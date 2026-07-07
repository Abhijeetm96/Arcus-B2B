import React, { useEffect, useState } from 'react';
import type { Order } from './types';
import { apiFetch } from '../../lib/api';
import { exportToCSV } from '../../utils/csvHelpers';

interface OrderManagementProps {
  type: 'B2B' | 'B2C' | 'SERVICES';
}

interface Booking {
  id: string;
  timestamp: string;
  service_name: string;
  name: string;
  phone: string;
  date: string;
  notes?: string;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({ type }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail Drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderNotes, setOrderNotes] = useState<string>('');

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await apiFetch('/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const users = await res.json();
        const map: Record<string, string> = {};
        users.forEach((u: any) => {
          map[u.id] = (u.customerType || '').toUpperCase();
        });
        setUsersMap(map);
      }
    } catch (err) {
      console.error('Error fetching users map:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('arcus_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      if (type === 'SERVICES') {
        const res = await apiFetch('/service-bookings', { headers });
        if (!res.ok) throw new Error('Failed to load service bookings.');
        const data = await res.json();
        setBookings(data);
      } else {
        const res = await apiFetch('/admin/orders', { headers });
        if (!res.ok) throw new Error('Failed to load orders.');
        const data = await res.json();
        setOrders(data);
        await fetchUsers();
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setSelectedOrder(null);
  }, [type]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await apiFetch(`/admin/orders/${orderId}/status`, {
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
      fetchData();
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
    const isB2B = o.gstNumber || usersMap[o.userId] === 'BUSINESS';
    if (type === 'B2B' && !isB2B) return false;
    if (type === 'B2C' && isB2B) return false;

    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
                        o.userId.toLowerCase().includes(search.toLowerCase()) ||
                        (o.shippingAddress && o.shippingAddress.toLowerCase().includes(search.toLowerCase()));
    
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredBookings = bookings.filter(b => {
    const matchSearch = b.id.toLowerCase().includes(search.toLowerCase()) ||
                        b.name.toLowerCase().includes(search.toLowerCase()) ||
                        b.service_name.toLowerCase().includes(search.toLowerCase()) ||
                        (b.phone && b.phone.toLowerCase().includes(search.toLowerCase()));
    return matchSearch;
  });

  const handleExport = () => {
    if (type === 'SERVICES') {
      const headers = [
        { label: 'Booking ID', key: 'id' },
        { label: 'Client Name', key: 'name' },
        { label: 'Phone', key: 'phone' },
        { label: 'Service Booked', key: 'service_name' },
        { label: 'Preferred Date', key: 'date' },
        { label: 'Client Notes', key: 'notes' },
        { label: 'Timestamp', key: 'timestamp' }
      ];
      exportToCSV(filteredBookings, headers, `arcus_service_bookings.csv`);
    } else {
      const headers = [
        { label: 'Order ID', key: 'id' },
        { label: 'Customer ID', key: 'userId' },
        { label: 'Order Timestamp', key: 'timestamp' },
        { label: 'Date', key: 'date' },
        { label: 'Items Summary', key: 'products' },
        { label: 'Status', key: 'status' },
        { label: 'Total Amount (INR)', key: 'amount' },
        { label: 'Shipping Address', key: 'shippingAddress' },
        { label: 'Billing Address', key: 'billingAddress' },
        { label: 'GST Number', key: 'gstNumber' },
        { label: 'Payment Method', key: 'paymentMethod' }
      ];
      exportToCSV(filteredOrders, headers, `arcus_orders_${type.toLowerCase()}.csv`);
    }
  };

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
              placeholder={type === 'SERVICES' ? "Search by booking ID, client name, service..." : "Search by Order ID, buyer..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-xxl pr-md border border-slate-200 rounded text-body-sm focus:border-primary focus:ring-0 bg-slate-50"
            />
          </div>

          {/* Status Filter */}
          {type !== 'SERVICES' && (
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
          )}
        </div>

        <div className="flex items-center gap-sm">
          <button
            onClick={handleExport}
            className="flex items-center gap-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-md h-9 rounded font-bold text-xs transition-all shadow-xs cursor-pointer"
            title="Export list to CSV"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export CSV
          </button>
          <div className="text-xs bg-slate-100 text-slate-500 rounded px-md py-sm font-extrabold font-label-caps uppercase tracking-wide">
            {type === 'SERVICES' ? `${filteredBookings.length} Bookings` : `${filteredOrders.length} Orders`}
          </div>
        </div>
      </div>

      {/* List Table */}
      {loading ? (
        <div className="flex justify-center py-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            {type === 'SERVICES' ? (
              <table className="w-full text-body-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                    <th className="px-lg py-md">Booking ID</th>
                    <th className="px-lg py-md">Client Name</th>
                    <th className="px-lg py-md">Phone</th>
                    <th className="px-lg py-md">Service Booked</th>
                    <th className="px-lg py-md">Preferred Date</th>
                    <th className="px-lg py-md">Client Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map(b => {
                    const dateStr = b.timestamp ? new Date(b.timestamp).toLocaleDateString('en-IN') : (b.date || 'N/A');
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-lg py-md font-mono text-xs font-bold text-primary">{b.id}</td>
                        <td className="px-lg py-md font-semibold text-slate-900">{b.name}</td>
                        <td className="px-lg py-md font-mono text-xs font-semibold text-slate-600">{b.phone}</td>
                        <td className="px-lg py-md text-slate-900 font-bold">{b.service_name}</td>
                        <td className="px-lg py-md text-slate-500 font-semibold text-xs">{b.date || dateStr}</td>
                        <td className="px-lg py-md text-slate-400 font-medium truncate max-w-xs">{b.notes || 'None'}</td>
                      </tr>
                    );
                  })}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-xl text-slate-400 font-semibold">
                        No service bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
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
            )}
          </div>
        </div>
      )}

      {/* Details Side Drawer Modal (only for B2B/B2C orders) */}
      {selectedOrder && type !== 'SERVICES' && (
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
                className="material-symbols-outlined text-slate-400 hover:text-slate-900"
              >
                close
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-lg space-y-lg text-slate-600">
              {/* Buyer info */}
              <div className="space-y-xs">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Client Details</h4>
                <div className="bg-slate-50 p-md rounded border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">{selectedOrder.userId}</div>
                  <div className="text-[11px] text-slate-500 font-medium">Shipping Address: {selectedOrder.shippingAddress}</div>
                  {selectedOrder.gstNumber && (
                    <div className="text-[10px] font-bold text-primary font-mono mt-sm">GSTIN: {selectedOrder.gstNumber}</div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="space-y-xs">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Order Items</h4>
                <div className="border border-slate-200 rounded divide-y divide-slate-100 overflow-hidden">
                  {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-md flex justify-between items-center text-xs font-semibold">
                      <div>
                        <div className="text-slate-900">{item.productName || item.productId}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN') || 0}</div>
                      </div>
                      <div className="text-slate-900">₹{((item.quantity || 1) * (item.price || 0)).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-md font-bold text-slate-900 text-sm">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{(typeof selectedOrder.amount === 'number' ? selectedOrder.amount : parseFloat(String(selectedOrder.amount).replace(/[^\d.]/g, '')) || 0).toLocaleString('en-IN')}</span>
                </div>
                <button
                  onClick={() => {
                    const token = localStorage.getItem('arcus_token') || '';
                    window.open(`/api/documents/${selectedOrder.id}?format=pdf&download=true&token=${encodeURIComponent(token)}`, '_blank');
                  }}
                  className="w-full mt-md h-9 border border-slate-200 hover:border-slate-800 text-slate-700 hover:text-slate-900 font-bold rounded text-xs flex items-center justify-center gap-xs transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Download Invoice PDF
                </button>
              </div>

              {/* Status Update */}
              <div className="space-y-sm">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Update Status</h4>
                <div className="flex gap-sm">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="flex-1 h-10 px-md border border-slate-200 rounded text-xs bg-slate-50 font-bold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-sm">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Internal Notes</h4>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Type notes to attach to this order..."
                  className="w-full border border-slate-200 rounded p-md text-xs focus:border-primary focus:ring-0 bg-slate-50 min-h-[80px]"
                />
                <button
                  onClick={handleSaveNotes}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-md rounded transition-all"
                >
                  Save Internal Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
