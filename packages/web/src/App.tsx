import { useState } from 'react';
import type { ResumeExtraction } from '@resume-lens/shared';

import { extractResume, NetworkError } from './api/client';
import UploadForm from './components/UploadForm';
import LoadingState from './components/LoadingState';
import ResultCard from './components/ResultCard';

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ResumeExtraction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await extractResume(file);
      setExtractionResult(result);
    } catch (err) {
      if (err instanceof NetworkError) {
        setError(`Network error: ${err.message}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
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
      {!isLoading && !extractionResult && <UploadForm onUpload={handleUpload} />}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      {extractionResult && <ResultCard extraction={extractionResult} onReset={handleReset} />}
    </div>
  );
};

export default App;
