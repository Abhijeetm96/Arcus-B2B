import React, { useEffect, useState } from 'react';
import type { Product } from './types';
import { apiFetch } from '../../lib/api';
import { exportToCSV } from '../../utils/csvHelpers';
import { ImportModal, type ImportField } from '../../components/ImportModal';

export const InventoryManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [kpisLoading, setKpisLoading] = useState(false);

  // Search & Pagination States
  const [search, setSearch] = useState('');
  const [isLowStockExpanded, setIsLowStockExpanded] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Stock Adjustment Dialog
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentForm, setAdjustmentForm] = useState({
    adjustmentType: 'INCOMING', // INCOMING, SHIPPED, DISCREPANCY, MANUAL
    quantity: 0,
    reason: ''
  });

  // Import/Export States & Handlers
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const inventoryImportFields: ImportField[] = [
    { label: 'SKU or Product ID', key: 'sku', required: true },
    { label: 'Adjustment Type', key: 'adjustmentType', required: true },
    { label: 'Quantity', key: 'quantity', required: true },
    { label: 'Reason', key: 'reason' }
  ];

  const handleExportStockLevels = () => {
    const headers = [
      { label: 'Product ID', key: 'id' },
      { label: 'Product Name', key: 'name' },
      { label: 'SKU', key: 'sku' },
      { label: 'Brand', key: 'brand' },
      { label: 'Available Stock', key: 'available' },
      { label: 'Reserved Stock', key: 'reserved' },
      { label: 'Safety Limit', key: 'reorderLevel' },
      { label: 'Unit', key: 'unitOfMeasure' }
    ];
    const data = products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      brand: p.brand || '',
      available: p.inventory?.available ?? p.stock ?? 0,
      reserved: p.inventory?.reserved ?? 0,
      reorderLevel: p.inventory?.reorderLevel ?? 10,
      unitOfMeasure: p.unitOfMeasure || 'pcs'
    }));
    exportToCSV(data, headers, 'arcus_inventory_stock_levels.csv');
  };

  const handleExportAdjustmentHistory = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('arcus_token');
      const res = await apiFetch('/admin/inventory/adjustments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load adjustment history.');
      const history = await res.json();
      
      const headers = [
        { label: 'Adjustment ID', key: 'id' },
        { label: 'Product ID', key: 'productId' },
        { label: 'Product Name', key: 'productName' },
        { label: 'Adjustment Type', key: 'adjustmentType' },
        { label: 'Quantity', key: 'quantity' },
        { label: 'Previous Stock', key: 'prevStock' },
        { label: 'New Stock', key: 'newStock' },
        { label: 'Reason', key: 'reason' },
        { label: 'Performed By', key: 'performedBy' },
        { label: 'Timestamp', key: 'timestamp' }
      ];
      
      const data = history.map((h: any) => ({
        id: h.id,
        productId: h.productId,
        productName: getProductName(h.productId),
        adjustmentType: h.adjustmentType,
        quantity: h.quantity,
        prevStock: h.prevStock,
        newStock: h.newStock,
        reason: h.reason || '',
        performedBy: h.performedBy || '',
        timestamp: h.timestamp || ''
      }));
      
      exportToCSV(data, headers, 'arcus_inventory_adjustments_history.csv');
      setSuccess('Inventory adjustment logs exported successfully!');
    } catch (err: any) {
      setError(err.message || 'Error exporting adjustment history.');
    }
  };

  const handleImportAdjustmentRow = async (row: Record<string, any>) => {
    const token = localStorage.getItem('arcus_token');
    
    // Match by SKU or ID
    const product = products.find(p => 
      (p.sku && p.sku.toLowerCase() === row.sku.toLowerCase()) || 
      p.id.toLowerCase() === row.sku.toLowerCase()
    );
    
    if (!product) {
      throw new Error(`Product SKU/ID "${row.sku}" not found in database.`);
    }

    const qtyVal = parseInt(row.quantity, 10);
    if (isNaN(qtyVal) || qtyVal <= 0) {
      throw new Error(`Quantity must be a positive integer. Got: "${row.quantity}"`);
    }

    const type = (row.adjustmentType || 'INCOMING').toUpperCase();
    if (!['INCOMING', 'SHIPPED', 'DISCREPANCY', 'MANUAL'].includes(type)) {
      throw new Error(`Invalid Adjustment Type "${row.adjustmentType}". Must be INCOMING, SHIPPED, DISCREPANCY, or MANUAL.`);
    }

    const res = await apiFetch('/admin/inventory/adjustments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: product.id,
        adjustmentType: type,
        quantity: qtyVal,
        reason: row.reason || 'Bulk Adjust CSV'
      })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || `Adjustment failed for ${product.name}`);
    }
  };

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

      // Fetch orders for KPI calculations
      setKpisLoading(true);
      const orderRes = await apiFetch('/admin/orders', { headers });
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading stock metrics.');
    } finally {
      setLoading(false);
      setKpisLoading(false);
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

  // Paginated Catalog
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getInventoryKPIs = () => {
    // 1. Filter out Cancelled orders
    const activeOrders = orders.filter(o => o.status !== 'Cancelled');

    // 2. Aggregate sales per product
    const productSales: Record<string, { name: string; brand: string; qty: number; revenue: number }> = {};
    const productOrderCount: Record<string, number> = {};

    // 3. For cross-selling: count pairs bought together in the same order
    const pairCounts: Record<string, { count: number; nameA: string; nameB: string }> = {};

    activeOrders.forEach(o => {
      const items = Array.isArray(o.items) ? o.items : [];
      
      // Track order count per product
      const uniqueProductIdsInOrder = new Set<string>();

      items.forEach((item: any) => {
        const pId = item.productId || item.id;
        if (!pId) return;

        uniqueProductIdsInOrder.add(pId);

        const qty = Number(item.quantity || item.qty || 0);
        const price = Number(item.unitPrice || item.price || 0);
        const revenue = qty * price;

        if (!productSales[pId]) {
          productSales[pId] = {
            name: item.productName || item.name || getProductName(pId) || 'Unknown Product',
            brand: products.find(p => p.id === pId)?.brand || 'Generic',
            qty: 0,
            revenue: 0
          };
        }
        productSales[pId].qty += qty;
        productSales[pId].revenue += revenue;
      });

      // Increment order count
      uniqueProductIdsInOrder.forEach(pId => {
        productOrderCount[pId] = (productOrderCount[pId] || 0) + 1;
      });

      // Calculate pairs in this order
      const pIdList = Array.from(uniqueProductIdsInOrder);
      for (let i = 0; i < pIdList.length; i++) {
        for (let j = i + 1; j < pIdList.length; j++) {
          const idA = pIdList[i];
          const idB = pIdList[j];
          const key = idA < idB ? `${idA}_${idB}` : `${idB}_${idA}`;

          if (!pairCounts[key]) {
            const nameA = items.find((item: any) => (item.productId || item.id) === idA)?.productName || getProductName(idA);
            const nameB = items.find((item: any) => (item.productId || item.id) === idB)?.productName || getProductName(idB);
            pairCounts[key] = { count: 0, nameA, nameB };
          }
          pairCounts[key].count += 1;
        }
      }
    });

    // Sort product sales to find top/low selling
    const salesList = Object.entries(productSales).map(([id, data]) => ({
      id,
      ...data,
      orderCount: productOrderCount[id] || 0
    }));

    // Top Selling Product (by revenue)
    const topSelling = salesList.length > 0 
      ? salesList.reduce((max, curr) => curr.revenue > max.revenue ? curr : max, salesList[0])
      : null;

    // Most Ordered Product (by distinct order count or quantity)
    const mostOrdered = salesList.length > 0
      ? salesList.reduce((max, curr) => curr.qty > max.qty ? curr : max, salesList[0])
      : null;

    // Top Category (revenue)
    const categorySales: Record<string, number> = {};
    products.forEach(p => {
      const salesData = productSales[p.id];
      if (salesData && p.categoryId) {
        categorySales[p.categoryId] = (categorySales[p.categoryId] || 0) + salesData.revenue;
      }
    });

    let topCategoryName = 'N/A';
    let topCategoryRevenue = 0;
    if (Object.keys(categorySales).length > 0) {
      const topCatEntry = Object.entries(categorySales).reduce((max, curr) => curr[1] > max[1] ? curr : max);
      const topCatId = topCatEntry[0];
      topCategoryRevenue = topCatEntry[1];
      
      const matchingProduct = products.find(p => p.categoryId === topCatId);
      topCategoryName = matchingProduct?.categoryTitle || matchingProduct?.categoryId || topCatId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    // Low Selling Product (active products in catalog with minimal sales)
    const activeCatalogProducts = products.filter(p => p.status !== 'ARCHIVED');
    const lowSellingList = activeCatalogProducts.map(p => {
      const sales = productSales[p.id] || { qty: 0, revenue: 0 };
      return {
        name: p.name,
        brand: p.brand || 'Generic',
        qty: sales.qty,
        revenue: sales.revenue
      };
    }).sort((a, b) => a.qty - b.qty || a.revenue - b.revenue);

    const lowSelling = lowSellingList.length > 0 ? lowSellingList[0] : null;

    // Top Cross-selling combo
    const crossSellingList = Object.values(pairCounts).sort((a, b) => b.count - a.count);
    const topCrossSelling = crossSellingList.length > 0 ? crossSellingList[0] : null;

    // Additional Inventory KPIs
    let totalInvValue = 0;
    let totalStockUnits = 0;
    let lowStockCount = 0;

    activeCatalogProducts.forEach(p => {
      const avail = p.inventory?.available ?? p.stock ?? 0;
      const limit = p.inventory?.reorderLevel ?? 10;
      if (avail <= limit) {
        lowStockCount++;
      }
      totalInvValue += (p.price || 0) * avail;
      totalStockUnits += avail;
    });

    const stockoutRisk = activeCatalogProducts.length > 0
      ? parseFloat(((lowStockCount / activeCatalogProducts.length) * 100).toFixed(1))
      : 0;

    return {
      topSelling,
      mostOrdered,
      topCategory: { name: topCategoryName, revenue: topCategoryRevenue },
      lowSelling,
      topCrossSelling,
      lowStockCount,
      totalInvValue,
      totalStockUnits,
      stockoutRisk
    };
  };

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md bg-white p-md rounded border border-slate-200 shadow-sm">
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
            <div className="flex flex-wrap items-center gap-sm">
              <button
                onClick={handleExportStockLevels}
                className="flex items-center gap-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-md h-11 rounded font-bold text-xs transition-all shadow-xs cursor-pointer"
                title="Export Stock Levels to CSV"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Export Stock
              </button>
              <button
                onClick={handleExportAdjustmentHistory}
                className="flex items-center gap-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-md h-11 rounded font-bold text-xs transition-all shadow-xs cursor-pointer"
                title="Export Adjustment History to CSV"
              >
                <span className="material-symbols-outlined text-[16px]">history</span>
                Export Logs
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-md h-11 rounded font-bold text-xs transition-all shadow-xs cursor-pointer"
                title="Import Stock Adjustments from CSV"
              >
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                Import Adjustments
              </button>
              <div className="text-xs bg-slate-100 text-slate-500 rounded px-md py-sm font-extrabold font-label-caps uppercase tracking-wide">
                {filteredProducts.length} Items Listed
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm flex flex-col">
            {loading ? (
              <div className="flex justify-center py-xl">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                  <table className="w-full text-body-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider sticky top-0 z-10">
                        <th className="px-lg py-md bg-slate-50">Product</th>
                        <th className="px-lg py-md bg-slate-50">SKU</th>
                        <th className="px-lg py-md bg-slate-50">Available stock</th>
                        <th className="px-lg py-md bg-slate-50">Reserved stock</th>
                        <th className="px-lg py-md bg-slate-50">Safety Limit</th>
                        <th className="px-lg py-md text-right bg-slate-50">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedProducts.map(p => {
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
                      {paginatedProducts.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-xl text-slate-400 font-semibold">
                            No products matching filters found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer */}
                <div className="bg-slate-50 px-lg py-md border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-md shrink-0">
                  <div className="flex items-center gap-sm text-xs font-semibold text-slate-500">
                    <span>Show</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="h-8 border border-slate-200 rounded pl-sm pr-8 bg-white focus:border-primary focus:ring-0 font-bold cursor-pointer text-slate-800 text-xs shadow-xs hover:border-slate-300 transition-all outline-none"
                    >
                      <option value={20}>20 items</option>
                      <option value={50}>50 items</option>
                      <option value={100}>100 items</option>
                    </select>
                    <span>per page</span>
                  </div>
                  <div className="flex items-center gap-md">
                    <span className="text-xs text-slate-500 font-semibold">
                      Showing {filteredProducts.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + pageSize, filteredProducts.length)} of {filteredProducts.length}
                    </span>
                    <div className="flex items-center gap-xs">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="w-8 h-8 rounded border border-slate-200 hover:border-slate-800 flex items-center justify-center disabled:opacity-40 disabled:hover:border-slate-200 cursor-pointer bg-white transition-all text-slate-600"
                      >
                        <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                      </button>
                      <span className="text-xs font-bold text-slate-850 px-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 rounded border border-slate-200 hover:border-slate-800 flex items-center justify-center disabled:opacity-40 disabled:hover:border-slate-200 cursor-pointer bg-white transition-all text-slate-600"
                      >
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Inventory Performance KPIs */}
        <div className="space-y-md">
          <div className="bg-slate-900 text-slate-200 p-lg rounded shadow-md flex justify-between items-center">
            <div>
              <h4 className="font-extrabold text-white text-body-md">Inventory Performance KPIs</h4>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Derived from system order transactions</p>
            </div>
            <span className="material-symbols-outlined text-primary text-[24px]">analytics</span>
          </div>

          {loading || kpisLoading ? (
            <div className="bg-white border border-slate-200 rounded shadow-sm p-xl flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (() => {
            const kpi = getInventoryKPIs();
            return (
              <div className="space-y-md max-h-[700px] overflow-y-auto pr-xs">
                {/* 1. Total Inventory Valuation */}
                <div className="bg-white p-lg rounded border-l-4 border-slate-800 border-y border-r border-slate-200 shadow-xs flex items-start gap-md">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                  </div>
                  <div className="space-y-xs min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Inventory Valuation</p>
                    <p className="font-black text-slate-900 text-body-md">{formatCurrency(kpi.totalInvValue)}</p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{kpi.totalStockUnits.toLocaleString()} total units in stock</p>
                  </div>
                </div>

                {/* 2. Stockout Risk Index */}
                <div className="bg-white p-lg rounded border-l-4 border-orange-500 border-y border-r border-slate-200 shadow-xs flex items-start gap-md">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">crisis_alert</span>
                  </div>
                  <div className="space-y-xs min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stockout Risk Index</p>
                    <p className="font-black text-slate-900 text-body-md">{kpi.stockoutRisk}%</p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{kpi.lowStockCount} items below safety limits</p>
                  </div>
                </div>

                {/* 3. Top Selling Product */}
                <div className="bg-white p-lg rounded border-l-4 border-green-500 border-y border-r border-slate-200 shadow-xs flex items-start gap-md">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">trending_up</span>
                  </div>
                  <div className="space-y-xs min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Selling Product</p>
                    {kpi.topSelling ? (
                      <>
                        <p className="font-extrabold text-slate-900 text-body-sm truncate">{kpi.topSelling.name}</p>
                        <div className="flex items-center gap-xs text-xs font-semibold text-slate-500 mt-0.5">
                          <span className="text-green-700 font-bold bg-green-50 px-sm py-0.5 rounded">{formatCurrency(kpi.topSelling.revenue)}</span>
                          <span>•</span>
                          <span>{kpi.topSelling.qty} units sold</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium italic">No sales recorded yet</p>
                    )}
                  </div>
                </div>

                {/* 4. Most Ordered Product */}
                <div className="bg-white p-lg rounded border-l-4 border-blue-500 border-y border-r border-slate-200 shadow-xs flex items-start gap-md">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                  </div>
                  <div className="space-y-xs min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Most Ordered Product</p>
                    {kpi.mostOrdered ? (
                      <>
                        <p className="font-extrabold text-slate-900 text-body-sm truncate">{kpi.mostOrdered.name}</p>
                        <div className="flex items-center gap-xs text-xs font-semibold text-slate-500 mt-0.5">
                          <span className="text-blue-700 font-bold bg-blue-50 px-sm py-0.5 rounded">{kpi.mostOrdered.qty} units sold</span>
                          <span>•</span>
                          <span>In {kpi.mostOrdered.orderCount} orders</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium italic">No sales recorded yet</p>
                    )}
                  </div>
                </div>

                {/* 5. Top Category */}
                <div className="bg-white p-lg rounded border-l-4 border-indigo-500 border-y border-r border-slate-200 shadow-xs flex items-start gap-md">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">category</span>
                  </div>
                  <div className="space-y-xs min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Performing Category</p>
                    {kpi.topCategory.revenue > 0 ? (
                      <>
                        <p className="font-extrabold text-slate-900 text-body-sm truncate">{kpi.topCategory.name}</p>
                        <div className="flex items-center gap-xs text-xs font-semibold text-slate-500 mt-0.5">
                          <span className="text-indigo-700 font-bold bg-indigo-50 px-sm py-0.5 rounded">{formatCurrency(kpi.topCategory.revenue)}</span>
                          <span>revenue generated</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium italic">No sales recorded yet</p>
                    )}
                  </div>
                </div>

                {/* 6. Low Selling Product */}
                <div className="bg-white p-lg rounded border-l-4 border-amber-500 border-y border-r border-slate-200 shadow-xs flex items-start gap-md">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">trending_down</span>
                  </div>
                  <div className="space-y-xs min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Selling / Dead Stock</p>
                    {kpi.lowSelling ? (
                      <>
                        <p className="font-extrabold text-slate-900 text-body-sm truncate">{kpi.lowSelling.name}</p>
                        <div className="flex items-center gap-xs text-xs font-semibold text-slate-500 mt-0.5">
                          <span className="text-amber-700 font-bold bg-amber-50 px-sm py-0.5 rounded">{kpi.lowSelling.qty} sold</span>
                          <span>•</span>
                          <span>{formatCurrency(kpi.lowSelling.revenue)} revenue</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium italic">No active products in catalog</p>
                    )}
                  </div>
                </div>

                {/* 7. Top Cross selling product */}
                <div className="bg-white p-lg rounded border-l-4 border-purple-500 border-y border-r border-slate-200 shadow-xs flex items-start gap-md">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">join_inner</span>
                  </div>
                  <div className="space-y-xs min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Cross-Selling Combo</p>
                    {kpi.topCrossSelling ? (
                      <>
                        <p className="font-extrabold text-slate-900 text-body-sm leading-snug">
                          {kpi.topCrossSelling.nameA} <br/>
                          <span className="text-slate-400 font-medium text-xs">+ {kpi.topCrossSelling.nameB}</span>
                        </p>
                        <div className="flex items-center gap-xs text-xs font-semibold text-slate-500 mt-0.5">
                          <span className="text-purple-700 font-bold bg-purple-50 px-sm py-0.5 rounded">Ordered {kpi.topCrossSelling.count} times together</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium italic">No multi-item orders yet</p>
                    )}
                  </div>
                </div>

                {/* 8. Low stock products */}
                <div className="bg-white p-lg rounded border-l-4 border-red-500 border-y border-r border-slate-200 shadow-xs flex items-start gap-md">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">production_quantity_limits</span>
                  </div>
                  <div className="space-y-xs min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Products Alert</p>
                    <p className="font-extrabold text-slate-900 text-body-sm">
                      {kpi.lowStockCount} items below safety limits
                    </p>
                    <div className="flex items-center gap-xs text-xs font-semibold text-slate-500 mt-0.5">
                      <span className={`font-bold px-sm py-0.5 rounded ${
                        kpi.lowStockCount > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {kpi.lowStockCount > 0 ? 'Action Required' : 'All Clear'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
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

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Stock Adjustments"
        fields={inventoryImportFields}
        templateFileName="stock_adjustments_template.csv"
        onImportRow={handleImportAdjustmentRow}
        onSuccess={(msg) => {
          setSuccess(msg);
          fetchData();
        }}
      />
    </div>
  );
};
