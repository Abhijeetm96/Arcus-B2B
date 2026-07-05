import React, { useState } from 'react';

interface Props {
  subtotal: number;
  itemDiscounts: number;
  globalDiscountType: 'FLAT' | 'PERCENT' | 'NONE';
  globalDiscountValue: number;
  shipping: number;
  otherCharges: number;
  gstAmount: number;
  grandTotal: number;
  roundOff: number;
  isInterstate: boolean;
  onShippingChange?: (val: number) => void;
  onOtherChargesChange?: (val: number) => void;
  onGlobalDiscountTypeChange?: (type: 'FLAT' | 'PERCENT' | 'NONE') => void;
  onGlobalDiscountValueChange?: (val: number) => void;
  onInterstateToggle?: (val: boolean) => void;
  isReadOnly?: boolean;
  auditTrail?: {
    cgstTotal: number;
    sgstTotal: number;
    igstTotal: number;
    exemptTotal: number;
    rawGrandTotal: number;
  };
}

export const PricingSummary: React.FC<Props> = ({
  subtotal,
  itemDiscounts,
  globalDiscountType,
  globalDiscountValue,
  shipping,
  otherCharges,
  gstAmount,
  grandTotal,
  roundOff,
  isInterstate,
  onShippingChange,
  onOtherChargesChange,
  onGlobalDiscountTypeChange,
  onGlobalDiscountValueChange,
  onInterstateToggle,
  isReadOnly = false,
  auditTrail
}) => {
  const [showAudit, setShowAudit] = useState(false);

  const netTaxable = subtotal - itemDiscounts - (
    globalDiscountType === 'FLAT' 
      ? globalDiscountValue 
      : globalDiscountType === 'PERCENT' 
        ? (subtotal - itemDiscounts) * (globalDiscountValue / 100)
        : 0
  );

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <span className="material-symbols-outlined text-slate-500 text-lg">receipt_long</span>
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Financial Summary &amp; Taxes</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
        {/* Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-500 text-[10px] uppercase">Tax Strategy</span>
            {!isReadOnly && onInterstateToggle ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onInterstateToggle(false)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all border-0 ${!isInterstate ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  CGST + SGST (Intra)
                </button>
                <button
                  type="button"
                  onClick={() => onInterstateToggle(true)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all border-0 ${isInterstate ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  IGST (Inter)
                </button>
              </div>
            ) : (
              <span className="font-bold text-slate-800 uppercase text-[10px]">
                {isInterstate ? 'IGST (Interstate)' : 'CGST + SGST (Intrastate)'}
              </span>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Global Discount</label>
            <div className="flex gap-2">
              <select
                disabled={isReadOnly}
                value={globalDiscountType}
                onChange={e => onGlobalDiscountTypeChange?.(e.target.value as any)}
                className="w-1/3 h-8 px-2 border border-slate-200 rounded text-slate-800 bg-white"
              >
                <option value="NONE">NONE</option>
                <option value="FLAT">FLAT (₹)</option>
                <option value="PERCENT">PERCENT (%)</option>
              </select>
              <input
                type="number"
                disabled={isReadOnly || globalDiscountType === 'NONE'}
                value={globalDiscountValue}
                onChange={e => onGlobalDiscountValueChange?.(Number(e.target.value) || 0)}
                className="w-2/3 h-8 px-3 border border-slate-200 rounded text-slate-800 bg-white text-right font-semibold"
                placeholder="Value"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Freight Charges (₹)</label>
              <input
                type="number"
                disabled={isReadOnly}
                value={shipping}
                onChange={e => onShippingChange?.(Number(e.target.value) || 0)}
                className="w-full h-8 px-3 border border-slate-200 rounded text-slate-800 bg-white text-right font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Other Surcharges (₹)</label>
              <input
                type="number"
                disabled={isReadOnly}
                value={otherCharges}
                onChange={e => onOtherChargesChange?.(Number(e.target.value) || 0)}
                className="w-full h-8 px-3 border border-slate-200 rounded text-slate-800 bg-white text-right font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 font-mono space-y-2 text-right">
          <div className="flex justify-between border-b border-slate-200/60 pb-1.5 text-[10px] font-sans font-bold text-slate-500 uppercase">
            <span>Description</span>
            <span>Value (INR)</span>
          </div>

          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Gross Items Subtotal:</span>
            <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          {itemDiscounts > 0 && (
            <div className="flex justify-between text-[11px] text-green-600">
              <span className="text-green-500/70">(-) Item Level Discounts:</span>
              <span>-₹{itemDiscounts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          )}

          {globalDiscountType !== 'NONE' && (
            <div className="flex justify-between text-[11px] text-green-600">
              <span className="text-green-500/70">(-) Global Commercial Disc:</span>
              <span>-₹{(subtotal - itemDiscounts - netTaxable).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          )}

          <div className="flex justify-between text-[11px] font-bold text-slate-700 border-t border-slate-200/50 pt-1">
            <span>Net Taxable Base Value:</span>
            <span>₹{netTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Total GST Liability:</span>
            <span>₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Freight &amp; Handling:</span>
            <span>₹{shipping.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          {otherCharges > 0 && (
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Other Charges:</span>
              <span>₹{otherCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          )}

          {Math.abs(roundOff) > 0 && (
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Round Off Adjustment:</span>
              <span>{roundOff >= 0 ? '+' : ''}₹{roundOff.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          )}

          <div className="flex justify-between text-xs text-slate-900 font-black border-t-2 border-indigo-500 pt-2">
            <span>PROPOSED GRAND TOTAL:</span>
            <span className="text-sm text-indigo-650">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Audit trail toggle */}
          {auditTrail && (
            <div className="pt-2 text-left border-t border-slate-200/50 mt-2">
              <button
                type="button"
                onClick={() => setShowAudit(!showAudit)}
                className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-700 bg-transparent border-0 font-sans p-0 cursor-pointer focus:outline-none"
              >
                <span className="material-symbols-outlined text-[13px]">{showAudit ? 'expand_less' : 'expand_more'}</span>
                {showAudit ? 'Hide Audit Log' : 'Show Audit Log'}
              </button>
              {showAudit && (
                <div className="mt-2 text-[10px] text-slate-500 bg-white p-2.5 rounded border border-slate-200/80 font-mono space-y-1">
                  <div>CGST Share (Intrastate): ₹{Number(auditTrail.cgstTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  <div>SGST Share (Intrastate): ₹{Number(auditTrail.sgstTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  <div>IGST Share (Interstate): ₹{Number(auditTrail.igstTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  <div>Exempt Category Total: ₹{Number(auditTrail.exemptTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  <div>Raw Grand Total: ₹{Number(auditTrail.rawGrandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
