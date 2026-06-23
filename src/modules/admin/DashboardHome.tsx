import React, { useEffect, useState } from 'react';

interface KPIData {
  revenue: { today: number; thisMonth: number; prevMonth: number; trend: number };
  orders: { today: number; thisMonth: number; prevMonth: number; trend: number };
  rfqs: { today: number; thisMonth: number; prevMonth: number; trend: number };
  inventory: { totalValue: number; lowStockCount: number };
  customers: { total: number; activeCount: number };
  salesTrend: Array<{ date: string; sales: number }>;
}

export const DashboardHome: React.FC = () => {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const token = localStorage.getItem('arcus_token');
        const res = await fetch('http://localhost:5000/api/admin/dashboard-kpis', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Failed to load KPIs');
        const data = await res.json();
        setKpis(data);
      } catch (err: any) {
        setError(err.message || 'Error fetching KPIs');
      } finally {
        setLoading(false);
      }
    };
    fetchKpis();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FFC107]"></div>
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className="bg-red-50 text-red-800 p-md rounded-2xl border border-red-200">
        <p className="font-semibold">Error: {error || 'Could not fetch KPI metrics.'}</p>
      </div>
    );
  }

  // Calculate coordinates for SVG sales trend path
  const trendMax = Math.max(...kpis.salesTrend.map(t => t.sales), 1000);
  const chartHeight = 140;
  const chartWidth = 500;
  const points = kpis.salesTrend.map((t, idx) => {
    const x = (idx / (kpis.salesTrend.length - 1)) * chartWidth;
    const y = chartHeight - (t.sales / trendMax) * chartHeight + 10; // offset slightly
    return { x, y, val: t.sales, date: t.date };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  // Area under path
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight + 20} L ${points[0].x} ${chartHeight + 20} Z`
    : '';

  return (
    <div className="space-y-lg text-left">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        {/* Revenue */}
        <div className="bg-white border border-slate-200 p-lg rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Revenue</p>
              <h3 className="text-headline-h5 font-extrabold text-slate-900 mt-xs">₹{kpis.revenue.thisMonth.toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-[#FFC107]">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
          </div>
          <div className="flex items-center gap-xs text-xs">
            <span className={`flex items-center font-bold ${kpis.revenue.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span className="material-symbols-outlined text-[16px]">{kpis.revenue.trend >= 0 ? 'trending_up' : 'trending_down'}</span>
              {Math.abs(kpis.revenue.trend)}%
            </span>
            <span className="text-slate-400 font-medium">vs last month</span>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white border border-slate-200 p-lg rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Orders</p>
              <h3 className="text-headline-h5 font-extrabold text-slate-900 mt-xs">{kpis.orders.thisMonth}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[24px]">local_mall</span>
            </div>
          </div>
          <div className="flex items-center gap-xs text-xs">
            <span className={`flex items-center font-bold ${kpis.orders.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span className="material-symbols-outlined text-[16px]">{kpis.orders.trend >= 0 ? 'trending_up' : 'trending_down'}</span>
              {Math.abs(kpis.orders.trend)}%
            </span>
            <span className="text-slate-400 font-medium">vs last month</span>
          </div>
        </div>

        {/* RFQs */}
        <div className="bg-white border border-slate-200 p-lg rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active RFQs</p>
              <h3 className="text-headline-h5 font-extrabold text-slate-900 mt-xs">{kpis.rfqs.thisMonth}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
              <span className="material-symbols-outlined text-[24px]">description</span>
            </div>
          </div>
          <div className="flex items-center gap-xs text-xs">
            <span className={`flex items-center font-bold ${kpis.rfqs.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span className="material-symbols-outlined text-[16px]">{kpis.rfqs.trend >= 0 ? 'trending_up' : 'trending_down'}</span>
              {Math.abs(kpis.rfqs.trend)}%
            </span>
            <span className="text-slate-400 font-medium">vs last month</span>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white border border-slate-200 p-lg rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Value</p>
              <h3 className="text-headline-h5 font-extrabold text-slate-900 mt-xs">₹{kpis.inventory.totalValue.toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600">
              <span className="material-symbols-outlined text-[24px]">warehouse</span>
            </div>
          </div>
          <div className="flex items-center gap-xs text-xs text-slate-500 font-bold">
            <span className={`px-2 py-0.5 rounded-full ${kpis.inventory.lowStockCount > 0 ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : 'bg-green-50 text-green-600 border border-green-200'}`}>
              {kpis.inventory.lowStockCount} Low stock items
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Trend Area Chart (SVG) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-lg rounded-2xl shadow-sm space-y-md">
          <div className="flex justify-between items-center border-b border-slate-100 pb-sm">
            <div>
              <h4 className="font-extrabold text-slate-900 text-body-md">Daily Sales Revenue Trend</h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Rolling 7-day transaction volumes</p>
            </div>
            <div className="text-xs bg-[#FFC107]/10 text-amber-900 border border-[#FFC107]/20 rounded-xl px-md py-sm font-bold">
              INR (₹) Total
            </div>
          </div>

          <div className="relative">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFC107" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#FFC107" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={chartHeight * ratio + 10}
                  x2={chartWidth}
                  y2={chartHeight * ratio + 10}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Area */}
              {areaD && <path d={areaD} fill="url(#chartGradient)" />}

              {/* Line */}
              {pathD && <path d={pathD} fill="none" stroke="#FFC107" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

              {/* Circles / Dots */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill="#FFC107"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="hover:scale-150 transition-transform cursor-pointer"
                  />
                  {/* Tooltip-like values */}
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    fill="#1E293B"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    ₹{Math.round(p.val / 100) / 10}k
                  </text>
                </g>
              ))}

              {/* Dates labels */}
              {points.map((p, i) => (
                <text
                  key={i}
                  x={p.x}
                  y={chartHeight + 25}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {p.date}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Operational Overview Cards */}
        <div className="bg-white border border-slate-200 p-lg rounded-2xl shadow-sm flex flex-col justify-between space-y-md">
          <div>
            <h4 className="font-extrabold text-slate-900 text-body-md border-b border-slate-100 pb-sm mb-md">Operational Demographics</h4>
            <div className="space-y-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-amber-500 bg-amber-50 p-xs rounded-xl text-[20px]">people</span>
                  <div>
                    <p className="text-body-sm font-bold text-slate-900">Total Customers</p>
                    <p className="text-[10px] text-slate-400 font-medium">Platform registered</p>
                  </div>
                </div>
                <span className="font-extrabold text-slate-900 text-body-md">{kpis.customers.total}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-green-500 bg-green-50 p-xs rounded-xl text-[20px]">how_to_reg</span>
                  <div>
                    <p className="text-body-sm font-bold text-slate-900">Active Procurement Partners</p>
                    <p className="text-[10px] text-slate-400 font-medium">Made orders or RFQs</p>
                  </div>
                </div>
                <span className="font-extrabold text-slate-900 text-body-md">{kpis.customers.activeCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-red-500 bg-red-50 p-xs rounded-xl text-[20px]">error_med</span>
                  <div>
                    <p className="text-body-sm font-bold text-slate-900">Low Stock Indicators</p>
                    <p className="text-[10px] text-slate-400 font-medium">Critical reorder warning</p>
                  </div>
                </div>
                <span className="font-extrabold text-red-600 text-body-md bg-red-50 px-md py-0.5 rounded border border-red-200">{kpis.inventory.lowStockCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-md rounded-xl text-xs leading-relaxed text-slate-600 font-semibold flex gap-xs">
            <span className="material-symbols-outlined text-[#FFC107] text-[18px]">verified_user</span>
            System status: Operating normally. All database sync channels are fully active.
          </div>
        </div>
      </div>
    </div>
  );
};
