import { Paperclip, FileText, FileSpreadsheet, Image, FileCode, File, Download } from 'lucide-react';
import type { RFQDetail } from '../../../types/rfqTypes';
import { Button } from '../../../../../../components/ui/Button';
import { EmptyStateContainer } from '../../shared/EmptyStateContainer';

interface AttachmentsTabProps {
  rfq: RFQDetail;
  onDownload: (filename: string) => void;
}

export function AttachmentsTab({ rfq, onDownload }: AttachmentsTabProps) {
  const attachments = rfq.attachments || [];

  const getFileIcon = (type: string) => {
    const norm = type.toUpperCase();
    if (norm === 'PDF') return FileText;
    if (norm === 'EXCEL' || norm === 'XLSX') return FileSpreadsheet;
    if (norm === 'IMAGE' || norm === 'PNG' || norm === 'JPG') return Image;
    if (norm === 'CAD' || norm === 'DWG') return FileCode;
    return File;
  };

  return (
    <div className="space-y-4 text-left select-none animate-in fade-in duration-200">
      {attachments.length === 0 ? (
        <EmptyStateContainer
          title="No Attachments"
          description="This RFQ has no blueprints, specifications sheets, or bill of quantities uploaded."
          icon={Paperclip}
        />
      ) : (
        <div className="space-y-3">
          {attachments.map((att) => {
            const FileIcon = getFileIcon(att.fileType);
            const uploadDate = new Date(att.uploadedAt);

            return (
              <div
                key={att.id}
                className="p-3 border border-border rounded bg-surface hover:bg-slate-50/50 flex items-center justify-between gap-4 transition-all duration-150"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded bg-slate-100 text-text-secondary flex items-center justify-center shrink-0">
                    <FileIcon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h5 className="font-bold text-xs text-text-primary truncate max-w-[220px]">
                      {att.filename}
                    </h5>
                    <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-text-secondary font-semibold">
                      <span>Size: {att.size}</span>
                      <span>•</span>
                      <span>Uploaded: {uploadDate.toLocaleDateString()}</span>
                      <span>•</span>
                      <span>By: {att.uploader}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold text-text-secondary bg-slate-100 px-1.5 py-0.5 rounded border border-border">
                    {att.version}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDownload(att.filename)}
                    className="h-8 w-8 hover:bg-primary hover:text-primary-foreground hover:border-primary rounded-full border-border"
                  >
                    <Download className="h-3.5 w-3.5" />
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
