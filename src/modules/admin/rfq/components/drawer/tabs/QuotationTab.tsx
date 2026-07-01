import { FileSignature, Download } from 'lucide-react';
import type { RFQDetail } from '../../../types/rfqTypes';
import { Button } from '../../../../../../components/ui/Button';
import { EmptyStateContainer } from '../../shared/EmptyStateContainer';

interface QuotationTabProps {
  rfq: RFQDetail;
  onDownloadQuote: (quoteId: string, filename: string) => void;
}

export function QuotationTab({ rfq, onDownloadQuote }: QuotationTabProps) {
  const quotations = rfq.quotations || [];

  return (
    <div className="space-y-4 text-left select-none animate-in fade-in duration-200">
      {quotations.length === 0 ? (
        <EmptyStateContainer
          title="No Proposals Drafted"
          description="We haven't shared any quotations or pricing proposals for this RFQ yet."
          icon={FileSignature}
        />
      ) : (
        <div className="space-y-3">
          {quotations.map((q) => {
            const isAccepted = q.status === 'ACCEPTED';
            const created = new Date(q.createdAt);
            const expires = new Date(q.validUntil);

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
                      {q.id} ({q.version})
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                        isAccepted
                          ? 'bg-success/20 text-success border-success/35'
                          : q.status === 'REJECTED'
                          ? 'bg-danger/15 text-danger border-danger/30'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>

                  <div className="font-extrabold text-sm text-text-primary">
                    Offer: ₹{q.value.toLocaleString('en-IN')}
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
                    onClick={() => onDownloadQuote(q.id, `${q.id}.pdf`)}
                    className="h-8 text-xs font-bold flex items-center gap-1 border-border"
                  >
                    <Download className="h-3.5 w-3.5" />
                    PDF
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
