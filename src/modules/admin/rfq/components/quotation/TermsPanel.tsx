import React from 'react';

interface Props {
  deliveryTerms: string;
  paymentTerms: string;
  validityDate: string;
  currencyCode: string;
  exchangeRate: number;
  onDeliveryTermsChange?: (val: string) => void;
  onPaymentTermsChange?: (val: string) => void;
  onValidityDateChange?: (val: string) => void;
  onCurrencyCodeChange?: (val: string) => void;
  onExchangeRateChange?: (val: number) => void;
  isReadOnly?: boolean;
}

export const TermsPanel: React.FC<Props> = ({
  deliveryTerms,
  paymentTerms,
  validityDate,
  currencyCode,
  exchangeRate,
  onDeliveryTermsChange,
  onPaymentTermsChange,
  onValidityDateChange,
  onCurrencyCodeChange,
  onExchangeRateChange,
  isReadOnly = false
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <span className="material-symbols-outlined text-slate-500 text-lg">gavel</span>
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Commercial Terms &amp; Exchange</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Delivery Terms</label>
            <input
              type="text"
              disabled={isReadOnly}
              value={deliveryTerms}
              onChange={e => onDeliveryTermsChange?.(e.target.value)}
              placeholder="e.g. Free On Road (F.O.R) Site Delivery"
              className="w-full h-8 px-3 border border-slate-200 rounded text-slate-800 bg-slate-50/30 disabled:bg-slate-100/50 disabled:cursor-not-allowed font-semibold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Terms</label>
            <input
              type="text"
              disabled={isReadOnly}
              value={paymentTerms}
              onChange={e => onPaymentTermsChange?.(e.target.value)}
              placeholder="e.g. Credit / Net 30 Days"
              className="w-full h-8 px-3 border border-slate-200 rounded text-slate-800 bg-slate-50/30 disabled:bg-slate-100/50 disabled:cursor-not-allowed font-semibold"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Proposal Validity Date</label>
            <input
              type="date"
              disabled={isReadOnly}
              value={validityDate}
              onChange={e => onValidityDateChange?.(e.target.value)}
              className="w-full h-8 px-3 border border-slate-200 rounded text-slate-800 bg-slate-50/30 disabled:bg-slate-100/50 disabled:cursor-not-allowed font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Currency Code</label>
              <select
                disabled={isReadOnly}
                value={currencyCode}
                onChange={e => onCurrencyCodeChange?.(e.target.value)}
                className="w-full h-8 px-2 border border-slate-200 rounded text-slate-800 bg-white"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="AED">AED (Dh)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Exchange Rate (vs INR)</label>
              <input
                type="number"
                disabled={isReadOnly || currencyCode === 'INR'}
                value={exchangeRate}
                step="any"
                onChange={e => onExchangeRateChange?.(Number(e.target.value) || 1.0)}
                className="w-full h-8 px-3 border border-slate-200 rounded text-slate-800 bg-white text-right font-semibold"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
