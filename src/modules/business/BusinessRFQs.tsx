import React, { useState, useEffect } from 'react';
import { useRFQs } from '../../core/hooks/useRFQs';
import { formatDate } from '../../core/config/format';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';

interface MaterialItem {
  itemName: string;
  description: string;
  unit: string;
  quantity: string;
}

interface QuotationItem {
  id: string;
  itemName: string;
  description?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  gstRate: number;
  lineTotal: number;
}

interface Quotation {
  id: string;
  quotationNumber: string;
  version: number;
  rfqId: string;
  status: 'SENT' | 'APPROVED' | 'DECLINED' | 'NEGOTIATION_REQUESTED';
  subtotal: number;
  discountType: 'FLAT' | 'PERCENT' | 'NONE';
  discountValue: number;
  shippingCharges: number;
  freeShipping: boolean;
  gstAmount: number;
  grandTotal: number;
  deliveryTerms?: string;
  paymentTerms?: string;
  validityDate?: string;
  notes?: string;
  customerComments?: string;
  declineReason?: string;
  createdAt?: string;
  items?: QuotationItem[];
}

export const BusinessRFQs: React.FC = () => {
  const { user } = useAuth();
  const { rfqs, refresh } = useRFQs();
  const [showNewRfq, setShowNewRfq] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState<any | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);

  // Modals / Input states
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [renegotiateComments, setRenegotiateComments] = useState('');
  const [showRenegotiateModal, setShowRenegotiateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  // New RFQ Form State (Type 2 - Detailed B2B)
  const [form, setForm] = useState({
    title: '',
    projectName: '',
    budget: '',
    deliveryAddress: '',
    deliveryDate: '',
    commercialNotes: '',
  });

  const [materialItems, setMaterialItems] = useState<MaterialItem[]>([
    { itemName: '', description: '', unit: 'Nos', quantity: '' }
  ]);

  const handleAddMaterial = () => {
    setMaterialItems([...materialItems, { itemName: '', description: '', unit: 'Nos', quantity: '' }]);
  };

  const handleRemoveMaterial = (index: number) => {
    if (materialItems.length === 1) return;
    setMaterialItems(materialItems.filter((_, idx) => idx !== index));
  };

  const handleMaterialChange = (index: number, field: keyof MaterialItem, value: string) => {
    const updated = [...materialItems];
    updated[index][field] = value;
    setMaterialItems(updated);
  };

  // Fetch quotations for selected RFQ
  const fetchQuotations = async (rfqId: string) => {
    try {
      const res = await apiFetch(`/rfqs/${rfqId}/quotations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('arcus_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setQuotations(data);
        if (data.length > 0) {
          // Default to latest version
          setSelectedQuote(data[0]);
        } else {
          setSelectedQuote(null);
        }
      }
    } catch (err) {
      console.error('Error fetching quotations:', err);
    }
  };

  useEffect(() => {
    if (selectedRfq) {
      fetchQuotations(selectedRfq.id);
    }
  }, [selectedRfq]);

  const handleSelectRfq = (rfq: any) => {
    setSelectedRfq(rfq);
    setSuccessOrder(null);
    setErrorMessage('');
  };

  const handleBackToList = () => {
    setSelectedRfq(null);
    setQuotations([]);
    setSelectedQuote(null);
    refresh();
  };

  const handleSubmitRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Check material items
    const invalidItem = materialItems.some(item => !item.itemName.trim() || !item.quantity.trim());
    if (invalidItem) {
      setErrorMessage('Please fill in Item Name and Quantity for all materials.');
      return;
    }

    try {
      const res = await apiFetch('/rfq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('arcus_token')}`
        },
        body: JSON.stringify({
          name: user?.name,
          phone: user?.phone,
          title: form.title,
          category: 'Detailed B2B RFQ',
          quantity: 'Detailed List',
          location: form.deliveryAddress,
          timeline: `Deliver By: ${form.deliveryDate || 'Flexible'}`,
          details: `[Detailed B2B RFQ] Project: ${form.projectName}. Notes: ${form.commercialNotes}`,
          budget: form.budget,
          items: materialItems
        })
      });
      if (res.ok) {
        setShowNewRfq(false);
        setForm({
          title: '',
          projectName: '',
          budget: '',
          deliveryAddress: '',
          deliveryDate: '',
          commercialNotes: '',
        });
        setMaterialItems([{ itemName: '', description: '', unit: 'Nos', quantity: '' }]);
        refresh();
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Failed to submit RFQ');
      }
    } catch {
      setErrorMessage('Network error. Failed to submit RFQ.');
    }
  };

  const handleAcceptQuotation = async () => {
    if (!selectedQuote) return;
    setActionLoading(true);
    setErrorMessage('');
    try {
      const res = await apiFetch(`/quotations/${selectedQuote.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('arcus_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSuccessOrder(data.order);
        fetchQuotations(selectedQuote.rfqId);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Failed to accept quotation.');
      }
    } catch {
      setErrorMessage('Network error. Failed to accept quotation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote || !declineReason.trim()) return;
    setActionLoading(true);
    setErrorMessage('');
    try {
      const res = await apiFetch(`/quotations/${selectedQuote.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('arcus_token')}`
        },
        body: JSON.stringify({ declineReason })
      });
      if (res.ok) {
        setShowDeclineModal(false);
        setDeclineReason('');
        fetchQuotations(selectedQuote.rfqId);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Failed to reject quotation.');
      }
    } catch {
      setErrorMessage('Network error. Failed to decline quotation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenegotiateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote || !renegotiateComments.trim()) return;
    setActionLoading(true);
    setErrorMessage('');
    try {
      const res = await apiFetch(`/quotations/${selectedQuote.id}/renegotiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('arcus_token')}`
        },
        body: JSON.stringify({ customerComments: renegotiateComments })
      });
      if (res.ok) {
        setShowRenegotiateModal(false);
        setRenegotiateComments('');
        fetchQuotations(selectedQuote.rfqId);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || 'Failed to request renegotiation.');
      }
    } catch {
      setErrorMessage('Network error. Failed to request renegotiation.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* ─── List / Detail Navigation Header ─── */}
      {!selectedRfq && (
        <div className="flex justify-between items-center bg-white p-4 border border-slate-200 rounded shadow-sm">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Commercial RFQs &amp; Quotes</h3>
            <p className="text-gray-500 text-xs mt-0.5">Submit material requirement sheets, track revisions, and accept finalized pricing agreements.</p>
          </div>
          <button
            onClick={() => {
              setErrorMessage('');
              setShowNewRfq(!showNewRfq);
            }}
            className="px-4 py-2 bg-primary text-[#0A0A0A] hover:bg-[#fabd00] font-bold rounded text-xs flex items-center gap-2 shadow-sm border-0"
          >
            <span className="material-symbols-outlined text-[16px]">{showNewRfq ? 'close' : 'add'}</span>
            {showNewRfq ? 'Cancel' : 'New B2B RFQ'}
          </button>
        </div>
      )}

      {/* ─── Create New RFQ Form Block ─── */}
      {showNewRfq && !selectedRfq && (
        <form onSubmit={handleSubmitRfq} className="bg-white border border-slate-200 rounded p-6 shadow-sm space-y-6 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-800 text-sm">New Procurement RFQ Submission</h4>
            <p className="text-gray-400 text-[10px] mt-0.5">Define your project requirements. GST number and verified business context are auto-included.</p>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-xs rounded">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">RFQ Title / Name *</label>
              <input
                type="text"
                placeholder="e.g. Astral Pipe Requirement - Phase 1"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
                className="h-11 px-3 border border-gray-300 rounded focus:border-primary focus:ring-0 text-slate-800 font-semibold"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Project Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Whitefield Residential Project"
                value={form.projectName}
                onChange={e => setForm({ ...form, projectName: e.target.value })}
                className="h-11 px-3 border border-gray-300 rounded focus:border-primary focus:ring-0 text-slate-800 font-semibold"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Target Budget Estimate (INR)</label>
              <input
                type="number"
                placeholder="e.g. 180000"
                value={form.budget}
                onChange={e => setForm({ ...form, budget: e.target.value })}
                className="h-11 px-3 border border-gray-300 rounded focus:border-primary focus:ring-0 text-slate-800 font-semibold"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Required Delivery Date</label>
              <input
                type="date"
                value={form.deliveryDate}
                onChange={e => setForm({ ...form, deliveryDate: e.target.value })}
                className="h-11 px-3 border border-gray-300 rounded focus:border-primary focus:ring-0 text-slate-800 font-semibold"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Delivery Site Address *</label>
              <input
                type="text"
                required
                placeholder="Full delivery location address"
                value={form.deliveryAddress}
                onChange={e => setForm({ ...form, deliveryAddress: e.target.value })}
                className="h-11 px-3 border border-gray-300 rounded focus:border-primary focus:ring-0 text-slate-800 font-semibold"
              />
            </div>
          </div>

          {/* Dynamic Materials list */}
          <div className="border border-gray-200 rounded p-4 bg-gray-50/50">
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Material Requirements Table</h5>
              <button
                type="button"
                onClick={handleAddMaterial}
                className="flex items-center gap-1 text-[10px] font-bold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 rounded border-0"
              >
                <span className="material-symbols-outlined text-[12px]">add</span> Add Row
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 font-bold border-b border-gray-200">
                    <th className="p-2 w-1/3">Item Name *</th>
                    <th className="p-2 w-1/3">Specification / Brand</th>
                    <th className="p-2 w-1/12">Unit</th>
                    <th className="p-2 w-1/6">Qty *</th>
                    <th className="p-2 text-center w-1/12"></th>
                  </tr>
                </thead>
                <tbody>
                  {materialItems.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-150 bg-white">
                      <td className="p-1">
                        <input
                          required
                          type="text"
                          value={item.itemName}
                          onChange={(e) => handleMaterialChange(idx, 'itemName', e.target.value)}
                          placeholder="e.g. Astral CPVC Pipe 1'"
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleMaterialChange(idx, 'description', e.target.value)}
                          placeholder="e.g. SDR11 Astral"
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none"
                        />
                      </td>
                      <td className="p-1">
                        <select
                          value={item.unit}
                          onChange={(e) => handleMaterialChange(idx, 'unit', e.target.value)}
                          className="w-full border border-gray-200 rounded px-1 py-1 text-xs text-gray-900 focus:outline-none"
                        >
                          <option value="Nos">Nos</option>
                          <option value="Bags">Bags</option>
                          <option value="Tons">Tons</option>
                          <option value="Meters">Meters</option>
                          <option value="Feet">Feet</option>
                        </select>
                      </td>
                      <td className="p-1">
                        <input
                          required
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleMaterialChange(idx, 'quantity', e.target.value)}
                          placeholder="Qty"
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <button
                          type="button"
                          disabled={materialItems.length === 1}
                          onClick={() => handleRemoveMaterial(idx)}
                          className="text-red-500 hover:text-red-700 disabled:text-gray-300"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Commercial Notes / Context</label>
            <textarea
              rows={3}
              placeholder="e.g. Looking for credit terms. Repeat buyer."
              value={form.commercialNotes}
              onChange={e => setForm({ ...form, commercialNotes: e.target.value })}
              className="p-3 border border-gray-300 rounded focus:border-primary focus:ring-0 text-slate-800 font-semibold resize-none"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-primary hover:bg-[#fabd00] text-[#0A0A0A] font-bold rounded text-xs font-label-caps uppercase tracking-wider border-0 shadow-sm"
          >
            Submit RFQ
          </button>
        </form>
      )}

      {/* ─── RFQ List Block ─── */}
      {!showNewRfq && !selectedRfq && (
        <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
          {rfqs.length === 0 ? (
            <p className="p-12 text-center text-gray-500 text-xs">No RFQs submitted yet. Click 'New B2B RFQ' to start procuring.</p>
          ) : (
            <div className="overflow-x-auto font-sans">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-4">RFQ ID</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Title</th>
                    <th className="p-4">Items / Details</th>
                    <th className="p-4">Budget</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rfqs.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono font-bold text-slate-900">{r.id}</td>
                      <td className="p-4 text-gray-500">{formatDate(r.timestamp)}</td>
                      <td className="p-4 font-bold text-slate-800">{r.title || 'Material Requirement'}</td>
                      <td className="p-4 text-gray-600 truncate max-w-xs">
                        {r.items && r.items.length > 0
                          ? r.items.map((i: any) => `${i.itemName} (x${i.quantity})`).join(', ')
                          : r.details || 'View details'}
                      </td>
                      <td className="p-4 font-semibold text-slate-700">{r.budget ? `₹${parseFloat(r.budget).toLocaleString('en-IN')}` : 'Flexible'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full font-bold text-[9px] border uppercase tracking-wider ${
                          r.status === 'Submitted' || r.status === 'SUBMITTED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          r.status === 'Completed' || r.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                          r.status === 'Quoted' || r.status === 'Quotes Received' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleSelectRfq(r)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded text-[10px] uppercase border-0"
                        >
                          View {r.status === 'Quoted' || r.status === 'Quotes Received' ? 'Quotes' : 'RFQ'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── RFQ Detail / Quotation Negotiation console ─── */}
      {selectedRfq && (
        <div className="bg-white border border-slate-200 rounded shadow-sm p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
            <div>
              <button
                onClick={handleBackToList}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-bold mb-2 bg-transparent border-0"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to List
              </button>
              <h3 className="font-bold text-slate-900 text-base">{selectedRfq.title || 'Procurement RFQ'}</h3>
              <p className="text-gray-400 text-xs mt-0.5">Submitted on {formatDate(selectedRfq.timestamp)} | RFQ ID: <strong className="font-mono text-slate-800">{selectedRfq.id}</strong></p>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full font-bold text-[9px] border uppercase tracking-wider ${
                selectedRfq.status === 'Submitted' || selectedRfq.status === 'SUBMITTED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                selectedRfq.status === 'Completed' || selectedRfq.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                selectedRfq.status === 'Quoted' || selectedRfq.status === 'Quotes Received' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-gray-50 text-gray-700 border-gray-200'
              }`}>
                {selectedRfq.status}
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-xs rounded">
              {errorMessage}
            </div>
          )}

          {/* Success screen upon order conversion */}
          {successOrder && (
            <div className="bg-green-50 border border-green-200 rounded p-6 text-center space-y-4">
              <span className="material-symbols-outlined text-green-600 text-5xl">check_circle</span>
              <h4 className="text-lg font-bold text-green-900">Quotation Finalized &amp; Ordered!</h4>
              <p className="text-xs text-green-800 max-w-md mx-auto">
                Excellent! The quotation has been signed and successfully converted to active Order <strong className="font-mono">{successOrder.id}</strong>.
                We have credited <strong>{successOrder.pointsEarned || 0} BuildPoints</strong> to your loyalty wallet.
              </p>
              <div className="flex justify-center gap-3">
                <a
                  href="#/dashboard"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-xs uppercase tracking-wider border-0"
                >
                  Go to Orders Dashboard
                </a>
              </div>
            </div>
          )}

          {/* RFQ Specs Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs border border-slate-200 rounded p-4 bg-slate-50/50">
            <div>
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Buyer Details</span>
              <p className="font-semibold text-slate-800 mt-1">{selectedRfq.name}</p>
              <p className="text-gray-500">{selectedRfq.phone}</p>
            </div>
            <div>
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Logistics / Delivery Address</span>
              <p className="font-semibold text-slate-800 mt-1">{selectedRfq.location || 'Project Site'}</p>
              <p className="text-gray-500">{selectedRfq.timeline || 'Flexible'}</p>
            </div>
            <div>
              <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Budget &amp; Files</span>
              <p className="font-semibold text-slate-800 mt-1">{selectedRfq.budget ? `₹${parseFloat(selectedRfq.budget).toLocaleString('en-IN')}` : 'Flexible'}</p>
              <p className="text-gray-500">{selectedRfq.details || 'No additional notes'}</p>
            </div>
          </div>

          {/* Material items originally requested */}
          {selectedRfq.items && selectedRfq.items.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Requested Material Specs</h4>
              <div className="border border-slate-100 rounded overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-150">
                      <th className="p-2">Item Name</th>
                      <th className="p-2">Spec / Description</th>
                      <th className="p-2">Unit</th>
                      <th className="p-2">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRfq.items.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-100 bg-white">
                        <td className="p-2 font-semibold text-slate-800">{item.itemName}</td>
                        <td className="p-2 text-slate-500">{item.description || 'N/A'}</td>
                        <td className="p-2 text-slate-600">{item.unit || 'Nos'}</td>
                        <td className="p-2 font-mono font-bold text-slate-700">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── Quotations Section ─── */}
          {quotations.length === 0 ? (
            <div className="p-8 border border-dashed border-gray-200 rounded text-center bg-gray-50/50">
              <span className="material-symbols-outlined text-gray-400 text-3xl">hourglass_empty</span>
              <h4 className="font-bold text-gray-700 text-xs mt-2">Quotation preparing</h4>
              <p className="text-gray-400 text-[10px] mt-1">An ARCUS procurement specialist is matching manufacturer catalogs to your sheet. You will receive an email/dashboard alert once V1 is issued.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Version History Tab Selector */}
              <div className="flex justify-between items-center bg-slate-900 text-white px-4 py-2.5 rounded">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-400 text-[18px]">gavel</span>
                  <span className="font-bold text-xs uppercase tracking-wider">ARCUS Custom Proposals</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">Select Proposal Version:</span>
                  <select
                    value={selectedQuote?.id || ''}
                    onChange={(e) => {
                      const q = quotations.find(item => item.id === e.target.value);
                      if (q) setSelectedQuote(q);
                    }}
                    className="bg-slate-800 border border-slate-700 text-white rounded text-xs px-2 py-1 focus:outline-none"
                  >
                    {quotations.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.quotationNumber} Version {q.version} ({q.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quotation Details display */}
              {selectedQuote && (
                <div className="border border-slate-200 rounded p-5 space-y-6 bg-white shadow-sm font-sans relative">
                  
                  {/* Print Friendly Watermark/Badge */}
                  <div className="absolute top-4 right-4 print:hidden flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[10px] font-bold uppercase flex items-center gap-1 border-0"
                    >
                      <span className="material-symbols-outlined text-[14px]">print</span> Print / Save PDF
                    </button>
                  </div>

                  {/* Print Header */}
                  <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">ARCUS PROCUREMENT LTD</h4>
                      <p className="text-gray-500">Corporate Supply Partner</p>
                      <p className="text-gray-400 mt-1">support@arcus.com | +91 80 4991 2299</p>
                    </div>
                    <div className="text-right">
                      <h4 className="font-mono font-bold text-slate-900 text-sm">{selectedQuote.id}</h4>
                      <p className="text-gray-500 font-semibold">RFQ Reference: {selectedQuote.rfqId}</p>
                      <p className="text-gray-400 mt-1">Validity Date: {selectedQuote.validityDate || 'Not specified'}</p>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">Line Items Details</h5>
                    <div className="border border-slate-150 rounded overflow-hidden">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[9px] border-b border-slate-200">
                            <th className="p-2">Material / Service</th>
                            <th className="p-2">Unit</th>
                            <th className="p-2 text-right">Qty</th>
                            <th className="p-2 text-right">Unit Rate (₹)</th>
                            <th className="p-2 text-right">Disc %</th>
                            <th className="p-2 text-right">GST %</th>
                            <th className="p-2 text-right">Total (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedQuote.items || []).map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-100 bg-white">
                              <td className="p-2">
                                <p className="font-semibold text-slate-800">{item.itemName}</p>
                                {item.description && <p className="text-[10px] text-gray-400 mt-0.5">{item.description}</p>}
                              </td>
                              <td className="p-2 text-gray-500">{item.unit}</td>
                              <td className="p-2 text-right font-mono">{item.quantity}</td>
                              <td className="p-2 text-right font-mono">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                              <td className="p-2 text-right font-mono text-green-600 font-bold">{item.discountPercentage}%</td>
                              <td className="p-2 text-right font-mono text-slate-500">{item.gstRate}%</td>
                              <td className="p-2 text-right font-mono font-bold">₹{item.lineTotal.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Delivery & Payment Terms */}
                    <div className="text-xs space-y-2 border-r border-slate-100 pr-4">
                      <div>
                        <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Delivery Terms</span>
                        <p className="text-slate-700 mt-0.5">{selectedQuote.deliveryTerms || 'Free On Road (F.O.R) Site Delivery'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Payment Terms</span>
                        <p className="text-slate-700 mt-0.5">{selectedQuote.paymentTerms || 'Credit / 30 Days Net cycle'}</p>
                      </div>
                      {selectedQuote.notes && (
                        <div>
                          <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">ARCUS Special Instructions</span>
                          <p className="text-slate-600 mt-0.5">{selectedQuote.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Commercial Totals */}
                    <div className="text-xs space-y-1.5 font-mono text-right bg-slate-50 p-4 rounded">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal:</span>
                        <span className="font-semibold">₹{selectedQuote.subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      {selectedQuote.discountType !== 'NONE' && (
                        <div className="flex justify-between text-green-600 font-bold">
                          <span>Global Discount ({selectedQuote.discountType}):</span>
                          <span>-₹{selectedQuote.discountValue.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Shipping / Freight charges:</span>
                        <span>{selectedQuote.freeShipping ? 'FREE' : `₹${selectedQuote.shippingCharges}`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">GST Tax Amount:</span>
                        <span>₹{selectedQuote.gstAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2 text-sm text-slate-900 font-black">
                        <span>GRAND TOTAL (Inclusive of Tax):</span>
                        <span>₹{selectedQuote.grandTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Decline reason or Comments if not Active SENT */}
                  {selectedQuote.status === 'DECLINED' && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-900">
                      <strong className="block font-bold">Proposal Declined by Customer</strong>
                      Reason: {selectedQuote.declineReason || 'Not specified'}
                    </div>
                  )}

                  {selectedQuote.status === 'NEGOTIATION_REQUESTED' && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded text-xs text-amber-900">
                      <strong className="block font-bold">Negotiation Pending Review</strong>
                      Customer Comments: {selectedQuote.customerComments || 'Requesting revised budget'}
                    </div>
                  )}

                  {/* ─── Client Action Controls ─── */}
                  {selectedQuote.status === 'SENT' && !successOrder && (
                    <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5 justify-end">
                      <button
                        onClick={() => setShowDeclineModal(true)}
                        className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded font-bold text-xs uppercase tracking-wider border border-red-200 transition-colors"
                      >
                        Decline Quote
                      </button>
                      <button
                        onClick={() => setShowRenegotiateModal(true)}
                        className="px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded font-bold text-xs uppercase tracking-wider border border-amber-200 transition-colors"
                      >
                        Renegotiate Pricing
                      </button>
                      <button
                        onClick={handleAcceptQuotation}
                        disabled={actionLoading}
                        className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-xs uppercase tracking-wider border-0 shadow-md flex items-center gap-1 transition-all"
                      >
                        {actionLoading ? 'Processing...' : 'Accept & Order'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Modal Dialog: Decline Reason ─── */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRejectQuotation} className="bg-white rounded p-5 max-w-sm w-full space-y-4 shadow text-xs">
            <h4 className="text-sm font-bold text-slate-800 border-b pb-2">Decline Proposal</h4>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Reason for decline *</label>
              <select
                required
                value={declineReason}
                onChange={e => setDeclineReason(e.target.value)}
                className="w-full border border-gray-300 rounded px-2.5 py-2 text-xs"
              >
                <option value="">-- Select Reason --</option>
                <option value="Price Too High">Price Too High</option>
                <option value="Project Cancelled">Project Cancelled</option>
                <option value="Purchased Elsewhere">Purchased Elsewhere</option>
                <option value="Delayed Delivery Terms">Delayed Delivery Terms</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => setShowDeclineModal(false)}
                className="px-3 py-2 bg-slate-100 rounded font-bold uppercase hover:bg-slate-200 border-0"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading || !declineReason}
                className="px-4 py-2 bg-red-600 text-white rounded font-bold uppercase hover:bg-red-700 border-0"
              >
                Confirm Decline
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Modal Dialog: Renegotiate Comments ─── */}
      {showRenegotiateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRenegotiateQuotation} className="bg-white rounded p-5 max-w-sm w-full space-y-4 shadow text-xs">
            <h4 className="text-sm font-bold text-slate-800 border-b pb-2">Request Proposal Revision</h4>
            <p className="text-gray-400 text-[10px]">Provide target pricing expectations or commercial comments to help admins revise quotation totals.</p>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Renegotiation Comments *</label>
              <textarea
                required
                rows={4}
                placeholder='e.g., "Can you reduce prices for CPVC pipe? Target budget is ₹1,70,000."'
                value={renegotiateComments}
                onChange={e => setRenegotiateComments(e.target.value)}
                className="w-full border border-gray-300 rounded px-2.5 py-2 text-xs resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => setShowRenegotiateModal(false)}
                className="px-3 py-2 bg-slate-100 rounded font-bold uppercase hover:bg-slate-200 border-0"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading || !renegotiateComments.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 rounded font-bold uppercase border-0"
              >
                Submit Comments
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default BusinessRFQs;
