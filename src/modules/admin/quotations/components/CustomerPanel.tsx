import React from 'react';

interface CustomerSnapshot {
  company: string;
  GSTIN?: string;
  billing_address: string;
  shipping_address: string;
  contact_person: string;
  phone: string;
  email: string;
  state?: string;
  country?: string;
}

interface Props {
  customer: CustomerSnapshot;
  onChange?: (updated: CustomerSnapshot) => void;
  isReadOnly?: boolean;
}

export const CustomerPanel: React.FC<Props> = ({ customer, onChange, isReadOnly = false }) => {
  const handleChange = (field: keyof CustomerSnapshot, value: string) => {
    if (onChange) {
      onChange({
        ...customer,
        [field]: value
      });
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <span className="material-symbols-outlined text-slate-500 text-lg">corporate_fare</span>
        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Customer Snapshot</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Company Name</label>
            <input
              type="text"
              disabled={isReadOnly}
              value={customer.company || ''}
              onChange={e => handleChange('company', e.target.value)}
              className="w-full h-8 px-3 border border-slate-200 rounded text-slate-800 bg-slate-50/30 disabled:bg-slate-100/50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">GSTIN</label>
            <input
              type="text"
              disabled={isReadOnly}
              value={customer.GSTIN || ''}
              placeholder="e.g. 29AAICA2342A1Z1"
              onChange={e => handleChange('GSTIN', e.target.value)}
              className="w-full h-8 px-3 border border-slate-200 rounded text-slate-800 bg-slate-50/30 disabled:bg-slate-100/50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Person</label>
            <input
              type="text"
              disabled={isReadOnly}
              value={customer.contact_person || ''}
              onChange={e => handleChange('contact_person', e.target.value)}
              className="w-full h-8 px-3 border border-slate-200 rounded text-slate-800 bg-slate-50/30 disabled:bg-slate-100/50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Billing Address</label>
            <textarea
              rows={2}
              disabled={isReadOnly}
              value={customer.billing_address || ''}
              onChange={e => handleChange('billing_address', e.target.value)}
              className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-slate-50/30 disabled:bg-slate-100/50 disabled:cursor-not-allowed resize-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Shipping Address</label>
            <textarea
              rows={2}
              disabled={isReadOnly}
              value={customer.shipping_address || ''}
              onChange={e => handleChange('shipping_address', e.target.value)}
              className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-slate-50/30 disabled:bg-slate-100/50 disabled:cursor-not-allowed resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
