import React, { useState } from 'react';
import { useOrders } from '../../core/hooks/useOrders';
import { formatCurrency, formatDate } from '../../core/config/format';

export const IndividualOrders: React.FC = () => {
  const { orders, loading, cancelOrder } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const orderSteps = [
    { label: 'Order Placed', status: 'Pending', desc: 'Order received & registered' },
    { label: 'Confirmed', status: 'Confirmed', desc: 'Order approved & processed' },
    { label: 'Dispatched', status: 'Dispatched', desc: 'Shipped from hub' },
    { label: 'Out For Delivery', status: 'Out For Delivery', desc: 'Technician/truck on the way' },
    { label: 'Delivered', status: 'Delivered', desc: 'Successfully delivered' }
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Pending':
      case 'Awaiting Payment':
        return 0;
      case 'Confirmed':
        return 1;
      case 'Dispatched':
      case 'Awaiting Delivery':
        return 2;
      case 'Out For Delivery':
        return 3;
      case 'Delivered':
        return 4;
      default:
        return 0;
    }
  };

  const downloadInvoice = (order: any) => {
    // Generate Invoice HTML template
    const items = order.items || [];
    let totalTaxableValue = 0;
    let totalCgst = 0;
    let totalSgst = 0;

    const tableRowsHtml = items.map((item: any) => {
      const itemTotal = item.qty * item.price;
      const isCement = item.name.toLowerCase().includes('cement');
      const gstRate = isCement ? 28 : 18;
      const hsn = isCement ? '2523' : '3917';
      
      const taxableValue = itemTotal / (1 + gstRate / 100);
      const gstAmount = itemTotal - taxableValue;
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;

      totalTaxableValue += taxableValue;
      totalCgst += cgst;
      totalSgst += sgst;

      return `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px; font-size: 14px; text-align: left; font-weight: bold; color: #1a1c1c;">${item.name}</td>
          <td style="padding: 12px; font-size: 14px; text-align: left;">${hsn}</td>
          <td style="padding: 12px; font-size: 14px; text-align: left;">₹${(item.price / (1 + gstRate / 100)).toFixed(2)}</td>
          <td style="padding: 12px; font-size: 14px; text-align: left;">${item.qty}</td>
          <td style="padding: 12px; font-size: 14px; text-align: left;">0%</td>
          <td style="padding: 12px; font-size: 14px; text-align: left;">${gstRate}%</td>
          <td style="padding: 12px; font-size: 14px; text-align: right; font-weight: bold;">₹${itemTotal.toLocaleString('en-IN')}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <html>
        <head>
          <title>ARCUS Digital Invoice - ${order.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: 800; color: #785900; }
            .invoice-title { font-size: 20px; font-weight: bold; }
            .details { display: flex; justify-content: space-between; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th { background: #f9f9f9; padding: 12px; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #555; border-bottom: 1px solid #ddd; }
            .totals { text-align: right; margin-top: 30px; font-size: 14px; }
            .totals p { margin: 6px 0; }
            .grand-total { font-size: 18px; font-weight: bold; color: #000; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">ARCUS GROUPS</div>
              <p>Premium B2B Commerce Platform</p>
            </div>
            <div style="text-align: right;">
              <div class="invoice-title">TAX INVOICE</div>
              <p>Order ID: ${order.id}</p>
              <p>Date: ${formatDate(order.timestamp || order.date)}</p>
            </div>
          </div>
          <div class="details">
            <div>
              <strong>Billed To:</strong>
              <p>${order.billingAddress || 'Valued Customer'}</p>
              <p>GSTIN: ${order.gstNumber || 'N/A'}</p>
            </div>
            <div style="text-align: right;">
              <strong>Shipped To:</strong>
              <p>${order.shippingAddress || 'N/A'}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>HSN</th>
                <th>Rate</th>
                <th>Qty</th>
                <th>Discount</th>
                <th>GST %</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>
          <div class="totals">
            <p>Subtotal: ₹${totalTaxableValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            <p>CGST: ₹${totalCgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            <p>SGST: ₹${totalSgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            <p class="grand-total">Grand Total: ₹${order.amount?.toLocaleString('en-IN')}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      alert('Popup blocked. Please enable popups to print/download invoice.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-lg text-left">
      {selectedOrder ? (
        <div className="bg-white border border-slate-200 rounded p-lg shadow-sm space-y-md">
          <div className="flex justify-between items-center border-b border-slate-100 pb-sm">
            <button
              onClick={() => setSelectedOrder(null)}
              className="flex items-center gap-xs text-xs font-bold text-primary hover:underline"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Orders
            </button>
            <div className="flex gap-sm">
              <button
                onClick={() => downloadInvoice(selectedOrder)}
                className="px-md py-1.5 border border-primary text-primary font-bold rounded text-xs hover:bg-[#FFFDF5] flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[16px]">description</span>
                Print Invoice
              </button>
              {selectedOrder.status !== 'Cancelled' && (
                <button
                  onClick={() => {
                    cancelOrder(selectedOrder.id).then((success) => {
                      if (success) setSelectedOrder({ ...selectedOrder, status: 'Cancelled' });
                    });
                  }}
                  className="px-md py-1.5 border border-red-200 text-red-600 font-bold rounded text-xs hover:bg-red-50 flex items-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-xs">
            <div>
              <p className="font-bold text-secondary">Order Reference</p>
              <p className="text-sm font-bold text-slate-800 mt-xs">{selectedOrder.id}</p>
            </div>
            <div>
              <p className="font-bold text-secondary">Placed On</p>
              <p className="text-sm font-bold text-slate-800 mt-xs">{formatDate(selectedOrder.timestamp || selectedOrder.date)}</p>
            </div>
          </div>

          {/* Stepper tracking container */}
          <div className="bg-slate-50 border border-slate-200 rounded p-lg my-md text-xs">
            <h4 className="text-xs font-bold text-slate-800 mb-lg uppercase tracking-wider">Order Delivery Status</h4>
            {selectedOrder.status === 'Cancelled' ? (
              <div className="flex items-center gap-md text-red-600 bg-red-50 border border-red-200 rounded p-md">
                <span className="material-symbols-outlined text-[24px]">cancel</span>
                <div>
                  <p className="text-xs font-bold">Order Cancelled</p>
                  <p className="text-[10px] text-red-500">This order has been cancelled and will not be delivered.</p>
                </div>
              </div>
            ) : (
              <div className="relative flex flex-col md:flex-row md:justify-between items-start md:items-center gap-lg md:gap-0 mt-md">
                {/* Horizontal line for desktop stepper */}
                <div className="absolute left-0 right-0 top-4 h-0.5 bg-slate-200 hidden md:block z-0" />
                <div 
                  className="absolute left-0 top-4 h-0.5 bg-primary hidden md:block z-0 transition-all duration-500 ease-out" 
                  style={{ width: `${(getStepIndex(selectedOrder.status) / (orderSteps.length - 1)) * 100}%` }}
                />

                {orderSteps.map((step, idx) => {
                  const currentStepIdx = getStepIndex(selectedOrder.status);
                  const isCompleted = idx < currentStepIdx;
                  const isActive = idx === currentStepIdx;

                  return (
                    <div key={idx} className="flex flex-row md:flex-col items-center gap-md md:gap-sm z-10 md:w-32 text-left md:text-center relative">
                      {/* Stepper Node */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 shrink-0 ${
                        isCompleted ? 'bg-primary border-primary text-slate-900 font-bold' :
                        isActive ? 'bg-white border-primary text-primary font-bold shadow-[0_0_12px_rgba(250,189,0,0.4)] animate-pulse' :
                        'bg-white border-slate-200 text-slate-400'
                      }`}>
                        {isCompleted ? (
                          <span className="material-symbols-outlined text-[18px] font-bold">check</span>
                        ) : (
                          <span className="text-xs font-bold">{idx + 1}</span>
                        )}
                      </div>
                      
                      {/* Stepper Labels */}
                      <div>
                        <p className={`text-xs font-bold leading-tight ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                          {step.label}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5 leading-tight md:max-w-[100px] md:mx-auto">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border border-slate-200 rounded overflow-hidden mt-md">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <th className="p-md">Product</th>
                  <th className="p-md">Price</th>
                  <th className="p-md">Qty</th>
                  <th className="p-md text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-md font-bold text-slate-900">{item.name}</td>
                    <td className="p-md">{formatCurrency(item.price)}</td>
                    <td className="p-md">{item.qty}</td>
                    <td className="p-md text-right font-bold">{formatCurrency(item.qty * item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-right pt-sm border-t border-slate-100">
            <span className="text-secondary font-semibold">Grand Total: </span>
            <span className="text-lg font-bold text-slate-900">{formatCurrency(selectedOrder.amount)}</span>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-xl text-center text-slate-500">
              <span className="material-symbols-outlined text-[48px] text-slate-300">shopping_cart_checkout</span>
              <p className="mt-sm text-sm">No orders found. Start purchasing materials to build your history!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                    <th className="p-md">Order ID</th>
                    <th className="p-md">Date</th>
                    <th className="p-md">Items</th>
                    <th className="p-md">Total Amount</th>
                    <th className="p-md">Status</th>
                    <th className="p-md text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o: any) => (
                    <tr key={o.id} className="hover:bg-slate-50/50">
                      <td className="p-md font-bold text-primary font-mono">{o.id}</td>
                      <td className="p-md text-slate-600">{formatDate(o.timestamp || o.date)}</td>
                      <td className="p-md text-slate-700 font-semibold max-w-[200px] truncate">{o.products || o.items?.map((i: any) => i.name).join(', ')}</td>
                      <td className="p-md font-bold text-slate-900">{formatCurrency(o.amount)}</td>
                      <td className="p-md">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                          o.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                          o.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-md text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="px-md py-1 border border-slate-200 hover:border-slate-800 text-slate-700 hover:text-slate-900 font-bold rounded text-[10px]"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default IndividualOrders;
