import React, { useState } from 'react';
import { useRFQs } from '../../core/hooks/useRFQs';
import { formatDate } from '../../core/config/format';
import { useAuth } from '../../context/AuthContext';

export const BusinessRFQs: React.FC = () => {
  const { user } = useAuth();
  const { rfqs, refresh } = useRFQs();
  const [showNewRfq, setShowNewRfq] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'Plumbing',
    quantity: '',
    budget: '',
    details: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/rfqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('arcus_token')}`
        },
        body: JSON.stringify({
          name: user?.name,
          phone: user?.phone,
          title: form.title,
          category: form.category,
          quantity: Number(form.quantity),
          budget: form.budget,
          details: form.details
        })
      });
      if (res.ok) {
        alert('RFQ submitted successfully!');
        setShowNewRfq(false);
        setForm({ title: '', category: 'Plumbing', quantity: '', budget: '', details: '' });
        refresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to submit RFQ');
      }
    } catch {
      alert('Network error. Failed to submit RFQ.');
    }
  };

  return (
    <div className="space-y-lg text-left">
      <div className="flex justify-between items-center bg-white p-md border border-slate-200 rounded-2xl shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Commercial RFQs Workspace</h3>
          <p className="text-secondary text-xs mt-0.5">Submit custom specifications to get competitive quotes from ARCUS suppliers.</p>
        </div>
        <button
          onClick={() => setShowNewRfq(!showNewRfq)}
          className="px-md py-1.5 bg-[#FFC107] text-[#0A0A0A] hover:bg-[#fabd00] font-bold rounded-lg text-xs flex items-center gap-xs shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">{showNewRfq ? 'close' : 'add'}</span>
          {showNewRfq ? 'Cancel' : 'New B2B RFQ'}
        </button>
      </div>

      {showNewRfq ? (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-lg shadow-sm space-y-md text-xs">
          <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-xs">New Procurement Request</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="font-bold text-secondary uppercase font-label-caps tracking-wider">RFQ Title</label>
              <input
                type="text"
                placeholder="e.g. CPVC pipe requirement for Whitefield project"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
                className="h-11 px-md border border-slate-200 rounded-xl focus:border-[#FFC107] focus:ring-0 text-slate-800 font-semibold"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-bold text-secondary uppercase font-label-caps tracking-wider">Product Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="h-11 px-md border border-slate-200 rounded-xl focus:border-[#FFC107] focus:ring-0 text-slate-800 font-semibold"
              >
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Cement">Cement</option>
                <option value="Steel">Steel &amp; Structural</option>
              </select>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-bold text-secondary uppercase font-label-caps tracking-wider">Quantity Required</label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
                required
                className="h-11 px-md border border-slate-200 rounded-xl focus:border-[#FFC107] focus:ring-0 text-slate-800 font-semibold"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-bold text-secondary uppercase font-label-caps tracking-wider">Project Budget Estimate</label>
              <input
                type="text"
                placeholder="e.g. Under ₹2,00,000"
                value={form.budget}
                onChange={e => setForm({ ...form, budget: e.target.value })}
                required
                className="h-11 px-md border border-slate-200 rounded-xl focus:border-[#FFC107] focus:ring-0 text-slate-800 font-semibold"
              />
            </div>
          </div>
          <div className="flex flex-col gap-xs">
            <label className="font-bold text-secondary uppercase font-label-caps tracking-wider">Specifications &amp; Details</label>
            <textarea
              rows={4}
              placeholder="Provide details about size, material specifications, delivery schedule, and billing preferences..."
              value={form.details}
              onChange={e => setForm({ ...form, details: e.target.value })}
              required
              className="p-md border border-slate-200 rounded-xl focus:border-[#FFC107] focus:ring-0 text-slate-800 font-semibold"
            />
          </div>
          <button
            type="submit"
            className="px-xl py-3 bg-[#FFC107] hover:bg-[#fabd00] text-[#0A0A0A] font-bold rounded-xl text-xs font-label-caps uppercase tracking-wider shadow-sm"
          >
            Submit RFQ
          </button>
        </form>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {rfqs.length === 0 ? (
            <p className="p-xl text-center text-slate-500 text-xs">No RFQs submitted yet. Click 'New B2B RFQ' to start procuring.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                    <th className="p-md">RFQ ID</th>
                    <th className="p-md">Date</th>
                    <th className="p-md">Title</th>
                    <th className="p-md">Category</th>
                    <th className="p-md">Qty</th>
                    <th className="p-md">Budget</th>
                    <th className="p-md">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rfqs.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="p-md font-mono font-bold text-[#FFC107]">{r.id}</td>
                      <td className="p-md text-slate-600">{formatDate(r.timestamp)}</td>
                      <td className="p-md font-bold text-slate-800">{r.title || 'Material Requirement'}</td>
                      <td className="p-md">{r.category}</td>
                      <td className="p-md">{r.quantity}</td>
                      <td className="p-md">{r.budget || 'N/A'}</td>
                      <td className="p-md">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                          r.status === 'Submitted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          r.status === 'Converted' ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default BusinessRFQs;
