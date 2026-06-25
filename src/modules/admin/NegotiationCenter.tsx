import React, { useState } from 'react';

interface QuotationItem {
  itemName: string;
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
  createdBy?: string;
  items?: QuotationItem[];
}

interface Props {
  rfq: {
    id: string;
    title?: string;
  };
  quotations: Quotation[];
  onBack: () => void;
}

export const NegotiationCenter: React.FC<Props> = ({ rfq, quotations, onBack }) => {
  const [vAId, setVAId] = useState(quotations.length > 0 ? quotations[quotations.length - 1].id : '');
  const [vBId, setVBId] = useState(quotations.length > 1 ? quotations[0].id : (quotations.length > 0 ? quotations[0].id : ''));

  const qA = quotations.find(q => q.id === vAId);
  const qB = quotations.find(q => q.id === vBId);

  return (
    <div className="bg-white border border-slate-200 rounded p-6 shadow-sm space-y-6 text-xs text-slate-800 text-left">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-3">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-bold mb-2 bg-transparent border-0"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to RFQ
          </button>
          <h4 className="font-bold text-slate-800 text-sm">Negotiation &amp; Version Control</h4>
          <p className="text-gray-400 text-[10px] mt-0.5">RFQ Title: {rfq.title} | RFQ ID: <strong className="font-mono">{rfq.id}</strong></p>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold uppercase border-0"
        >
          Close History
        </button>
      </div>

      {/* timeline log */}
      <div className="space-y-3">
        <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Negotiation Trail Log</h5>
        <div className="relative border-l border-slate-200 ml-3 pl-5 space-y-4">
          {quotations.map((q) => (
            <div key={q.id} className="relative">
              {/* Dot */}
              <span className={`absolute -left-[26px] top-1 w-3 h-3 rounded-full border-2 bg-white ${
                q.status === 'APPROVED' ? 'border-green-500' :
                q.status === 'DECLINED' ? 'border-red-500' :
                q.status === 'NEGOTIATION_REQUESTED' ? 'border-amber-500' :
                'border-slate-400'
              }`}></span>
              <div>
                <span className="font-bold text-slate-800">Quotation Version {q.version} ({q.status})</span>
                <span className="text-gray-400 text-[10px] ml-2">Issued {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : ''} by {q.createdBy || 'Admin'}</span>
                
                {/* Proposal details */}
                <div className="mt-1 font-mono text-gray-600 text-[10px]">
                  Subtotal: ₹{q.subtotal.toLocaleString()} | Grand Total: <strong className="text-slate-800">₹{q.grandTotal.toLocaleString()}</strong>
                </div>

                {/* Customer comments */}
                {q.status === 'NEGOTIATION_REQUESTED' && q.customerComments && (
                  <div className="mt-2 bg-amber-50 border border-amber-100 p-2.5 rounded text-amber-900 max-w-lg">
                    <span className="font-bold">Customer Comments (Renegotiation):</span>
                    <p className="mt-0.5 italic">"{q.customerComments}"</p>
                  </div>
                )}

                {/* Decline reason */}
                {q.status === 'DECLINED' && q.declineReason && (
                  <div className="mt-2 bg-red-50 border border-red-100 p-2.5 rounded text-red-900 max-w-lg">
                    <span className="font-bold">Decline Reason:</span>
                    <p className="mt-0.5">"{q.declineReason}"</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr />

      {/* Side-by-side comparison */}
      <div className="space-y-4">
        <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Side-by-Side Version Comparison</h5>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-500 uppercase tracking-wider text-[9px]">Select Base Version</label>
            <select
              value={vAId}
              onChange={e => setVAId(e.target.value)}
              className="border border-slate-300 rounded px-2.5 py-1.5 bg-white"
            >
              {quotations.map(q => (
                <option key={q.id} value={q.id}>Version {q.version} (Total: ₹{q.grandTotal.toLocaleString()})</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-bold text-gray-500 uppercase tracking-wider text-[9px]">Select Comparison Version</label>
            <select
              value={vBId}
              onChange={e => setVBId(e.target.value)}
              className="border border-slate-300 rounded px-2.5 py-1.5 bg-white"
            >
              {quotations.map(q => (
                <option key={q.id} value={q.id}>Version {q.version} (Total: ₹{q.grandTotal.toLocaleString()})</option>
              ))}
            </select>
          </div>
        </div>

        {qA && qB && (
          <div className="border border-slate-150 rounded overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[9px]">
                  <th className="p-3 w-1/3">Proposed Metric</th>
                  <th className="p-3 w-1/3 text-right bg-slate-100/50">Version {qA.version}</th>
                  <th className="p-3 w-1/3 text-right bg-slate-200/30">Version {qB.version}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-semibold text-slate-700">Proposal ID</td>
                  <td className="p-3 text-right font-mono bg-slate-100/50">{qA.id}</td>
                  <td className="p-3 text-right font-mono bg-slate-200/30">{qB.id}</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700">Status</td>
                  <td className="p-3 text-right bg-slate-100/50">
                    <span className="font-bold uppercase text-[9px]">{qA.status}</span>
                  </td>
                  <td className="p-3 text-right bg-slate-200/30">
                    <span className="font-bold uppercase text-[9px]">{qB.status}</span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700">Subtotal</td>
                  <td className="p-3 text-right font-mono bg-slate-100/50">₹{qA.subtotal.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono bg-slate-200/30">₹{qB.subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700">Discount Type</td>
                  <td className="p-3 text-right font-mono bg-slate-100/50">{qA.discountType}</td>
                  <td className="p-3 text-right font-mono bg-slate-200/30">{qB.discountType}</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700">Discount Value</td>
                  <td className="p-3 text-right font-mono text-green-600 font-bold bg-slate-100/50">-₹{qA.discountValue.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono text-green-600 font-bold bg-slate-200/30">-₹{qB.discountValue.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700">GST Amount</td>
                  <td className="p-3 text-right font-mono bg-slate-100/50">₹{qA.gstAmount.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono bg-slate-200/30">₹{qB.gstAmount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700">Freight &amp; Shipping Charges</td>
                  <td className="p-3 text-right font-mono bg-slate-100/50">{qA.freeShipping ? 'FREE' : `₹${qA.shippingCharges}`}</td>
                  <td className="p-3 text-right font-mono bg-slate-200/30">{qB.freeShipping ? 'FREE' : `₹${qB.shippingCharges}`}</td>
                </tr>
                <tr className="font-bold text-slate-900 border-t-2 border-slate-200">
                  <td className="p-3 text-sm font-black">GRAND TOTAL (Tax-Inc)</td>
                  <td className="p-3 text-right text-sm font-black bg-slate-100/50 text-slate-900">₹{qA.grandTotal.toLocaleString()}</td>
                  <td className="p-3 text-right text-sm font-black bg-slate-200/30 text-slate-900">₹{qB.grandTotal.toLocaleString()}</td>
                </tr>
                <tr className="font-semibold text-slate-600">
                  <td className="p-3">Variance Percentage</td>
                  <td className="p-3 text-right bg-slate-100/50" colSpan={2}>
                    {qA.grandTotal > 0 ? (
                      <span className={`font-bold ${qB.grandTotal < qA.grandTotal ? 'text-green-600' : (qB.grandTotal > qA.grandTotal ? 'text-red-600' : 'text-slate-500')}`}>
                        {qB.grandTotal < qA.grandTotal ? 'REDUCED BY ' : (qB.grandTotal > qA.grandTotal ? 'INCREASED BY ' : 'NO VARIANCE ')}
                        {Math.abs(Math.round(((qB.grandTotal - qA.grandTotal) / qA.grandTotal) * 100))}%
                      </span>
                    ) : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
