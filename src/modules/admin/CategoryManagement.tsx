import React, { useEffect, useState } from 'react';
import type { Category } from './types';
import { apiFetch } from '../../lib/api';
import { exportToCSV } from '../../utils/csvHelpers';
import { ImportModal, type ImportField } from '../../components/ImportModal';

export const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<Partial<Category>>({});
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<Category | null>(null);
  const [transferTargetId, setTransferTargetId] = useState<string>('');
  const [shouldTransfer, setShouldTransfer] = useState<boolean>(true);

  // Import/Export State & Handlers
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const categoryImportFields: ImportField[] = [
    { label: 'Category ID', key: 'id', required: true },
    { label: 'Category Name', key: 'name', required: true },
    { label: 'Icon Code', key: 'icon' },
    { label: 'Total Products count', key: 'count' },
    { label: 'Parent ID', key: 'parentId' }
  ];

  const handleExportCategories = () => {
    const headers = [
      { label: 'Category ID', key: 'id' },
      { label: 'Category Name', key: 'name' },
      { label: 'Icon Code', key: 'icon' },
      { label: 'Total Products count', key: 'count' },
      { label: 'Parent ID', key: 'parentId' }
    ];
    exportToCSV(categories, headers, 'arcus_categories.csv');
  };

  const handleImportCategoryRow = async (row: Record<string, any>) => {
    const token = localStorage.getItem('arcus_token');
    const exists = categories.some(c => c.id === row.id);
    const method = exists ? 'PUT' : 'POST';
    const url = exists ? `/admin/categories/${row.id}` : '/admin/categories';

    const res = await apiFetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id: row.id,
        name: row.name,
        icon: row.icon || 'folder',
        count: row.count || '0 products',
        parentId: row.parentId || null
      })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || `Failed to import category ${row.name}`);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await apiFetch('/admin/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load categories.');
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Error loading categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setForm({ id: '', name: '', icon: 'folder', count: '0 products', href: '', parentId: null });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setForm({ ...cat });
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('arcus_token');
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory 
        ? `/admin/categories/${editingCategory.id}` 
        : '/admin/categories';

      const res = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save category.');

      setSuccess(`Category "${form.name}" saved successfully!`);
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Error saving category.');
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deleteConfirmCategory) return;
    const { id, name } = deleteConfirmCategory;
    console.log('confirmDeleteCategory triggered for:', id, name);
    
    let url = `/admin/categories/${id}`;
    const productCount = parseInt((deleteConfirmCategory.count || '').replace(/[^0-9]/g, ''), 10) || 0;
    if (productCount > 0 && shouldTransfer && transferTargetId) {
      url += `?transferTo=${encodeURIComponent(transferTargetId)}`;
    }
    
    setDeleteConfirmCategory(null);
    setTransferTargetId('');
    setShouldTransfer(true);
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
        console.error('Server rejected category deletion:', data);
        throw new Error(data.error || 'Failed to delete category.');
      }
      console.log('Category deleted successfully on server.');
      setSuccess(`Category "${name}" deleted successfully.`);
      fetchCategories();
    } catch (err: any) {
      console.error('Error in handleDeleteCategory:', err);
      setError(err.message || 'Error deleting category.');
    }
  };

  const getSortedCategories = () => {
    const topLevel = categories.filter(c => !c.parentId);
    const subCategories = categories.filter(c => !!c.parentId);
    
    const result: Array<Category & { isSub?: boolean; parentName?: string }> = [];
    
    topLevel.forEach(parent => {
      result.push(parent);
      const children = subCategories.filter(child => child.parentId === parent.id);
      children.forEach(child => {
        result.push({
          ...child,
          isSub: true,
          parentName: parent.name
        });
      });
    });
    
    // Append any orphaned subcategories
    subCategories.forEach(child => {
      if (!result.some(r => r.id === child.id)) {
        const parent = categories.find(p => p.id === child.parentId);
        result.push({
          ...child,
          isSub: true,
          parentName: parent ? parent.name : 'Unknown Parent'
        });
      }
    });
    
    return result;
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
          <h4 className="font-extrabold text-slate-900 text-body-md">Procurement Categories Tree</h4>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage category tree mapping for catalog browsing</p>
        </div>
        <div className="flex items-center gap-sm">
          <button
            onClick={handleExportCategories}
            className="flex items-center gap-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-md h-11 rounded font-bold text-xs transition-all shadow-xs cursor-pointer"
            title="Export Categories to CSV"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-md h-11 rounded font-bold text-xs transition-all shadow-xs cursor-pointer"
            title="Import Categories from CSV"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            Import
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-xs bg-primary text-slate-950 hover:bg-[#fabd00] px-lg h-11 rounded font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add Category
          </button>
        </div>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="flex justify-center py-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm w-full">
          <table className="w-full text-body-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-lg py-md">Category Details</th>
                <th className="px-lg py-md">Category slug / href</th>
                <th className="px-lg py-md">Icon Code</th>
                <th className="px-lg py-md">Total Products count</th>
                <th className="px-lg py-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {getSortedCategories().map(c => (
                <tr key={c.id} className={`hover:bg-slate-50/50 transition-colors ${c.isSub ? 'bg-slate-50/30' : ''}`}>
                  <td className="px-lg py-md font-bold text-slate-900">
                    <div className="flex items-center gap-sm" style={{ paddingLeft: c.isSub ? '24px' : '0px' }}>
                      {c.isSub ? (
                        <>
                          <span className="text-slate-400 font-mono select-none">↳</span>
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">{c.icon || 'folder'}</span>
                          <span className="font-semibold text-slate-700">{c.name}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-sm py-0.5 rounded-full ml-xs">Sub</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-primary text-[20px]">{c.icon || 'folder'}</span>
                          <span>{c.name}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-lg py-md text-slate-500 font-mono text-xs">{c.href || `#/materials/${c.id}`}</td>
                  <td className="px-lg py-md text-slate-500 font-mono text-xs">
                    <span className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">{c.icon}</span>
                      {c.icon || 'folder'}
                    </span>
                  </td>
                  <td className="px-lg py-md text-slate-500 font-semibold">{c.count || '0 products'}</td>
                  <td className="px-lg py-md text-right">
                    <div className="flex gap-sm justify-end">
                      <button
                        onClick={() => openEditModal(c)}
                        className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
                        title="Edit Category"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirmCategory(c)}
                        className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:bg-red-50 text-slate-600 hover:text-red-600 cursor-pointer"
                        title="Delete Category"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-xl text-slate-400 font-semibold">
                    No categories found in system database.
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
          <div className="w-full max-w-md bg-white rounded shadow overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-lg py-md border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
              <h3 className="font-extrabold text-slate-900 text-body-md">
                {editingCategory ? 'Edit Category Properties' : 'Create Category Entity'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-lg space-y-md overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Category ID *</label>
                <input
                  type="text"
                  required
                  disabled={!!editingCategory}
                  placeholder="e.g. plumbing"
                  value={form.id || ''}
                  onChange={e => setForm({ ...form, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                  className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plumbing"
                  value={form.name || ''}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Category Hierarchy *</label>
                <div className="flex gap-md mb-sm">
                  <label className="flex items-center gap-xs text-body-sm font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="catLevel"
                      checked={!form.parentId}
                      onChange={() => setForm({ ...form, parentId: null })}
                      className="w-4 h-4 text-primary focus:ring-primary border-slate-300"
                    />
                    Main Category
                  </label>
                  <label className="flex items-center gap-xs text-body-sm font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="catLevel"
                      checked={!!form.parentId}
                      onChange={() => {
                        const firstParent = categories.find(c => c.id !== form.id && !c.parentId);
                        setForm({ ...form, parentId: firstParent ? firstParent.id : '' });
                      }}
                      className="w-4 h-4 text-primary focus:ring-primary border-slate-300"
                    />
                    Sub-category
                  </label>
                </div>

                {form.parentId !== undefined && form.parentId !== null && (
                  <div className="mt-sm">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-xs">Select Parent Category *</label>
                    <select
                      value={form.parentId || ''}
                      onChange={e => setForm({ ...form, parentId: e.target.value })}
                      required
                      className="w-full h-11 px-md border border-slate-200 rounded text-body-sm bg-slate-50 focus:border-primary focus:ring-0 font-bold"
                    >
                      <option value="" disabled>-- Select Parent Category --</option>
                      {categories
                        .filter(c => c.id !== form.id && !c.parentId)
                        .map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Category Icon *</label>
                <div className="grid grid-cols-4 gap-xs border border-slate-200 rounded p-sm bg-slate-50 max-h-36 overflow-y-auto">
                  {[
                    { id: 'folder', name: 'Folder' },
                    { id: 'plumbing', name: 'Plumbing' },
                    { id: 'electrical_services', name: 'Electrical' },
                    { id: 'construction', name: 'Structural' },
                    { id: 'bolt', name: 'Power/Volt' },
                    { id: 'water_drop', name: 'Fluids/Water' },
                    { id: 'handyman', name: 'Tools/Safety' },
                    { id: 'tools', name: 'Equipment' },
                    { id: 'square_foot', name: 'Precision' },
                    { id: 'home', name: 'Roof/Brick' },
                    { id: 'format_paint', name: 'Paint/Coat' },
                    { id: 'kitchen', name: 'Appliances' },
                    { id: 'hardware', name: 'Hardware' },
                    { id: 'engineering', name: 'Engineering' },
                    { id: 'warehouse', name: 'Warehouse' },
                    { id: 'build', name: 'Build/Fix' }
                  ].map(iconOpt => (
                    <button
                      key={iconOpt.id}
                      type="button"
                      onClick={() => setForm({ ...form, icon: iconOpt.id })}
                      className={`flex flex-col items-center justify-center p-xs rounded border transition-all cursor-pointer ${
                        form.icon === iconOpt.id
                          ? 'border-primary bg-primary-container text-on-primary-container font-bold shadow-xs'
                          : 'border-transparent bg-white hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{iconOpt.id}</span>
                      <span className="text-[9px] mt-0.5 truncate max-w-full">{iconOpt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Href / Slug mapping</label>
                <input
                  type="text"
                  placeholder="e.g. #/materials/plumbing"
                  value={form.href || ''}
                  onChange={e => setForm({ ...form, href: e.target.value })}
                  className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Product count display text</label>
                <input
                  type="text"
                  placeholder="e.g. 150 products"
                  value={form.count || ''}
                  onChange={e => setForm({ ...form, count: e.target.value })}
                  className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm"
                />
              </div>

              <div className="flex justify-end gap-sm pt-md border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-lg h-11 border border-slate-200 hover:border-slate-800 rounded font-bold text-xs text-slate-600 hover:text-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-container text-on-primary-container hover:bg-[#fabd00] px-xl h-11 rounded font-bold text-xs transition-all shadow-sm cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmCategory && (() => {
        const productCount = parseInt((deleteConfirmCategory.count || '').replace(/[^0-9]/g, ''), 10) || 0;
        const otherCategories = categories.filter(c => c.id !== deleteConfirmCategory.id);
        const isDeleteDisabled = productCount > 0 && shouldTransfer && !transferTargetId;

        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-md">
            <div className="bg-white rounded shadow-lg border border-slate-200 w-full max-w-md overflow-hidden transform transition-all scale-100 flex flex-col">
              <div className="p-xl flex gap-md items-start">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                  <span className="material-symbols-outlined text-[24px]">warning</span>
                </div>
                <div className="space-y-sm text-left flex-1">
                  <h3 className="font-extrabold text-slate-900 text-body-md">Delete Category Confirmation</h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Are you sure you want to delete the category <span className="font-bold text-slate-800">"{deleteConfirmCategory.name}"</span>?
                    This will permanently delete it from the system catalog tree.
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
                            name="deleteAction"
                            checked={shouldTransfer}
                            onChange={() => setShouldTransfer(true)}
                            className="w-3.5 h-3.5 text-amber-600 focus:ring-amber-500 border-slate-300"
                          />
                          Transfer products to another category
                        </label>
                        <label className="flex items-center gap-xs text-[11px] font-bold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="deleteAction"
                            checked={!shouldTransfer}
                            onChange={() => {
                              setShouldTransfer(false);
                              setTransferTargetId('');
                            }}
                            className="w-3.5 h-3.5 text-amber-600 focus:ring-amber-500 border-slate-300"
                          />
                          Leave products unassigned (set category to null)
                        </label>
                      </div>

                      {shouldTransfer && (
                        <div className="pt-sm">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-xs">Select Target Category *</label>
                          <select
                            value={transferTargetId}
                            onChange={e => setTransferTargetId(e.target.value)}
                            required
                            className="w-full h-9 px-sm border border-slate-300 rounded text-xs bg-white focus:border-amber-500 focus:ring-0 font-bold"
                          >
                            <option value="">-- Choose Category --</option>
                            {otherCategories.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.parentId ? `↳ ${c.name}` : c.name}
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
                    setDeleteConfirmCategory(null);
                    setTransferTargetId('');
                    setShouldTransfer(true);
                  }}
                  className="px-lg h-10 rounded border border-slate-200 hover:border-slate-800 text-slate-600 hover:text-slate-800 font-bold text-xs cursor-pointer transition-all bg-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteCategory}
                  disabled={isDeleteDisabled}
                  className={`px-lg h-10 rounded font-bold text-xs cursor-pointer transition-all shadow-sm text-white ${
                    isDeleteDisabled 
                      ? 'bg-red-300 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Delete Category
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Categories"
        fields={categoryImportFields}
        templateFileName="categories_import_template.csv"
        onImportRow={handleImportCategoryRow}
        onSuccess={(msg) => {
          setSuccess(msg);
          fetchCategories();
        }}
      />
    </div>
  );
};
