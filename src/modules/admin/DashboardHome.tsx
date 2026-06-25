import React, { useEffect, useState } from 'react';
import { MetricCard, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/shared/Card';
import { IndianRupee, ShoppingBag, FileText, Package, Users, UserCheck, AlertTriangle, ShieldCheck } from 'lucide-react';

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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded border border-red-200">
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
    <div className="space-y-6 text-left">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <MetricCard
          title="Monthly Revenue"
          value={`₹${kpis.revenue.thisMonth.toLocaleString('en-IN')}`}
          description="vs last month"
          icon={<IndianRupee className="h-4 w-4" />}
          trend={{ value: `${Math.abs(kpis.revenue.trend)}%`, isPositive: kpis.revenue.trend >= 0 }}
        />

        {/* Orders */}
        <MetricCard
          title="Monthly Orders"
          value={kpis.orders.thisMonth}
          description="vs last month"
          icon={<ShoppingBag className="h-4 w-4" />}
          trend={{ value: `${Math.abs(kpis.orders.trend)}%`, isPositive: kpis.orders.trend >= 0 }}
        />

        {/* RFQs */}
        <MetricCard
          title="Active RFQs"
          value={kpis.rfqs.thisMonth}
          description="vs last month"
          icon={<FileText className="h-4 w-4" />}
          trend={{ value: `${Math.abs(kpis.rfqs.trend)}%`, isPositive: kpis.rfqs.trend >= 0 }}
        />

        {/* Inventory */}
        <MetricCard
          title="Inventory Value"
          value={`₹${kpis.inventory.totalValue.toLocaleString('en-IN')}`}
          description={`${kpis.inventory.lowStockCount} Low stock items`}
          icon={<Package className="h-4 w-4" />}
          trend={{ value: kpis.inventory.lowStockCount > 0 ? 'Reorder' : 'Healthy', isPositive: kpis.inventory.lowStockCount === 0 }}
        />
      </div>

      {/* Main Charts & Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (SVG) */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
            <div>
              <CardTitle className="text-base font-extrabold">Daily Sales Revenue Trend</CardTitle>
              <CardDescription>Rolling 7-day transaction volumes</CardDescription>
            </div>
            <div className="text-xs bg-primary/10 text-amber-900 border border-primary/20 rounded px-3 py-1 font-bold">
              INR (₹) Total
            </div>
          </CardHeader>

          <CardContent className="p-6">
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
          </CardContent>
        </Card>

        {/* Operational Overview Cards */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-extrabold">Operational Demographics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-amber-50 p-2 rounded text-amber-500">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">Total Customers</p>
                  <p className="text-[10px] text-text-secondary font-medium">Platform registered</p>
                </div>
              </div>
              <span className="font-extrabold text-text-primary text-base">{kpis.customers.total}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-50 p-2 rounded text-green-500">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">Active Procurement Partners</p>
                  <p className="text-[10px] text-text-secondary font-medium">Made orders or RFQs</p>
                </div>
              </div>
              <span className="font-extrabold text-text-primary text-base">{kpis.customers.activeCount}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-50 p-2 rounded text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">Low Stock Indicators</p>
                  <p className="text-[10px] text-text-secondary font-medium">Critical reorder warning</p>
                </div>
              </div>
              <span className="font-extrabold text-red-600 text-base bg-red-50 px-2 py-0.5 rounded border border-red-200">{kpis.inventory.lowStockCount}</span>
            </div>

            <div className="bg-surface-secondary border border-border p-3 rounded text-xs leading-relaxed text-text-secondary font-semibold flex gap-2 mt-4">
              <ShieldCheck className="text-primary h-5 w-5 flex-shrink-0" />
              System status: Operating normally. All database sync channels are fully active.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
