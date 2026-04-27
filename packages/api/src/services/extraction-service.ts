import { BedrockRuntimeClient, InvokeModelCommand, ThrottlingException } from '@aws-sdk/client-bedrock-runtime';

import {
  ResumeJsonSchema,
  ResumeLensError,
  ResumeLensErrorCode,
  ResumeSchema,
  type Resume,
  type ResumeExtraction,
} from '@resume-lens/shared';

const MODEL_ID = 'us.anthropic.claude-haiku-4-5-20251001-v1:0';

// Instantiated once per Lambda container — connection reuse across warm invocations
const bedrockClient = new BedrockRuntimeClient({});

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
 * Extracts structured resume data from raw text using Bedrock (Claude Haiku).
 *
 * Constructs a prompt to instruct the model to extract relevant fields, invokes the model via Bedrock SDK,
 * and processes the response. Uses a JSON schema to enforce structured output. Implements error handling for
 * Bedrock throttling and parsing issues.
 *
 * @param rawText - Raw text extracted from PDF by ParserService
 * @returns Structured ResumeExtraction object
 * @throws ResumeLensError with BEDROCK_THROTTLED if Bedrock throttles the request
 * @throws ResumeLensError with BEDROCK_ERROR for all other Bedrock SDK errors
 * @throws ResumeLensError with EXTRACTION_PARSE_FAILURE if response cannot be parsed
 */
export const extract = async (rawText: string): Promise<ResumeExtraction> => {
  console.log({ service: 'ExtractionService', event: 'extract_start', textLength: rawText.length });

  // Construct the prompt and payload for Bedrock
  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Extract structured data from this resume:\n\n${rawText}`,
      },
    ],
    output_config: {
      format: {
        type: 'json_schema',
        schema: ResumeJsonSchema,
      },
    },
  };

  let responseBody: Uint8Array;
  try {
    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: new TextEncoder().encode(JSON.stringify(payload)),
    });
    console.log({
      service: 'ExtractionService',
      event: 'invoke_bedrock',
      commandInput: { ...command.input, body: '[REDACTED]' },
    });

    // Invoke the model via Bedrock SDK
    const response = await bedrockClient.send(command);
    console.log({
      service: 'ExtractionService',
      event: 'bedrock_response',
      response: { ...response, body: '[REDACTED]' },
    });

    responseBody = response.body;
  } catch (error) {
    if (error instanceof ThrottlingException) {
      console.warn({ service: 'ExtractionService', event: 'bedrock_throttled' });
      // retryAfter: 30 seconds — conservative default for portfolio demo scale
      throw new ResumeLensError(
        'Bedrock request throttled. Please retry shortly.',
        ResumeLensErrorCode.BEDROCK_THROTTLED,
        30,
      );
    }
    const message = error instanceof Error ? error.message : 'Unknown Bedrock error';
    console.error({ service: 'ExtractionService', event: 'bedrock_error', message });
    throw new ResumeLensError(`Bedrock invocation failed: ${message}`, ResumeLensErrorCode.BEDROCK_ERROR);
  }

  // Decode, parse, and validate the Bedrock response
  let extractedData: Resume;
  try {
    const decoded = new TextDecoder().decode(responseBody);
    const bedrockResponse = JSON.parse(decoded) as { content: Array<{ type: string; text: string }> };

    const textBlock = bedrockResponse.content.find((block) => block.type === 'text');
    console.log({
      service: 'ExtractionService',
      event: 'bedrock_response_parsed',
      textBlockLength: textBlock?.text.length ?? 0,
      textBlockPreview: textBlock ? textBlock.text.slice(0, 100) : 'N/A',
    });
    if (!textBlock) {
      throw new Error('No text content block in Bedrock response');
    }

    const parsed: unknown = JSON.parse(textBlock.text);

    const resumeValidationResult = ResumeSchema.safeParse(parsed);
    if (!resumeValidationResult.success) {
      console.error({
        service: 'ExtractionService',
        event: 'schema_validation_failure',
        errors: resumeValidationResult.error.issues,
      });
      throw new Error('Parsed response does not conform to ResumeSchema');
    }
    console.log({ service: 'ExtractionService', event: 'schema_validation_success' });

    extractedData = resumeValidationResult.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Parse failure';
    console.error({ service: 'ExtractionService', event: 'parse_failure', message });
    throw new ResumeLensError(
      `Failed to parse extraction response: ${message}`,
      ResumeLensErrorCode.EXTRACTION_PARSE_FAILURE,
    );
  }

  // Derive confidence scores and construct the final result
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

  console.log({
    service: 'ExtractionService',
    event: 'extract_complete',
    modelId: MODEL_ID,
    processedAt,
  });

  return result;
};
