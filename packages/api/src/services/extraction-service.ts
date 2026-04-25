import { ResumeExtraction } from '@resume-lens/shared';

/**
 * Extracts structured resume data from raw text using Bedrock (Claude 3 Haiku).
 *
 * (Stub implementation: M2-5 will implement Bedrock integration)
 *
 * Accepts raw text from ParserService and returns structured ResumeExtraction object.
 * Errors during extraction throw with code property set to ResumeLensErrorCode.BEDROCK_ERROR or EXTRACTION_PARSE_FAILURE.
 *
 * @param rawText - Raw text extracted from PDF by ParserService
 * @returns Structured ResumeExtraction object
 * @throws Error with code property set to ResumeLensErrorCode if extraction fails
 */
export const extract = async (rawText: string): Promise<ResumeExtraction> => {
  // Stub: Return placeholder ResumeExtraction
  // TODO: Implement Bedrock integration in M2-5
  console.log(`[ExtractionService] Extracting from text of length ${rawText.length} (stub)`);

  const placeholderExtraction: ResumeExtraction = {
    candidate: {
      fullName: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: null,
      location: null,
      linkedIn: null,
    },
    summary: null,
    inferredSeniorityLevel: 'mid',
    skills: {
      technical: [],
      soft: [],
    },
    experience: [],
    education: [],
    certifications: [],
    extractionMeta: {
      modelId: 'claude-3-haiku-20240307', // Bedrock model ID
      sourceFormat: 'pdf',
      processedAt: new Date().toISOString(),
      confidence: {
        experience: 'low',
        education: 'low',
        skills: 'low',
      },
    },
  };

  return placeholderExtraction;
};
