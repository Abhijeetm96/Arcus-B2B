import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { exportToCSV } from '../../utils/csvHelpers';

interface AnalyticsData {
  totalSearches: number;
  uniqueQueriesCount: number;
  totalClicks: number;
  topQueries: Array<{ query: string; count: number; clickedCount?: number; locations?: string }>;
  zeroResults: Array<{ query: string; count: number }>;
  locationMetrics: Array<{ city: string; count: number }>;
  detailedLogs: Array<{ id: number | string; timestamp: string; query: string; resultsCount: number; city: string; state: string; categories: string; pageBrowsed: string }>;
}

export const SearchAnalytics: React.FC<{ view?: 'queries' | 'locations' }> = ({ view = 'queries' }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed'>('summary');

  const handleExportTopQueries = () => {
    if (!analytics) return;
    const headers = [
      { label: 'Query Term', key: 'query' },
      { label: 'Searches Count', key: 'count' },
      { label: 'Click Count', key: 'clickedCount' },
      { label: 'Click Rate (%)', key: 'ctr' },
      { label: 'Top Locations', key: 'locations' }
    ];
    const data = analytics.topQueries.map(q => ({
      query: q.query,
      count: q.count,
      clickedCount: q.clickedCount || 0,
      ctr: q.count > 0 ? Math.round(((q.clickedCount || 0) / q.count) * 100) : 0,
      locations: q.locations || 'Unknown'
    }));
    exportToCSV(data, headers, 'arcus_top_search_queries.csv');
  };

  const handleExportZeroResults = () => {
    if (!analytics) return;
    const headers = [
      { label: 'Failed Query String', key: 'query' },
      { label: 'Search Attempts', key: 'count' }
    ];
    exportToCSV(analytics.zeroResults, headers, 'arcus_zero_result_queries.csv');
  };

  const handleExportLocations = () => {
    if (!analytics || !analytics.locationMetrics) return;
    const headers = [
      { label: 'City / Location', key: 'city' },
      { label: 'Search Volume', key: 'count' }
    ];
    exportToCSV(analytics.locationMetrics, headers, 'arcus_search_volumes_by_city.csv');
  };

  const handleExportDetailedLogs = () => {
    if (!analytics || !analytics.detailedLogs) return;
    const headers = [
      { label: 'Timestamp', key: 'timestamp' },
      { label: 'Query / Keywords', key: 'query' },
      { label: 'Results Count', key: 'resultsCount' },
      { label: 'City', key: 'city' },
      { label: 'State', key: 'state' },
      { label: 'Categories Matched', key: 'categories' },
      { label: 'Clicked Page / Product', key: 'pageBrowsed' }
    ];
    exportToCSV(analytics.detailedLogs, headers, 'arcus_detailed_search_logs.csv');
  };

  const fetchAnalytics = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await apiFetch('/admin/search-analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load search analytics.');
      const data = await res.json();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching analytics.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(true);
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
      {/* Live Refresh Header Bar */}
      <div className="flex justify-between items-center bg-slate-50 p-sm rounded border border-slate-200">
        <span className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider pl-xs">Live Telemetry Overview</span>
        <button
          onClick={() => fetchAnalytics(true)}
          className="flex items-center gap-xs bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-sm h-8 rounded font-bold text-xs transition-all shadow-xs cursor-pointer"
          title="Refresh telemetry reports from database"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Refresh Data
        </button>
      </div>

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

      {view === 'queries' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg animate-in fade-in duration-200">
          {/* Top Search Queries Table */}
          <div className="border border-slate-200 rounded p-lg bg-white shadow-sm space-y-md">
            <div className="flex justify-between items-center mb-xs">
              <div>
                <h4 className="font-extrabold text-slate-900 text-body-md">Top Catalogs Searched</h4>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Most common buyer search terms & intent</p>
              </div>
              <button
                onClick={handleExportTopQueries}
                className="flex items-center gap-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-sm h-8 rounded font-bold text-xs transition-all shadow-xs cursor-pointer"
                title="Export Top Searches to CSV"
              >
                <span className="material-symbols-outlined text-[14px]">download</span>
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="px-md py-sm">Query Term</th>
                    <th className="px-md py-sm">Searches count</th>
                    <th className="px-md py-sm">Click Count</th>
                    <th className="px-md py-sm">Top Locations</th>
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
                        <td className="px-md py-sm text-slate-400 font-medium italic max-w-[120px] truncate" title={q.locations}>{q.locations || 'Unknown'}</td>
                        <td className="px-md py-sm text-right font-black text-primary">{ctr}%</td>
                      </tr>
                    );
                  })}
                  {analytics.topQueries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-md text-slate-400 italic">No catalog searches logged.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Zero Results Queries Table */}
          <div className="border border-slate-200 rounded p-lg bg-white shadow-sm space-y-md">
            <div className="flex justify-between items-center mb-xs">
              <div>
                <h4 className="font-extrabold text-red-700 flex items-center gap-xs text-body-md">
                  <span className="material-symbols-outlined text-[20px] text-red-500">warning</span>
                  Zero-Result Queries
                </h4>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Queries typed by buyers that returned 0 products</p>
              </div>
              <button
                onClick={handleExportZeroResults}
                className="flex items-center gap-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-sm h-8 rounded font-bold text-xs transition-all shadow-xs cursor-pointer"
                title="Export Zero Results to CSV"
              >
                <span className="material-symbols-outlined text-[14px]">download</span>
                Export CSV
              </button>
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
      ) : (
        <div className="space-y-md">
          {/* Tab Selection Headers */}
          <div className="flex border-b border-slate-200 gap-md">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-lg py-sm font-bold text-xs uppercase tracking-wide border-b-2 transition-all cursor-pointer ${
                activeTab === 'summary'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Citywise Summary
            </button>
            <button
              onClick={() => setActiveTab('detailed')}
              className={`px-lg py-sm font-bold text-xs uppercase tracking-wide border-b-2 transition-all cursor-pointer ${
                activeTab === 'detailed'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Detailed Search Logs
            </button>
          </div>

          {activeTab === 'summary' ? (
            <div className="border border-slate-200 rounded p-lg bg-white shadow-sm space-y-md animate-in fade-in duration-200">
              {/* Geographic Demand Summary Table */}
              <div className="flex justify-between items-center mb-xs">
                <div>
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-xs text-body-md">
                    <span className="material-symbols-outlined text-[20px] text-blue-500">pin_drop</span>
                    Geographic Demand Summary
                  </h4>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Search volumes broken down by city / location</p>
                </div>
                <button
                  onClick={handleExportLocations}
                  className="flex items-center gap-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-sm h-8 rounded font-bold text-xs transition-all shadow-xs cursor-pointer"
                  title="Export Geographic Demand to CSV"
                >
                  <span className="material-symbols-outlined text-[14px]">download</span>
                  Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="px-md py-sm">City / Location</th>
                      <th className="px-md py-sm text-right">Search Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(analytics.locationMetrics || []).map((m, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-md py-sm font-bold text-slate-700">{m.city}</td>
                        <td className="px-md py-sm text-right text-slate-500 font-semibold">{m.count}</td>
                      </tr>
                    ))}
                    {(!analytics.locationMetrics || analytics.locationMetrics.length === 0) && (
                      <tr>
                        <td colSpan={2} className="text-center py-md text-slate-400 italic">No geographic data logged.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="border border-slate-200 rounded p-lg bg-white shadow-sm space-y-md animate-in fade-in duration-200">
              {/* Detailed Search Logs Table */}
              <div className="flex justify-between items-center mb-xs">
                <div>
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-xs text-body-md">
                    <span className="material-symbols-outlined text-[20px] text-amber-500">view_list</span>
                    Detailed Search Log Records
                  </h4>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Chronological record of every keyword query, demographic location and matched category</p>
                </div>
                <button
                  onClick={handleExportDetailedLogs}
                  className="flex items-center gap-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-sm h-8 rounded font-bold text-xs transition-all shadow-xs cursor-pointer"
                  title="Export Detailed Logs to CSV"
                >
                  <span className="material-symbols-outlined text-[14px]">download</span>
                  Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="px-md py-sm">Timestamp</th>
                      <th className="px-md py-sm">Location</th>
                      <th className="px-md py-sm">Keywords</th>
                      <th className="px-md py-sm">Categories Browsed</th>
                      <th className="px-md py-sm">Clicked Page / Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(analytics.detailedLogs || []).map((m, i) => (
                      <tr key={m.id || i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-md py-sm font-mono text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(m.timestamp).toLocaleString()}
                        </td>
                        <td className="px-md py-sm font-bold text-slate-700">
                          {m.city}, <span className="text-slate-400 font-semibold">{m.state}</span>
                        </td>
                        <td className="px-md py-sm font-black text-primary">
                          "{m.query}"
                        </td>
                        <td className="px-md py-sm text-slate-500 font-semibold truncate max-w-[150px]" title={m.categories}>
                          {m.categories}
                        </td>
                        <td className="px-md py-sm font-bold text-slate-600 truncate max-w-[200px]" title={m.pageBrowsed}>
                          {m.pageBrowsed}
                        </td>
                      </tr>
                    ))}
                    {(!analytics.detailedLogs || analytics.detailedLogs.length === 0) && (
                      <tr>
                        <td colSpan={5} className="text-center py-md text-slate-400 italic">No detailed search logs registered.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
