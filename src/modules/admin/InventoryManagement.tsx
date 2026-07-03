import React, { useEffect, useState } from 'react';
import type { Product, InventoryAdjustment } from './types';
import { apiFetch } from '../../lib/api';


export const InventoryManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search
  const [search, setSearch] = useState('');
  const [isLowStockExpanded, setIsLowStockExpanded] = useState(true);

  // Stock Adjustment Dialog
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentForm, setAdjustmentForm] = useState({
    adjustmentType: 'INCOMING', // INCOMING, SHIPPED, DISCREPANCY, MANUAL
    quantity: 0,
    reason: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('arcus_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch products
      const prodRes = await apiFetch('/admin/products', { headers });
      if (!prodRes.ok) throw new Error('Failed to fetch product stock.');
      const prodData = await prodRes.json();
      
      let flatProducts: Product[] = [];
      if (Array.isArray(prodData)) {
        if (prodData.length > 0 && 'products' in prodData[0]) {
          prodData.forEach((cat: any) => {
            if (cat.products && Array.isArray(cat.products)) {
              cat.products.forEach((p: any) => {
                if (!flatProducts.some(fp => fp.id === p.id)) {
                  flatProducts.push(p);
                }
              });
            }
          });
        } else {
          flatProducts = prodData;
        }
      }
      setProducts(flatProducts);

      // Fetch adjustments history
      setHistoryLoading(true);
      const adjRes = await apiFetch('/admin/inventory/adjustments', { headers });
      if (adjRes.ok) {
        const adjData = await adjRes.json();
        setAdjustments(adjData);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading stock metrics.');
    } finally {
      setLoading(false);
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdjustModal = (product: Product) => {
    setSelectedProduct(product);
    setAdjustmentForm({
      adjustmentType: 'INCOMING',
      quantity: 10,
      reason: 'Regular restock'
    });
    setIsAdjustModalOpen(true);
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await apiFetch('/admin/inventory/adjustments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          ...adjustmentForm
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to adjust stock.');

      setSuccess(`Stock for "${selectedProduct.name}" adjusted successfully!`);
      setIsAdjustModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Error adjusting stock.');
    }
  };

  const getProductName = (prodId: string) => {
    const p = products.find(prod => prod.id === prodId);
    return p ? p.name : prodId;
  };

  const [reorderLoading, setReorderLoading] = useState<Record<string, boolean>>({});

  const handleCreateReorderTask = async (product: Product) => {
    setError(null);
    setSuccess(null);
    setReorderLoading(prev => ({ ...prev, [product.id]: true }));
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await apiFetch('/admin/inventory/reorder-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create reorder task.');

      setSuccess(`Reorder task created for "${product.name}" successfully! Operational staff notified.`);
    } catch (err: any) {
      setError(err.message || 'Error creating reorder task.');
    } finally {
      setReorderLoading(prev => ({ ...prev, [product.id]: false }));
    }
  };

  // Filter Catalog
  const filteredProducts = products.filter(p => {
    if (p.status === 'ARCHIVED') return false;
    return p.name.toLowerCase().includes(search.toLowerCase()) ||
           p.sku.toLowerCase().includes(search.toLowerCase()) ||
           (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));
  });

  const lowStockProducts = products.filter(p => {
    if (p.status === 'ARCHIVED') return false;
    const avail = p.inventory?.available ?? p.stock ?? 0;
    const reorder = p.inventory?.reorderLevel ?? 10;
    return avail <= reorder;
  });

  return (
    <div className="space-y-lg text-left">
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

      {/* Alert Banner for Low Stock */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50/60 backdrop-blur-xs border border-red-200/80 text-red-950 p-lg rounded space-y-md shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-sm">
            <div className="flex items-center gap-sm font-extrabold text-body-md text-red-900">
              <span className="material-symbols-outlined text-red-600 animate-pulse bg-red-100 p-1.5 rounded border border-red-200">warning</span>
              <div>
                <p className="font-extrabold text-slate-900">Low Stock Threshold Breached</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{lowStockProducts.length} items have fallen below safety limits. Action required.</p>
              </div>
            </div>
            <button
              onClick={() => setIsLowStockExpanded(!isLowStockExpanded)}
              className="flex items-center gap-xs px-md h-9 border border-red-200 hover:border-red-400 bg-white hover:bg-red-50 text-red-700 font-bold text-xs rounded shadow-xs transition-all cursor-pointer select-none"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isLowStockExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              </span>
              {isLowStockExpanded ? 'Hide Items' : `View Items (${lowStockProducts.length})`}
            </button>
          </div>

          {isLowStockExpanded && (
            <div className="bg-white border border-red-100/60 rounded overflow-hidden shadow-xs divide-y divide-slate-100">
              {lowStockProducts.map(p => {
                const avail = p.inventory?.available ?? p.stock ?? 0;
                const limit = p.inventory?.reorderLevel ?? 10;
                return (
                  <div key={p.id} className="p-md hover:bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-body-sm truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Brand: {p.brand} | SKU: <span className="font-mono">{p.sku}</span></p>
                    </div>
                    
                    <div className="flex items-center gap-lg w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center gap-md text-xs font-semibold">
                        <span className="bg-red-50 text-red-700 px-md py-1 rounded border border-red-100 font-bold text-center min-w-[70px]">
                          {avail} left
                        </span>
                        <span className="text-slate-400 font-medium">
                          Limit: {limit}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleCreateReorderTask(p)}
                        disabled={reorderLoading[p.id]}
                        className="h-8 px-md bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold text-xs rounded shadow-sm flex items-center justify-center gap-xs transition-all cursor-pointer whitespace-nowrap"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_task</span>
                        {reorderLoading[p.id] ? 'Creating...' : 'Reorder'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Dashboard Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-lg">
        {/* Left Column: Product Stock List */}
        <div className="xl:col-span-2 space-y-md">
          <div className="flex justify-between items-center bg-white p-md rounded border border-slate-200 shadow-sm">
            <div className="relative w-full max-w-xs">
              <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search stock catalog..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-xxl pr-md border border-slate-200 rounded text-body-sm focus:border-primary focus:ring-0 bg-slate-50"
              />
            </div>
            <div className="text-xs bg-slate-100 text-slate-500 rounded px-md py-sm font-extrabold font-label-caps uppercase tracking-wide">
              {filteredProducts.length} Items Listed
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
            {loading ? (
              <div className="flex justify-center py-xl">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-body-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                      <th className="px-lg py-md">Product</th>
                      <th className="px-lg py-md">SKU</th>
                      <th className="px-lg py-md">Available stock</th>
                      <th className="px-lg py-md">Reserved stock</th>
                      <th className="px-lg py-md">Safety Limit</th>
                      <th className="px-lg py-md text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map(p => {
                      const avail = p.inventory?.available ?? p.stock ?? 0;
                      const limit = p.inventory?.reorderLevel ?? 10;
                      const isLow = avail <= limit;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-lg py-md font-bold text-slate-900">
                            <div>{p.name}</div>
                            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{p.brand}</div>
                          </td>
                          <td className="px-lg py-md text-slate-500 font-mono text-xs">{p.sku}</td>
                          <td className="px-lg py-md">
                            <span className={`font-bold px-md py-sm rounded border text-xs flex items-center gap-xs w-max ${
                              isLow ? 'bg-red-50 text-red-700 border-red-100 animate-pulse' : 'bg-slate-50 text-slate-900 border-slate-200'
                            }`}>
                              {avail} {p.unitOfMeasure}
                              {isLow && <span className="text-[9px] font-black uppercase bg-red-100 px-1 rounded">ALERT</span>}
                            </span>
                          </td>
                          <td className="px-lg py-md text-slate-500 font-medium">{p.inventory?.reserved ?? 0} {p.unitOfMeasure}</td>
                          <td className="px-lg py-md text-slate-400 font-medium">{limit} {p.unitOfMeasure}</td>
                          <td className="px-lg py-md text-right">
                            <button
                              onClick={() => openAdjustModal(p)}
                              className="flex items-center gap-xs px-md h-8 border border-slate-200 hover:border-primary hover:bg-[#FFFDF5] text-slate-600 hover:text-slate-950 font-bold text-xs rounded transition-all ml-auto"
                            >
                              <span className="material-symbols-outlined text-[16px]">add_circle</span>
                              Adjust
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

        {/* Right Column: Adjustment Logs History */}
        <div className="space-y-md">
          <div className="bg-slate-900 text-slate-200 p-lg rounded shadow-md flex justify-between items-center">
            <div>
              <h4 className="font-extrabold text-white text-body-md">Stock Adjustment Logs</h4>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">History of manual & automated adjustments</p>
            </div>
            <span className="material-symbols-outlined text-primary text-[24px]">history</span>
          </div>

          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden flex flex-col max-h-[600px]">
            {historyLoading ? (
              <div className="flex justify-center py-xl flex-1 items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
                {adjustments.map((a, i) => {
                  const timestampStr = a.timestamp ? new Date(a.timestamp).toLocaleString('en-IN', { hour: 'numeric', minute: 'numeric', day: 'numeric', month: 'short' }) : 'N/A';
                  return (
                    <div key={i} className="p-md hover:bg-slate-50 transition-colors space-y-sm text-xs">
                      <div className="flex justify-between items-start">
                        <span className={`font-bold px-md py-0.5 rounded-full border text-[10px] ${
                          a.adjustmentType === 'INCOMING' ? 'bg-green-50 text-green-700 border-green-200' :
                          a.adjustmentType === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {a.adjustmentType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">{timestampStr}</span>
                      </div>

                      <p className="font-extrabold text-slate-900 text-body-xs">{getProductName(a.productId)}</p>
                      
                      <div className="grid grid-cols-3 gap-xs bg-slate-50 p-sm rounded border border-slate-100 text-center font-bold font-mono text-[10px]">
                        <div>
                          <p className="text-slate-400 font-medium">Previous</p>
                          <p className="text-slate-600">{a.previousStock}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-medium">Qty Chg</p>
                          <p className={a.adjustmentType === 'INCOMING' ? 'text-green-600' : 'text-blue-600'}>
                            {a.adjustmentType === 'INCOMING' ? '+' : '-'}{a.quantity}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-medium">New stock</p>
                          <p className="text-slate-950">{a.newStock}</p>
                        </div>
                      </div>

                      {a.reason && (
                        <p className="text-slate-500 italic leading-relaxed">
                          Reason: {a.reason}
                        </p>
                      )}

                      <p className="text-[10px] text-slate-400 font-medium">
                        Performed By: <span className="font-bold text-slate-600">{a.performedBy}</span>
                      </p>
                    </div>
                  );
                })}
                {adjustments.length === 0 && (
                  <p className="text-center py-xl text-slate-400 italic">No adjustments logged yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Adjustment Dialog Modal */}
      {isAdjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
          <div className="w-full max-w-md bg-white rounded shadow overflow-hidden">
            <div className="px-lg py-md border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 text-body-md">
                  Adjust Inventory Stock
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{selectedProduct.name}</p>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="p-lg space-y-md">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Current Stock Status</label>
                <div className="grid grid-cols-2 gap-sm bg-amber-50/40 border border-amber-100 p-md rounded text-center">
                  <div>
                    <p className="text-slate-400 text-xs font-medium">Available</p>
                    <p className="font-black text-slate-900 text-body-md">{selectedProduct.inventory?.available ?? selectedProduct.stock ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-medium">Reserved</p>
                    <p className="font-black text-slate-900 text-body-md">{selectedProduct.inventory?.reserved ?? 0}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Adjustment Type</label>
                <select
                  value={adjustmentForm.adjustmentType}
                  onChange={e => setAdjustmentForm({ ...adjustmentForm, adjustmentType: e.target.value })}
                  className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm font-bold"
                >
                  <option value="INCOMING">Restock / Incoming (+)</option>
                  <option value="SHIPPED">Ship / Outgoing (-)</option>
                  <option value="DISCREPANCY">Discrepancy Correction (Set direct value)</option>
                  <option value="MANUAL">Manual Adjustment Override (Set direct value)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Quantity *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={adjustmentForm.quantity}
                  onChange={e => setAdjustmentForm({ ...adjustmentForm, quantity: parseInt(e.target.value, 10) || 0 })}
                  className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Adjustment Reason / Context *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Received shipment, audit discrepancy, damaged stock"
                  value={adjustmentForm.reason}
                  onChange={e => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                  className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm"
                />
              </div>

              <div className="flex justify-end gap-sm pt-md border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-lg h-11 border border-slate-200 hover:border-slate-800 rounded font-bold text-xs text-slate-600 hover:text-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-container text-on-primary-container hover:bg-[#fabd00] px-xl h-11 rounded font-bold text-xs transition-all shadow-sm"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
