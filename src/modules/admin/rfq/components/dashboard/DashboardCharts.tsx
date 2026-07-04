import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/ui/Card';
import type { RFQSummary } from '../../types/rfqTypes';
import { cn } from '../../../../../components/ui/utils';
import { ShieldAlert, AlertTriangle, Info, ShieldCheck } from 'lucide-react';

interface DashboardChartsProps {
  rfqs: RFQSummary[];
}

export function DashboardCharts({ rfqs }: DashboardChartsProps) {
  // 1. Status distribution
  const statuses = ['SUBMITTED', 'ASSIGNED', 'UNDER_REVIEW', 'NEGOTIATION', 'APPROVED', 'REJECTED', 'CONVERTED'];
  const statusCounts = rfqs.reduce((acc: Record<string, number>, r) => {
    const s = r.status.toUpperCase();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const statusData = statuses.map(s => ({
    name: s,
    value: statusCounts[s] || 0
  })).filter(d => d.value > 0);

  const statusColors: Record<string, string> = {
    SUBMITTED: '#6366f1', // Indigo
    ASSIGNED: '#3b82f6', // Blue
    UNDER_REVIEW: '#8b5cf6', // Violet
    NEGOTIATION: '#f59e0b', // Amber
    APPROVED: '#10b981', // Emerald
    REJECTED: '#ef4444', // Rose
    CONVERTED: '#06b6d4' // Cyan
  };

  const statusBgColors: Record<string, string> = {
    SUBMITTED: 'bg-indigo-500',
    ASSIGNED: 'bg-blue-500',
    UNDER_REVIEW: 'bg-violet-500',
    NEGOTIATION: 'bg-amber-500',
    APPROVED: 'bg-emerald-500',
    REJECTED: 'bg-rose-500',
    CONVERTED: 'bg-cyan-500'
  };

  // Compute Donut SVG parameters
  const totalStatus = statusData.reduce((sum, d) => sum + d.value, 0);
  let accumulatedPercent = 0;
  
  const donutSegments = statusData.map(d => {
    const percent = totalStatus > 0 ? (d.value / totalStatus) * 100 : 0;
    const startPercent = accumulatedPercent;
    accumulatedPercent += percent;
    return {
      name: d.name,
      value: d.value,
      percent,
      startPercent,
      color: statusColors[d.name] || '#cbd5e1',
      bgColor: statusBgColors[d.name] || 'bg-slate-400'
    };
  });

  // 2. Priority distribution
  const priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const priorityCounts = rfqs.reduce((acc: Record<string, number>, r) => {
    const p = r.priority.toUpperCase();
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});

  const totalPriority = priorities.reduce((sum, p) => sum + (priorityCounts[p] || 0), 0);

  const priorityData = priorities.map(p => {
    const value = priorityCounts[p] || 0;
    const percent = totalPriority > 0 ? (value / totalPriority) * 100 : 0;
    return {
      name: p,
      value,
      percent
    };
  });

  const priorityColors: Record<string, string> = {
    CRITICAL: 'bg-rose-500 border-rose-600',
    HIGH: 'bg-amber-500 border-amber-600',
    MEDIUM: 'bg-blue-500 border-blue-600',
    LOW: 'bg-emerald-500 border-emerald-600'
  };

  const priorityIcons: Record<string, any> = {
    CRITICAL: ShieldAlert,
    HIGH: AlertTriangle,
    MEDIUM: Info,
    LOW: ShieldCheck
  };

  const priorityLabels: Record<string, string> = {
    CRITICAL: 'Critical SLA (<6h)',
    HIGH: 'High SLA (12h)',
    MEDIUM: 'Medium SLA (24h)',
    LOW: 'Low SLA (48h)'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none animate-in fade-in duration-200">
      
      {/* 1. Status distribution donut chart */}
      <Card className="border border-slate-100 bg-white shadow-sm rounded-xl">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center justify-between">
            <span>RFQ Status Segment</span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Live breakdown
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 flex flex-col sm:flex-row items-center justify-between gap-6 mt-2">
          
          {/* Donut SVG */}
          <div className="relative h-40 w-40 flex items-center justify-center shrink-0">
            {totalStatus === 0 ? (
              <span className="text-xs text-slate-400">No Data</span>
            ) : (
              <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 42 42">
                <circle 
                  cx="21" cy="21" r="15.915" 
                  fill="transparent" 
                  stroke="#f8fafc" strokeWidth="4.2"
                />
                {donutSegments.map((seg, idx) => {
                  const strokeDasharray = `${seg.percent} ${100 - seg.percent}`;
                  const strokeDashoffset = 100 - seg.startPercent;
                  return (
                    <circle
                      key={idx}
                      cx="21" cy="21" r="15.915"
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="4.2"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-300 hover:stroke-[5.2px] cursor-pointer"
                    >
                      <title>{`${seg.name}: ${seg.value} (${seg.percent.toFixed(1)}%)`}</title>
                    </circle>
                  );
                })}
              </svg>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-slate-800">{totalStatus}</span>
              <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">RFQs Total</span>
            </div>
          </div>

          {/* Ledger Legend list with Share Progress bars */}
          <div className="space-y-3 w-full">
            {donutSegments.map((seg, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", seg.bgColor)} />
                    <span className="text-slate-600 font-bold capitalize">
                      {seg.name.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  <span className="font-extrabold text-slate-800">
                    {seg.value} <span className="text-slate-400 font-medium">({seg.percent.toFixed(0)}%)</span>
                  </span>
                </div>
                {/* Visual horizontal share bar */}
                <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden border border-slate-100/50">
                  <div className={cn("h-full rounded-full", seg.bgColor)} style={{ width: `${seg.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2. Priority List with progress indicators */}
      <Card className="border border-slate-100 bg-white shadow-sm rounded-xl">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center justify-between">
            <span>SLA Priority Distribution</span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Commitment limits
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 flex flex-col justify-center gap-4 mt-2">
          <div className="space-y-3.5 w-full">
            {priorityData.map((d, idx) => {
              const Icon = priorityIcons[d.name] || Info;
              const color = priorityColors[d.name] || 'bg-slate-400';
              const label = priorityLabels[d.name] || d.name;
              
              return (
                <div key={idx} className="flex items-center gap-3">
                  {/* Left Label & Icon */}
                  <div className="w-28 flex items-center gap-1.5 shrink-0">
                    <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] font-bold text-slate-600 truncate">{label}</span>
                  </div>

                  {/* Horizontal share progress bar */}
                  <div className="flex-1 bg-slate-50 h-2.5 rounded-full overflow-hidden border border-slate-100/50">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-300", color)}
                      style={{ width: `${d.percent}%` }}
                    />
                  </div>

                  {/* Right count details */}
                  <div className="w-12 text-right shrink-0">
                    <span className="text-xs font-extrabold text-slate-800">{d.value}</span>
                    <span className="text-[9px] font-semibold text-slate-400 ml-1">({d.percent.toFixed(0)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
