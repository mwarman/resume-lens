/**
 * Typed error codes for resume-lens API responses
 * Used by the API to produce responses and the frontend to render specific error messages
 */

export enum ResumeLensErrorCode {
  UNSUPPORTED_FILE_TYPE = "UNSUPPORTED_FILE_TYPE",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  UNPARSEABLE_DOCUMENT = "UNPARSEABLE_DOCUMENT",
  BEDROCK_THROTTLED = "BEDROCK_THROTTLED",
  BEDROCK_ERROR = "BEDROCK_ERROR",
  EXTRACTION_PARSE_FAILURE = "EXTRACTION_PARSE_FAILURE",
}

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  errorCode: ResumeLensErrorCode;
  message: string;
}
