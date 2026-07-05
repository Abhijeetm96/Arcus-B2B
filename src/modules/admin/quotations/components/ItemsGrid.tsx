import React from 'react';

export interface QuotationItem {
  id?: string;
  product_id?: string;
  product_snapshot: {
    name: string;
    sku?: string;
    brand?: string;
    unit?: string;
    hsn_code?: string;
    gst?: number;
    description?: string;
    manufacturer?: string;
    image?: string;
    specifications?: any;
  };
  quantity: number;
  rate: number;
  discount_percent: number;
  tax_percent: number;
  final_amount: number;
  remarks?: string;
}

interface Props {
  items: QuotationItem[];
  onChange: (updated: QuotationItem[]) => void;
  isReadOnly?: boolean;
}

export const ItemsGrid: React.FC<Props> = ({ items, onChange, isReadOnly = false }) => {
  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    const item = { ...updated[index] };

    if (field === 'name') {
      item.product_snapshot = { ...item.product_snapshot, name: value };
    } else if (field === 'brand') {
      item.product_snapshot = { ...item.product_snapshot, brand: value };
    } else if (field === 'sku') {
      item.product_snapshot = { ...item.product_snapshot, sku: value };
    } else if (field === 'unit') {
      item.product_snapshot = { ...item.product_snapshot, unit: value };
    } else if (field === 'hsn_code') {
      item.product_snapshot = { ...item.product_snapshot, hsn_code: value };
    } else if (field === 'quantity' || field === 'rate' || field === 'discount_percent' || field === 'tax_percent') {
      (item as any)[field] = Number(value) || 0;
    } else {
      (item as any)[field] = value;
    }

    // Recompute local final amount for convenience
    const subtotal = item.quantity * item.rate;
    const discAmount = subtotal * (item.discount_percent / 100);
    const taxable = subtotal - discAmount;
    const tax = taxable * (item.tax_percent / 100);
    item.final_amount = taxable + tax;

    updated[index] = item;
    onChange(updated);
  };

  const handleAddItem = () => {
    onChange([
      ...items,
      {
        product_snapshot: { name: '', brand: '', sku: '', unit: 'Nos', hsn_code: '2523', gst: 18 },
        quantity: 1,
        rate: 0,
        discount_percent: 0,
        tax_percent: 18,
        final_amount: 0
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    onChange(items.filter((_, idx) => idx !== index));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onChange(updated);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-500 text-lg">view_list</span>
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Quotation Line Items</h3>
        </div>
        {!isReadOnly && (
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1 bg-slate-900 text-white font-bold px-3 py-1.5 rounded text-[10px] uppercase hover:bg-slate-800 transition-colors border-0"
          >
            <span className="material-symbols-outlined text-[13px]">add</span> Add Item
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-200">
              <th className="p-3 w-[25%]">Material Description *</th>
              <th className="p-3 w-[15%]">Brand / SKU</th>
              <th className="p-3 w-[8%] text-center">HSN</th>
              <th className="p-3 w-[8%] text-center">Unit</th>
              <th className="p-3 w-[10%] text-right">Qty *</th>
              <th className="p-3 w-[12%] text-right">Rate (₹) *</th>
              <th className="p-3 w-[8%] text-right">Disc %</th>
              <th className="p-3 w-[8%] text-right">GST %</th>
              <th className="p-3 w-[12%] text-right">Total (₹)</th>
              {!isReadOnly && <th className="p-3 text-center w-[8%]">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                <td className="p-2">
                  <input
                    type="text"
                    disabled={isReadOnly}
                    required
                    value={item.product_snapshot.name || ''}
                    onChange={e => handleItemChange(idx, 'name', e.target.value)}
                    placeholder="e.g. UltraTech Cement OPC 53"
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 disabled:bg-slate-100/50 disabled:cursor-not-allowed font-semibold"
                  />
                </td>
                <td className="p-2 flex gap-1">
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={item.product_snapshot.brand || ''}
                    onChange={e => handleItemChange(idx, 'brand', e.target.value)}
                    placeholder="Brand"
                    className="w-1/2 border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-800 disabled:bg-slate-100/50 disabled:cursor-not-allowed"
                  />
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={item.product_snapshot.sku || ''}
                    onChange={e => handleItemChange(idx, 'sku', e.target.value)}
                    placeholder="SKU"
                    className="w-1/2 border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-800 disabled:bg-slate-100/50 disabled:cursor-not-allowed font-mono"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={item.product_snapshot.hsn_code || ''}
                    onChange={e => handleItemChange(idx, 'hsn_code', e.target.value)}
                    placeholder="2523"
                    className="w-full border border-slate-200 rounded px-1 py-1 text-xs text-center text-slate-700 disabled:bg-slate-100/50 disabled:cursor-not-allowed font-mono"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={item.product_snapshot.unit || ''}
                    onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                    placeholder="Bag"
                    className="w-full border border-slate-200 rounded px-1 py-1 text-xs text-center text-slate-700 disabled:bg-slate-100/50 disabled:cursor-not-allowed"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    disabled={isReadOnly}
                    min="0.0001"
                    step="any"
                    value={item.quantity}
                    onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                    className="w-full border border-slate-200 rounded px-2 py-1 text-xs text-right text-slate-800 disabled:bg-slate-100/50 disabled:cursor-not-allowed font-semibold"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    disabled={isReadOnly}
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={e => handleItemChange(idx, 'rate', e.target.value)}
                    className="w-full border border-slate-200 rounded px-2 py-1 text-xs text-right text-slate-800 disabled:bg-slate-100/50 disabled:cursor-not-allowed font-bold"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    disabled={isReadOnly}
                    min="0"
                    max="100"
                    step="0.01"
                    value={item.discount_percent}
                    onChange={e => handleItemChange(idx, 'discount_percent', e.target.value)}
                    className="w-full border border-slate-200 rounded px-1 py-1 text-xs text-right text-green-600 disabled:bg-slate-100/50 disabled:cursor-not-allowed font-bold"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    disabled={isReadOnly}
                    min="0"
                    max="100"
                    value={item.tax_percent}
                    onChange={e => handleItemChange(idx, 'tax_percent', e.target.value)}
                    className="w-full border border-slate-200 rounded px-1 py-1 text-xs text-right text-slate-500 disabled:bg-slate-100/50 disabled:cursor-not-allowed"
                  />
                </td>
                <td className="p-2 text-right font-mono font-bold text-slate-800">
                  ₹{Number(item.final_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                {!isReadOnly && (
                  <td className="p-2">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => moveItem(idx, 'up')}
                        disabled={idx === 0}
                        className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      >
                        <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(idx, 'down')}
                        disabled={idx === items.length - 1}
                        className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      >
                        <span className="material-symbols-outlined text-[15px]">arrow_downward</span>
                      </button>
                      <button
                        type="button"
                        disabled={items.length === 1}
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-500 hover:text-red-700 disabled:opacity-30"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
