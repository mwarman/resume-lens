import { ResumeLensErrorCode } from '@resume-lens/shared';

/**
 * Maps error codes to user-friendly, actionable messages.
 * Each message provides clear guidance on what went wrong and what the user can do.
 */
export const getErrorMessage = (errorCode: ResumeLensErrorCode): string => {
  switch (errorCode) {
    case ResumeLensErrorCode.UNSUPPORTED_FILE_TYPE:
      return 'Only PDF files are supported. Please upload a .pdf file.';
    case ResumeLensErrorCode.FILE_TOO_LARGE:
      return 'File exceeds the 5MB limit. Most résumés are under 1MB — try re-saving the PDF.';
    case ResumeLensErrorCode.UNPARSEABLE_DOCUMENT:
      return "This PDF couldn't be read. It may be scanned or image-based. Try a text-based PDF.";
    case ResumeLensErrorCode.BEDROCK_THROTTLED:
      return 'The service is busy. Please wait a moment and try again.';
    case ResumeLensErrorCode.BEDROCK_ERROR:
      return 'An upstream error occurred. Please try again shortly.';
    case ResumeLensErrorCode.EXTRACTION_PARSE_FAILURE:
      return 'The extraction produced an unexpected result. Please try again.';
    default:
      const exhaustiveCheck: never = errorCode;
      return exhaustiveCheck;
  }
};

/**
 * Generic message for network-level errors (no response received from server).
 */
export const NETWORK_ERROR_MESSAGE = 'Connection error. Please check your internet connection and try again.';
