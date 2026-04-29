/**
 * Centralized constants for the resume-lens API.
 * Eliminates hardcoded values across services and ensures consistency.
 */

/** Bedrock model identifier for resume extraction. Claude Haiku 4.5 is cost-optimized for structured data extraction. */
export const MODEL_ID = 'us.anthropic.claude-haiku-4-5-20251001-v1:0';

/** MIME type for PDF files. Only application/pdf is supported; DOCX and other formats are rejected at intake. */
export const PDF_MIME_TYPE = 'application/pdf';

/** Maximum file size in bytes (5MB). Enforced to prevent Lambda timeout on large PDFs and Bedrock token limits. */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Minimum text length threshold to detect image-only PDFs. PDFs with extracted text below this threshold are rejected as unparseable. */
export const MIN_TEXT_LENGTH = 10;
