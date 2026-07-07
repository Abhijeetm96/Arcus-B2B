import React, { useEffect, useState } from 'react';
import type { User } from './types';
import { apiFetch } from '../../lib/api';
import { exportToCSV } from '../../utils/csvHelpers';
import { ImportModal, type ImportField } from '../../components/ImportModal';


export const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Import/Export States & Handlers
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const customerImportFields: ImportField[] = [
    { label: 'Full Name', key: 'name', required: true },
    { label: 'Email Address', key: 'email', required: true },
    { label: 'Phone Number', key: 'phone', required: true },
    { label: 'Customer Type', key: 'customerType', required: true }, // INDIVIDUAL or BUSINESS
    { label: 'Company Name', key: 'companyName' },
    { label: 'GSTIN Number', key: 'gstNumber' },
    { label: 'Default Password', key: 'password' }
  ];

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await apiFetch('/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load user accounts.');
      const data = await res.json();
      // Filter out admin users
      const clientUsers = data.filter((u: any) => u.role !== 'Admin' && u.role !== 'ADMIN');
      setCustomers(clientUsers);
    } catch (err: any) {
      setError(err.message || 'Error fetching clients list');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCustomers = () => {
    const headers = [
      { label: 'Customer ID', key: 'id' },
      { label: 'Full Name', key: 'name' },
      { label: 'Email Address', key: 'email' },
      { label: 'Phone Number', key: 'phone' },
      { label: 'Customer Type', key: 'customerType' },
      { label: 'Company Name', key: 'companyName' },
      { label: 'GSTIN Number', key: 'gstNumber' },
      { label: 'Order Count', key: 'orderCount' },
      { label: 'RFQ Count', key: 'rfqCount' },
      { label: 'Lifetime Value (INR)', key: 'lifetimeValue' },
      { label: 'BuildPoints', key: 'buildPoints' }
    ];
    const data = customers.map(c => ({
      id: c.id,
      name: c.fullName || c.full_name || c.name || '',
      email: c.email || '',
      phone: c.phone || c.phoneNumber || '',
      customerType: c.customerType || 'INDIVIDUAL',
      companyName: c.companyName || '',
      gstNumber: c.gstNumber || '',
      orderCount: c.orderCount || 0,
      rfqCount: c.rfqCount || 0,
      lifetimeValue: c.lifetimeValue || 0,
      buildPoints: c.buildPoints || 0
    }));
    exportToCSV(data, headers, 'arcus_customers.csv');
  };

  const handleImportCustomerRow = async (row: Record<string, any>) => {
    const token = localStorage.getItem('arcus_token');
    const res = await apiFetch('/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: row.name,
        email: row.email,
        phone: row.phone,
        customerType: (row.customerType || 'INDIVIDUAL').toUpperCase(),
        companyName: row.companyName || undefined,
        gstNumber: row.gstNumber || undefined,
        password: row.password || undefined,
        role: 'USER'
      })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || `Failed to import customer ${row.name}`);
    }
  };

  useEffect(() => {
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
        <div className="bg-red-50 text-red-800 p-md rounded border border-red-200">
          <p className="font-semibold">Error: {error}</p>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md bg-white p-md rounded border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-sm w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] md:max-w-xs">
            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search customers, companies, GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-xxl pr-md border border-slate-200 rounded text-body-sm focus:border-primary focus:ring-0 bg-slate-50"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-11 px-md border border-slate-200 rounded text-body-sm bg-slate-50 focus:border-primary focus:ring-0 font-bold"
          >
            <option value="all">All Customer Types</option>
            <option value="INDIVIDUAL">B2C (Individual)</option>
            <option value="BUSINESS">B2B (Business / Contractor)</option>
          </select>
        </div>

        {/* Success message */}
        {success && (
          <div className="bg-green-50 text-green-800 p-md rounded border border-green-200 w-full mb-sm flex justify-between items-center text-xs font-semibold">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="material-symbols-outlined text-[16px] hover:text-slate-900">close</button>
          </div>
        )}

        <div className="flex items-center gap-sm">
          <button
            onClick={handleExportCustomers}
            className="flex items-center gap-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-md h-9 rounded font-bold text-xs transition-all shadow-xs cursor-pointer"
            title="Export list to CSV"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export CSV
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-md h-9 rounded font-bold text-xs transition-all shadow-xs cursor-pointer"
            title="Import from CSV"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            Import CSV
          </button>
          <div className="text-xs bg-slate-100 text-slate-500 rounded px-md py-sm font-extrabold font-label-caps uppercase tracking-wide">
            {filteredCustomers.length} Client Profiles
          </div>
        </div>
      </div>

      {/* Client Accounts Table */}
      {loading ? (
        <div className="flex justify-center py-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
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

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Customers"
        fields={customerImportFields}
        templateFileName="customers_import_template.csv"
        onImportRow={handleImportCustomerRow}
        onSuccess={(msg) => {
          setSuccess(msg);
          fetchCustomers();
        }}
      />
    </div>
  );
};
