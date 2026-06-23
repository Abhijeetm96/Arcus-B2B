import React, { useEffect, useState } from 'react';
import type { User } from './types';


export const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('arcus_token');
        const res = await fetch('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load user accounts.');
        const data = await res.json();
        // Filter out admin users
        const clientUsers = data.filter((u: any) => u.role !== 'Admin');
        setCustomers(clientUsers);
      } catch (err: any) {
        setError(err.message || 'Error fetching clients list');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => {
    const name = c.fullName || c.full_name || c.name || '';
    const email = c.email || '';
    const company = c.companyName || '';
    const gst = c.gstNumber || '';

    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
                        email.toLowerCase().includes(search.toLowerCase()) ||
                        company.toLowerCase().includes(search.toLowerCase()) ||
                        gst.toLowerCase().includes(search.toLowerCase());

    const type = c.customerType || 'INDIVIDUAL';
    const matchType = typeFilter === 'all' || type === typeFilter;

    return matchSearch && matchType;
  });

  return (
    <div className="space-y-md text-left">
      {/* Notifications */}
      {error && (
        <div className="bg-red-50 text-red-800 p-md rounded-2xl border border-red-200">
          <p className="font-semibold">Error: {error}</p>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md bg-white p-md rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-sm w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] md:max-w-xs">
            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search customers, companies, GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-xxl pr-md border border-slate-200 rounded-xl text-body-sm focus:border-[#FFC107] focus:ring-0 bg-slate-50"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-11 px-md border border-slate-200 rounded-xl text-body-sm bg-slate-50 focus:border-[#FFC107] focus:ring-0 font-bold"
          >
            <option value="all">All Customer Types</option>
            <option value="INDIVIDUAL">B2C (Individual)</option>
            <option value="BUSINESS">B2B (Business / Contractor)</option>
          </select>
        </div>

        <div className="text-xs bg-slate-100 text-slate-500 rounded-xl px-md py-sm font-extrabold font-label-caps uppercase tracking-wide">
          {filteredCustomers.length} Client Profiles
        </div>
      </div>

      {/* Client Accounts Table */}
      {loading ? (
        <div className="flex justify-center py-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FFC107]"></div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-lg py-md">Customer Details</th>
                  <th className="px-lg py-md">Business & GSTIN</th>
                  <th className="px-lg py-md">Type</th>
                  <th className="px-lg py-md">Order Count</th>
                  <th className="px-lg py-md">RFQ Count</th>
                  <th className="px-lg py-md">Lifetime Value (LTV)</th>
                  <th className="px-lg py-md">BuildPoints</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map(c => {
                  const name = c.fullName || c.full_name || c.name || 'Anonymous Client';
                  const type = c.customerType || 'INDIVIDUAL';
                  
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-lg py-md">
                        <div className="font-bold text-slate-900">{name}</div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{c.email} • {c.phone || c.phoneNumber || 'No phone'}</div>
                      </td>
                      <td className="px-lg py-md">
                        {c.companyName ? (
                          <>
                            <div className="font-bold text-slate-700">{c.companyName}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">GSTIN: {c.gstNumber || 'N/A'}</div>
                          </>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Individual Buyer</span>
                        )}
                      </td>
                      <td className="px-lg py-md">
                        <span className={`text-[10px] font-bold px-md py-0.5 rounded-full border ${
                          type === 'BUSINESS' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {type === 'BUSINESS' ? 'B2B Partner' : 'B2C Client'}
                        </span>
                      </td>
                      <td className="px-lg py-md font-bold text-slate-700">{c.orderCount !== undefined ? c.orderCount : 0} orders</td>
                      <td className="px-lg py-md font-bold text-slate-700">{c.rfqCount !== undefined ? c.rfqCount : 0} RFQs</td>
                      <td className="px-lg py-md font-black text-slate-950">₹{c.lifetimeValue !== undefined ? c.lifetimeValue.toLocaleString('en-IN') : '0'}</td>
                      <td className="px-lg py-md text-amber-600 font-bold flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[16px]">stars</span>
                        {c.buildPoints || 0} pts
                      </td>
                    </tr>
                  );
                })}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-xl text-slate-400 font-semibold">
                      No client profiles found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
