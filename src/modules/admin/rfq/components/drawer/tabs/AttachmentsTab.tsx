import { useState, useRef } from 'react';
import { apiFetch } from '../../../../lib/api';
import { 
  Paperclip, FileText, FileSpreadsheet, Image, FileCode, File, 
  Download, Trash2, UploadCloud, Loader2 
} from 'lucide-react';
import type { RFQDetail } from '../../../types/rfqTypes';
import { Button } from '../../../../../../components/ui/Button';
import { EmptyStateContainer } from '../../shared/EmptyStateContainer';
import { cn } from '../../../../../../components/ui/utils';

interface AttachmentsTabProps {
  rfq: RFQDetail;
  onDownload: (filename: string) => void;
  onRefresh?: () => void;
}

export function AttachmentsTab({ rfq, onDownload, onRefresh }: AttachmentsTabProps) {
  const attachments = rfq.attachments || [];
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    const norm = type.toUpperCase();
    if (norm === 'PDF') return FileText;
    if (norm === 'EXCEL' || norm === 'XLSX') return FileSpreadsheet;
    if (norm === 'IMAGE' || norm === 'PNG' || norm === 'JPG') return Image;
    if (norm === 'CAD' || norm === 'DWG') return FileCode;
    return File;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);
      formData.append('mimeType', file.type);
      formData.append('size', String(file.size));

      const res = await apiFetch(`/admin/rfqs/${rfq.id}/attachments`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (attId: string) => {
    setDeletingId(attId);
    try {
      const res = await apiFetch(`/admin/rfqs/${rfq.id}/attachments/${attId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Deletion failed');

      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Delete attachment error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4 text-left select-none animate-in fade-in duration-200">
      
      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2",
          isDragOver ? "border-indigo-500 bg-indigo-50/40" : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <span className="text-xs font-semibold text-slate-600">Uploading attachment...</span>
          </>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Drag & Drop specifications file here</span>
            <span className="text-[10px] text-slate-400">or click to browse local drawings (PDF, JPG, CAD, XLSX)</span>
          </>
        )}
      </div>

      {attachments.length === 0 ? (
        <EmptyStateContainer
          title="No Attachments"
          description="This RFQ has no blueprints, specifications sheets, or bill of quantities uploaded."
          icon={Paperclip}
        />
      ) : (
        <div className="space-y-3">
          {attachments.map((att) => {
            const FileIcon = getFileIcon(att.fileType || (att as any).mime_type || '');
            const uploadDate = new Date(att.uploadedAt || (att as any).uploaded_at);
            const isDeleting = deletingId === att.id;

            return (
              <div
                key={att.id}
                className="p-3 border border-slate-100 rounded-lg bg-white hover:bg-slate-50/30 flex items-center justify-between gap-4 transition-all duration-150 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 border border-slate-100">
                    <FileIcon className="h-4.5 w-4.5 text-slate-500" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h5 className="font-bold text-xs text-slate-800 truncate max-w-[200px]" title={att.filename}>
                      {att.filename}
                    </h5>
                    <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-slate-400 font-semibold">
                      <span>Size: {typeof att.size === 'number' ? `${(att.size / 1024).toFixed(1)} KB` : att.size}</span>
                      <span>•</span>
                      <span>Uploaded: {uploadDate.toLocaleDateString()}</span>
                      <span>•</span>
                      <span>By: {att.uploader || (att as any).uploader_name || 'System'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                    {att.version || 'v1.0'}
                  </span>
                  
                  {/* Download button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDownload(att.filename)}
                    className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 rounded-full border-slate-200"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>

                  {/* Delete button */}
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={isDeleting}
                    onClick={() => handleDelete(att.id)}
                    className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-full border-slate-200"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
