import React from 'react';
import { useOrders } from '../../core/hooks/useOrders';
import { formatCurrency, formatDate } from '../../core/config/format';
import { useAuth } from '../../context/AuthContext';

export const BusinessInvoices: React.FC = () => {
  const { user } = useAuth();
  const { orders, loading } = useOrders();

  const parseAmount = (amtStr: any) => {
    if (typeof amtStr === 'number') return amtStr;
    if (!amtStr) return 0;
    return parseFloat(String(amtStr).replace(/[^\d.]/g, '')) || 0;
  };

  const completedOrders = orders.filter(o => o.status === 'Delivered');

  // Compute B2B savings (approx 18% GST input credit on delivered orders)
  const totalSpend = completedOrders.reduce((sum, o) => sum + parseAmount(o.amount), 0);
  const gstSavings = totalSpend - (totalSpend / 1.18);

  if (loading) {
    return (
      <div className="flex justify-center py-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-lg text-left">
      {/* GST Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <div className="bg-[#FFFDF5] border border-primary/20 p-md rounded">
          <span className="material-symbols-outlined text-primary text-[32px]">percent</span>
          <p className="text-[28px] font-extrabold text-[#0A0A0A] mt-sm leading-none">{formatCurrency(gstSavings)}</p>
          <p className="text-secondary text-[10px] font-bold uppercase tracking-wider font-label-caps mt-sm">GST Input Credit Claimable</p>
        </div>
        <div className="bg-white border border-slate-200 p-md rounded shadow-sm">
          <span className="material-symbols-outlined text-green-600 text-[32px]">check_circle</span>
          <p className="text-[14px] font-extrabold text-slate-800 mt-sm leading-tight">{user?.gstNumber || 'NO GSTIN ASSOCIATED'}</p>
          <p className="text-secondary text-[10px] font-bold uppercase tracking-wider font-label-caps mt-xs">Company GSTIN Verified Profile</p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <div className="p-md border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm">Corporate Tax Invoices</h3>
          <p className="text-secondary text-[10px] mt-xs">Download official GST-compliant tax invoices for financial bookkeeping and filings.</p>
        </div>

        {completedOrders.length === 0 ? (
          <p className="p-xl text-center text-slate-500 text-xs">No delivered orders found. Tax invoices will generate once orders are delivered.</p>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <th className="p-md">Invoice ID</th>
                  <th className="p-md">Order ID</th>
                  <th className="p-md">GST Date</th>
                  <th className="p-md">Total Amount</th>
                  <th className="p-md">GST Claimable (18%)</th>
                  <th className="p-md text-right">Invoicing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedOrders.map((o: any) => {
                  const amt = parseAmount(o.amount);
                  const claimableGst = amt - (amt / 1.18);
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/50">
                      <td className="p-md font-mono font-bold text-slate-800">INV-{o.id.split('-').pop()}</td>
                      <td className="p-md font-mono text-slate-500">{o.id}</td>
                      <td className="p-md text-slate-600">{formatDate(o.timestamp || o.date)}</td>
                      <td className="p-md font-bold text-slate-900">{formatCurrency(amt)}</td>
                      <td className="p-md font-bold text-green-700">{formatCurrency(claimableGst)}</td>
                      <td className="p-md text-right">
                        <button
                          onClick={() => {
                            const token = localStorage.getItem('arcus_token') || '';
                            window.open(`/api/documents/${o.id}?format=pdf&download=true&token=${encodeURIComponent(token)}`, '_blank');
                          }}
                          className="px-md py-1 border border-slate-200 hover:border-slate-800 text-slate-700 hover:text-slate-900 font-bold rounded text-[10px] flex items-center gap-xs ml-auto"
                        >
                          <span className="material-symbols-outlined text-[14px]">download</span>
                          Download PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default BusinessInvoices;
