import { FolderOpen, Clock, TrendingUp, CheckCircle, ShoppingBag, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { RFQSummary } from '../../types/rfqTypes';
import { RFQStatus } from '../../constants/status';
import { cn } from '../../../../../components/ui/utils';

interface DashboardKPIsProps {
  rfqs: RFQSummary[];
  onTabChange?: (tab: string) => void;
}

export function DashboardKPIs({ rfqs, onTabChange }: DashboardKPIsProps) {
  // Compute metrics based on actual RFQs
  const openRFQs = rfqs.filter(r => 
    r.status === RFQStatus.SUBMITTED || 
    r.status === RFQStatus.ASSIGNED || 
    r.status === RFQStatus.UNDER_REVIEW || 
    r.status === RFQStatus.NEGOTIATION
  ).length;

  const negotiations = rfqs.filter(r => r.status === RFQStatus.NEGOTIATION).length;
  
  const pendingApproval = rfqs.filter(r => 
    r.status === RFQStatus.UNDER_REVIEW || 
    r.status === RFQStatus.ASSIGNED
  ).length;

  const now = new Date();
  const overdueCount = rfqs.filter(r => 
    new Date(r.dueDate) < now && 
    r.status !== RFQStatus.APPROVED && 
    r.status !== RFQStatus.CONVERTED
  ).length;

  const wonCount = rfqs.filter(r => r.status === RFQStatus.CONVERTED).length;
  
  const totalRevenuePipeline = rfqs
    .filter(r => r.status !== RFQStatus.REJECTED && r.status !== RFQStatus.EXPIRED)
    .reduce((sum, r) => sum + r.value, 0);

  // Sparkline path generators for visual variety
  const sparklines = [
    "M0,6 Q5,2 10,5 T20,1 T30,4",
    "M0,4 Q5,8 10,2 T20,6 T30,1",
    "M0,8 Q5,1 10,4 T20,2 T30,5",
    "M0,2 Q5,5 10,3 T20,7 T30,2",
    "M0,7 Q5,4 10,6 T20,3 T30,1",
    "M0,5 Q5,2 10,7 T20,4 T30,3"
  ];

  const cards = [
    {
      title: "Open RFQs",
      value: openRFQs,
      trend: "+12% today",
      isPositive: true,
      icon: FolderOpen,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50/50",
      sparkline: sparklines[0],
      actionLabel: "View list",
      action: () => onTabChange?.('workspace')
    },
    {
      title: "Active Negotiations",
      value: negotiations,
      trend: "4 pending",
      isPositive: true,
      icon: TrendingUp,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50/50",
      sparkline: sparklines[1],
      actionLabel: "Follow-up",
      action: () => onTabChange?.('workspace')
    },
    {
      title: "Pending Approval",
      value: pendingApproval,
      trend: "3 overdue",
      isPositive: false,
      icon: Clock,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50/50",
      sparkline: sparklines[2],
      actionLabel: "Review",
      action: () => onTabChange?.('workspace')
    },
    {
      title: "Overdue Pipeline",
      value: overdueCount,
      trend: "-8% this week",
      isPositive: true,
      icon: AlertCircle,
      iconColor: "text-rose-500",
      bgColor: "bg-rose-50/50",
      sparkline: sparklines[3],
      actionLabel: "Escalate",
      action: () => alert("Escalated overdue alerts to operations desk.")
    },
    {
      title: "Win Conversion",
      value: `${wonCount} Won`,
      trend: "+2% conversion",
      isPositive: true,
      icon: CheckCircle,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-50/50",
      sparkline: sparklines[4],
      actionLabel: "Analyze",
      action: () => onTabChange?.('analytics')
    },
    {
      title: "Revenue Pipeline",
      value: `₹${(totalRevenuePipeline / 1000000).toFixed(1)}M`,
      trend: "+₹450k today",
      isPositive: true,
      icon: ShoppingBag,
      iconColor: "text-indigo-500",
      bgColor: "bg-indigo-50/50",
      sparkline: sparklines[5],
      actionLabel: "Forecast",
      action: () => onTabChange?.('analytics')
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 w-full">
      {cards.map((c, idx) => {
        const IconComponent = c.icon;
        return (
          <div 
            key={idx} 
            className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all duration-200 text-left relative overflow-hidden group min-h-[148px]"
          >
            {/* Top Row: Icon & Action */}
            <div className="flex justify-between items-start">
              <div className={cn("p-2 rounded-lg shrink-0", c.bgColor)}>
                <IconComponent className={cn("h-4.5 w-4.5", c.iconColor)} />
              </div>
              <button 
                onClick={c.action}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[10px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-0.5 border border-slate-150 rounded px-1.5 py-0.5 bg-slate-50 cursor-pointer"
              >
                {c.actionLabel}
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>

            {/* Middle Row: Title & Sparkline */}
            <div className="flex items-end justify-between mt-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.title}</p>
                <h3 className="text-lg font-black text-slate-800 tracking-tight mt-0.5">{c.value}</h3>
              </div>
              {/* Sparkline Graphic */}
              <div className="h-6 w-12 shrink-0 pr-1">
                <svg className={cn("w-full h-full", c.isPositive ? "text-emerald-500" : "text-rose-500")} viewBox="0 0 30 10" fill="none">
                  <path 
                    d={c.sparkline} 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Bottom Row: Trend pill */}
            <div className="flex items-center gap-1 mt-2.5">
              <span className={cn(
                "inline-flex items-center text-[9px] font-extrabold px-1.5 py-0.5 rounded-full",
                c.isPositive 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100/50" 
                  : "bg-rose-50 text-rose-700 border border-rose-100/50"
              )}>
                {c.isPositive ? <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" /> : <ArrowDownRight className="h-2.5 w-2.5 mr-0.5" />}
                {c.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
