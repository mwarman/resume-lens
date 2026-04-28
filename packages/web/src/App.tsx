import { useState } from 'react';
import type { ResumeExtraction } from '@resume-lens/shared';
import { ResumeLensError } from '@resume-lens/shared';

import { extractResume, NetworkError } from './api/client';
import { getErrorMessage, NETWORK_ERROR_MESSAGE } from './utils/error-messages';
import UploadForm from './components/UploadForm';
import LoadingState from './components/LoadingState';
import ResultCard from './components/ResultCard';

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ResumeExtraction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    try {
      const result = await extractResume(file);
      setExtractionResult(result);
    } catch (err) {
      let errorMessage = 'An unexpected error occurred';

      if (err instanceof ResumeLensError) {
        errorMessage = getErrorMessage(err.code);
      } else if (err instanceof NetworkError) {
        errorMessage = NETWORK_ERROR_MESSAGE;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Called when user starts form submission.
   * Clears any existing errors so we have a clean state for the new request.
   */
  const handleStartSubmit = () => {
    setError(null);
    setIsLoading(true);
  };

  /**
   * Resets the app state to allow analyzing another résumé.
   */
  const handleReset = () => {
    setExtractionResult(null);
    setError(null);
  };

  return (
    <div>
      <h1>Resume Lens</h1>
      {isLoading && <LoadingState />}
      {!isLoading && !extractionResult && (
        <UploadForm onUpload={handleUpload} onStartSubmit={handleStartSubmit} error={error} />
      )}
      {extractionResult && <ResultCard extraction={extractionResult} onReset={handleReset} />}
    </div>
  );
};

export default App;
