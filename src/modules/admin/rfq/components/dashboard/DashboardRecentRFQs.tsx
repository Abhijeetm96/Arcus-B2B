import { FileText, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { StatusBadge } from '../../../../../components/ui/StatusBadge';
import type { RFQSummary } from '../../types/rfqTypes';

interface DashboardRecentRFQsProps {
  rfqs: RFQSummary[];
  onSelectRFQ: (id: string) => void;
  onViewAll: () => void;
}

export function DashboardRecentRFQs({ rfqs, onSelectRFQ, onViewAll }: DashboardRecentRFQsProps) {
  // Sort by ID or last updated (descending) and take top 5
  const recentList = [...rfqs]
    .sort((a, b) => b.rfqNumber.localeCompare(a.rfqNumber))
    .slice(0, 5);

  return (
    <Card className="h-full flex flex-col text-left">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Recent RFQ Submissions
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="h-8 font-bold text-xs">
          View All Workspace
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow overflow-x-auto p-4 md:p-6 pt-0">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-text-secondary font-bold uppercase tracking-wider">
              <th className="py-2.5 px-3">RFQ Number</th>
              <th className="py-2.5 px-3">Company</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Est. Value</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {recentList.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-text-secondary">
                  No RFQs found.
                </td>
              </tr>
            ) : (
              recentList.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 group transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-text-primary">
                    {r.rfqNumber}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-text-primary truncate max-w-[140px]">
                      {r.companyName}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-text-primary">
                    ₹{r.value.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectRFQ(r.id)}
                      className="h-7 text-[10px] font-bold py-0.5 px-2 hover:bg-primary hover:text-primary-foreground border-border hover:border-primary"
                    >
                      Open
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
