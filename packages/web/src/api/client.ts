import { ApiErrorResponse, ResumeLensError, ResumeLensErrorCode, type ResumeExtraction } from '@resume-lens/shared';

/**
 * Thrown when the request fails due to a network error (e.g. no connection, DNS failure, CORS
 * rejection). Distinguishable from ResumeLensError via instanceof — callers should check for
 * NetworkError first, then ResumeLensError.
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Sends a PDF file to the extraction API and returns the structured ResumeExtraction result.
 *
 * Throws NetworkError on network-level failure (no response received).
 * Throws ResumeLensError with a typed ResumeLensErrorCode on any non-200 HTTP response.
 */
export const extractResume = async (file: File): Promise<ResumeExtraction> => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL as string;

  const body = new FormData();
  body.append('file', file);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/extract`, {
      method: 'POST',
      body,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network request failed';
    throw new NetworkError(message);
  }

  if (response.ok) {
    return response.json() as Promise<ResumeExtraction>;
  }

  // Non-200: parse the typed error response and throw ResumeLensError
  const errorBody = (await response.json()) as ApiErrorResponse;
  throw new ResumeLensError(errorBody.message, errorBody.errorCode as ResumeLensErrorCode);
};
