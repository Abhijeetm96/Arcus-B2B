import { FileSignature, Download, Eye, Plus } from 'lucide-react';
import type { RFQDetail } from '../../../types/rfqTypes';
import { Button } from '../../../../../../components/ui/Button';
import { EmptyStateContainer } from '../../shared/EmptyStateContainer';
import { DocumentStatusBadge } from '../../../../../../components/shared/DocumentStatusBadge';
import { cn } from '../../../../../../components/ui/utils';

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
        <div className="border border-slate-100 rounded-lg overflow-hidden bg-white shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-bold">
                <th className="p-3">Quotation No.</th>
                <th className="p-3">Revision</th>
                <th className="p-3 text-right">Offer Value</th>
                <th className="p-3">Status</th>
                <th className="p-3">Sent Date</th>
                <th className="p-3">Validity</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => {
                const isAccepted = q.status === 'ACCEPTED' || q.status === 'APPROVED' || q.status === 'CONVERTED';
                const createdVal = q.createdAt || q.created_at || Date.now();
                const created = new Date(createdVal);
                const expiresVal = q.validUntil || q.expires_at || (Date.now() + 7 * 24 * 60 * 60 * 1000);
                const expires = new Date(expiresVal);
                const isExpired = expires < new Date();

                return (
                  <tr key={q.id} className={cn("border-b border-slate-100 hover:bg-slate-50/50 last:border-b-0", isAccepted && "bg-emerald-50/10")}>
                    <td className="p-3 font-mono font-bold text-slate-800">
                      {q.quotation_number || q.id.substring(0, 8)}
                    </td>
                    <td className="p-3 text-slate-500 font-medium">
                      Rev {q.version || 1}
                    </td>
                    <td className="p-3 text-right font-extrabold text-slate-900">
                      ₹{Number(q.value || q.grand_total || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <DocumentStatusBadge status={q.status} />
                    </td>
                    <td className="p-3 text-slate-500 font-medium">
                      {created.toLocaleDateString('en-IN')}
                    </td>
                    <td className={cn("p-3 font-medium", isExpired ? "text-rose-500 font-bold" : "text-slate-500")}>
                      {expires.toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewDetails(q.id)}
                          className="h-7 w-7 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 rounded-full"
                          title="View & Edit Proposal"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {q.isPersisted !== false ? (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onDownloadQuote(q.id, `${q.id}.pdf`)}
                            className="h-7 w-7 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 rounded-full"
                            title="Download PDF"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <span 
                            title="Document available after saving"
                            className="text-[10px] text-slate-400 bg-slate-50 font-semibold px-2 py-1 rounded cursor-not-allowed select-none border border-slate-100"
                          >
                            Draft
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
