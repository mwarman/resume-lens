import { extractText } from 'unpdf';

import { ResumeLensErrorCode, ResumeLensError } from '@resume-lens/shared';
import { MIN_TEXT_LENGTH } from '../utils/constants';

/**
 * Parses a PDF buffer and extracts raw text.
 *
 * Uses unpdf (a serverless-optimised wrapper around pdfjs-dist) to extract text from a validated
 * PDF buffer. pdf-parse v1 was abandoned in 2019 and its bundled PDF.js fails on modern PDFs;
 * pdfjs-dist direct usage breaks esbuild bundling because it dynamically loads a worker file
 * using import.meta.url which esbuild rewrites incorrectly. unpdf pre-configures pdfjs-dist for
 * Node.js/serverless environments and bundles cleanly without Lambda Layers.
 *
 * Detects and rejects image-only PDFs (scanned documents with no extractable text).
 * Errors during parsing throw ResumeLensError with code UNPARSEABLE_DOCUMENT.
 *
 * @param pdfBuffer - The PDF file buffer (already validated by IntakeService for type and size)
 * @returns Raw text content extracted from the PDF (no normalization applied)
 * @throws ResumeLensError with code UNPARSEABLE_DOCUMENT if parsing fails or document is image-only
 */
export const parse = async (pdfBuffer: Buffer): Promise<string> => {
  try {
    console.log({ service: 'ParserService', event: 'parse_start', bufferLength: pdfBuffer.length });

    const uint8Array = new Uint8Array(pdfBuffer.buffer, pdfBuffer.byteOffset, pdfBuffer.byteLength);
    const { text: pages } = await extractText(uint8Array, { mergePages: false });
    const rawText = pages.join('\n');

    console.log({ service: 'ParserService', event: 'pdf_parsed', textLength: rawText.length });

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
  }
};
