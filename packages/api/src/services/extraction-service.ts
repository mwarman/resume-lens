import { BedrockRuntimeClient, InvokeModelCommand, ThrottlingException } from '@aws-sdk/client-bedrock-runtime';
import { ResumeLensError, ResumeLensErrorCode, type ResumeExtraction } from '@resume-lens/shared';

const MODEL_ID = 'anthropic.claude-haiku-4-5-20251001-v1:0';

// Instantiated once per Lambda container — connection reuse across warm invocations
const bedrockClient = new BedrockRuntimeClient({});

const SYSTEM_PROMPT = `You are a resume data extraction engine. Extract structured information from the resume text and return ONLY valid JSON conforming exactly to the following TypeScript interface — no markdown, no explanation, no prose:

{
  "candidate": {
    "fullName": string,
    "email": string | null,
    "phone": string | null,
    "location": string | null,
    "linkedIn": string | null
  },
  "summary": string | null,
  "inferredSeniorityLevel": "junior" | "mid" | "senior" | "principal" | "unknown",
  "skills": {
    "technical": string[],
    "soft": string[]
  },
  "experience": Array<{
    "company": string,
    "title": string,
    "startDate": string | null,
    "endDate": string | null,
    "current": boolean,
    "highlights": string[]
  }>,
  "education": Array<{
    "institution": string,
    "degree": string | null,
    "field": string | null,
    "graduationYear": number | null
  }>,
  "certifications": Array<{
    "name": string,
    "issuer": string | null,
    "year": number | null
  }>
}

Rules:
- Use null (not undefined, not empty string) for absent optional fields.
- inferredSeniorityLevel must be inferred from overall experience and role history, not parsed.
- Return ONLY the JSON object. No surrounding text.`;

/**
 * Validates that a parsed object structurally conforms to ResumeExtraction (sans extractionMeta).
 * Throws EXTRACTION_PARSE_FAILURE if required fields are missing or of wrong type.
 */
const validateExtractionShape = (obj: unknown): obj is Omit<ResumeExtraction, 'extractionMeta'> => {
  if (typeof obj !== 'object' || obj === null) return false;

  const o = obj as Record<string, unknown>;

  if (typeof o['candidate'] !== 'object' || o['candidate'] === null) return false;
  const c = o['candidate'] as Record<string, unknown>;
  if (typeof c['fullName'] !== 'string') return false;

  if (!Array.isArray(o['experience'])) return false;
  if (!Array.isArray(o['education'])) return false;
  if (!Array.isArray(o['certifications'])) return false;

  if (typeof o['skills'] !== 'object' || o['skills'] === null) return false;
  const s = o['skills'] as Record<string, unknown>;
  if (!Array.isArray(s['technical']) || !Array.isArray(s['soft'])) return false;

  const validSeniority = ['junior', 'mid', 'senior', 'principal', 'unknown'];
  if (!validSeniority.includes(o['inferredSeniorityLevel'] as string)) return false;

  return true;
};

/**
 * Derives per-section confidence based on data completeness.
 * High: multiple entries with rich detail; medium: some data; low: empty or sparse.
 */
const deriveConfidence = (
  obj: Omit<ResumeExtraction, 'extractionMeta'>,
): ResumeExtraction['extractionMeta']['confidence'] => {
  const experienceScore = obj.experience.length >= 3 ? 'high' : obj.experience.length >= 1 ? 'medium' : 'low';
  const educationScore = obj.education.length >= 2 ? 'high' : obj.education.length >= 1 ? 'medium' : 'low';
  const skillsScore =
    obj.skills.technical.length + obj.skills.soft.length >= 6
      ? 'high'
      : obj.skills.technical.length + obj.skills.soft.length >= 2
        ? 'medium'
        : 'low';

  return {
    experience: experienceScore,
    education: educationScore,
    skills: skillsScore,
  };
};

/**
 * Extracts structured resume data from raw text using Bedrock (Claude 3 Haiku).
 *
 * Constructs a prompt instructing JSON-only output, calls InvokeModelCommand,
 * parses the response, and validates structural conformance to ResumeExtraction.
 *
 * @param rawText - Raw text extracted from PDF by ParserService
 * @returns Structured ResumeExtraction object
 * @throws ResumeLensError with BEDROCK_THROTTLED if Bedrock throttles the request
 * @throws ResumeLensError with BEDROCK_ERROR for all other Bedrock SDK errors
 * @throws ResumeLensError with EXTRACTION_PARSE_FAILURE if response cannot be parsed
 */
export const extract = async (rawText: string): Promise<ResumeExtraction> => {
  console.log(JSON.stringify({ service: 'ExtractionService', event: 'extract_start', textLength: rawText.length }));

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Extract structured data from this resume:\n\n${rawText}`,
      },
    ],
  };

  let responseBody: Uint8Array;
  try {
    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: new TextEncoder().encode(JSON.stringify(payload)),
    });

    const response = await bedrockClient.send(command);
    responseBody = response.body;
  } catch (error) {
    if (error instanceof ThrottlingException) {
      console.warn(JSON.stringify({ service: 'ExtractionService', event: 'bedrock_throttled' }));
      // retryAfter: 30 seconds — conservative default for portfolio demo scale
      throw new ResumeLensError(
        'Bedrock request throttled. Please retry shortly.',
        ResumeLensErrorCode.BEDROCK_THROTTLED,
        30,
      );
    }
    const message = error instanceof Error ? error.message : 'Unknown Bedrock error';
    console.error(JSON.stringify({ service: 'ExtractionService', event: 'bedrock_error', message }));
    throw new ResumeLensError(`Bedrock invocation failed: ${message}`, ResumeLensErrorCode.BEDROCK_ERROR);
  }

  // Decode and parse Bedrock response
  let extractedData: Omit<ResumeExtraction, 'extractionMeta'>;
  try {
    const decoded = new TextDecoder().decode(responseBody);
    const bedrockResponse = JSON.parse(decoded) as { content: Array<{ type: string; text: string }> };

    const textBlock = bedrockResponse.content.find((block) => block.type === 'text');
    if (!textBlock) {
      throw new Error('No text content block in Bedrock response');
    }

    const parsed: unknown = JSON.parse(textBlock.text);

    if (!validateExtractionShape(parsed)) {
      throw new Error('Response does not conform to ResumeExtraction schema');
    }

    extractedData = parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Parse failure';
    console.error(JSON.stringify({ service: 'ExtractionService', event: 'parse_failure', message }));
    throw new ResumeLensError(
      `Failed to parse extraction response: ${message}`,
      ResumeLensErrorCode.EXTRACTION_PARSE_FAILURE,
    );
  }

  const processedAt = new Date().toISOString();
  const confidence = deriveConfidence(extractedData);

  const result: ResumeExtraction = {
    ...extractedData,
    extractionMeta: {
      modelId: MODEL_ID,
      processedAt,
      sourceFormat: 'pdf',
      confidence,
    },
  };

  console.log(
    JSON.stringify({
      service: 'ExtractionService',
      event: 'extract_complete',
      modelId: MODEL_ID,
      processedAt,
      confidence,
    }),
  );

  return result;
};
