import { ResumeLensErrorCode } from '@resume-lens/shared';

const PDF_MIME_TYPE = 'application/pdf';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * ValidatedFile — Result of successful intake validation.
 * Contains the file buffer, MIME type, and size.
 */
export interface ValidatedFile {
  file: Buffer;
  mimeType: string;
  size: number;
}

/**
 * Validates file type and size constraints.
 *
 * Ensures:
 * 1. File is PDF only (application/pdf)
 * 2. File size does not exceed 5MB
 *
 * Errors are thrown with a `code` property set to the appropriate ResumeLensErrorCode.
 * (Future implementation: M2-3 will add S3 upload capability here.)
 *
 * @param file - The file buffer
 * @param mimeType - The MIME type of the file
 * @returns ValidatedFile if validation passes
 * @throws Error with code property set to ResumeLensErrorCode if validation fails
 */
export const validate = (file: Buffer, mimeType: string): ValidatedFile => {
  // Validate MIME type
  if (mimeType !== PDF_MIME_TYPE) {
    const error = new Error(`Unsupported file type: ${mimeType}. Only PDF (application/pdf) is supported.`);
    (error as any).code = ResumeLensErrorCode.UNSUPPORTED_FILE_TYPE;
    throw error;
  }

  // Validate file size
  if (file.length > MAX_FILE_SIZE) {
    const error = new Error(`File too large: ${file.length} bytes. Maximum size is ${MAX_FILE_SIZE} bytes (5MB).`);
    (error as any).code = ResumeLensErrorCode.FILE_TOO_LARGE;
    throw error;
  }

  return {
    file,
    mimeType,
    size: file.length,
  };
};
