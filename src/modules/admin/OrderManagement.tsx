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
  status?: string;
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
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
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

  const handleBookingStatusChange = async (bookingId: string, newStatus: string) => {
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await apiFetch(`/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update booking status.');
      }

      setSuccess(`Booking #${bookingId} status updated to ${newStatus}!`);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Error updating booking status.');
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

  if (selectedOrder && type !== 'SERVICES') {
    return (
      <div className="space-y-md text-left">
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
        <OrderInvoiceView 
          order={selectedOrder} 
          onBack={() => setSelectedOrder(null)} 
          handleStatusChange={handleStatusChange}
          orderNotes={orderNotes}
          setOrderNotes={setOrderNotes}
          handleSaveNotes={handleSaveNotes}
        />
      </div>
    );
  }

  if (selectedBooking && type === 'SERVICES') {
    return (
      <div className="space-y-md text-left">
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
        <BookingJobSheetView 
          booking={selectedBooking} 
          onBack={() => setSelectedBooking(null)} 
          handleBookingStatusChange={handleBookingStatusChange}
        />
      </div>
    );
  }

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
              <option value="Awaiting Payment">Awaiting Payment</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Awaiting Delivery">Awaiting Delivery</option>
              <option value="Out For Delivery">Out For Delivery</option>
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
                    <th className="px-lg py-md">Status</th>
                    <th className="px-lg py-md text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map(b => {
                    const dateStr = b.timestamp ? new Date(b.timestamp).toLocaleDateString('en-IN') : (b.date || 'N/A');
                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
                        case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                        default: return 'bg-blue-50 text-blue-700 border-blue-200';
                      }
                    };
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        <td 
                          className="px-lg py-md font-mono text-xs font-bold text-primary cursor-pointer hover:underline"
                          onClick={() => {
                            setSelectedBooking(b);
                          }}
                        >
                          {b.id}
                        </td>
                        <td className="px-lg py-md font-semibold text-slate-900">{b.name}</td>
                        <td className="px-lg py-md font-mono text-xs font-semibold text-slate-600">{b.phone}</td>
                        <td className="px-lg py-md text-slate-900 font-bold">{b.service_name}</td>
                        <td className="px-lg py-md text-slate-500 font-semibold text-xs">{b.date || dateStr}</td>
                        <td className="px-lg py-md text-slate-400 font-medium truncate max-w-xs">{b.notes || 'None'}</td>
                        <td className="px-lg py-md">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${getStatusColor(b.status || 'Pending')}`}>
                            {b.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-lg py-md text-right">
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
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
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-xl text-slate-400 font-semibold">
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
                        <td 
                          className="px-lg py-md font-mono text-xs font-bold text-primary cursor-pointer hover:underline"
                          onClick={() => {
                            setSelectedOrder(o);
                            setOrderNotes('');
                          }}
                        >
                          {o.id}
                        </td>
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
    </div>
  );
};

interface OrderInvoiceViewProps {
  order: any;
  onBack: () => void;
  handleStatusChange: (id: string, status: string) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  handleSaveNotes: () => void;
}

const OrderInvoiceView: React.FC<OrderInvoiceViewProps> = ({
  order,
  onBack,
  handleStatusChange,
  orderNotes,
  setOrderNotes,
  handleSaveNotes
}) => {
  const amtVal = typeof order.amount === 'number' ? order.amount : parseFloat(String(order.amount).replace(/[^\d.]/g, '')) || 0;
  const gstAmount = order.gstNumber ? amtVal * 0.18 : 0;
  const subtotal = amtVal - gstAmount;

  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [secureLink, setSecureLink] = useState<string>('');

  useEffect(() => {
    let active = true;
    const fetchPdf = async () => {
      try {
        const response = await apiFetch(`/documents/${order.id}?format=pdf&download=true`);
        if (response.ok) {
          const blob = await response.blob();
          if (active) setPdfBlob(blob);
        }
      } catch (err) {
        console.error('Pre-fetching invoice PDF failed:', err);
      }
    };
    const fetchSecureLink = async () => {
      try {
        const response = await apiFetch(`/admin/documents/order/${order.id}/secure-token`);
        if (response.ok) {
          const data = await response.json();
          if (active && data.secureLink) {
            setSecureLink(data.secureLink);
          }
        }
      } catch (err) {
        console.error('Error pre-fetching secure link:', err);
      }
    };
    fetchPdf();
    fetchSecureLink();
    return () => {
      active = false;
    };
  }, [order.id]);

  return (
    <div className="space-y-lg text-left bg-white border border-slate-200 rounded p-lg shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-200 pb-sm mb-lg">
        <button
          onClick={onBack}
          className="flex items-center gap-xs text-xs font-bold text-primary hover:underline bg-transparent border-none cursor-pointer p-0"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Orders List
        </button>
        <span className="text-xs bg-slate-100 text-slate-800 px-md py-sm rounded border font-bold uppercase tracking-wider">
          Order Status: {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg items-start">
        {/* Left Column: Invoice Sheet */}
        <div className="lg:col-span-2 border border-slate-200 rounded p-xl space-y-xl bg-white shadow-xs">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-md">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">ARCUS COMMERCE</h2>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                Arcus Building Materials & Logistics Hub<br />
                MG Road, Industrial Area Phase 2<br />
                Bangalore, Karnataka - 560025<br />
                support@arcus.com | +91 80 4912 3456
              </p>
            </div>
            <div className="sm:text-right">
              <h1 className="text-lg font-extrabold uppercase text-slate-800 tracking-wider">Tax Invoice</h1>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                <span className="font-bold text-slate-700">Invoice No:</span> INV-{order.id.slice(-6).toUpperCase()}<br />
                <span className="font-bold text-slate-700">Date:</span> {order.date || new Date(order.timestamp).toLocaleDateString('en-IN')}<br />
                <span className="font-bold text-slate-700">Order ID:</span> <span className="font-mono text-[11px]">{order.id}</span>
              </p>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Address Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg text-xs">
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Billed To</h4>
              <p className="font-bold text-slate-800 mt-xs">{order.userId}</p>
              {order.billingAddress ? (
                <p className="text-slate-600 mt-1 whitespace-pre-line leading-relaxed">{order.billingAddress}</p>
              ) : (
                <p className="text-slate-600 mt-1 whitespace-pre-line leading-relaxed">{order.shippingAddress}</p>
              )}
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Shipped To</h4>
              <p className="font-bold text-slate-800 mt-xs">{order.userId}</p>
              <p className="text-slate-600 mt-1 whitespace-pre-line leading-relaxed">{order.shippingAddress}</p>
              {order.gstNumber && (
                <div className="mt-sm p-xs bg-slate-50 border border-slate-100 rounded inline-block text-[10px] font-bold text-primary font-mono">
                  GSTIN: {order.gstNumber}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <th className="p-md">Product / Description</th>
                  <th className="p-md text-right">Price</th>
                  <th className="p-md text-center">Qty</th>
                  <th className="p-md text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items && order.items.map((item: any, idx: number) => (
                  <tr key={idx} className="font-semibold text-slate-700">
                    <td className="p-md text-slate-900">{item.productName || item.productId}</td>
                    <td className="p-md text-right">₹{item.price?.toLocaleString('en-IN') || 0}</td>
                    <td className="p-md text-center">{item.quantity || 1}</td>
                    <td className="p-md text-right">₹{((item.quantity || 1) * (item.price || 0)).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-md">
            <div className="w-64 space-y-sm text-xs font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.gstNumber && (
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span className="text-slate-900">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-100 pt-sm text-sm font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-primary">₹{amtVal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Processing Controls */}
        <div className="space-y-lg">
          {/* Status Controls */}
          <div className="bg-slate-50 border border-slate-200 rounded p-lg space-y-md">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Process Order</h3>
            <div className="space-y-xs">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Change Status</label>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                className="w-full h-10 px-md border border-slate-200 rounded text-xs bg-white font-bold text-slate-700 cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="Awaiting Payment">Awaiting Payment</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Awaiting Delivery">Awaiting Delivery</option>
                <option value="Out For Delivery">Out For Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-sm">
              <button
                onClick={() => window.print()}
                className="h-10 border border-slate-300 hover:border-slate-800 text-slate-700 hover:text-slate-900 font-bold rounded text-xs flex items-center justify-center gap-xs transition-all bg-white shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                Print
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await apiFetch(`/documents/${order.id}?format=pdf&download=true`);
                    if (!response.ok) throw new Error('Failed to fetch invoice');
                    const blob = await response.blob();
                    const fileURL = URL.createObjectURL(blob);
                    window.open(fileURL, '_blank');
                    setTimeout(() => {
                      URL.revokeObjectURL(fileURL);
                    }, 10000);
                  } catch (err) {
                    console.error('Invoice download failed:', err);
                    alert('Failed to download invoice PDF.');
                  }
                }}
                className="h-10 border border-slate-300 hover:border-slate-800 text-slate-700 hover:text-slate-900 font-bold rounded text-xs flex items-center justify-center gap-xs transition-all bg-white shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Download
              </button>
              <button
                onClick={async () => {
                  try {
                    let blob = pdfBlob;
                    if (!blob) {
                      const response = await apiFetch(`/documents/${order.id}?format=pdf&download=true`);
                      if (!response.ok) throw new Error('Failed to fetch invoice');
                      blob = await response.blob();
                    }
                    const file = new File([blob], `Invoice-${order.id.slice(-6).toUpperCase()}.pdf`, { type: 'application/pdf' });
                    
                    const maskedLink = secureLink ? `${window.location.origin}${secureLink}` : `${window.location.origin}/api/documents/${order.id}?format=pdf`;
                    const itemsText = order.items ? order.items.map((item: any) => `- ${item.productName || item.productId} (x${item.quantity || 1}): ₹${((item.quantity || 1) * (item.price || 0)).toLocaleString('en-IN')}`).join('\n') : '';
                    const invoiceText = `Hi, Please find attached the Arcus Tax Invoice details for Order #${order.id}.\n\nItems:\n${itemsText}\n\nTotal Amount: ₹${amtVal.toLocaleString('en-IN')}\n\nSecure Download Link:\n${maskedLink}`;

                    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                      await navigator.share({
                        files: [file],
                        title: `Arcus Tax Invoice - INV-${order.id.slice(-6).toUpperCase()}`,
                        text: invoiceText
                      });
                      return;
                    }
                  } catch (err) {
                    console.warn('Native sharing failed:', err);
                  }

                  // Fallback: Download PDF locally AND open local mail client (mailto)
                  try {
                    let blob = pdfBlob;
                    if (!blob) {
                      const response = await apiFetch(`/documents/${order.id}?format=pdf&download=true`);
                      if (!response.ok) throw new Error('Failed to fetch invoice');
                      blob = await response.blob();
                    }
                    const fileURL = URL.createObjectURL(blob);
                    const downloadLink = document.createElement('a');
                    downloadLink.href = fileURL;
                    downloadLink.download = `Invoice-${order.id.slice(-6).toUpperCase()}.pdf`;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    URL.revokeObjectURL(fileURL);

                    const maskedLink = secureLink ? `${window.location.origin}${secureLink}` : `${window.location.origin}/api/documents/${order.id}?format=pdf`;
                    const itemsText = order.items ? order.items.map((item: any) => `- ${item.productName || item.productId} (x${item.quantity || 1}): ₹${((item.quantity || 1) * (item.price || 0)).toLocaleString('en-IN')}`).join('\n') : '';
                    const invoiceBody = `Hi, Please find attached the Arcus Tax Invoice details for Order #${order.id}.\n\nItems:\n${itemsText}\n\nTotal Amount: ₹${amtVal.toLocaleString('en-IN')}\n\nSecure Download Link:\n${maskedLink}\n\n(Attached invoice PDF has been downloaded to your local Downloads folder. Please attach it to this email.)`;
                    
                    const mailtoUrl = `mailto:?subject=${encodeURIComponent(`Arcus Tax Invoice - INV-${order.id.slice(-6).toUpperCase()}`)}&body=${encodeURIComponent(invoiceBody)}`;
                    window.open(mailtoUrl, '_blank');
                  } catch (err) {
                    console.error('Email fallback failed:', err);
                  }
                }}
                className="h-10 border border-slate-300 hover:border-slate-800 text-slate-700 hover:text-slate-900 font-bold rounded text-xs flex items-center justify-center gap-xs transition-all bg-white shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">mail</span>
                Email
              </button>
              <button
                onClick={async () => {
                  try {
                    let blob = pdfBlob;
                    if (!blob) {
                      const response = await apiFetch(`/documents/${order.id}?format=pdf&download=true`);
                      if (!response.ok) throw new Error('Failed to fetch invoice');
                      blob = await response.blob();
                    }
                    const file = new File([blob], `Invoice-${order.id.slice(-6).toUpperCase()}.pdf`, { type: 'application/pdf' });
                    
                    const maskedLink = secureLink ? `${window.location.origin}${secureLink}` : `${window.location.origin}/api/documents/${order.id}?format=pdf`;
                    const itemsText = order.items ? order.items.map((item: any) => `- ${item.productName || item.productId} (x${item.quantity || 1}): ₹${((item.quantity || 1) * (item.price || 0)).toLocaleString('en-IN')}`).join('\n') : '';
                    const invoiceText = `*ARCUS COMMERCE - TAX INVOICE*\n------------------------------------------\nInvoice No: INV-${order.id.slice(-6).toUpperCase()}\nOrder ID: ${order.id}\nDate: ${order.date || new Date(order.timestamp).toLocaleDateString('en-IN')}\n\n*Billed To:*\nName: ${order.userId}\nAddress: ${order.shippingAddress}\n${order.gstNumber ? `GSTIN: ${order.gstNumber}\n` : ''}\n*Items:*\n${itemsText}\n\n*Total Breakdown:*\nSubtotal: ₹${subtotal.toLocaleString('en-IN')}\nGST (18%): ₹${gstAmount.toLocaleString('en-IN')}\n*Total Amount: ₹${amtVal.toLocaleString('en-IN')}*\n\n*Secure Download Link:*\n${maskedLink}\n------------------------------------------`;

                    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                      await navigator.share({
                        files: [file],
                        title: `Arcus Tax Invoice - INV-${order.id.slice(-6).toUpperCase()}`,
                        text: invoiceText
                      });
                      return;
                    }
                  } catch (err) {
                    console.warn('Native sharing failed:', err);
                  }

                  // Fallback to standard WhatsApp Link with masked link
                  const maskedLink = secureLink ? `${window.location.origin}${secureLink}` : `${window.location.origin}/api/documents/${order.id}?format=pdf`;
                  const itemsText = order.items ? order.items.map((item: any) => `- ${item.productName || item.productId} (x${item.quantity || 1}): ₹${((item.quantity || 1) * (item.price || 0)).toLocaleString('en-IN')}`).join('\n') : '';
                  const invoiceText = `*ARCUS COMMERCE - TAX INVOICE*\n------------------------------------------\nInvoice No: INV-${order.id.slice(-6).toUpperCase()}\nOrder ID: ${order.id}\nDate: ${order.date || new Date(order.timestamp).toLocaleDateString('en-IN')}\n\n*Billed To:*\nName: ${order.userId}\nAddress: ${order.shippingAddress}\n${order.gstNumber ? `GSTIN: ${order.gstNumber}\n` : ''}\n*Items:*\n${itemsText}\n\n*Total Breakdown:*\nSubtotal: ₹${subtotal.toLocaleString('en-IN')}\nGST (18%): ₹${gstAmount.toLocaleString('en-IN')}\n*Total Amount: ₹${amtVal.toLocaleString('en-IN')}*\n\n*Secure Download Link:*\n${maskedLink}\n------------------------------------------`;
                  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(invoiceText)}`;
                  window.open(waUrl, '_blank');
                }}
                className="h-10 border border-slate-300 hover:border-slate-800 text-slate-700 hover:text-slate-900 font-bold rounded text-xs flex items-center justify-center gap-xs transition-all bg-white shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
                WhatsApp
              </button>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-slate-50 border border-slate-200 rounded p-lg space-y-md">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Internal Notes</h3>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Type internal notes to attach..."
              className="w-full border border-slate-200 rounded p-md text-xs focus:border-primary focus:ring-0 bg-white min-h-[100px]"
            />
            <button
              onClick={handleSaveNotes}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-md rounded transition-all shadow-xs"
            >
              Save Internal Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface BookingJobSheetViewProps {
  booking: any;
  onBack: () => void;
  handleBookingStatusChange: (id: string, status: string) => void;
}

const BookingJobSheetView: React.FC<BookingJobSheetViewProps> = ({
  booking,
  onBack,
  handleBookingStatusChange
}) => {
  const serviceRate = 1499;
  const gstAmount = serviceRate * 0.18;
  const subtotal = serviceRate - gstAmount;

  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [secureLink, setSecureLink] = useState<string>('');

  useEffect(() => {
    let active = true;
    const fetchPdf = async () => {
      try {
        const response = await apiFetch(`/documents/booking/${booking.id}`);
        if (response.ok) {
          const blob = await response.blob();
          if (active) setPdfBlob(blob);
        }
      } catch (err) {
        console.error('Pre-fetching booking PDF failed:', err);
      }
    };
    const fetchSecureLink = async () => {
      try {
        const response = await apiFetch(`/admin/documents/booking/${booking.id}/secure-token`);
        if (response.ok) {
          const data = await response.json();
          if (active && data.secureLink) {
            setSecureLink(data.secureLink);
          }
        }
      } catch (err) {
        console.error('Error pre-fetching secure link:', err);
      }
    };
    fetchPdf();
    fetchSecureLink();
    return () => {
      active = false;
    };
  }, [booking.id]);

  return (
    <div className="space-y-lg text-left bg-white border border-slate-200 rounded p-lg shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-200 pb-sm mb-lg">
        <button
          onClick={onBack}
          className="flex items-center gap-xs text-xs font-bold text-primary hover:underline bg-transparent border-none cursor-pointer p-0"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Bookings List
        </button>
        <span className="text-xs bg-slate-100 text-slate-800 px-md py-sm rounded border font-bold uppercase tracking-wider">
          Booking Status: {booking.status || 'Pending'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg items-start">
        {/* Left Column: Invoice Sheet */}
        <div className="lg:col-span-2 border border-slate-200 rounded p-xl space-y-xl bg-white shadow-xs">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-md">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">ARCUS SERVICES</h2>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                Contractor Placement & Site Maintenance Hub<br />
                MG Road, Industrial Area Phase 2<br />
                Bangalore, Karnataka - 560025<br />
                services@arcus.com | Support: +91 80 4912 3456
              </p>
            </div>
            <div className="sm:text-right">
              <h1 className="text-lg font-extrabold uppercase text-slate-800 tracking-wider">Service Tax Invoice</h1>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                <span className="font-bold text-slate-700">Invoice No:</span> INV-SRV-{booking.id.slice(-6).toUpperCase()}<br />
                <span className="font-bold text-slate-700">Date Logged:</span> {booking.timestamp ? new Date(booking.timestamp).toLocaleDateString('en-IN') : 'N/A'}<br />
                <span className="font-bold text-slate-700">Booking ID:</span> <span className="font-mono text-[11px]">{booking.id}</span>
              </p>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Client & Schedule Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg text-xs">
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Billed To (Client)</h4>
              <p className="font-bold text-slate-800 mt-xs">{booking.name}</p>
              <p className="text-slate-600 mt-1">Phone: {booking.phone}</p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Service Schedule</h4>
              <p className="font-bold text-slate-800 mt-xs">Appointment Date & Time</p>
              <p className="text-slate-600 mt-1">{booking.date}</p>
            </div>
          </div>

          {/* Service Items Table */}
          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <th className="p-md">Service Description / Code</th>
                  <th className="p-md text-right">Visitation & Consulting Fee</th>
                  <th className="p-md text-center">Qty</th>
                  <th className="p-md text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                <tr>
                  <td className="p-md text-slate-900">
                    <div>{booking.service_name}</div>
                    {booking.notes && (
                      <div className="text-[10px] text-slate-400 font-medium mt-1 font-sans">
                        Instructions: {booking.notes}
                      </div>
                    )}
                  </td>
                  <td className="p-md text-right">₹{serviceRate.toLocaleString('en-IN')}</td>
                  <td className="p-md text-center">1</td>
                  <td className="p-md text-right">₹{serviceRate.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-md">
            <div className="w-64 space-y-sm text-xs font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span className="text-slate-900">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-sm text-sm font-bold text-slate-900">
                <span>Total Service Amount</span>
                <span className="text-primary">₹{serviceRate.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Processing Controls */}
        <div className="space-y-lg">
          {/* Status Controls */}
          <div className="bg-slate-50 border border-slate-200 rounded p-lg space-y-md">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Process Booking</h3>
            <div className="space-y-xs">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Change Status</label>
              <select
                value={booking.status || 'Pending'}
                onChange={(e) => handleBookingStatusChange(booking.id, e.target.value)}
                className="w-full h-10 px-md border border-slate-200 rounded text-xs bg-white font-bold text-slate-700 cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Partner Dispatched">Partner Dispatched</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-sm">
              <button
                onClick={() => window.print()}
                className="h-10 border border-slate-300 hover:border-slate-800 text-slate-700 hover:text-slate-900 font-bold rounded text-xs flex items-center justify-center gap-xs transition-all bg-white shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                Print
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await apiFetch(`/documents/booking/${booking.id}`);
                    if (!response.ok) throw new Error('Failed to fetch invoice');
                    const blob = await response.blob();
                    const fileURL = URL.createObjectURL(blob);
                    window.open(fileURL, '_blank');
                    setTimeout(() => {
                      URL.revokeObjectURL(fileURL);
                    }, 10000);
                  } catch (err) {
                    console.error('Invoice download failed:', err);
                    alert('Failed to download invoice PDF.');
                  }
                }}
                className="h-10 border border-slate-300 hover:border-slate-800 text-slate-700 hover:text-slate-900 font-bold rounded text-xs flex items-center justify-center gap-xs transition-all bg-white shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Download
              </button>
              <button
                onClick={async () => {
                  try {
                    let blob = pdfBlob;
                    if (!blob) {
                      const response = await apiFetch(`/documents/booking/${booking.id}`);
                      if (!response.ok) throw new Error('Failed to fetch invoice');
                      blob = await response.blob();
                    }
                    const file = new File([blob], `Service-Invoice-${booking.id.slice(-6).toUpperCase()}.pdf`, { type: 'application/pdf' });
                    
                    const maskedLink = secureLink ? `${window.location.origin}${secureLink}` : `${window.location.origin}/api/documents/booking/${booking.id}`;
                    const bookingText = `Hi, Please find attached the Arcus Service Tax Invoice details for Booking #${booking.id}.\n\nService: ${booking.service_name}\nTotal Amount: ₹1,499.00\n\nSecure Download Link:\n${maskedLink}`;

                    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                      await navigator.share({
                        files: [file],
                        title: `Arcus Service Tax Invoice - INV-SRV-${booking.id.slice(-6).toUpperCase()}`,
                        text: bookingText
                      });
                      return;
                    }
                  } catch (err) {
                    console.warn('Native sharing failed:', err);
                  }

                  // Fallback: Download PDF locally AND open local mail client (mailto)
                  try {
                    let blob = pdfBlob;
                    if (!blob) {
                      const response = await apiFetch(`/documents/booking/${booking.id}`);
                      if (!response.ok) throw new Error('Failed to fetch invoice');
                      blob = await response.blob();
                    }
                    const fileURL = URL.createObjectURL(blob);
                    const downloadLink = document.createElement('a');
                    downloadLink.href = fileURL;
                    downloadLink.download = `Service-Invoice-${booking.id.slice(-6).toUpperCase()}.pdf`;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    URL.revokeObjectURL(fileURL);

                    const maskedLink = secureLink ? `${window.location.origin}${secureLink}` : `${window.location.origin}/api/documents/booking/${booking.id}`;
                    const invoiceBody = `Hi, Please find attached the Arcus Service Tax Invoice details for Booking #${booking.id}.\n\nService: ${booking.service_name}\nTotal Amount: ₹1,499.00\n\nSecure Download Link:\n${maskedLink}\n\n(Attached service invoice PDF has been downloaded to your local Downloads folder. Please attach it to this email.)`;
                    
                    const mailtoUrl = `mailto:?subject=${encodeURIComponent(`Arcus Service Tax Invoice - INV-SRV-${booking.id.slice(-6).toUpperCase()}`)}&body=${encodeURIComponent(invoiceBody)}`;
                    window.open(mailtoUrl, '_blank');
                  } catch (err) {
                    console.error('Email fallback failed:', err);
                  }
                }}
                className="h-10 border border-slate-300 hover:border-slate-800 text-slate-700 hover:text-slate-900 font-bold rounded text-xs flex items-center justify-center gap-xs transition-all bg-white shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">mail</span>
                Email
              </button>
              <button
                onClick={async () => {
                  try {
                    let blob = pdfBlob;
                    if (!blob) {
                      const response = await apiFetch(`/documents/booking/${booking.id}`);
                      if (!response.ok) throw new Error('Failed to fetch invoice');
                      blob = await response.blob();
                    }
                    const file = new File([blob], `Service-Invoice-${booking.id.slice(-6).toUpperCase()}.pdf`, { type: 'application/pdf' });
                    
                    const maskedLink = secureLink ? `${window.location.origin}${secureLink}` : `${window.location.origin}/api/documents/booking/${booking.id}`;
                    const bookingText = `*ARCUS SERVICES - SERVICE TAX INVOICE*\n------------------------------------------\nInvoice No: INV-SRV-${booking.id.slice(-6).toUpperCase()}\nBooking ID: ${booking.id}\nDate Logged: ${booking.timestamp ? new Date(booking.timestamp).toLocaleDateString('en-IN') : 'N/A'}\n\n*Client Details:*\nName: ${booking.name}\nPhone: ${booking.phone}\n\n*Service Scheduled:*\nService: ${booking.service_name}\nAppointment: ${booking.date}\n${booking.notes ? `Instructions: ${booking.notes}\n` : ''}\n*Service Amount Breakdown:*\nSubtotal: ₹${subtotal.toLocaleString('en-IN')}\nGST (18%): ₹${gstAmount.toLocaleString('en-IN')}\n*Total Service Amount: ₹${serviceRate.toLocaleString('en-IN')}*\n\n*Secure Download Link:*\n${maskedLink}\n------------------------------------------`;

                    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                      await navigator.share({
                        files: [file],
                        title: `Arcus Service Tax Invoice - INV-SRV-${booking.id.slice(-6).toUpperCase()}`,
                        text: bookingText
                      });
                      return;
                    }
                  } catch (err) {
                    console.warn('Native sharing failed:', err);
                  }

                  // Fallback to standard WhatsApp Link with masked link
                  const maskedLink = secureLink ? `${window.location.origin}${secureLink}` : `${window.location.origin}/api/documents/booking/${booking.id}`;
                  const bookingText = `*ARCUS SERVICES - SERVICE TAX INVOICE*\n------------------------------------------\nInvoice No: INV-SRV-${booking.id.slice(-6).toUpperCase()}\nBooking ID: ${booking.id}\nDate Logged: ${booking.timestamp ? new Date(booking.timestamp).toLocaleDateString('en-IN') : 'N/A'}\n\n*Client Details:*\nName: ${booking.name}\nPhone: ${booking.phone}\n\n*Service Scheduled:*\nService: ${booking.service_name}\nAppointment: ${booking.date}\n${booking.notes ? `Instructions: ${booking.notes}\n` : ''}\n*Service Amount Breakdown:*\nSubtotal: ₹${subtotal.toLocaleString('en-IN')}\nGST (18%): ₹${gstAmount.toLocaleString('en-IN')}\n*Total Service Amount: ₹${serviceRate.toLocaleString('en-IN')}*\n\n*Secure Download Link:*\n${maskedLink}\n------------------------------------------`;
                  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(bookingText)}`;
                  window.open(waUrl, '_blank');
                }}
                className="h-10 border border-slate-300 hover:border-slate-800 text-slate-700 hover:text-slate-900 font-bold rounded text-xs flex items-center justify-center gap-xs transition-all bg-white shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
