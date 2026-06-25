import React, { useEffect, useState } from 'react';
import type { RFQ } from './types';
import { QuotationBuilder } from './QuotationBuilder';
import { NegotiationCenter } from './NegotiationCenter';

export const RFQManagement: React.FC = () => {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // View state: 'list' | 'builder' | 'history'
  const [viewMode, setViewMode] = useState<'list' | 'builder' | 'history'>('list');
  const [existingQuotations, setExistingQuotations] = useState<any[]>([]);

  // Drawer / Modals
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [showInlineQuote, setShowInlineQuote] = useState(false);
  const [showInlineConvert, setShowInlineConvert] = useState(false);

  // Quote Form
  const [quoteForm, setQuoteForm] = useState({
    price: '',
    validityDays: 30,
    message: ''
  });

  // Convert Form
  const [convertForm, setConvertForm] = useState({
    amount: '',
    items: [
      { name: '', quantity: 1, price: 0 }
    ],
    shippingAddress: '',
    billingAddress: '',
    paymentMethod: 'COD'
  });

  const fetchRfqs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch('http://localhost:5000/api/rfqs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load RFQs.');
      const data = await res.json();
      setRfqs(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching RFQs');
    } finally {
      setLoading(false);
    }
  };

  const fetchRfqQuotations = async (rfqId: string) => {
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch(`http://localhost:5000/api/rfqs/${rfqId}/quotations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExistingQuotations(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRfqs();
  }, []);

  const handleStatusChange = async (rfqId: string, newStatus: string) => {
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch(`http://localhost:5000/api/admin/rfqs/${rfqId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update RFQ status.');
      }

      setSuccess(`RFQ status updated to ${newStatus}!`);
      fetchRfqs();
      if (selectedRfq && selectedRfq.id === rfqId) {
        setSelectedRfq({ ...selectedRfq, status: newStatus });
      }
    } catch (err: any) {
      setError(err.message || 'Error updating status.');
    }
  };

  const handleGenerateAndSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfq) return;
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch(`http://localhost:5000/api/admin/rfqs/${selectedRfq.id}/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quoteForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate quote.');

      setSuccess(`Quote PDF successfully generated: ${data.pdfUrl}. Sent details to buyer.`);
      setShowInlineQuote(false);
      fetchRfqs();
      if (selectedRfq) {
        setSelectedRfq({ ...selectedRfq, status: 'Quoted' });
      }
    } catch (err: any) {
      setError(err.message || 'Error sending quote.');
    }
  };

  const handleConvertToOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfq) return;
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch(`http://localhost:5000/api/admin/rfqs/${selectedRfq.id}/convert-to-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(convertForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to convert RFQ to order.');

      setSuccess(`RFQ #${selectedRfq.id} successfully converted to Order #${data.order?.id || ''}!`);
      setShowInlineConvert(false);
      setSelectedRfq(null);
      fetchRfqs();
    } catch (err: any) {
      setError(err.message || 'Error converting RFQ to order.');
    }
  };

  const addConvertItem = () => {
    setConvertForm({
      ...convertForm,
      items: [...convertForm.items, { name: '', quantity: 1, price: 0 }]
    });
  };

  const updateConvertItem = (idx: number, field: string, val: any) => {
    const updated = [...convertForm.items];
    updated[idx] = { ...updated[idx], [field]: val };
    
    // Auto calculate total amount
    const total = updated.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    setConvertForm({
      ...convertForm,
      items: updated,
      amount: String(total)
    });
  };

  const removeConvertItem = (idx: number) => {
    const updated = convertForm.items.filter((_, i) => i !== idx);
    const total = updated.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    setConvertForm({
      ...convertForm,
      items: updated,
      amount: String(total)
    });
  };

  const filteredRfqs = rfqs.filter(r => {
    const matchSearch = r.id?.toLowerCase().includes(search.toLowerCase()) ||
                        r.name.toLowerCase().includes(search.toLowerCase()) ||
                        (r.category && r.category.toLowerCase().includes(search.toLowerCase())) ||
                        (r.details && r.details.toLowerCase().includes(search.toLowerCase()));
    
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (viewMode === 'builder' && selectedRfq) {
    return (
      <QuotationBuilder
        rfq={selectedRfq as any}
        existingQuotations={existingQuotations}
        onSuccess={() => {
          setViewMode('list');
          setSelectedRfq(null);
          fetchRfqs();
        }}
        onCancel={() => {
          setViewMode('list');
          setSelectedRfq(null);
        }}
      />
    );
  }

  if (viewMode === 'history' && selectedRfq) {
    return (
      <NegotiationCenter
        rfq={selectedRfq as any}
        quotations={existingQuotations}
        onBack={() => {
          setViewMode('list');
          setSelectedRfq(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-md text-left">
      {/* Notifications */}
      {error && (
        <div className="bg-red-50 text-red-800 p-md rounded border border-red-200 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="material-symbols-outlined text-[18px]">close</button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-800 p-md rounded border border-green-200 flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="material-symbols-outlined text-[18px]">close</button>
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
              placeholder="Search RFQs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-xxl pr-md border border-slate-200 rounded text-body-sm focus:border-primary focus:ring-0 bg-slate-50"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-md border border-slate-200 rounded text-body-sm bg-slate-50 focus:border-primary focus:ring-0 font-bold"
          >
            <option value="all">All RFQs</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Quoted">Quoted</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="text-xs bg-slate-100 text-slate-500 rounded px-md py-sm font-extrabold font-label-caps uppercase tracking-wide">
          {filteredRfqs.length} Requirements
        </div>
      </div>

      {/* RFQs Table */}
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
                  <th className="px-lg py-md">RFQ ID</th>
                  <th className="px-lg py-md">Client / Project</th>
                  <th className="px-lg py-md">Category & Quantity</th>
                  <th className="px-lg py-md">Location</th>
                  <th className="px-lg py-md">Status</th>
                  <th className="px-lg py-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRfqs.map(r => {
                  const dateStr = r.timestamp ? new Date(r.timestamp).toLocaleDateString('en-IN') : 'N/A';
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-lg py-md font-mono text-xs font-bold text-slate-500">{r.id}</td>
                      <td className="px-lg py-md">
                        <div className="font-bold text-slate-900">{r.name}</div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{r.title || 'Procurement Brief'} • {dateStr}</div>
                      </td>
                      <td className="px-lg py-md">
                        <div className="font-bold text-slate-700 capitalize">{r.category}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Quantity: {r.quantity || 'N/A'}</div>
                      </td>
                      <td className="px-lg py-md text-slate-600 font-medium">{r.location || 'N/A'}</td>
                      <td className="px-lg py-md">
                        <span className={`text-[10px] font-bold px-md py-0.5 rounded-full border ${
                          r.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                          r.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          r.status === 'Quoted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {r.status || 'Submitted'}
                        </span>
                      </td>
                      <td className="px-lg py-md text-right">
                        <button
                          onClick={() => {
                            setSelectedRfq(r);
                            if (r.id) fetchRfqQuotations(r.id);
                            setShowInlineQuote(false);
                            setShowInlineConvert(false);
                            // Populate convert defaults
                            setConvertForm({
                              amount: r.budget ? String(r.budget).replace(/[^\d.]/g, '') : '',
                              items: [{ name: `${r.category || 'Materials'} procurement`, quantity: 1, price: r.budget ? parseFloat(String(r.budget).replace(/[^\d.]/g, '')) || 0 : 0 }],
                              shippingAddress: r.location || '',
                              billingAddress: r.location || '',
                              paymentMethod: 'COD'
                            });
                          }}
                          className="flex items-center gap-xs px-md h-8 border border-slate-200 hover:border-slate-800 text-slate-600 hover:text-slate-950 font-bold text-xs rounded transition-all ml-auto"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          Open Brief
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredRfqs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-xl text-slate-400 font-semibold">
                      No RFQ submissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RFQ Drawer Details */}
      {selectedRfq && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="px-lg py-md border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 text-body-md">
                  RFQ Workspace: #{selectedRfq.id}
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Status: {selectedRfq.status || 'Submitted'}</p>
              </div>
              <button
                onClick={() => setSelectedRfq(null)}
                className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>            {/* Scroll Area */}
            <div className="flex-1 overflow-y-auto p-lg space-y-lg text-xs font-semibold text-slate-600">
              {showInlineQuote ? (
                <form onSubmit={handleGenerateAndSendQuote} className="space-y-md animate-fade-in">
                  <h4 className="font-extrabold text-slate-900 text-body-md border-b border-slate-100 pb-sm">Generate Quote PDF</h4>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Offer Price Quote (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 45000"
                      value={quoteForm.price}
                      onChange={e => setQuoteForm({ ...quoteForm, price: e.target.value })}
                      className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Quote Validity (Days)</label>
                    <input
                      type="number"
                      value={quoteForm.validityDays}
                      onChange={e => setQuoteForm({ ...quoteForm, validityDays: parseInt(e.target.value, 10) || 30 })}
                      className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Notes & Terms</label>
                    <textarea
                      placeholder="Payment options, shipping timelines, warranty clauses..."
                      value={quoteForm.message}
                      onChange={e => setQuoteForm({ ...quoteForm, message: e.target.value })}
                      rows={3}
                      className="w-full p-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm text-slate-900"
                    />
                  </div>

                  <div className="flex justify-end gap-sm pt-md border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowInlineQuote(false)}
                      className="px-lg h-11 border border-slate-200 hover:border-slate-800 rounded font-bold text-xs text-slate-500 transition-all bg-white"
                    >
                      Back to Brief
                    </button>
                    <button
                      type="submit"
                      className="bg-primary text-slate-950 hover:bg-[#fabd00] px-xl h-11 rounded font-bold text-xs transition-all shadow-sm font-extrabold"
                    >
                      Generate & Send Quote
                    </button>
                  </div>
                </form>
              ) : showInlineConvert ? (
                <form onSubmit={handleConvertToOrder} className="space-y-md animate-fade-in">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-sm">
                    <h4 className="font-extrabold text-slate-900 text-body-md">Convert RFQ to Order</h4>
                    <button
                      type="button"
                      onClick={addConvertItem}
                      className="text-xs text-primary font-bold hover:underline flex items-center gap-xs"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span> Add Item
                    </button>
                  </div>

                  {convertForm.items.map((item, idx) => (
                    <div key={idx} className="flex gap-xs items-center">
                      <input
                        type="text"
                        required
                        placeholder="Item name / SKU"
                        value={item.name}
                        onChange={e => updateConvertItem(idx, 'name', e.target.value)}
                        className="flex-1 h-10 px-sm border border-slate-200 rounded text-xs text-slate-900"
                      />
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={e => updateConvertItem(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                        className="w-16 h-10 px-sm border border-slate-200 rounded text-xs text-slate-900"
                      />
                      <input
                        type="number"
                        required
                        placeholder="Price"
                        value={item.price || ''}
                        onChange={e => updateConvertItem(idx, 'price', parseFloat(e.target.value) || 0)}
                        className="w-24 h-10 px-sm border border-slate-200 rounded text-xs font-bold text-slate-900"
                      />
                      {convertForm.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeConvertItem(idx)}
                          className="text-red-500 hover:text-red-750"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-between items-center pt-xs font-black text-slate-900 text-body-xs border-t border-slate-100 mt-sm">
                    <span>Calculated Amount:</span>
                    <span className="text-md text-slate-950 font-extrabold">₹{Number(convertForm.amount || 0).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="space-y-sm">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Shipping Address *</label>
                    <textarea
                      required
                      value={convertForm.shippingAddress}
                      onChange={e => setConvertForm({ ...convertForm, shippingAddress: e.target.value })}
                      rows={2}
                      className="w-full p-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm text-slate-900"
                    />
                  </div>

                  <div className="space-y-sm">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Billing Address *</label>
                    <textarea
                      required
                      value={convertForm.billingAddress}
                      onChange={e => setConvertForm({ ...convertForm, billingAddress: e.target.value })}
                      rows={2}
                      className="w-full p-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Payment Method</label>
                    <select
                      value={convertForm.paymentMethod}
                      onChange={e => setConvertForm({ ...convertForm, paymentMethod: e.target.value })}
                      className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm text-slate-900 font-bold"
                    >
                      <option value="COD">Cash on Delivery (COD)</option>
                      <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Net Banking">Net Banking</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-sm pt-md border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowInlineConvert(false)}
                      className="px-lg h-11 border border-slate-200 hover:border-slate-800 rounded font-bold text-xs text-slate-500 transition-all bg-white"
                    >
                      Back to Brief
                    </button>
                    <button
                      type="submit"
                      className="bg-primary-container text-on-primary-container hover:bg-[#fabd00] px-xl h-11 rounded font-bold text-xs transition-all shadow-sm font-extrabold"
                    >
                      Convert to Confirmed Order
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {/* status dropdown */}
                  <div className="bg-slate-50 p-md rounded border border-slate-100 space-y-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Status Transitions</p>
                    <div className="flex flex-wrap gap-xs">
                      {['Submitted', 'Under Review', 'Quoted', 'Approved', 'Rejected', 'Closed'].map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleStatusChange(selectedRfq.id!, st)}
                          className={`px-md py-sm rounded border font-bold text-[10px] transition-all ${
                            selectedRfq.status === st 
                              ? 'bg-primary text-slate-950 border-primary' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* RFQ details */}
                  <div className="space-y-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Procurement Briefs</p>
                    <div className="bg-slate-50 border border-slate-100 rounded p-md space-y-md text-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold mb-xs">Title / Subject</span>
                        <span className="font-extrabold text-slate-950 text-body-sm">{selectedRfq.title || `${selectedRfq.category} procurement request`}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold mb-xs">Category / Quantity</span>
                        <span className="font-extrabold text-slate-950 text-body-sm capitalize">{selectedRfq.category} (x{selectedRfq.quantity})</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold mb-xs">Delivery Location</span>
                        <span className="font-bold text-slate-700">{selectedRfq.location || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold mb-xs">Timeline Constraint</span>
                        <span className="font-bold text-slate-700">{selectedRfq.timeline || 'Immediate'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold mb-xs">Target Budget</span>
                        <span className="font-extrabold text-slate-950">₹{selectedRfq.budget ? Number(selectedRfq.budget).toLocaleString('en-IN') : 'Unspecified'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold mb-xs">Detailed Requirements</span>
                        <span className="font-semibold text-slate-650 leading-relaxed block bg-white p-sm rounded border border-slate-100">{selectedRfq.details || 'No additional details provided.'}</span>
                      </div>
                      {selectedRfq.items && selectedRfq.items.length > 0 && (
                        <div className="mt-md">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold mb-xs">Materials Sheet Table</span>
                          <div className="border border-slate-200 rounded overflow-hidden bg-white">
                            <table className="w-full text-left border-collapse text-[10px]">
                              <thead>
                                <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                                  <th className="p-2">Material / Item</th>
                                  <th className="p-2">Spec / Description</th>
                                  <th className="p-2">Qty</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedRfq.items.map((it: any, index: number) => (
                                  <tr key={index} className="border-b border-slate-150">
                                    <td className="p-2 font-bold text-slate-800">{it.itemName || it.item_name}</td>
                                    <td className="p-2 text-slate-550">{it.description || 'N/A'}</td>
                                    <td className="p-2 font-mono font-bold text-slate-700">{it.quantity} {it.unit}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attachments */}
                  <div className="space-y-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Attached Blueprints / Specifications</p>
                    {selectedRfq.attachmentUrls && selectedRfq.attachmentUrls.length > 0 ? (
                      <div className="grid grid-cols-2 gap-sm">
                        {selectedRfq.attachmentUrls.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-sm rounded flex items-center justify-between font-bold text-xs text-primary transition-all shadow-sm"
                          >
                            Brief #{i + 1}
                            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">No blueprints uploaded.</p>
                    )}
                  </div>

                  {/* Contact info */}
                  <div className="space-y-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Buyer Contact Information</p>
                    <div className="bg-slate-50 border border-slate-100 rounded p-md space-y-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">FullName:</span>
                        <span className="text-slate-800 font-bold">{selectedRfq.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <span className="text-slate-800 font-mono font-bold">{selectedRfq.phone}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Workflow Actions Footer */}
            {!showInlineQuote && !showInlineConvert && (
              <div className="px-lg py-md border-t border-slate-200 bg-slate-50 flex justify-between gap-sm">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('builder');
                  }}
                  className="flex-1 flex items-center justify-center gap-xs bg-slate-900 hover:bg-slate-800 text-white px-md h-11 rounded font-bold text-xs transition-all shadow-sm border-0"
                >
                  <span className="material-symbols-outlined text-[16px]">edit_document</span>
                  {existingQuotations.length > 0 ? 'Revise Proposal' : 'Prepare Proposal'}
                </button>

                {existingQuotations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('history');
                    }}
                    className="flex-1 flex items-center justify-center gap-xs bg-amber-500 text-gray-950 hover:bg-amber-600 px-md h-11 rounded font-bold text-xs transition-all shadow-sm border-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">history</span>
                    Negotiation Center ({existingQuotations.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
