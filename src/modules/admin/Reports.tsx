import React, { useState } from 'react';
import { apiFetch } from '../../lib/api';

export const Reports: React.FC = () => {
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportingSales, setExportingSales] = useState(false);
  const [exportingInventory, setExportingInventory] = useState(false);
  const [exportingRfqs, setExportingRfqs] = useState(false);

  // Download helper
  const triggerCsvDownload = (filename: string, headers: string[], rows: string[][]) => {
    // Correctly escape values for CSV
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.map(cell => {
        const val = String(cell || '').replace(/"/g, '""');
        return `"${val}"`;
      }).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccess(`Report "${filename}" exported successfully!`);
    setTimeout(() => setExportSuccess(null), 4000);
  };

  const handleExportSales = async () => {
    setExportingSales(true);
    setError(null);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await apiFetch('/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch sales orders from database.');
      const data = await res.json();
      
      const headers = ["Order ID", "Date", "Buyer ID", "Products Brief", "Amount (INR)", "Payment Method", "Status"];
      const rows = data.map((o: any) => [
        o.id || 'N/A',
        o.createdAt || o.timestamp || 'N/A',
        o.userId || 'N/A',
        o.items ? o.items.map((item: any) => `${item.productName || item.name} (x${item.quantity})`).join('; ') : 'N/A',
        o.totalAmount || o.totalPrice || 0,
        o.paymentMethod || 'N/A',
        o.status || 'N/A'
      ]);
      
      triggerCsvDownload("Sales_Revenue_Report.csv", headers, rows);
    } catch (err: any) {
      setError(err.message || 'Error exporting sales report.');
    } finally {
      setExportingSales(false);
    }
  };

  const handleExportInventory = async () => {
    setExportingInventory(true);
    setError(null);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await apiFetch('/admin/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch product catalog from database.');
      const data = await res.json();
      
      let flatProducts: any[] = [];
      if (Array.isArray(data)) {
        if (data.length > 0 && 'products' in data[0]) {
          data.forEach((c: any) => {
            if (c.products && Array.isArray(c.products)) {
              flatProducts.push(...c.products);
            }
          });
        } else {
          flatProducts = data;
        }
      }

      const headers = ["Product ID", "SKU", "Product Name", "Available Stock", "Reserved Stock", "Safety Limit", "Price (INR)"];
      const rows = flatProducts.map((p: any) => [
        p.id || 'N/A',
        p.sku || 'N/A',
        p.name || 'N/A',
        p.inventory?.available ?? p.stock ?? 0,
        p.inventory?.reserved ?? 0,
        p.inventory?.reorderLevel ?? 10,
        p.price || 0
      ]);
      
      triggerCsvDownload("Inventory_Valuation_Report.csv", headers, rows);
    } catch (err: any) {
      setError(err.message || 'Error exporting inventory report.');
    } finally {
      setExportingInventory(false);
    }
  };

  const handleExportRfqs = async () => {
    setExportingRfqs(true);
    setError(null);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await apiFetch('/rfqs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch RFQs from database.');
      const data = await res.json();
      
      const headers = ["RFQ ID", "Date", "Category", "Client Name", "Contact Phone", "Budget Target", "Status"];
      const rows = data.map((r: any) => [
        r.id || 'N/A',
        r.timestamp ? new Date(r.timestamp).toLocaleDateString() : 'N/A',
        r.category || 'N/A',
        r.name || 'N/A',
        r.phone || 'N/A',
        r.budget || 'N/A',
        r.status || 'N/A'
      ]);
      
      triggerCsvDownload("RFQ_Pipeline_Report.csv", headers, rows);
    } catch (err: any) {
      setError(err.message || 'Error exporting RFQ report.');
    } finally {
      setExportingRfqs(false);
    }
  };

  return (
    <div className="space-y-md text-left">
      {exportSuccess && (
        <div className="bg-green-50 text-green-800 p-md rounded border border-green-200">
          <p className="font-semibold">{exportSuccess}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-800 p-md rounded border border-red-200 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="material-symbols-outlined text-[18px]">close</button>
        </div>
      )}

      {/* Reports Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {/* Sales Widget */}
        <div className="bg-white border border-slate-200 p-lg rounded shadow-sm flex flex-col justify-between space-y-md">
          <div className="space-y-sm">
            <div className="w-10 h-10 rounded bg-amber-100 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">trending_up</span>
            </div>
            <h4 className="font-extrabold text-slate-900 text-body-md">Sales & Revenue Reports</h4>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Consolidated data of all transaction records, taxes, payment options, and delivery channels.
            </p>
          </div>
          <button
            onClick={handleExportSales}
            disabled={exportingSales}
            className="flex items-center justify-center gap-xs px-md h-10 border border-primary text-primary hover:bg-[#FFFDF5] disabled:border-slate-200 disabled:text-slate-400 disabled:bg-slate-50 font-bold text-xs rounded transition-all bg-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            {exportingSales ? 'Exporting...' : 'Export Sales CSV'}
          </button>
        </div>

        {/* Inventory Widget */}
        <div className="bg-white border border-slate-200 p-lg rounded shadow-sm flex flex-col justify-between space-y-md">
          <div className="space-y-sm">
            <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[24px]">warehouse</span>
            </div>
            <h4 className="font-extrabold text-slate-900 text-body-md">Inventory & Stock Reports</h4>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Complete catalog stock evaluations, low stock threshold warnings, and logs of manual overrides.
            </p>
          </div>
          <button
            onClick={handleExportInventory}
            disabled={exportingInventory}
            className="flex items-center justify-center gap-xs px-md h-10 border border-blue-200 text-blue-600 hover:bg-blue-50/30 disabled:border-slate-200 disabled:text-slate-400 disabled:bg-slate-50 font-bold text-xs rounded transition-all bg-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            {exportingInventory ? 'Exporting...' : 'Export Inventory CSV'}
          </button>
        </div>

        {/* RFQ Widget */}
        <div className="bg-white border border-slate-200 p-lg rounded shadow-sm flex flex-col justify-between space-y-md">
          <div className="space-y-sm">
            <div className="w-10 h-10 rounded bg-purple-100 flex items-center justify-center text-purple-600">
              <span className="material-symbols-outlined text-[24px]">assignment</span>
            </div>
            <h4 className="font-extrabold text-slate-900 text-body-md">RFQ Workspace Pipeline</h4>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Pipeline analytics of submitted buyer queries, issued quote offers, and conversion rates.
            </p>
          </div>
          <button
            onClick={handleExportRfqs}
            disabled={exportingRfqs}
            className="flex items-center justify-center gap-xs px-md h-10 border border-purple-200 text-purple-600 hover:bg-purple-50/30 disabled:border-slate-200 disabled:text-slate-400 disabled:bg-slate-50 font-bold text-xs rounded transition-all bg-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            {exportingRfqs ? 'Exporting...' : 'Export RFQ CSV'}
          </button>
        </div>
      </div>
    </div>
  );
};
