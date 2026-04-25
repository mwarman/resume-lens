/**
 * Parses a PDF buffer and extracts raw text.
 *
 * (Stub implementation: M2-4 will implement pdf-parse integration)
 *
 * Accepts a Buffer from IntakeService and returns the raw text content.
 * Errors during parsing throw with code property set to ResumeLensErrorCode.UNPARSEABLE_DOCUMENT.
 *
 * @param pdfBuffer - The PDF file buffer (already validated by IntakeService)
 * @returns Raw text content extracted from the PDF
 * @throws Error with code property set to ResumeLensErrorCode.UNPARSEABLE_DOCUMENT if parsing fails
 */
export const parse = async (pdfBuffer: Buffer): Promise<string> => {
  // Stub: Return placeholder text
  // TODO: Implement with pdf-parse in M2-4
  console.log(`[ParserService] Parsing PDF of size ${pdfBuffer.length} bytes (stub)`);
  return 'PLACEHOLDER: Raw text extracted from PDF';
};
