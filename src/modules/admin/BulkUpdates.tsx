import React, { useState } from 'react';

type UpdateType = 'price' | 'inventory' | 'moq' | 'status';

export const BulkUpdates: React.FC = () => {
  const [activeSection, setActiveSection] = useState<UpdateType>('price');
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Result States
  const [result, setResult] = useState<{
    updatedCount: number;
    failedCount: number;
    errors: Array<{ sku: string; error: string }>;
  } | null>(null);

  const sections: Array<{ id: UpdateType; title: string; icon: string; desc: string; columns: string[] }> = [
    {
      id: 'price',
      title: 'Price Update',
      icon: 'payments',
      desc: 'Quickly adjust standard selling prices across your products.',
      columns: ['SKU', 'Price']
    },
    {
      id: 'inventory',
      title: 'Inventory Sync',
      icon: 'warehouse',
      desc: 'Update available stock levels in bulk.',
      columns: ['SKU', 'Stock']
    },
    {
      id: 'moq',
      title: 'MOQ Purchasing Rules',
      icon: 'shopping_basket',
      desc: 'Modify Minimum Order Quantities, Units, and Multiples.',
      columns: ['SKU', 'MOQ', 'MOQ Unit', 'Order Multiple']
    },
    {
      id: 'status',
      title: 'Mass Status Change',
      icon: 'rule',
      desc: 'Activate, discontinue, or set status of products in bulk.',
      columns: ['SKU', 'Status']
    }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
      setSuccess(null);
    }
  };

  const handleSectionChange = (sectionId: UpdateType) => {
    setActiveSection(sectionId);
    setFile(null);
    setResult(null);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setProcessing(true);
    setError(null);
    setSuccess(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', activeSection);

    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch('http://localhost:5000/api/admin/catalog/bulk-update', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process bulk update.');
      }

      setResult(data);
      setSuccess('Bulk update executed successfully.');
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred while uploading bulk sheet.');
    } finally {
      setProcessing(false);
    }
  };

  const currentSec = sections.find(s => s.id === activeSection)!;

  return (
    <div className="space-y-lg text-left">
      {/* Top Banner */}
      <div className="bg-white p-lg rounded border border-slate-200 shadow-sm">
        <h3 className="font-extrabold text-slate-900 text-headline-h6">Bulk Update Center</h3>
        <p className="text-body-sm text-slate-400">Perform massive product metadata, price, or inventory corrections without exporting the entire catalog.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg">
        {/* Sidebar selection */}
        <div className="space-y-sm">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => handleSectionChange(s.id)}
              className={`w-full flex items-center gap-md px-md py-sm rounded font-bold text-xs uppercase tracking-wider transition-all border text-left ${
                activeSection === s.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-650 hover:bg-slate-50 border-slate-200 shadow-xs'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${activeSection === s.id ? 'text-primary' : 'text-slate-400'}`}>{s.icon}</span>
              {s.title}
            </button>
          ))}
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-3 space-y-lg">
          {/* Notifications */}
          {error && (
            <div className="bg-red-50 text-red-800 p-md rounded border border-red-200 flex justify-between items-center animate-fade-in">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="material-symbols-outlined text-[18px]">close</button>
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-800 p-md rounded border border-green-200 flex justify-between items-center animate-fade-in">
              <span>{success}</span>
              <button onClick={() => setSuccess(null)} className="material-symbols-outlined text-[18px]">close</button>
            </div>
          )}

          {/* Form */}
          {!result && (
            <form onSubmit={handleSubmit} className="bg-white p-lg rounded border border-slate-200 shadow-sm space-y-md">
              <div className="border-b border-slate-100 pb-sm">
                <h4 className="font-extrabold text-slate-900 text-md flex items-center gap-xs">
                  <span className="material-symbols-outlined text-primary">{currentSec.icon}</span>
                  {currentSec.title}
                </h4>
                <p className="text-xs text-slate-400 font-medium mt-1">{currentSec.desc}</p>
              </div>

              {/* Template Columns Info */}
              <div className="bg-slate-50 p-md rounded border border-slate-200/50 space-y-xs text-xs">
                <span className="font-bold text-slate-700">Required Column Headers:</span>
                <div className="flex flex-wrap gap-xs pt-xs font-mono text-[10px]">
                  {currentSec.columns.map(col => (
                    <span key={col} className="bg-slate-200 px-sm py-1 rounded text-slate-800 font-bold">{col}</span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 italic pt-xs">* You can upload either Excel (.xlsx) or CSV format. Row headers can be snake_case or spaces.</p>
              </div>

              {/* Dropzone */}
              <div className="border-2 border-dashed border-slate-200 rounded p-xl flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer relative group">
                <span className="material-symbols-outlined text-slate-300 text-[56px] group-hover:text-primary transition-all">upload_file</span>
                <p className="text-body-sm text-slate-700 font-bold mt-sm">
                  {file ? file.name : 'Select or drag & drop update spreadsheet'}
                </p>
                <input
                  type="file"
                  required
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              <div className="flex justify-end pt-md">
                <button
                  type="submit"
                  disabled={processing || !file}
                  className="flex items-center gap-xs bg-primary-container text-on-primary-container hover:bg-[#fabd00] disabled:bg-slate-100 disabled:text-slate-400 px-xl h-12 rounded font-extrabold text-sm transition-all shadow-sm"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent"></div>
                      Executing Updates...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">publish</span>
                      Apply Bulk Updates
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Results Screen */}
          {result && (
            <div className="bg-white p-lg rounded border border-slate-200 shadow-sm space-y-md animate-fade-in">
              <div className="text-center py-md space-y-xs">
                <span className="material-symbols-outlined text-green-500 text-[48px]">check_circle</span>
                <h4 className="font-extrabold text-slate-900 text-headline-h6">Bulk Updates Applied!</h4>
                <p className="text-xs text-slate-400">Processed sheet for bulk {activeSection} changes.</p>
              </div>

              <div className="grid grid-cols-2 gap-md max-w-sm mx-auto">
                <div className="bg-green-50 text-green-800 p-md rounded text-center border border-green-200">
                  <p className="text-[10px] uppercase font-bold">Successfully Updated</p>
                  <p className="text-headline-h6 font-extrabold">{result.updatedCount}</p>
                </div>
                <div className="bg-red-50 text-red-800 p-md rounded text-center border border-red-200">
                  <p className="text-[10px] uppercase font-bold">Failed / Not Found</p>
                  <p className="text-headline-h6 font-extrabold">{result.failedCount}</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-sm pt-sm">
                  <h5 className="font-bold text-xs text-red-600 flex items-center gap-xs uppercase tracking-wide border-b border-red-100 pb-xs">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    Failed / Skipped Rows ({result.errors.length})
                  </h5>
                  <div className="max-h-56 overflow-y-auto border border-red-100 rounded bg-red-50/20 divide-y divide-red-50">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="p-sm text-xs">
                        <span className="font-bold text-slate-700 mr-sm">SKU: {err.sku}</span>
                        <span className="text-red-700 font-semibold">{err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-md border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setResult(null)}
                  className="bg-primary text-slate-950 px-lg h-11 rounded font-bold text-xs hover:bg-[#fabd00]"
                >
                  Load Another Sheet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
