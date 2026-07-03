import React, { useEffect, useState } from 'react';
import type { Category } from './types';
import { apiFetch } from '../../lib/api';


export const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<Partial<Category>>({});

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
    setForm({ id: '', name: '', icon: 'folder', count: '0 products', href: '' });
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
        ? `/api/admin/categories/${editingCategory.id}` 
        : '/api/admin/categories';

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

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await apiFetch(`/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete category.');
      }
      setSuccess(`Category "${name}" deleted successfully.`);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Error deleting category.');
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
          <h4 className="font-extrabold text-slate-900 text-body-md">Procurement Categories Tree</h4>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manage category tree mapping for catalog browsing</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-xs bg-primary-container text-on-primary-container hover:bg-[#fabd00] px-lg h-11 rounded font-bold text-xs transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Main Category
        </button>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="flex justify-center py-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm max-w-4xl">
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
              {categories.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-lg py-md font-bold text-slate-900">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-primary text-[20px]">{c.icon || 'folder'}</span>
                      {c.name}
                    </div>
                  </td>
                  <td className="px-lg py-md text-slate-500 font-mono text-xs">{c.href || `#/materials/${c.id}`}</td>
                  <td className="px-lg py-md text-slate-500 font-mono text-xs">{c.icon || 'folder'}</td>
                  <td className="px-lg py-md text-slate-500 font-semibold">{c.count || '0 products'}</td>
                  <td className="px-lg py-md text-right">
                    <div className="flex gap-sm justify-end">
                      <button
                        onClick={() => openEditModal(c)}
                        className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                        title="Edit Category"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(c.id, c.name)}
                        className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:bg-red-50 text-slate-600 hover:text-red-600"
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
          <div className="w-full max-w-md bg-white rounded shadow overflow-hidden">
            <div className="px-lg py-md border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 text-body-md">
                {editingCategory ? 'Edit Category Properties' : 'Create Category Entity'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-lg space-y-md">
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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Icon (Google Material Icon tag)</label>
                <input
                  type="text"
                  placeholder="e.g. folder, plumbing, electrical_services"
                  value={form.icon || ''}
                  onChange={e => setForm({ ...form, icon: e.target.value })}
                  className="w-full h-11 px-md border border-slate-200 rounded focus:border-primary focus:ring-0 text-body-sm"
                />
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
                  className="px-lg h-11 border border-slate-200 hover:border-slate-800 rounded font-bold text-xs text-slate-600 hover:text-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-container text-on-primary-container hover:bg-[#fabd00] px-xl h-11 rounded font-bold text-xs transition-all shadow-sm"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
