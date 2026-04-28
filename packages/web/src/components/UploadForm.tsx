import { useRef, useState } from 'react';
import { ResumeLensErrorCode } from '@resume-lens/shared';
import { getErrorMessage } from '../utils/error-messages';
import styles from './UploadForm.module.css';

interface UploadFormProps {
  onUpload: (file: File) => Promise<void>;
  onStartSubmit?: () => void;
  error?: string | null;
}

const ACCEPTED_MIME_TYPE = 'application/pdf';
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const UploadForm = ({ onUpload, onStartSubmit, error: parentError }: UploadFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Display error prop from parent (server errors) if no local validation error.
   */
  const displayError = localError || parentError;

  /**
   * Validates file type and size.
   * Returns error message if invalid, or null if valid.
   * Uses the standard error messages from error-messages.ts for consistency.
   */
  const validateFile = (file: File): string | null => {
    if (file.type !== ACCEPTED_MIME_TYPE) {
      return getErrorMessage(ResumeLensErrorCode.UNSUPPORTED_FILE_TYPE);
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return getErrorMessage(ResumeLensErrorCode.FILE_TOO_LARGE);
    }
    return null;
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setLocalError(null);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setSelectedFile(null);
      setLocalError(validationError);
    } else {
      setSelectedFile(file);
      setLocalError(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const file = e.dataTransfer.files?.[0] ?? null;
    handleFileSelect(file);
  };

  const handleClickBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLocalError(null);
    setIsSubmitting(true);
    onStartSubmit?.();
    try {
      await onUpload(selectedFile);
    } catch (err) {
      // Error is handled by parent; just stop submitting state
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = !selectedFile || isSubmitting;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleInputChange} className={styles.fileInput} />

      <div
        className={`${styles.dropZone} ${isDragActive ? styles.active : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickBrowse}
      >
        <p className={styles.dropZoneText}>Drag and drop your PDF résumé here, or click to browse</p>
        {selectedFile && !localError && (
          <p className={styles.selectedFile}>
            Selected: <span className={styles.selectedFileName}>{selectedFile.name}</span>
          </p>
        )}
      </div>

      {displayError && <div className={styles.errorMessage}>{displayError}</div>}

      <button type="submit" disabled={isButtonDisabled} className={styles.submitButton}>
        {isSubmitting ? 'Extracting...' : 'Extract Resume'}
      </button>
    </form>
  );
};

export default UploadForm;
