import { FolderOpen, Clock, FileText, TrendingUp, CheckCircle, ShoppingBag } from 'lucide-react';
import { MetricCard } from '../../../../../components/ui/Card';
import type { RFQSummary } from '../../types/rfqTypes';
import { RFQStatus } from '../../constants/status';

interface DashboardKPIsProps {
  rfqs: RFQSummary[];
}

export function DashboardKPIs({ rfqs }: DashboardKPIsProps) {
  const openRFQs = rfqs.filter(r => 
    r.status === RFQStatus.SUBMITTED || 
    r.status === RFQStatus.ASSIGNED || 
    r.status === RFQStatus.UNDER_REVIEW || 
    r.status === RFQStatus.NEGOTIATION
  ).length;

  const awaitingReview = rfqs.filter(r => 
    r.status === RFQStatus.SUBMITTED || 
    r.status === RFQStatus.UNDER_REVIEW
  ).length;

  const negotiations = rfqs.filter(r => r.status === RFQStatus.NEGOTIATION).length;
  const approved = rfqs.filter(r => r.status === RFQStatus.APPROVED).length;
  const converted = rfqs.filter(r => r.status === RFQStatus.CONVERTED).length;
  
  // Simulated total quotes sent
  const quotationsSent = rfqs.filter(r => 
    r.status === RFQStatus.NEGOTIATION || 
    r.status === RFQStatus.APPROVED || 
    r.status === RFQStatus.CONVERTED
  ).length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 w-full">
      <MetricCard
        className="border-l-4 border-l-blue-500"
        title="Open RFQs"
        value={openRFQs}
        icon={<FolderOpen className="h-4 w-4 text-blue-500" />}
        description="Active customer pipelines"
      />
      <MetricCard
        className="border-l-4 border-l-amber-500"
        title="Awaiting Review"
        value={awaitingReview}
        icon={<Clock className="h-4 w-4 text-amber-500" />}
        description="Pending initial verification"
      />
      <MetricCard
        className="border-l-4 border-l-indigo-500"
        title="Quotations Sent"
        value={quotationsSent}
        icon={<FileText className="h-4 w-4 text-indigo-500" />}
        description="Proposals shared with buyers"
      />
      <MetricCard
        className="border-l-4 border-l-purple-500"
        title="Negotiations"
        value={negotiations}
        icon={<TrendingUp className="h-4 w-4 text-purple-500" />}
        description="Active quote revisions"
      />
      <MetricCard
        className="border-l-4 border-l-emerald-500"
        title="Approved"
        value={approved}
        icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
        description="Awaiting order conversion"
      />
      <MetricCard
        className="border-l-4 border-l-yellow-500"
        title="Converted to Orders"
        value={converted}
        icon={<ShoppingBag className="h-4 w-4 text-yellow-500" />}
        description="Successfully closed deals"
      />
    </div>
  );
}
