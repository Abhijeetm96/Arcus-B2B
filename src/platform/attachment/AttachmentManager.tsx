/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';
import { Upload, File, Image, Trash2, Download, AlertCircle, Loader2 } from 'lucide-react';

export interface AttachmentRecord {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  category: string;
  publicUrl?: string;
  uploadedAt: string;
  uploadedByName: string;
}

interface AttachmentManagerProps {
  attachments: AttachmentRecord[];
  onUpload: (file: File, category: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  categories?: string[];
  maxSizeMB?: number;
}

export const AttachmentManager: React.FC<AttachmentManagerProps> = ({
  attachments,
  onUpload,
  onDelete,
  categories = ['Invoice', 'GST Certificate', 'PAN Card', 'E-Way Draft', 'Other'],
  maxSizeMB = 10,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMessage(`File exceeds the limit of ${maxSizeMB}MB.`);
      return;
    }

    setUploading(true);
    try {
      await onUpload(file, selectedCategory);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload attachment.');
    } finally {
      setUploading(false);
    }
  };

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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image size={18} className="text-blue-500 shrink-0" />;
    }
    return <File size={18} className="text-slate-500 shrink-0" />;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
      <h3 className="font-semibold text-slate-800 text-sm mb-3">Attachments & Documentation</h3>

      {/* Upload Drag & Drop Interface */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="w-full sm:w-44 flex flex-col gap-1.5">
          <label className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">
            Document Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-700 focus:ring-primary focus:border-primary focus:outline-hidden"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-1.5 text-slate-500">
              <Loader2 className="animate-spin text-primary" size={24} />
              <span className="text-xs font-semibold">Uploading document...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-center">
              <Upload size={20} className="text-slate-400" />
              <div className="text-xs font-semibold text-slate-700">
                Drag & Drop or <span className="text-primary hover:underline">Browse</span>
              </div>
              <span className="text-2xs text-slate-400">PDF, JPG, PNG up to {maxSizeMB}MB</span>
            </div>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-lg flex items-center gap-2 mb-4 bg-red-50 text-red-700 border border-red-150 text-xs">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Attachments List */}
      <div className="space-y-2">
        <div className="text-2xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5 mb-1.5">
          Uploaded Files ({attachments.length})
        </div>

        {attachments.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">
            No compliance attachments uploaded yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2.5 bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {getFileIcon(file.mimeType)}
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-medium text-slate-800 truncate" title={file.filename}>
                      {file.filename}
                    </h4>
                    <div className="flex items-center gap-1.5 text-2xs text-slate-400 mt-0.5">
                      <span className="bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded-sm font-medium">
                        {file.category}
                      </span>
                      <span>•</span>
                      <span>{formatBytes(file.size)}</span>
                      <span>•</span>
                      <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {file.publicUrl && (
                    <a
                      href={file.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-all"
                      title="Download"
                    >
                      <Download size={14} />
                    </a>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(file.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
