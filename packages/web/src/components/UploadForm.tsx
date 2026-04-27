import { useRef, useState } from 'react';

interface UploadFormProps {
  onUpload: (file: File) => Promise<void>;
}

const ACCEPTED_MIME_TYPE = 'application/pdf';
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const UploadForm = ({ onUpload }: UploadFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validates file type and size.
   * Returns error message if invalid, or null if valid.
   */
  const validateFile = (file: File): string | null => {
    if (file.type !== ACCEPTED_MIME_TYPE) {
      return 'File must be a PDF';
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File exceeds ${MAX_FILE_SIZE_MB}MB limit`;
    }
    return null;
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setError(null);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setSelectedFile(null);
      setError(validationError);
    } else {
      setSelectedFile(file);
      setError(null);
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

    setIsSubmitting(true);
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
    <form onSubmit={handleSubmit}>
      <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleInputChange} style={{ display: 'none' }} />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickBrowse}
        style={{
          border: isDragActive ? '2px dashed blue' : '2px dashed #ccc',
          backgroundColor: isDragActive ? '#f0f8ff' : '#fafafa',
          padding: '40px',
          textAlign: 'center',
          cursor: 'pointer',
          borderRadius: '8px',
          transition: 'all 0.2s ease',
        }}
      >
        <p>Drag and drop your PDF résumé here, or click to browse</p>
        {selectedFile && !error && (
          <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
            Selected: <strong>{selectedFile.name}</strong>
          </p>
        )}
      </div>

      {error && (
        <div
          style={{
            color: '#d32f2f',
            marginTop: '12px',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isButtonDisabled}
        style={{
          marginTop: '16px',
          padding: '10px 20px',
          backgroundColor: isButtonDisabled ? '#ccc' : '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
          fontSize: '16px',
        }}
      >
        {isSubmitting ? 'Extracting...' : 'Extract Resume'}
      </button>
    </form>
  );
};

export default UploadForm;
