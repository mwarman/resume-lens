import { ResumeLensErrorCode, ResumeLensError } from '@resume-lens/shared';

const PDF_MIME_TYPE = 'application/pdf';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validates file type and size constraints.
 *
 * Ensures:
 * 1. File is PDF only (application/pdf)
 * 2. File size does not exceed 5MB
 *
 * Throws ResumeLensError with the appropriate error code if validation fails.
 * Returns void on success — success is indicated by the absence of an exception.
 *
 * @param file - The file buffer
 * @param mimeType - The MIME type of the file
 * @throws ResumeLensError with code UNSUPPORTED_FILE_TYPE if not PDF
 * @throws ResumeLensError with code FILE_TOO_LARGE if exceeds 5MB
 */
export const validate = (file: Buffer, mimeType: string): void => {
  // Validate MIME type
  if (mimeType !== PDF_MIME_TYPE) {
    throw new ResumeLensError(
      `Unsupported file type: ${mimeType}. Only PDF (application/pdf) is supported.`,
      ResumeLensErrorCode.UNSUPPORTED_FILE_TYPE,
    );
  }

  // Validate file size
  if (file.length > MAX_FILE_SIZE) {
    throw new ResumeLensError(
      `File too large: ${file.length} bytes. Maximum size is ${MAX_FILE_SIZE} bytes (5MB).`,
      ResumeLensErrorCode.FILE_TOO_LARGE,
    );
  }
};
