import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import Busboy from 'busboy';
import {
  ResumeLensErrorCode,
  ResumeLensError,
  type ResumeExtraction,
  type ApiErrorResponse,
} from '@resume-lens/shared';
import { validate as validateIntake } from '../services/intake-service';
import { parse as parsePdf } from '../services/parser-service';
import { extract as extractResume } from '../services/extraction-service';

/**
 * Maps ResumeLensErrorCode to HTTP status code per AD-010.
 */
const errorCodeToHttpStatus = (errorCode: ResumeLensErrorCode): number => {
  switch (errorCode) {
    case ResumeLensErrorCode.UNSUPPORTED_FILE_TYPE:
      return 415; // Unsupported Media Type
    case ResumeLensErrorCode.FILE_TOO_LARGE:
      return 413; // Payload Too Large
    case ResumeLensErrorCode.UNPARSEABLE_DOCUMENT:
      return 422; // Unprocessable Entity
    case ResumeLensErrorCode.EXTRACTION_PARSE_FAILURE:
      return 422; // Unprocessable Entity
    case ResumeLensErrorCode.BEDROCK_THROTTLED:
      return 503; // Service Unavailable
    case ResumeLensErrorCode.BEDROCK_ERROR:
      return 502; // Bad Gateway
    default:
      return 500; // Internal Server Error
  }
};

/**
 * Builds CORS headers for the response.
 * (To be tightened to CloudFront domain in M3)
 */
const getCorsHeaders = (): Record<string, string> => {
  return {
    'Access-Control-Allow-Origin': '*', // TODO: Restrict to CloudFront domain in M3
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
};

/**
 * Parses multipart/form-data from the Lambda event.
 * Returns { file: Buffer, mimeType: string }.
 */
const parseMultipartFormData = (event: APIGatewayProxyEvent): Promise<{ file: Buffer; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const body = event.isBase64Encoded
      ? Buffer.from(event.body || '', 'base64')
      : Buffer.from(event.body || '', 'utf-8');

    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    const bb = Busboy({ headers: { 'content-type': contentType } });

    let fileBuffer: Buffer | null = null;
    let fileMimeType: string | null = null;

    bb.on('file', (fieldname: string, file: NodeJS.ReadableStream, info: any) => {
      const chunks: Buffer[] = [];
      file.on('data', (data: Buffer) => {
        chunks.push(data);
      });
      file.on('end', () => {
        fileBuffer = Buffer.concat(chunks);
        fileMimeType = info.mimeType;
      });
    });

    bb.on('error', (err: Error) => {
      reject(new Error(`Failed to parse multipart data: ${err.message}`));
    });

    bb.on('close', () => {
      if (fileBuffer && fileMimeType) {
        resolve({ file: fileBuffer, mimeType: fileMimeType });
      } else {
        reject(new Error('No file found in multipart data'));
      }
    });

    bb.write(body);
    bb.end();
  });
};

/**
 * Lambda handler for resume extraction.
 *
 * Orchestrates the three-stage pipeline:
 * 1. IntakeService: Validates file type (PDF) and size (5MB)
 * 2. ParserService: Extracts raw text from PDF
 * 3. ExtractionService: Calls Bedrock to extract structured JSON
 *
 * Returns HTTP 200 with ResumeExtraction on success.
 * Returns typed error response with appropriate HTTP status on failure.
 */
export const handler = async (event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> => {
  console.log({ service: 'ExtractHandler', event: 'invoke' });

  const cors = getCorsHeaders();

  try {
    // Parse multipart/form-data to extract file
    let parsedData: { file: Buffer; mimeType: string };
    try {
      parsedData = await parseMultipartFormData(event);
      console.log({
        service: 'ExtractHandler',
        event: 'file_parsed',
        fileSize: parsedData.file.length,
        mimeType: parsedData.mimeType,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
      return {
        statusCode: 400,
        headers: cors,
        body: JSON.stringify({
          errorCode: 'INVALID_REQUEST',
          message: `Failed to parse request: ${errorMessage}`,
        }),
      };
    }

    // Stage 1: Intake (Validate file type and size)
    try {
      validateIntake(parsedData.file, parsedData.mimeType);
      console.log({ service: 'ExtractHandler', event: 'intake_validated' });
    } catch (error) {
      if (error instanceof ResumeLensError) {
        const statusCode = errorCodeToHttpStatus(error.code);
        const errorResponse: ApiErrorResponse = {
          errorCode: error.code,
          message: error.message,
        };
        return {
          statusCode,
          headers: cors,
          body: JSON.stringify(errorResponse),
        };
      }
      const errorMessage = error instanceof Error ? error.message : 'Intake validation failed';
      throw error;
    }

    // Stage 2: Parser (Extract raw text from PDF)
    let rawText: string;
    try {
      rawText = await parsePdf(parsedData.file);
      console.log({ service: 'ExtractHandler', event: 'pdf_parsed', textLength: rawText.length });
    } catch (error) {
      if (error instanceof ResumeLensError) {
        const statusCode = errorCodeToHttpStatus(error.code);
        const errorResponse: ApiErrorResponse = {
          errorCode: error.code,
          message: error.message,
        };
        return {
          statusCode,
          headers: cors,
          body: JSON.stringify(errorResponse),
        };
      }
      const errorMessage = error instanceof Error ? error.message : 'PDF parsing failed';
      throw error;
    }

    // Stage 3: Extraction (Call Bedrock)
    let extraction: ResumeExtraction;
    try {
      extraction = await extractResume(rawText);
      console.log({ service: 'ExtractHandler', event: 'extraction_complete', data: extraction });
    } catch (error) {
      if (error instanceof ResumeLensError) {
        const statusCode = errorCodeToHttpStatus(error.code);
        const errorResponse: ApiErrorResponse = {
          errorCode: error.code,
          message: error.message,
        };
        const responseHeaders: Record<string, string | number> = { ...cors };
        if (error.code === ResumeLensErrorCode.BEDROCK_THROTTLED && error.retryAfter !== undefined) {
          responseHeaders['Retry-After'] = error.retryAfter;
        }
        return {
          statusCode,
          headers: responseHeaders,
          body: JSON.stringify(errorResponse),
        };
      }
      const errorMessage = error instanceof Error ? error.message : 'Extraction failed';
      throw error;
    }

    // Success: Return 200 with ResumeExtraction
    console.log({ service: 'ExtractHandler', event: 'handler_complete' });
    return {
      statusCode: 200,
      headers: {
        ...cors,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(extraction),
    };
  } catch (error) {
    // Unexpected error: Return 500
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error({ service: 'ExtractHandler', event: 'unexpected_error', message: errorMessage }, error);

    const errorResponse: ApiErrorResponse = {
      errorCode: ResumeLensErrorCode.BEDROCK_ERROR, // Generic error code for unexpected failures
      message: `Unexpected error: ${errorMessage}`,
    };

    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify(errorResponse),
    };
  }
};
