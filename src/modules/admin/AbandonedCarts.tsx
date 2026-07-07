import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';

interface CartItem {
  id: string;
  name: string;
  price: number;
  basePrice: number;
  qty: number;
  unit: string;
}

interface AbandonedCart {
  id: string;
  userId: string;
  items: CartItem[];
  totalValue: number;
  updatedAt: string;
  status: string;
  reminderSentAt: string | null;
  userName: string;
  userEmail: string;
  userPhone: string;
  userCity: string;
  userState: string;
  customerType: string;
  companyName: string;
}

export const AbandonedCarts: React.FC = () => {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchCarts = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await apiFetch('/admin/abandoned-carts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load abandoned carts.');
      const data = await res.json();
      setCarts(data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading carts.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts(true);
  }, []);

  const handleSendReminder = async (cart: AbandonedCart) => {
    setSendingReminderId(cart.id);
    setError(null);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await apiFetch(`/admin/abandoned-carts/${cart.id}/remind`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to send recovery reminder.');
      
      setSuccessMessage(`Recovery reminder successfully sent to ${cart.userName} (${cart.userEmail}).`);
      
      // Update local state
      setCarts(prev =>
        prev.map(c =>
          c.id === cart.id
            ? { ...c, reminderSentAt: new Date().toISOString() }
            : c
        )
      );

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Error sending reminder.');
    } finally {
      setSendingReminderId(null);
    }
  };

  const getRelativeTime = (isoString: string) => {
    const now = new Date();
    const date = new Date(isoString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  // Metrics calculations
  const totalAbandonedCarts = carts.length;
  const totalRevenueLoss = carts.reduce((sum, c) => sum + Number(c.totalValue), 0);
  const avgCartValue = totalAbandonedCarts ? totalRevenueLoss / totalAbandonedCarts : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-xl">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-lg text-left">
      {/* Live Refresh Header Bar */}
      <div className="flex justify-between items-center bg-slate-50 p-sm rounded border border-slate-200">
        <span className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider pl-xs">Abandoned Carts Tracking</span>
        <button
          onClick={() => fetchCarts(true)}
          className="flex items-center gap-xs bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-sm h-8 rounded font-bold text-xs transition-all shadow-xs cursor-pointer"
          title="Refresh abandoned cart logs from database"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Refresh Data
        </button>
      </div>

      {/* Success/Error Banners */}
      {successMessage && (
        <div className="bg-emerald-50 text-emerald-800 p-md rounded border border-emerald-200 flex items-center gap-sm">
          <span className="material-symbols-outlined text-emerald-500">check_circle</span>
          <p className="font-semibold text-body-sm">{successMessage}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-800 p-md rounded border border-red-200 flex items-center gap-sm">
          <span className="material-symbols-outlined text-red-500">error</span>
          <p className="font-semibold text-body-sm">Error: {error}</p>
        </div>
      )}

      {/* Telemetry Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="bg-white border border-slate-200 p-lg rounded shadow-sm flex items-center gap-md">
          <div className="w-12 h-12 rounded bg-amber-50 text-amber-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">shopping_cart</span>
          </div>
          <div>
            <p className="text-[24px] font-black text-slate-900 mt-xs leading-none">{totalAbandonedCarts}</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Abandoned Carts</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-lg rounded shadow-sm flex items-center gap-md">
          <div className="w-12 h-12 rounded bg-rose-50 text-rose-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">payments</span>
          </div>
          <div>
            <p className="text-[24px] font-black text-rose-600 mt-xs leading-none">{formatCurrency(totalRevenueLoss)}</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Recoverable Value</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-lg rounded shadow-sm flex items-center gap-md">
          <div className="w-12 h-12 rounded bg-blue-50 text-blue-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">analytics</span>
          </div>
          <div>
            <p className="text-[24px] font-black text-slate-900 mt-xs leading-none">{formatCurrency(avgCartValue)}</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Avg. Value Idle</p>
          </div>
        </div>
      </div>

      {/* Main Abandoned Carts Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        {carts.length === 0 ? (
          <div className="text-center py-2xl text-slate-400">
            <span className="material-symbols-outlined text-[48px] text-slate-200 mb-xs">production_quantity_limits</span>
            <p className="font-bold text-body">No abandoned carts tracked</p>
            <p className="text-xs text-slate-400">When users add materials and leave them in their cart, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-md text-xs font-bold text-slate-500 uppercase tracking-wider">Buyer Info</th>
                  <th className="p-md text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                  <th className="p-md text-xs font-bold text-slate-500 uppercase tracking-wider">Cart Contents</th>
                  <th className="p-md text-xs font-bold text-slate-500 uppercase tracking-wider">Total Value</th>
                  <th className="p-md text-xs font-bold text-slate-500 uppercase tracking-wider">Last Activity</th>
                  <th className="p-md text-xs font-bold text-slate-500 uppercase tracking-wider">Recovery Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {carts.map(cart => (
                  <tr key={cart.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Buyer Info */}
                    <td className="p-md">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-xs">
                          <span className="font-bold text-slate-950 text-body-sm">{cart.userName}</span>
                          <span className={`text-[9px] font-extrabold uppercase px-xs py-0.5 rounded ${
                            cart.customerType === 'BUSINESS' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {cart.customerType}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 mt-0.5">{cart.userEmail}</span>
                        <span className="text-[10px] text-slate-400">{cart.userPhone}</span>
                        {cart.companyName && (
                          <span className="text-[11px] text-indigo-500 font-bold mt-1">🏢 {cart.companyName}</span>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="p-md">
                      <div className="flex items-center gap-xs text-slate-600">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">pin_drop</span>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-xs">{cart.userCity}</span>
                          <span className="text-[10px] text-slate-400">{cart.userState}</span>
                        </div>
                      </div>
                    </td>

                    {/* Cart Contents */}
                    <td className="p-md max-w-[280px]">
                      <div className="flex flex-col gap-1">
                        {cart.items.map(item => (
                          <div key={item.id} className="flex justify-between items-center text-xs bg-slate-50 border border-slate-100 rounded px-sm py-xs">
                            <span className="text-slate-800 font-medium truncate max-w-[160px]" title={item.name}>
                              {item.name}
                            </span>
                            <span className="text-slate-400 font-bold text-[10px] shrink-0 ml-sm">
                              {item.qty} {item.unit || 'pcs'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Total Value */}
                    <td className="p-md">
                      <span className="font-extrabold text-slate-900 text-body-sm">
                        {formatCurrency(cart.totalValue)}
                      </span>
                    </td>

                    {/* Last Activity */}
                    <td className="p-md">
                      <span className="text-xs text-slate-500 font-bold">
                        {getRelativeTime(cart.updatedAt)}
                      </span>
                    </td>

                    {/* Recovery Actions */}
                    <td className="p-md">
                      {cart.reminderSentAt ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-xs text-emerald-600 font-extrabold text-xs">
                            <span className="material-symbols-outlined text-[16px]">check</span>
                            Reminder Sent
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider pl-4">
                            {getRelativeTime(cart.reminderSentAt)}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSendReminder(cart)}
                          disabled={sendingReminderId === cart.id}
                          className="flex items-center gap-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-sm py-1.5 rounded transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-[14px]">mail</span>
                          {sendingReminderId === cart.id ? 'Sending...' : 'Send Reminder'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
