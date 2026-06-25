import React, { useEffect, useState } from 'react';
import type { Order } from './types';


export const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail Drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderNotes, setOrderNotes] = useState<string>('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch('http://localhost:5000/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load orders.');
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update order status.');
      }

      setSuccess(`Order #${orderId} status updated to ${newStatus}!`);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
    } catch (err: any) {
      setError(err.message || 'Error updating order status.');
    }
  };

  const handleSaveNotes = () => {
    if (!selectedOrder) return;
    setSuccess(`Order notes saved for #${selectedOrder.id}!`);
    // Local mock persist of notes
    setTimeout(() => setSuccess(null), 3000);
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
                        o.userId.toLowerCase().includes(search.toLowerCase()) ||
                        (o.shippingAddress && o.shippingAddress.toLowerCase().includes(search.toLowerCase()));
    
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-md text-left">
      {/* Notifications */}
      {error && (
        <div className="bg-red-50 text-red-800 p-md rounded border border-red-200 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="material-symbols-outlined text-[18px]">close</button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-800 p-md rounded border border-green-200 flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="material-symbols-outlined text-[18px]">close</button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md bg-white p-md rounded border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-sm w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] md:max-w-xs">
            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search by Order ID, buyer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-xxl pr-md border border-slate-200 rounded text-body-sm focus:border-primary focus:ring-0 bg-slate-50"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-md border border-slate-200 rounded text-body-sm bg-slate-50 focus:border-primary focus:ring-0 font-bold"
          >
            <option value="all">All Orders</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="text-xs bg-slate-100 text-slate-500 rounded px-md py-sm font-extrabold font-label-caps uppercase tracking-wide">
          {filteredOrders.length} Orders
        </div>
      </div>

      {/* Orders List Table */}
      {loading ? (
        <div className="flex justify-center py-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-lg py-md">Order ID</th>
                  <th className="px-lg py-md">Buyer / Client</th>
                  <th className="px-lg py-md">Order products</th>
                  <th className="px-lg py-md">Total amount</th>
                  <th className="px-lg py-md">Order status</th>
                  <th className="px-lg py-md">Date</th>
                  <th className="px-lg py-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map(o => {
                  const amtVal = typeof o.amount === 'number' ? o.amount : parseFloat(String(o.amount).replace(/[^\d.]/g, '')) || 0;
                  const dateStr = o.timestamp ? new Date(o.timestamp).toLocaleDateString('en-IN') : (o.date || 'N/A');
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-lg py-md font-mono text-xs font-bold text-primary">{o.id}</td>
                      <td className="px-lg py-md">
                        <div className="font-semibold text-slate-900">{o.userId}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">{o.shippingAddress}</div>
                      </td>
                      <td className="px-lg py-md text-slate-600 font-medium truncate max-w-xs">{o.products}</td>
                      <td className="px-lg py-md font-bold text-slate-950">₹{amtVal.toLocaleString('en-IN')}</td>
                      <td className="px-lg py-md">
                        <span className={`text-[10px] font-bold px-md py-0.5 rounded-full border ${
                          o.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                          o.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                          o.status === 'Dispatched' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-lg py-md text-slate-400 font-semibold text-xs">{dateStr}</td>
                      <td className="px-lg py-md text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(o);
                            setOrderNotes('');
                          }}
                          className="flex items-center gap-xs px-md h-8 border border-slate-200 hover:border-slate-800 text-slate-600 hover:text-slate-950 font-bold text-xs rounded transition-all ml-auto"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-xl text-slate-400 font-semibold">
                      No orders found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Side Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="px-lg py-md border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 text-body-md">
                  Order Details: {selectedOrder.id}
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Purchased on {selectedOrder.date || 'N/A'}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Scroll Area */}
            <div className="flex-1 overflow-y-auto p-lg space-y-lg text-xs font-semibold text-slate-600">
              {/* Status Controller */}
              <div className="bg-slate-50 p-md rounded border border-slate-100 space-y-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Update Order State</p>
                <div className="flex flex-wrap gap-xs">
                  {(['Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(selectedOrder.id, st)}
                      className={`px-md py-sm rounded border font-bold text-[10px] transition-all ${
                        selectedOrder.status === st 
                          ? 'bg-primary text-slate-950 border-primary' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Items List */}
              <div className="space-y-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Ordered Products</p>
                <div className="border border-slate-100 rounded overflow-hidden divide-y divide-slate-100">
                  {selectedOrder.items?.map((item, idx) => {
                    const price = item.price || item.unitPrice || 0;
                    const qty = item.qty || item.quantity || 1;
                    return (
                      <div key={idx} className="p-md flex justify-between items-center hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="font-bold text-slate-900">{item.name || item.productName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">₹{price.toLocaleString('en-IN')} x {qty}</p>
                        </div>
                        <p className="font-extrabold text-slate-900">₹{(price * qty).toLocaleString('en-IN')}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between items-center pt-xs font-black text-slate-900 text-body-sm">
                  <span>Grand Total</span>
                  <span>₹{(typeof selectedOrder.amount === 'number' ? selectedOrder.amount : parseFloat(String(selectedOrder.amount).replace(/[^\d.]/g, '')) || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Shipping & Billing details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md pt-sm">
                <div className="space-y-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Shipping Address</p>
                  <p className="text-slate-800 leading-relaxed font-bold">{selectedOrder.shippingAddress}</p>
                </div>
                <div className="space-y-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Billing Address</p>
                  <p className="text-slate-800 leading-relaxed font-bold">{selectedOrder.billingAddress}</p>
                </div>
              </div>

              {/* Additional details */}
              <div className="grid grid-cols-2 gap-sm border-t border-slate-100 pt-md">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Payment Option</p>
                  <p className="text-slate-900 font-bold">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">GST Number</p>
                  <p className="text-slate-900 font-mono font-bold">{selectedOrder.gstNumber || 'None'}</p>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-xs border-t border-slate-100 pt-md">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Order Notes & Internal Briefs</label>
                <textarea
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  placeholder="Add internal processing updates, delivery instructions..."
                  rows={3}
                  className="w-full p-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm font-semibold"
                />
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-md py-xs rounded font-bold text-[10px]"
                >
                  Save Internal Notes
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-lg py-md border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-lg h-11 border border-slate-200 hover:border-slate-800 rounded font-bold text-xs text-slate-600 hover:text-slate-800 transition-all"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
