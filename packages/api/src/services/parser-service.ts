import { PDFParse } from 'pdf-parse';
import { ResumeLensErrorCode, ResumeLensError } from '@resume-lens/shared';

/**
 * Minimum text length threshold to detect image-only PDFs.
 * PDFs with extracted text below this threshold after trimming are considered unparseable (e.g., scanned documents).
 */
const MIN_TEXT_LENGTH = 10;

/**
 * Parses a PDF buffer and extracts raw text.
 *
 * Uses pdf-parse v2 API to extract text from a validated PDF buffer.
 * Detects and rejects image-only PDFs (scanned documents with no extractable text).
 * Errors during parsing throw ResumeLensError with code UNPARSEABLE_DOCUMENT.
 *
 * Always calls parser.destroy() to free memory, even on error.
 *
 * @param pdfBuffer - The PDF file buffer (already validated by IntakeService for type and size)
 * @returns Raw text content extracted from the PDF (no normalization applied)
 * @throws ResumeLensError with code UNPARSEABLE_DOCUMENT if parsing fails or document is image-only
 */
export const parse = async (pdfBuffer: Buffer): Promise<string> => {
  const parser = new PDFParse({ data: pdfBuffer });

  try {
    const result = await parser.getText();
    const rawText = result.text;

    // Detect image-only PDFs: text is empty or near-empty after trimming
    if (!rawText || rawText.trim().length < MIN_TEXT_LENGTH) {
      throw new ResumeLensError(
        'The document appears to be a scanned image without extractable text. Please provide a text-based PDF.',
        ResumeLensErrorCode.UNPARSEABLE_DOCUMENT,
      );
    }

    return rawText;
  } catch (error) {
    // If it's already a ResumeLensError (e.g., from image detection above), rethrow it
    if (error instanceof ResumeLensError) {
      throw error;
    }

    // For other errors (pdf-parse failures, invalid PDFs, etc.), wrap as UNPARSEABLE_DOCUMENT
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during PDF parsing';
    throw new ResumeLensError(`Failed to parse PDF: ${errorMessage}`, ResumeLensErrorCode.UNPARSEABLE_DOCUMENT);
  } finally {
    // Always free memory, even if parsing fails
    await parser.destroy();
  }
};
