import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/ui/Card';
import type { RFQSummary } from '../../types/rfqTypes';

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
      color: statusColors[d.name] || '#cbd5e1'
    };
  });

  // 2. Priority distribution
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const priorityCounts = rfqs.reduce((acc: Record<string, number>, r) => {
    const p = r.priority.toUpperCase();
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});

  const priorityData = priorities.map(p => ({
    name: p,
    value: priorityCounts[p] || 0
  }));

  const maxPriorityValue = Math.max(...priorityData.map(d => d.value), 1);

  const priorityColors: Record<string, string> = {
    LOW: '#10b981', // Emerald
    MEDIUM: '#3b82f6', // Blue
    HIGH: '#f59e0b', // Amber
    CRITICAL: '#ef4444' // Rose
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none animate-in fade-in duration-200">
      
      {/* Donut Chart: Status distribution */}
      <Card className="text-left">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-slate-800">
            RFQ Status Segmentation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Donut SVG */}
          <div className="relative h-40 w-40 flex items-center justify-center shrink-0">
            {totalStatus === 0 ? (
              <span className="text-xs text-slate-400">No Data</span>
            ) : (
              <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 42 42">
                <circle 
                  cx="21" cy="21" r="15.915" 
                  fill="transparent" 
                  stroke="#f1f5f9" strokeWidth="4.2"
                />
                {donutSegments.map((seg, idx) => {
                  // Circumference = 2 * PI * r = 100
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
                      className="transition-all duration-300 hover:stroke-[5px] cursor-pointer"
                    >
                      <title>{`${seg.name}: ${seg.value} (${seg.percent.toFixed(1)}%)`}</title>
                    </circle>
                  );
                })}
              </svg>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-slate-800">{totalStatus}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">RFQs Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 w-full">
            {donutSegments.map((seg, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="text-slate-600 font-semibold truncate capitalize max-w-[100px]">
                    {seg.name.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
                <span className="font-bold text-slate-700 text-[11px]">
                  {seg.value} <span className="text-slate-400 font-medium">({seg.percent.toFixed(0)}%)</span>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart: Priority distribution */}
      <Card className="text-left">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-slate-800">
            SLA Priority Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 flex flex-col justify-end h-44">
          <div className="flex items-end justify-between h-28 gap-4 w-full px-2 border-b border-slate-100">
            {priorityData.map((d, idx) => {
              const barHeightPercent = (d.value / maxPriorityValue) * 100;
              const color = priorityColors[d.name] || '#94a3b8';
              return (
                <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group">
                  <span className="text-[10px] font-extrabold text-slate-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    {d.value}
                  </span>
                  <div 
                    style={{ height: `${barHeightPercent}%`, backgroundColor: color }}
                    className="w-full max-w-[28px] rounded-t transition-all duration-300 hover:brightness-95 hover:shadow-sm cursor-pointer"
                    title={`${d.name}: ${d.value} RFQs`}
                  />
                </div>
              );
            })}
          </div>
          {/* Axis Labels */}
          <div className="flex justify-between w-full px-2 mt-2">
            {priorityData.map((d, idx) => (
              <span key={idx} className="text-[9px] font-bold text-slate-500 uppercase tracking-wide flex-1 text-center truncate">
                {d.name}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
