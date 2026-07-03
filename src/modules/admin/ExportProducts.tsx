import React, { useState, useEffect } from 'react';
import type { Category } from './types';
import { apiFetch } from '../../lib/api';

export const ExportProducts: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');
  
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('arcus_token');
        const [catRes, brandRes] = await Promise.all([
          apiFetch('/admin/categories', { headers: { 'Authorization': `Bearer ${token}` } }),
          apiFetch('/admin/brands', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (catRes.ok) {
          const cats = await catRes.json();
          setCategories(cats);
        }
        if (brandRes.ok) {
          const brs = await brandRes.json();
          setBrands(brs);
        }
      } catch (err) {
        console.error('Error fetching categories or brands for export:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('arcus_token');
      const params = new URLSearchParams({
        categoryId: selectedCategory,
        brand: selectedBrand,
        status: selectedStatus,
        format: format
      });

      // Simple browser download trigger
      const downloadUrl = `/api/admin/catalog/export?${params.toString()}`;
      
      const response = await apiFetch(downloadUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate catalog export');
      }

      // Trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `arcus_catalog_export_${timestamp}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to generate export file. Please try again.');
    } finally {
      setExporting(false);
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
    <div className="max-w-2xl mx-auto text-left bg-white p-lg rounded border border-slate-200 shadow-sm space-y-lg">
      <div>
        <h3 className="font-extrabold text-slate-900 text-headline-h6">Export Product Catalog</h3>
        <p className="text-body-sm text-slate-400">Configure your export parameters below to download your catalog sheet.</p>
      </div>

      <div className="space-y-md">
        {/* Category filter */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Filter By Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-11 px-md border border-slate-200 rounded bg-slate-50 focus:border-primary focus:ring-0 font-semibold"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Brand filter */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Filter By Brand</label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full h-11 px-md border border-slate-200 rounded bg-slate-50 focus:border-primary focus:ring-0 font-semibold"
          >
            <option value="all">All Brands</option>
            {brands.map(b => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Filter By Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full h-11 px-md border border-slate-200 rounded bg-slate-50 focus:border-primary focus:ring-0 font-semibold"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="COMING_SOON">Coming Soon</option>
            <option value="DISCONTINUED">Discontinued</option>
            <option value="RFQ_ONLY">RFQ Only</option>
          </select>
        </div>

        {/* Format toggle */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-sm">Export File Format</label>
          <div className="flex gap-md pt-xs">
            <label className="flex items-center gap-xs font-bold text-sm text-slate-800 cursor-pointer">
              <input
                type="radio"
                name="format"
                checked={format === 'xlsx'}
                onChange={() => setFormat('xlsx')}
                className="w-5 h-5 text-primary focus:ring-primary"
              />
              Excel spreadsheet (.xlsx)
            </label>
            <label className="flex items-center gap-xs font-bold text-sm text-slate-800 cursor-pointer">
              <input
                type="radio"
                name="format"
                checked={format === 'csv'}
                onChange={() => setFormat('csv')}
                className="w-5 h-5 text-primary focus:ring-primary"
              />
              CSV text file (.csv)
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-md border-t border-slate-100">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center justify-center gap-xs bg-primary text-slate-950 hover:bg-[#fabd00] disabled:bg-slate-100 disabled:text-slate-400 px-xl h-12 rounded font-extrabold text-sm transition-all shadow-sm shadow-[#FFC107]/20"
        >
          {exporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent"></div>
              Generating File...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">download_sheet</span>
              Generate & Download Catalog
            </>
          )}
        </button>
      </div>
    </div>
  );
};
