import React, { useEffect, useState } from 'react';

interface AnalyticsData {
  totalSearches: number;
  uniqueQueriesCount: number;
  totalClicks: number;
  topQueries: Array<{ query: string; count: number; clickedCount?: number }>;
  zeroResults: Array<{ query: string; count: number }>;
}

export const SearchAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('arcus_token');
        const res = await fetch('http://localhost:5000/api/admin/search-analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load search analytics.');
        const data = await res.json();
        setAnalytics(data);
      } catch (err: any) {
        setError(err.message || 'Error fetching analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-xl">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="bg-red-50 text-red-800 p-md rounded border border-red-200">
        <p className="font-semibold">Error: {error || 'Could not load search insights.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-lg text-left">
      {/* Telemetry Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="bg-white border border-slate-200 p-lg rounded shadow-sm flex items-center gap-md">
          <div className="w-12 h-12 rounded bg-amber-50 text-amber-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">search</span>
          </div>
          <div>
            <p className="text-[24px] font-black text-slate-900 mt-xs leading-none">{analytics.totalSearches || 0}</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Total Catalog Searches</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-lg rounded shadow-sm flex items-center gap-md">
          <div className="w-12 h-12 rounded bg-blue-50 text-blue-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">manage_search</span>
          </div>
          <div>
            <p className="text-[24px] font-black text-slate-900 mt-xs leading-none">{analytics.uniqueQueriesCount || 0}</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Unique Query Strings</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-lg rounded shadow-sm flex items-center gap-md">
          <div className="w-12 h-12 rounded bg-green-50 text-green-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">ads_click</span>
          </div>
          <div>
            <p className="text-[24px] font-black text-slate-900 mt-xs leading-none">
              {analytics.totalSearches ? `${Math.round(((analytics.totalClicks || 0) / analytics.totalSearches) * 100)}%` : '0%'}
            </p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Search Clicks CTR</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Top Search Queries Table */}
        <div className="border border-slate-200 rounded p-lg bg-white shadow-sm space-y-md">
          <div>
            <h4 className="font-extrabold text-slate-900 text-body-md">Top Catalogs Searched</h4>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Most common buyer search terms & intent</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-md py-sm">Query Term</th>
                  <th className="px-md py-sm">Searches count</th>
                  <th className="px-md py-sm">Click Count</th>
                  <th className="px-md py-sm text-right">Click Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.topQueries.map((q, i) => {
                  const ctr = q.count > 0 ? Math.round(((q.clickedCount || 0) / q.count) * 100) : 0;
                  return (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-md py-sm font-bold text-slate-900">"{q.query}"</td>
                      <td className="px-md py-sm text-slate-500 font-semibold">{q.count}</td>
                      <td className="px-md py-sm text-slate-500 font-semibold">{q.clickedCount || 0}</td>
                      <td className="px-md py-sm text-right font-black text-primary">{ctr}%</td>
                    </tr>
                  );
                })}
                {analytics.topQueries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-md text-slate-400 italic">No catalog searches logged.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Zero Results Queries Table */}
        <div className="border border-slate-200 rounded p-lg bg-white shadow-sm space-y-md">
          <div>
            <h4 className="font-extrabold text-red-700 flex items-center gap-xs text-body-md">
              <span className="material-symbols-outlined text-[20px] text-red-500">warning</span>
              Zero-Result Queries (Unmet Demands)
            </h4>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Queries typed by buyers that returned 0 products</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-md py-sm">Failed Query String</th>
                  <th className="px-md py-sm text-right">Search Attempts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.zeroResults.map((q, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-md py-sm font-bold text-red-700">"{q.query}"</td>
                    <td className="px-md py-sm text-right text-slate-500 font-semibold">{q.count}</td>
                  </tr>
                ))}
                {analytics.zeroResults.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center py-md text-green-600 font-semibold italic">No failed searches logged. Great catalog!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
