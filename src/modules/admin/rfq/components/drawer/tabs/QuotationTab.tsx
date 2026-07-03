import { FileSignature, Download, Eye, Plus } from 'lucide-react';
import type { RFQDetail } from '../../../types/rfqTypes';
import { Button } from '../../../../../../components/ui/Button';
import { EmptyStateContainer } from '../../shared/EmptyStateContainer';
import { DocumentStatusBadge } from '../../../../../../components/shared/DocumentStatusBadge';

interface QuotationTabProps {
  rfq: RFQDetail;
  onDownloadQuote: (quoteId: string, filename: string) => void;
}

export function QuotationTab({ rfq, onDownloadQuote }: QuotationTabProps) {
  const quotations = rfq.quotations || [];

  const handleCreateNew = () => {
    window.location.hash = `#/portal/admin/quotations/new?rfqId=${rfq.id}`;
  };

  const handleViewDetails = (quoteId: string) => {
    window.location.hash = `#/portal/admin/quotations/${quoteId}`;
  };

  return (
    <div className="space-y-4 text-left select-none animate-in fade-in duration-200">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Quotations list</h4>
        <Button
          onClick={handleCreateNew}
          size="sm"
          className="h-8 text-xs font-bold flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800"
        >
          <Plus className="h-3.5 w-3.5" />
          Draft Quote
        </Button>
      </div>

      {quotations.length === 0 ? (
        <EmptyStateContainer
          title="No Proposals Drafted"
          description="We haven't shared any quotations or pricing proposals for this RFQ yet."
          icon={FileSignature}
        />
      ) : (
        <div className="space-y-3">
          {quotations.map((q) => {
            const isAccepted = q.status === 'ACCEPTED' || q.status === 'APPROVED' || q.status === 'CONVERTED';
            const createdVal = q.createdAt || q.created_at || Date.now();
            const created = new Date(createdVal);
            const expiresVal = q.validUntil || q.expires_at || (Date.now() + 7 * 24 * 60 * 60 * 1000);
            const expires = new Date(expiresVal);

            return (
              <div
                key={q.id}
                className={`p-3 border rounded bg-surface hover:bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-150 ${
                  isAccepted ? 'border-success bg-success/5' : 'border-border'
                }`}
              >
                <div className="space-y-1.5 min-w-0 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-text-primary">
                      {q.quotation_number || q.id.substring(0, 8)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      (Rev {q.version || 1})
                    </span>
                    <DocumentStatusBadge status={q.status} />
                  </div>

                  <div className="font-extrabold text-sm text-text-primary">
                    Offer: ₹{Number(q.value || q.grand_total || 0).toLocaleString('en-IN')}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-text-secondary font-semibold">
                    <span>Sent: {created.toLocaleDateString()}</span>
                    <span>•</span>
                    <span className={expires < new Date() ? 'text-danger' : 'text-text-secondary'}>
                      Valid to: {expires.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(q.id)}
                    className="h-8 text-xs font-bold flex items-center gap-1 border-border"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  {q.isPersisted !== false ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownloadQuote(q.id, `${q.id}.pdf`)}
                      className="h-8 text-xs font-bold flex items-center gap-1 border-border"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </Button>
                  ) : (
                    <span 
                      title="This proposal is mock data. Create and save a real quotation to compile and download its PDF document."
                      className="text-[10px] text-slate-400 bg-slate-100 font-semibold px-2.5 py-1.5 rounded cursor-not-allowed select-none"
                    >
                      Document available after saving
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
