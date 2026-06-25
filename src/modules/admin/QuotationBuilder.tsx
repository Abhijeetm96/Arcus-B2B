import React, { useState, useEffect } from 'react';

interface RFQItem {
  itemName: string;
  description?: string;
  unit: string;
  quantity: string;
}

interface QuotationItem {
  itemName: string;
  description: string;
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
  status: string;
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
}

interface Props {
  rfq: {
    id: string;
    title?: string;
    items?: RFQItem[];
    category?: string;
    quantity?: string;
    location?: string;
    details?: string;
  };
  existingQuotations: Quotation[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const QuotationBuilder: React.FC<Props> = ({ rfq, existingQuotations, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if we are creating V1 or revising (cloning)
  const isRevision = existingQuotations.length > 0;
  const latestQuote = isRevision ? existingQuotations[0] : null;

  // Quotation header states
  const [quotationNumber, setQuotationNumber] = useState(latestQuote ? latestQuote.quotationNumber : '');
  const version = latestQuote ? latestQuote.version + 1 : 1;
  const [discountType, setDiscountType] = useState<'FLAT' | 'PERCENT' | 'NONE'>(latestQuote ? latestQuote.discountType : 'NONE');
  const [discountValue, setDiscountValue] = useState(latestQuote ? String(latestQuote.discountValue) : '0');
  const [shippingCharges, setShippingCharges] = useState(latestQuote ? String(latestQuote.shippingCharges) : '0');
  const [freeShipping, setFreeShipping] = useState(latestQuote ? latestQuote.freeShipping : false);
  const [deliveryTerms, setDeliveryTerms] = useState(latestQuote ? latestQuote.deliveryTerms || '' : 'Free On Road (F.O.R) Site Delivery');
  const [paymentTerms, setPaymentTerms] = useState(latestQuote ? latestQuote.paymentTerms || '' : 'B2B Credit / Net 30 Days');
  const [validityDate, setValidityDate] = useState(latestQuote ? latestQuote.validityDate || '' : '');
  const [notes, setNotes] = useState(latestQuote ? latestQuote.notes || '' : '');

  // Line items state
  const [items, setItems] = useState<QuotationItem[]>([]);

  // Initialize items from latest quote or original RFQ items list
  useEffect(() => {
    if (isRevision && latestQuote) {
      // Fetch details of latest quote to get its items
      fetch(`http://localhost:5000/api/quotations/${latestQuote.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('arcus_token')}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.items) {
            setItems(data.items);
          }
        })
        .catch(err => console.error('Error fetching quote items:', err));
    } else {
      // Map from RFQ items
      if (rfq.items && rfq.items.length > 0) {
        const initial = rfq.items.map(item => ({
          itemName: item.itemName,
          description: item.description || '',
          unit: item.unit || 'Nos',
          quantity: parseInt(item.quantity) || 1,
          unitPrice: 0,
          discountPercentage: 0,
          gstRate: 18,
          lineTotal: 0
        }));
        setItems(initial);
      } else {
        // Fallback single row
        setItems([{
          itemName: rfq.title || rfq.category || 'Construction Materials',
          description: rfq.details || '',
          unit: 'Nos',
          quantity: parseInt(rfq.quantity || '1') || 1,
          unitPrice: 0,
          discountPercentage: 0,
          gstRate: 18,
          lineTotal: 0
        }]);
      }
    }
  }, [rfq, isRevision, latestQuote]);

  const handleAddItem = () => {
    setItems([...items, {
      itemName: '',
      description: '',
      unit: 'Nos',
      quantity: 1,
      unitPrice: 0,
      discountPercentage: 0,
      gstRate: 18,
      lineTotal: 0
    }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    const updated = [...items];
    if (field === 'quantity' || field === 'unitPrice' || field === 'discountPercentage' || field === 'gstRate') {
      updated[index][field] = Number(value) || 0;
    } else {
      (updated[index] as any)[field] = value;
    }

    // Recalculate line total (net after item discount)
    const qty = updated[index].quantity;
    const price = updated[index].unitPrice;
    const disc = updated[index].discountPercentage;
    updated[index].lineTotal = qty * price * (1 - disc / 100);

    setItems(updated);
  };

  // Calculations
  const calculatedSubtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const totalItemDiscount = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice * (item.discountPercentage / 100)), 0);
  const subtotalAfterItemDiscounts = calculatedSubtotal - totalItemDiscount;

  let globalDiscountAmount = 0;
  const globalDiscVal = Number(discountValue) || 0;
  if (discountType === 'FLAT') {
    globalDiscountAmount = globalDiscVal;
  } else if (discountType === 'PERCENT') {
    globalDiscountAmount = subtotalAfterItemDiscounts * (globalDiscVal / 100);
  }

  const netTaxableValue = Math.max(0, subtotalAfterItemDiscounts - globalDiscountAmount);

  // Pro-rate GST from net taxable value based on items GST rates
  const baseGstSum = items.reduce((acc, item) => acc + (item.lineTotal * (item.gstRate / 100)), 0);
  const totalNetItemValue = items.reduce((acc, item) => acc + item.lineTotal, 0);
  
  // Pro-rated GST calculation
  const calculatedGst = totalNetItemValue > 0
    ? baseGstSum * (netTaxableValue / totalNetItemValue)
    : 0;

  const shipCharges = freeShipping ? 0 : (Number(shippingCharges) || 0);
  const calculatedGrandTotal = netTaxableValue + calculatedGst + shipCharges;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const invalidItem = items.some(item => !item.itemName.trim() || item.quantity <= 0 || item.unitPrice <= 0);
    if (invalidItem) {
      setError('Please fill in Item Name, Quantity, and Unit Price (> 0) for all items.');
      setLoading(false);
      return;
    }

    const quotePayload = {
      quoteData: {
        quotationNumber: quotationNumber || undefined,
        version: version,
        discountType,
        discountValue: globalDiscountAmount,
        shippingCharges: shipCharges,
        freeShipping,
        subtotal: calculatedSubtotal,
        gstAmount: calculatedGst,
        grandTotal: calculatedGrandTotal,
        deliveryTerms,
        paymentTerms,
        validityDate: validityDate || undefined,
        notes,
        status: 'SENT'
      },
      items: items.map(i => ({
        itemName: i.itemName,
        description: i.description,
        unit: i.unit,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        discountPercentage: i.discountPercentage,
        gstRate: i.gstRate,
        lineTotal: i.lineTotal
      }))
    };

    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch(`http://localhost:5000/api/rfqs/${rfq.id}/quotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quotePayload)
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit quotation.');
      }
    } catch {
      setError('Network error. Failed to save quotation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-xs text-slate-800">
      
      {/* Title */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h4 className="font-bold text-slate-800 text-sm">
            {isRevision ? `Revise Proposal (Create Version ${version})` : 'Create Custom Quotation V1'}
          </h4>
          <p className="text-gray-400 text-[10px] mt-0.5">RFQ Title: {rfq.title || 'Inquiry'} | RFQ ID: <strong className="font-mono text-slate-700">{rfq.id}</strong></p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold uppercase tracking-wider border-0"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-xs rounded">
          {error}
        </div>
      )}

      {/* Row 1: Quote Identifiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div className="flex flex-col gap-1">
          <label className="font-bold text-gray-500 uppercase tracking-wider text-[9px]">Quotation Number</label>
          <input
            type="text"
            readOnly={isRevision}
            placeholder="e.g. QT-101 (Auto-generated if empty)"
            value={quotationNumber}
            onChange={e => setQuotationNumber(e.target.value)}
            className={`h-9 px-3 border border-gray-300 rounded font-semibold ${isRevision ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-bold text-gray-500 uppercase tracking-wider text-[9px]">Proposal Version</label>
          <input
            type="number"
            readOnly
            value={version}
            className="h-9 px-3 border border-gray-300 rounded bg-gray-100 cursor-not-allowed font-semibold"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-bold text-gray-500 uppercase tracking-wider text-[9px]">Quote Validity Date</label>
          <input
            type="date"
            value={validityDate}
            onChange={e => setValidityDate(e.target.value)}
            className="h-9 px-3 border border-gray-300 rounded font-semibold bg-white"
          />
        </div>
      </div>

      {/* Line items Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h5 className="font-bold uppercase tracking-wider text-gray-600">Quotation Line Items</h5>
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1 bg-slate-900 text-white font-bold px-3 py-1 rounded hover:bg-slate-800 border-0"
          >
            <span className="material-symbols-outlined text-[14px]">add</span> Add Line
          </button>
        </div>

        <div className="border border-slate-150 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-200">
                <th className="p-3 w-1/4">Material Name *</th>
                <th className="p-3 w-1/4">Description / Brand</th>
                <th className="p-3 w-1/12">Unit</th>
                <th className="p-3 w-1/12 text-right">Qty *</th>
                <th className="p-3 w-1/12 text-right">Unit Rate (₹) *</th>
                <th className="p-3 w-1/12 text-right">Disc %</th>
                <th className="p-3 w-1/12 text-right">GST %</th>
                <th className="p-3 w-1/12 text-right">Total (₹)</th>
                <th className="p-3 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100 bg-white hover:bg-slate-50/50">
                  <td className="p-2">
                    <input
                      required
                      type="text"
                      value={item.itemName}
                      onChange={e => handleItemChange(idx, 'itemName', e.target.value)}
                      placeholder="Astral CPVC Pipe"
                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-slate-850"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => handleItemChange(idx, 'description', e.target.value)}
                      placeholder="SDR11 1 Inch"
                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs text-slate-850"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                      placeholder="Nos"
                      className="w-full border border-gray-200 rounded px-1 py-1 text-xs text-slate-850"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      required
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full border border-gray-200 rounded px-1.5 py-1 text-xs text-right text-slate-850"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                      className="w-full border border-gray-200 rounded px-1.5 py-1 text-xs text-right text-slate-850 font-bold"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discountPercentage}
                      onChange={e => handleItemChange(idx, 'discountPercentage', e.target.value)}
                      className="w-full border border-gray-200 rounded px-1.5 py-1 text-xs text-right text-green-600 font-bold"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.gstRate}
                      onChange={e => handleItemChange(idx, 'gstRate', e.target.value)}
                      className="w-full border border-gray-200 rounded px-1 py-1 text-xs text-right text-slate-500"
                    />
                  </td>
                  <td className="p-2 text-right font-mono font-bold">
                    ₹{item.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      disabled={items.length === 1}
                      onClick={() => handleRemoveItem(idx)}
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

      {/* Row 3: Discounts, Terms & Calculations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Logistics & Delivery terms */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-500 uppercase tracking-wider text-[9px]">Delivery Terms</label>
            <input
              type="text"
              value={deliveryTerms}
              onChange={e => setDeliveryTerms(e.target.value)}
              className="h-9 px-3 border border-gray-300 rounded font-semibold bg-white"
              placeholder="e.g. Free On Road (F.O.R) Site Delivery"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-500 uppercase tracking-wider text-[9px]">Payment Terms</label>
            <input
              type="text"
              value={paymentTerms}
              onChange={e => setPaymentTerms(e.target.value)}
              className="h-9 px-3 border border-gray-300 rounded font-semibold bg-white"
              placeholder="e.g. Credit / Net 30 Days"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-500 uppercase tracking-wider text-[9px]">Commercial Remarks / Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="p-3 border border-gray-300 rounded font-semibold bg-white resize-none"
              placeholder="Validity criteria, logistics exclusions, or discount rationale..."
            />
          </div>
        </div>

        {/* Global Commercial Calculations */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4">
          <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] border-b pb-2">Grand Summary</h5>
          
          {/* Discounts controls */}
          <div className="grid grid-cols-3 gap-2 items-center text-[10px]">
            <span className="font-bold text-gray-500 uppercase">Global Discount:</span>
            <select
              value={discountType}
              onChange={e => setDiscountType(e.target.value as any)}
              className="border rounded px-2 py-1 bg-white focus:outline-none"
            >
              <option value="NONE">NONE</option>
              <option value="FLAT">FLAT (INR)</option>
              <option value="PERCENT">PERCENT (%)</option>
            </select>
            <input
              type="number"
              disabled={discountType === 'NONE'}
              value={discountValue}
              onChange={e => setDiscountValue(e.target.value)}
              className={`w-full border rounded px-2 py-1 text-right focus:outline-none ${discountType === 'NONE' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white font-bold'}`}
              placeholder="Value"
            />
          </div>

          {/* Shipping controls */}
          <div className="grid grid-cols-3 gap-2 items-center text-[10px]">
            <span className="font-bold text-gray-500 uppercase">Freight Charges:</span>
            <div className="flex items-center gap-1 col-span-2">
              <label className="flex items-center gap-1 font-bold text-gray-700">
                <input
                  type="checkbox"
                  checked={freeShipping}
                  onChange={e => setFreeShipping(e.target.checked)}
                  className="rounded text-amber-500 border-gray-300 focus:ring-0"
                />
                Free Shipping
              </label>
              <input
                type="number"
                disabled={freeShipping}
                value={shippingCharges}
                onChange={e => setShippingCharges(e.target.value)}
                className={`w-28 border rounded px-2 py-1 text-right focus:outline-none ml-auto ${freeShipping ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'bg-white font-bold'}`}
                placeholder="Charges (INR)"
              />
            </div>
          </div>

          <hr />

          {/* Mathematical breakdowns */}
          <div className="space-y-2 font-mono text-right text-[11px]">
            <div className="flex justify-between">
              <span className="text-gray-500">Gross Item Value (Before Disc):</span>
              <span className="font-semibold">₹{calculatedSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            {totalItemDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>(-) Item Level Discounts Sum:</span>
                <span>-₹{totalItemDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            {globalDiscountAmount > 0 && (
              <div className="flex justify-between text-green-600 font-bold">
                <span>(-) Global Commercial Discount:</span>
                <span>-₹{globalDiscountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-700 border-b pb-1.5">
              <span>Net Taxable Base Value:</span>
              <span>₹{netTaxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pro-Rated GST Amount:</span>
              <span>₹{calculatedGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Freight &amp; Delivery Logistics:</span>
              <span>{freeShipping ? 'FREE' : `₹${shipCharges.toLocaleString('en-IN')}`}</span>
            </div>
            <div className="flex justify-between border-t border-slate-300 pt-2 text-xs text-slate-900 font-black">
              <span>PROPOSED GRAND TOTAL (INR):</span>
              <span className="text-sm">₹{calculatedGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase rounded-lg border-0"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase rounded-lg border-0 shadow-md flex items-center gap-1"
        >
          {loading ? 'Saving...' : 'Send Quotation to Buyer'}
        </button>
      </div>
    </form>
  );
};
