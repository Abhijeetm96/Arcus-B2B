import * as React from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { cn } from '../ui/utils';

export interface UploadComponentProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  onFileSelect?: (files: File[]) => void;
  maxFiles?: number;
}

const UploadComponent = React.forwardRef<HTMLInputElement, UploadComponentProps>(
  ({ className, label, error, onFileSelect, maxFiles = 3, ...props }, ref) => {
    const [dragActive, setDragActive] = React.useState(false);
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
      } else if (e.type === 'dragleave') {
        setDragActive(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const filesArray = Array.from(e.dataTransfer.files);
        const validFiles = filesArray.slice(0, maxFiles);
        setSelectedFiles(validFiles);
        if (onFileSelect) onFileSelect(validFiles);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        const filesArray = Array.from(e.target.files);
        const validFiles = filesArray.slice(0, maxFiles);
        setSelectedFiles(validFiles);
        if (onFileSelect) onFileSelect(validFiles);
      }
    };

    const removeFile = (index: number) => {
      const updated = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(updated);
      if (onFileSelect) onFileSelect(updated);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-xs">
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <div
          className={cn(
            'flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded bg-surface transition-all duration-200 text-center cursor-pointer',
            dragActive && 'border-primary bg-primary/5',
            error && 'border-danger bg-danger/5',
            className
          )}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) ref.current = node;
            }}
            type="file"
            className="hidden"
            onChange={handleChange}
            {...props}
          />
          <Upload className="h-8 w-8 text-text-secondary mb-2" />
          <p className="text-sm font-semibold text-text-primary">Drag & drop files or click to browse</p>
          <p className="text-xs text-text-secondary mt-1">Upload PDF, Excel, JPG, max {maxFiles} files</p>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-border rounded bg-surface-secondary/50">
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="h-4 w-4 text-text-secondary flex-shrink-0" />
                  <span className="text-sm text-text-primary truncate">{file.name}</span>
                  <span className="text-xs text-text-secondary">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  className="text-text-secondary hover:text-danger"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        {error && <span className="mt-1 block text-xs font-medium text-danger">{error}</span>}
      </div>
    );
  }
);
UploadComponent.displayName = 'UploadComponent';

export { UploadComponent };
