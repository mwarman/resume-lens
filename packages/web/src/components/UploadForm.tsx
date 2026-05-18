import { useRef, useState } from 'react';
import { ResumeLensErrorCode } from '@resume-lens/shared';
import { Upload } from 'lucide-react';
import clsx from 'clsx';
import { Button } from './shadcn/button';
import { Alert, AlertDescription, AlertTitle } from './shadcn/alert';
import { getErrorMessage } from '../utils/error-messages';

interface UploadFormProps {
  onUpload: (file: File) => Promise<void>;
  onStartSubmit?: () => void;
  error?: string | null;
}

const ACCEPTED_MIME_TYPE = 'application/pdf';
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * UploadForm component for submitting PDF résumés.
 * Redesigned with Tailwind CSS and shadcn/ui components.
 * Supports drag-and-drop, file validation (PDF, 5MB max), and client-side error handling.
 * Renders correctly in both light and dark modes via Tailwind dark: variants.
 */
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

  const handleSubmit = async (e: React.FormEvent) => {
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
    <div className="mx-auto max-w-2xl px-6 py-8 md:px-4">
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleInputChange} className="hidden" />

        {/* Drag-and-drop zone */}
        <div
          className={clsx(
            'flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed',
            'bg-muted p-12 text-center transition-all duration-200 cursor-pointer',
            isDragActive
              ? ['border-primary bg-primary/5 shadow-md', 'dark:border-primary dark:bg-primary/10']
              : [
                  'border-muted-foreground/25 bg-muted hover:border-primary/50 hover:bg-muted/80',
                  'dark:border-muted-foreground/25 dark:bg-muted/50 dark:hover:border-primary/40 dark:hover:bg-muted/70',
                ],
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClickBrowse}
        >
          <Upload className="size-10 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground md:text-base">
            Drag and drop your PDF resume here, or click to browse
          </p>
          {selectedFile && !localError && (
            <p className="text-xs text-muted-foreground">
              Selected: <span className="font-semibold text-foreground">{selectedFile.name}</span>
            </p>
          )}
        </div>

        {/* Error alert */}
        {displayError && (
          <Alert variant="destructive">
            <AlertTitle>Validation Error</AlertTitle>
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        )}

        {/* Submit button */}
        <Button type="submit" disabled={isButtonDisabled} className="w-full">
          {isSubmitting ? 'Extracting...' : 'Extract Resume'}
        </Button>
      </form>
    </div>
  );
};

export default UploadForm;
