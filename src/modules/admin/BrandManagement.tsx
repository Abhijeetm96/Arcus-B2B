import React, { useEffect, useState } from 'react';
import type { Brand } from './types';
import { apiFetch } from '../../lib/api';




export const BrandManagement: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [form, setForm] = useState<Partial<Brand>>({});
  const [deleteConfirmBrand, setDeleteConfirmBrand] = useState<Brand | null>(null);
  const [transferTargetBrandId, setTransferTargetBrandId] = useState<string>('');
  const [shouldTransferBrand, setShouldTransferBrand] = useState<boolean>(true);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await apiFetch('/admin/brands', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load brands.');
      const data = await res.json();
      setBrands(data);
    } catch (err: any) {
      setError(err.message || 'Error loading brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openAddModal = () => {
    setEditingBrand(null);
    setForm({ id: '', name: '', logo: '', description: '', status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setForm({ ...brand });
    setIsModalOpen(true);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('arcus_token');
      const method = editingBrand ? 'PUT' : 'POST';
      const url = editingBrand 
        ? `/api/admin/brands/${editingBrand.id}` 
        : '/api/admin/brands';

      const res = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save brand.');

      setSuccess(`Brand "${form.name}" saved successfully!`);
      setIsModalOpen(false);
      fetchBrands();
    } catch (err: any) {
      setError(err.message || 'Error saving brand.');
    }
  };

  const confirmArchiveBrand = async () => {
    if (!deleteConfirmBrand) return;
    const { id, name } = deleteConfirmBrand;
    console.log('confirmArchiveBrand triggered for:', id, name);
    
    let url = `/admin/brands/${id}`;
    const productCount = parseInt((deleteConfirmBrand.count || '').replace(/[^0-9]/g, ''), 10) || 0;
    if (productCount > 0 && shouldTransferBrand && transferTargetBrandId) {
      url += `?transferTo=${encodeURIComponent(transferTargetBrandId)}`;
    }
    
    setDeleteConfirmBrand(null);
    setTransferTargetBrandId('');
    setShouldTransferBrand(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('arcus_token');
      console.log(`Sending DELETE request to ${url}...`);
      const res = await apiFetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`DELETE request returned status: ${res.status}`);
      if (!res.ok) {
        const data = await res.json();
        console.error('Server rejected brand archive:', data);
        throw new Error(data.error || 'Failed to archive brand.');
      }
      console.log('Brand archived successfully on server.');
      setSuccess(`Brand "${name}" archived successfully.`);
      fetchBrands();
    } catch (err: any) {
      console.error('Error in handleArchiveBrand:', err);
      setError(err.message || 'Error archiving brand.');
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

      {/* Header Panel */}
      <div className="flex justify-between items-center bg-white p-md rounded border border-slate-200 shadow-sm">
        <div>
          <h4 className="font-extrabold text-slate-900 text-body-md">Manufacturer Brands Hub</h4>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage brand metadata linked to platform products</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-xs bg-primary-container text-on-primary-container hover:bg-[#fabd00] px-lg h-11 rounded font-bold text-xs transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Brand Entity
        </button>
      </div>

      {/* Brands Table */}
      {loading ? (
        <div className="flex justify-center py-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm max-w-4xl">
          <table className="w-full text-body-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-lg py-md">Brand Details</th>
                <th className="px-lg py-md">Brand ID</th>
                <th className="px-lg py-md">Description</th>
                <th className="px-lg py-md">Products</th>
                <th className="px-lg py-md">Status</th>
                <th className="px-lg py-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {brands.map(b => (
                <tr key={b.id} className={`hover:bg-slate-50/50 transition-colors ${b.status === 'ARCHIVED' ? 'bg-slate-100/40 text-slate-400' : ''}`}>
                  <td className="px-lg py-md font-bold text-slate-900">
                    <div className="flex items-center gap-sm">
                      <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-400 text-xs">
                        {b.name.substring(0, 2).toUpperCase()}
                      </div>
                      {b.name}
                    </div>
                  </td>
                  <td className="px-lg py-md text-slate-500 font-mono text-xs">{b.id}</td>
                  <td className="px-lg py-md text-slate-500 font-medium">{b.description || 'N/A'}</td>
                  <td className="px-lg py-md text-slate-500 font-semibold">{b.count || '0 products'}</td>
                  <td className="px-lg py-md">
                    <span className={`text-[10px] font-bold px-md py-0.5 rounded-full border ${
                      b.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-300'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-lg py-md text-right">
                    <div className="flex gap-sm justify-end">
                      <button
                        onClick={() => openEditModal(b)}
                        className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                        title="Edit Brand"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      {b.status !== 'ARCHIVED' && (
                        <button
                          onClick={() => setDeleteConfirmBrand(b)}
                          className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:bg-red-50 text-slate-600 hover:text-red-600"
                          title="Archive Brand"
                        >
                          <span className="material-symbols-outlined text-[16px]">archive</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {brands.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-xl text-slate-400 font-semibold">
                    No brands found in system database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
          <div className="w-full max-w-md bg-white rounded shadow overflow-hidden">
            <div className="px-lg py-md border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 text-body-md">
                {editingBrand ? 'Edit Brand Properties' : 'Create Brand Entity'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="p-lg space-y-md">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Brand slug / ID *</label>
                <input
                  type="text"
                  required
                  disabled={!!editingBrand}
                  placeholder="e.g. jaquar"
                  value={form.id || ''}
                  onChange={e => setForm({ ...form, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                  className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jaquar"
                  value={form.name || ''}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Logo Image URI</label>
                <input
                  type="text"
                  placeholder="e.g. /brands_jaquar.png"
                  value={form.logo || ''}
                  onChange={e => setForm({ ...form, logo: e.target.value })}
                  className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Bath fittings and premium showers"
                  value={form.description || ''}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Status</label>
                <select
                  value={form.status || 'ACTIVE'}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div className="flex justify-end gap-sm pt-md border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-lg h-11 border border-slate-200 hover:border-slate-800 rounded font-bold text-xs text-slate-600 hover:text-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-container text-on-primary-container hover:bg-[#fabd00] px-xl h-11 rounded font-bold text-xs transition-all shadow-sm"
                >
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete/Archive Confirmation Modal */}
      {deleteConfirmBrand && (() => {
        const productCount = parseInt((deleteConfirmBrand.count || '').replace(/[^0-9]/g, ''), 10) || 0;
        const otherBrands = brands.filter(b => b.id !== deleteConfirmBrand.id && b.status !== 'ARCHIVED');
        const isDeleteDisabled = productCount > 0 && shouldTransferBrand && !transferTargetBrandId;

        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-md">
            <div className="bg-white rounded shadow-lg border border-slate-200 w-full max-w-md overflow-hidden transform transition-all scale-100 flex flex-col">
              <div className="p-xl flex gap-md items-start">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                  <span className="material-symbols-outlined text-[24px]">warning</span>
                </div>
                <div className="space-y-sm text-left flex-1">
                  <h3 className="font-extrabold text-slate-900 text-body-md">Archive Brand Confirmation</h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Are you sure you want to archive the brand <span className="font-bold text-slate-800">"{deleteConfirmBrand.name}"</span>?
                    This will set its status to archived.
                  </p>

                  {productCount > 0 && (
                    <div className="mt-md p-md bg-amber-50 rounded border border-amber-200 text-left space-y-sm">
                      <p className="text-xs font-bold text-amber-800 flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[16px]">warning</span>
                        Contains {productCount} Active Products
                      </p>
                      
                      <div className="space-y-xs pt-xs">
                        <label className="flex items-center gap-xs text-[11px] font-bold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="deleteBrandAction"
                            checked={shouldTransferBrand}
                            onChange={() => setShouldTransferBrand(true)}
                            className="w-3.5 h-3.5 text-amber-600 focus:ring-amber-500 border-slate-300"
                          />
                          Transfer products to another brand
                        </label>
                        <label className="flex items-center gap-xs text-[11px] font-bold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="deleteBrandAction"
                            checked={!shouldTransferBrand}
                            onChange={() => {
                              setShouldTransferBrand(false);
                              setTransferTargetBrandId('');
                            }}
                            className="w-3.5 h-3.5 text-amber-600 focus:ring-amber-500 border-slate-300"
                          />
                          Mark products as 'Generic' brand
                        </label>
                      </div>

                      {shouldTransferBrand && (
                        <div className="pt-sm">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-xs">Select Target Brand *</label>
                          <select
                            value={transferTargetBrandId}
                            onChange={e => setTransferTargetBrandId(e.target.value)}
                            required
                            className="w-full h-9 px-sm border border-slate-300 rounded text-xs bg-white focus:border-amber-500 focus:ring-0 font-bold"
                          >
                            <option value="">-- Choose Brand --</option>
                            {otherBrands.map(b => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-slate-50 px-xl py-lg flex justify-end gap-md border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmBrand(null);
                    setTransferTargetBrandId('');
                    setShouldTransferBrand(true);
                  }}
                  className="px-lg h-10 rounded border border-slate-200 hover:border-slate-800 text-slate-600 hover:text-slate-800 font-bold text-xs cursor-pointer transition-all bg-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmArchiveBrand}
                  disabled={isDeleteDisabled}
                  className={`px-lg h-10 rounded font-bold text-xs cursor-pointer transition-all shadow-sm text-white ${
                    isDeleteDisabled 
                      ? 'bg-red-300 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Archive Brand
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
