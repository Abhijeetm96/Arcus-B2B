import React, { useEffect, useState } from 'react';
import type { Product, PriceTier, Category } from './types';

export const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Bulk Operations State
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkMoq, setBulkMoq] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeEditorTab, setActiveEditorTab] = useState<'basic' | 'pricing' | 'specs' | 'accessories'>('basic');

  // Forms
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);
  const [specifications, setSpecifications] = useState<Array<{ key: string; value: string }>>([]);
  const [recommendedAccessories, setRecommendedAccessories] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);

  // Temp Inputs
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');
  const [newTierMin, setNewTierMin] = useState('');
  const [newTierMax, setNewTierMax] = useState('');
  const [newTierPrice, setNewTierPrice] = useState('');
  const [newAccessoryId, setNewAccessoryId] = useState('');


  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('arcus_token');
      
      // Fetch all products (including archived)
      const prodRes = await fetch('http://localhost:5000/api/admin/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!prodRes.ok) throw new Error('Failed to load products');
      const prodData = await prodRes.json();
      
      // Flatten products categories grouping
      const flatProducts: Product[] = [];
      if (Array.isArray(prodData)) {
        if (prodData.length > 0 && 'products' in prodData[0] && Array.isArray((prodData[0] as any).products)) {
          // If backend returns formatted categories with nested products: [{ title: 'Plumbing', products: [...] }]
          prodData.forEach((cat: any) => {
            if (cat.products && Array.isArray(cat.products)) {
              cat.products.forEach((p: any) => {
                if (!flatProducts.some(fp => fp.id === p.id)) {
                  flatProducts.push({
                    ...p,
                    categoryId: p.categoryId || cat.title.toLowerCase(),
                    categoryTitle: p.categoryTitle || cat.title,
                    price: typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/[^\d.]/g, '')) || 0
                  });
                }
              });
            }
          });
          setProducts(flatProducts);
        } else {
          // If the backend returns Product[]
          setProducts(prodData);
        }
      } else if (prodData && typeof prodData === 'object') {
        // If it's an object with category keys
        Object.entries(prodData).forEach(([catKey, val]: [string, any]) => {
          const prods = Array.isArray(val) ? val : (val && Array.isArray((val as any).products) ? (val as any).products : []);
          prods.forEach((p: any) => {
            if (!flatProducts.some(fp => fp.id === p.id)) {
              flatProducts.push({
                ...p,
                categoryId: p.categoryId || catKey,
                categoryTitle: p.categoryTitle || catKey,
                price: typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/[^\d.]/g, '')) || 0
              });
            }
          });
        });
        setProducts(flatProducts);
      }

      // Fetch categories
      const catRes = await fetch('http://localhost:5000/api/admin/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const openAddEditor = () => {
    setEditingProduct(null);
    setProductForm({
      id: `prod_${Date.now()}`,
      productId: `prod_${Date.now()}`,
      name: '',
      brand: '',
      model: '',
      sku: '',
      categoryId: categories[0]?.id || 'plumbing',
      price: 0,
      unitOfMeasure: 'Piece',
      minimumOrderQuantity: 1,
      minimumOrderUnit: 'Piece',
      orderMultiple: 1,
      allowB2B: true,
      allowB2C: true,
      status: 'ACTIVE',
      description: '',
      leadTimeDays: 3,
      hsnCode: '',
      gstRate: 18,
      procurementPrice: 0,
      vendorName: '',
      vendorProductCode: ''
    });
    setPriceTiers([]);
    setSpecifications([]);
    setRecommendedAccessories([]);
    setImages(['/pdp_cpvc_pipe_main.png']);
    setActiveEditorTab('basic');
    setIsEditorOpen(true);
  };

  const openEditEditor = (p: Product) => {
    setEditingProduct(p);
    setProductForm({ ...p });
    setPriceTiers(p.priceTiers || []);
    
    // Map specifications object to array
    const specsArr = Object.entries(p.specifications || {}).map(([key, value]) => ({ key, value }));
    setSpecifications(specsArr);
    
    setRecommendedAccessories(p.recommendedAccessories || []);
    setImages(p.images && p.images.length > 0 ? p.images : ['/pdp_cpvc_pipe_main.png']);
    setActiveEditorTab('basic');
    setIsEditorOpen(true);
  };

  const handleArchiveProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to archive product "${name}"? Archived products will be hidden from public views but preserved in database.`)) return;
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch(`http://localhost:5000/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to archive product');
      setSuccess(`Product "${name}" archived successfully.`);
      fetchCatalog();
    } catch (err: any) {
      setError(err.message || 'Error archiving product');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('arcus_token');
      const url = editingProduct
        ? `http://localhost:5000/api/admin/products/${editingProduct.id}`
        : 'http://localhost:5000/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      // Reassemble specs
      const specsObj: Record<string, string> = {};
      specifications.forEach(s => {
        if (s.key.trim()) specsObj[s.key.trim()] = s.value;
      });

      const body = {
        ...productForm,
        priceTiers,
        specifications: specsObj,
        recommendedAccessories,
        images,
        price: Number(productForm.price),
        minimumOrderQuantity: Number(productForm.minimumOrderQuantity || 1),
        orderMultiple: Number(productForm.orderMultiple || 1),
        leadTimeDays: Number(productForm.leadTimeDays || 3),
        gstRate: Number(productForm.gstRate || 18),
        procurementPrice: productForm.procurementPrice !== undefined ? Number(productForm.procurementPrice) : undefined,
        inventory: editingProduct ? undefined : {
          available: Number(productForm.inventory?.available || 100),
          reserved: 0,
          reorderLevel: Number(productForm.inventory?.reorderLevel || 10)
        }
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      setSuccess(`Product "${body.name}" saved successfully!`);
      setIsEditorOpen(false);
      fetchCatalog();
    } catch (err: any) {
      setError(err.message || 'Error saving product');
    }
  };

  // Specification Helpers
  const addSpec = () => {
    if (!newSpecKey.trim() || !newSpecVal.trim()) return;
    setSpecifications([...specifications, { key: newSpecKey.trim(), value: newSpecVal }]);
    setNewSpecKey('');
    setNewSpecVal('');
  };

  const removeSpec = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  // Pricing Tier Helpers
  const addPriceTier = () => {
    if (!newTierMin.trim() || !newTierPrice.trim()) return;
    const minVal = parseInt(newTierMin, 10);
    const maxVal = newTierMax.trim() ? parseInt(newTierMax, 10) : 999999;
    const priceVal = parseFloat(newTierPrice);
    
    // Save calculation
    const basePrice = Number(productForm.price || 0);
    const savePct = basePrice > 0 ? Math.round(((basePrice - priceVal) / basePrice) * 100) : 0;

    setPriceTiers([...priceTiers, { min: minVal, max: maxVal, price: priceVal, save: savePct }]);
    setNewTierMin('');
    setNewTierMax('');
    setNewTierPrice('');
  };

  const removePriceTier = (index: number) => {
    setPriceTiers(priceTiers.filter((_, i) => i !== index));
  };

  // Accessory Helpers
  const addAccessory = () => {
    if (!newAccessoryId.trim()) return;
    setRecommendedAccessories([...recommendedAccessories, newAccessoryId.trim()]);
    setNewAccessoryId('');
  };

  const removeAccessory = (index: number) => {
    setRecommendedAccessories(recommendedAccessories.filter((_, i) => i !== index));
  };

  // Filter Catalog
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.sku.toLowerCase().includes(search.toLowerCase()) ||
                        (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));
    
    const matchCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchSearch && matchCategory && matchStatus;
  });

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedProductIds(prev => {
      if (prev.size === filteredProducts.length) {
        return new Set();
      } else {
        return new Set(filteredProducts.map(p => p.id));
      }
    });
  };

  const handleBulkAction = async (action: 'status' | 'moq' | 'export', value?: string) => {
    if (action === 'export') {
      try {
        const token = localStorage.getItem('arcus_token');
        const res = await fetch(`http://localhost:5000/api/admin/catalog/export?format=xlsx`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Bulk export failed');
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `arcus_catalog_export_bulk.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        setSuccess(`Exported selected products.`);
      } catch (err: any) {
        setError(err.message || 'Export failed.');
      }
      return;
    }

    setIsBulkUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch('http://localhost:5000/api/admin/catalog/bulk-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productIds: Array.from(selectedProductIds),
          action,
          value
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to apply bulk actions.');

      setSuccess(`Successfully updated ${selectedProductIds.size} products.`);
      setSelectedProductIds(new Set());
      setBulkStatus('');
      setBulkMoq('');
      fetchCatalog();
    } catch (err: any) {
      setError(err.message || 'Bulk action failed.');
    } finally {
      setIsBulkUpdating(false);
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

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md bg-white p-md rounded border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-sm w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] md:max-w-xs">
            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search product name, SKU, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-xxl pr-md border border-slate-200 rounded text-body-sm focus:border-primary focus:ring-0 bg-slate-50"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-11 px-md border border-slate-200 rounded text-body-sm bg-slate-50 focus:border-primary focus:ring-0 font-bold"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-md border border-slate-200 rounded text-body-sm bg-slate-50 focus:border-primary focus:ring-0 font-bold"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="COMING_SOON">Coming Soon</option>
            <option value="DISCONTINUED">Discontinued</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Add Product Button */}
        <button
          onClick={openAddEditor}
          className="flex items-center gap-xs bg-primary-container text-on-primary-container hover:bg-[#fabd00] px-lg h-11 rounded font-bold text-xs transition-all shadow-sm w-full md:w-auto justify-center"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add New Product
        </button>
      </div>

      {/* Catalog Table */}
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
                  <th className="px-md py-md w-12 text-center">
                    <input
                      type="checkbox"
                      checked={filteredProducts.length > 0 && selectedProductIds.size === filteredProducts.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="px-lg py-md">Product details</th>
                  <th className="px-lg py-md">SKU</th>
                  <th className="px-lg py-md">Category</th>
                  <th className="px-lg py-md">Selling Price</th>
                  <th className="px-lg py-md">MOQ details</th>
                  <th className="px-lg py-md">Status</th>
                  <th className="px-lg py-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(p => (
                  <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${p.status === 'ARCHIVED' ? 'bg-slate-100/40 text-slate-400' : ''}`}>
                    <td className="px-md py-md text-center">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.has(p.id)}
                        onChange={() => toggleSelectProduct(p.id)}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-lg py-md">
                      <div className="flex items-center gap-md">
                        <img
                          src={p.images?.[0] || '/pdp_cpvc_pipe_main.png'}
                          alt={p.name}
                          className="w-12 h-12 object-contain border border-slate-100 rounded p-0.5 bg-white"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-body-sm">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{p.brand || 'Generic'} • {p.model || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-lg py-md text-slate-500 font-mono text-xs">{p.sku}</td>
                    <td className="px-lg py-md font-semibold text-slate-500 capitalize">{p.categoryTitle || p.categoryId}</td>
                    <td className="px-lg py-md font-bold text-slate-950">₹{p.price.toLocaleString('en-IN')}<span className="text-[10px] font-medium text-slate-400"> / {p.unitOfMeasure}</span></td>
                    <td className="px-lg py-md text-slate-500 text-xs">
                      <div>Min: {p.minimumOrderQuantity} {p.minimumOrderUnit}</div>
                      <div className="text-[10px] italic">Pack of {p.orderMultiple || 1}</div>
                    </td>
                    <td className="px-lg py-md">
                      <span className={`text-[10px] font-bold px-md py-0.5 rounded-full border ${
                        p.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' :
                        p.status === 'OUT_OF_STOCK' ? 'bg-red-50 text-red-700 border-red-200' :
                        p.status === 'ARCHIVED' ? 'bg-slate-100 text-slate-500 border-slate-300' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-lg py-md text-right">
                      <div className="flex gap-sm justify-end">
                        <button
                          onClick={() => openEditEditor(p)}
                          className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        {p.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => handleArchiveProduct(p.id, p.name)}
                            className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:bg-red-50 text-slate-600 hover:text-red-600"
                            title="Archive Product"
                          >
                            <span className="material-symbols-outlined text-[16px]">archive</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-xl text-slate-400 font-semibold">
                      No products found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating Bulk Operations Bar */}
      {selectedProductIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-lg py-md rounded shadow flex flex-wrap items-center gap-md z-40 border border-slate-800 animate-slide-up">
          <div className="flex items-center gap-xs border-r border-slate-800 pr-md">
            <span className="material-symbols-outlined text-primary">check_box</span>
            <span className="font-extrabold text-sm">{selectedProductIds.size} Products Selected</span>
          </div>

          <div className="flex items-center gap-md flex-wrap">
            {/* Status dropdown */}
            <div className="flex items-center gap-xs">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wide">Status:</span>
              <select
                value={bulkStatus}
                onChange={e => {
                  setBulkStatus(e.target.value);
                  if (e.target.value) handleBulkAction('status', e.target.value);
                }}
                disabled={isBulkUpdating}
                className="bg-slate-800 border border-slate-700 text-white rounded text-xs h-9 px-sm focus:ring-primary focus:border-primary font-bold"
              >
                <option value="">Choose...</option>
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="COMING_SOON">Coming Soon</option>
                <option value="DISCONTINUED">Discontinued</option>
                <option value="RFQ_ONLY">RFQ Only</option>
              </select>
            </div>

            {/* MOQ update input */}
            <div className="flex items-center gap-xs">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wide">MOQ:</span>
              <input
                type="number"
                placeholder="Qty"
                value={bulkMoq}
                onChange={e => setBulkMoq(e.target.value)}
                disabled={isBulkUpdating}
                className="w-16 bg-slate-800 border border-slate-700 text-white rounded text-xs h-9 px-sm focus:ring-primary focus:border-primary font-bold"
              />
              <button
                onClick={() => {
                  if (bulkMoq) handleBulkAction('moq', bulkMoq);
                }}
                disabled={isBulkUpdating || !bulkMoq}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-sm h-9 rounded text-xs font-bold"
              >
                Apply
              </button>
            </div>

            {/* Export Selected */}
            <button
              onClick={() => handleBulkAction('export')}
              disabled={isBulkUpdating}
              className="flex items-center gap-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-md h-9 rounded text-xs font-bold"
            >
              <span className="material-symbols-outlined text-[14px]">download</span>
              Export
            </button>

            {/* Clear Selection */}
            <button
              onClick={() => setSelectedProductIds(new Set())}
              disabled={isBulkUpdating}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Editor Sidebar Drawer Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="px-lg py-md border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 text-headline-h6">
                  {editingProduct ? `Edit: ${editingProduct.name}` : 'Add Catalog Product'}
                </h3>
                <p className="text-xs text-slate-400 font-medium">Standardized ARCUS B2B/B2C specifications</p>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/50 px-lg">
              {(['basic', 'pricing', 'specs', 'accessories'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveEditorTab(tab)}
                  className={`px-md py-sm font-bold text-xs uppercase tracking-wider border-b-2 transition-all capitalize ${
                    activeEditorTab === tab 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Form Content */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-lg space-y-md">
              {activeEditorTab === 'basic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={productForm.name || ''}
                      onChange={e => {
                        const name = e.target.value;
                        const updates: Partial<Product> = { name };
                        if (!editingProduct) {
                          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                          updates.productId = slug;
                          updates.id = slug;
                          
                          const brandPrefix = (productForm.brand || 'ARC').substring(0, 3).toUpperCase();
                          const nameClean = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
                          updates.sku = `${brandPrefix}-${nameClean}-${Math.floor(100 + Math.random() * 900)}`;
                          
                          // Smart defaults based on keyword matches
                          const lowerName = name.toLowerCase();
                          if (lowerName.includes('cement')) {
                            updates.categoryId = 'cement';
                            updates.gstRate = 28;
                            updates.minimumOrderQuantity = 50;
                            updates.minimumOrderUnit = 'Bag';
                            updates.orderMultiple = 10;
                          } else if (lowerName.includes('pipe') || lowerName.includes('elbow') || lowerName.includes('valve') || lowerName.includes('tee')) {
                            updates.categoryId = 'plumbing';
                            updates.gstRate = 18;
                            updates.minimumOrderQuantity = 10;
                            updates.minimumOrderUnit = 'Piece';
                            updates.orderMultiple = 5;
                          } else if (lowerName.includes('wire') || lowerName.includes('cable') || lowerName.includes('switch') || lowerName.includes('mcb')) {
                            updates.categoryId = 'electrical';
                            updates.gstRate = 18;
                            updates.minimumOrderQuantity = 5;
                            updates.minimumOrderUnit = 'Piece';
                          } else if (lowerName.includes('paint') || lowerName.includes('solvent')) {
                            updates.categoryId = 'paints';
                            updates.gstRate = 18;
                            updates.minimumOrderQuantity = 2;
                            updates.minimumOrderUnit = 'Litre';
                          } else if (lowerName.includes('steel') || lowerName.includes('rebar') || lowerName.includes('rod')) {
                            updates.categoryId = 'steel';
                            updates.gstRate = 18;
                            updates.minimumOrderQuantity = 10;
                            updates.minimumOrderUnit = 'Piece';
                          }
                        }
                        setProductForm(prev => ({ ...prev, ...updates }));
                      }}
                      className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Brand *</label>
                    <input
                      type="text"
                      required
                      value={productForm.brand || ''}
                      onChange={e => {
                        const brand = e.target.value;
                        const updates: Partial<Product> = { brand };
                        if (!editingProduct && productForm.name) {
                          const brandPrefix = brand.substring(0, 3).toUpperCase();
                          const nameClean = productForm.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
                          updates.sku = `${brandPrefix}-${nameClean}-${Math.floor(100 + Math.random() * 900)}`;
                        }
                        setProductForm(prev => ({ ...prev, ...updates }));
                      }}
                      className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Model *</label>
                    <input
                      type="text"
                      required
                      value={productForm.model || ''}
                      onChange={e => setProductForm({ ...productForm, model: e.target.value })}
                      className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">SKU * (Auto-generated)</label>
                    <input
                      type="text"
                      required
                      value={productForm.sku || ''}
                      onChange={e => setProductForm({ ...productForm, sku: e.target.value })}
                      className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Product ID / Slug (Auto-generated)</label>
                    <input
                      type="text"
                      required
                      value={productForm.productId || ''}
                      onChange={e => setProductForm({ ...productForm, productId: e.target.value, id: e.target.value })}
                      className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Category *</label>
                    <select
                      value={productForm.categoryId || ''}
                      onChange={e => {
                        const catId = e.target.value;
                        const updates: Partial<Product> = { categoryId: catId };
                        // Category based smart defaults
                        if (!editingProduct) {
                          if (catId === 'cement') {
                            updates.gstRate = 28;
                            updates.minimumOrderQuantity = 50;
                            updates.minimumOrderUnit = 'Bag';
                            updates.orderMultiple = 10;
                          } else if (catId === 'plumbing') {
                            updates.gstRate = 18;
                            updates.minimumOrderQuantity = 10;
                            updates.minimumOrderUnit = 'Piece';
                            updates.orderMultiple = 5;
                          } else {
                            updates.gstRate = 18;
                            updates.minimumOrderQuantity = 1;
                            updates.minimumOrderUnit = 'Piece';
                            updates.orderMultiple = 1;
                          }
                        }
                        setProductForm(prev => ({ ...prev, ...updates }));
                      }}
                      className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">HSN Code</label>
                    <input
                      type="text"
                      value={productForm.hsnCode || ''}
                      onChange={e => setProductForm({ ...productForm, hsnCode: e.target.value })}
                      className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">GST Rate (%)</label>
                    <input
                      type="number"
                      value={productForm.gstRate || 18}
                      onChange={e => setProductForm({ ...productForm, gstRate: Number(e.target.value) })}
                      className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Description</label>
                    <textarea
                      value={productForm.description || ''}
                      onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                      rows={3}
                      className="w-full p-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm"
                    />
                  </div>

                  {/* Initial stock setup for new products */}
                  {!editingProduct && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Initial Stock Available</label>
                        <input
                          type="number"
                          onChange={e => setProductForm({
                            ...productForm,
                            inventory: {
                              available: Number(e.target.value),
                              reserved: 0,
                              reorderLevel: Number(productForm.inventory?.reorderLevel || 10)
                            }
                          })}
                          placeholder="100"
                          className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Reorder Alert Level</label>
                        <input
                          type="number"
                          onChange={e => setProductForm({
                            ...productForm,
                            inventory: {
                              available: Number(productForm.inventory?.available || 100),
                              reserved: 0,
                              reorderLevel: Number(e.target.value)
                            }
                          })}
                          placeholder="10"
                          className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Product Status</label>
                    <select
                      value={productForm.status || 'ACTIVE'}
                      onChange={e => setProductForm({ ...productForm, status: e.target.value as any })}
                      className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="OUT_OF_STOCK">Out of Stock</option>
                      <option value="COMING_SOON">Coming Soon</option>
                      <option value="DISCONTINUED">Discontinued</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>

                  {/* B2B / B2C Access */}
                  <div className="flex items-center gap-lg mt-md">
                    <label className="flex items-center gap-xs text-body-sm font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={productForm.allowB2B !== false}
                        onChange={e => setProductForm({ ...productForm, allowB2B: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      Allow B2B
                    </label>
                    <label className="flex items-center gap-xs text-body-sm font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={productForm.allowB2C !== false}
                        onChange={e => setProductForm({ ...productForm, allowB2C: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      Allow B2C
                    </label>
                  </div>
                </div>
              )}

              {activeEditorTab === 'pricing' && (
                <div className="space-y-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md border-b border-slate-200 pb-md">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Standard Selling Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={productForm.price || ''}
                        onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                        className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Selling Unit of Measure *</label>
                      <input
                        type="text"
                        required
                        placeholder="Piece, Meter, Box, Bag..."
                        value={productForm.unitOfMeasure || ''}
                        onChange={e => setProductForm({ ...productForm, unitOfMeasure: e.target.value })}
                        className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Minimum Order Qty (MOQ)</label>
                      <input
                        type="number"
                        value={productForm.minimumOrderQuantity || 1}
                        onChange={e => setProductForm({ ...productForm, minimumOrderQuantity: Number(e.target.value) })}
                        className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">MOQ Multiple</label>
                      <input
                        type="number"
                        value={productForm.orderMultiple || 1}
                        onChange={e => setProductForm({ ...productForm, orderMultiple: Number(e.target.value) })}
                        className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Procurement / Cost Price (₹)</label>
                      <input
                        type="number"
                        value={productForm.procurementPrice || 0}
                        onChange={e => setProductForm({ ...productForm, procurementPrice: Number(e.target.value) })}
                        className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Vendor Name</label>
                      <input
                        type="text"
                        value={productForm.vendorName || ''}
                        onChange={e => setProductForm({ ...productForm, vendorName: e.target.value })}
                        className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm"
                      />
                    </div>
                  </div>

                  {/* Price Tiers Section */}
                  <div className="space-y-sm">
                    <h4 className="font-bold text-body-sm text-slate-900">Wholesale Volume Price Tiers</h4>
                    <div className="grid grid-cols-4 gap-sm">
                      <input
                        type="number"
                        placeholder="Min Qty"
                        value={newTierMin}
                        onChange={e => setNewTierMin(e.target.value)}
                        className="h-10 px-sm border border-slate-200 rounded text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Max Qty"
                        value={newTierMax}
                        onChange={e => setNewTierMax(e.target.value)}
                        className="h-10 px-sm border border-slate-200 rounded text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Unit Price"
                        value={newTierPrice}
                        onChange={e => setNewTierPrice(e.target.value)}
                        className="h-10 px-sm border border-slate-200 rounded text-xs"
                      />
                      <button
                        type="button"
                        onClick={addPriceTier}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 h-10 rounded font-bold text-xs"
                      >
                        Add Tier
                      </button>
                    </div>

                    {/* Price Tiers List */}
                    <div className="space-y-xs pt-xs">
                      {priceTiers.map((t, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-sm rounded border border-slate-100 text-xs font-semibold">
                          <div>
                            Qty {t.min} - {t.max === 999999 ? '∞' : t.max} • <span className="text-primary font-bold">₹{t.price}</span> (Save {t.save}%)
                          </div>
                          <button
                            type="button"
                            onClick={() => removePriceTier(idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeEditorTab === 'specs' && (
                <div className="space-y-md">
                  <h4 className="font-bold text-body-sm text-slate-900 border-b border-slate-100 pb-xs">Technical Specifications</h4>
                  <div className="flex gap-sm">
                    <input
                      type="text"
                      placeholder="Spec Key (e.g., Material)"
                      value={newSpecKey}
                      onChange={e => setNewSpecKey(e.target.value)}
                      className="flex-1 h-10 px-sm border border-slate-200 rounded text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g., CPVC)"
                      value={newSpecVal}
                      onChange={e => setNewSpecVal(e.target.value)}
                      className="flex-1 h-10 px-sm border border-slate-200 rounded text-xs"
                    />
                    <button
                      type="button"
                      onClick={addSpec}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 h-10 px-md rounded font-bold text-xs"
                    >
                      Add Spec
                    </button>
                  </div>

                  <div className="space-y-xs pt-xs">
                    {specifications.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-sm rounded border border-slate-100 text-xs">
                        <div>
                          <span className="font-bold text-slate-500">{s.key}:</span> <span className="font-semibold text-slate-800">{s.value}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSpec(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeEditorTab === 'accessories' && (
                <div className="space-y-md">
                  <h4 className="font-bold text-body-sm text-slate-900 border-b border-slate-100 pb-xs">Cross-Sell Accessories</h4>
                  <div className="flex gap-sm">
                    <input
                      type="text"
                      placeholder="Accessory Product ID (e.g., cpvc-solvent-cement)"
                      value={newAccessoryId}
                      onChange={e => setNewAccessoryId(e.target.value)}
                      className="flex-1 h-10 px-sm border border-slate-200 rounded text-xs"
                    />
                    <button
                      type="button"
                      onClick={addAccessory}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 h-10 px-md rounded font-bold text-xs"
                    >
                      Add ID
                    </button>
                  </div>

                  <div className="space-y-xs pt-xs">
                    {recommendedAccessories.map((aId, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-sm rounded border border-slate-100 text-xs font-mono">
                        <span>{aId}</span>
                        <button
                          type="button"
                          onClick={() => removeAccessory(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="px-lg py-md border-t border-slate-200 bg-slate-50 flex justify-end gap-sm">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-lg h-11 border border-slate-200 hover:border-slate-800 rounded font-bold text-xs text-slate-600 hover:text-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProduct}
                className="bg-primary-container text-on-primary-container hover:bg-[#fabd00] px-xl h-11 rounded font-bold text-xs transition-all shadow-sm"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
