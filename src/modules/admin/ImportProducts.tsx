import React, { useState, useEffect } from 'react';

interface ValidationError {
  row: number;
  sku: string;
  name: string;
  field: string;
  error: string;
}

interface ValidationWarning {
  row: number;
  sku: string;
  name: string;
  field: string;
  warning: string;
  suggestion?: any;
}

interface ImportHistoryRecord {
  id: string;
  importDate: string;
  importedBy: string;
  fileName: string;
  mode: string;
  productsAdded: number;
  productsUpdated: number;
  productsFailed: number;
}

export const ImportProducts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'import' | 'history'>('import');
  
  // Upload States
  const [sheetFile, setSheetFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<'ADD_NEW' | 'UPDATE_EXISTING' | 'ADD_UPDATE' | 'SYNC'>('ADD_UPDATE');
  const [autoCreateBrands, setAutoCreateBrands] = useState(true);
  
  // Processing States
  const [validating, setValidating] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Validation Preview Results
  const [previewData, setPreviewData] = useState<{
    importId: string;
    totalRows: number;
    validCount: number;
    warningCount: number;
    errorCount: number;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    unrecognizedBrands: string[];
    unrecognizedCategories: Record<string, string>;
    imagesReport?: {
      matchedCount: number;
      missingImages: string[];
      unmatchedImages: string[];
    };
  } | null>(null);

  // Completed results
  const [commitResult, setCommitResult] = useState<any | null>(null);

  // History List
  const [history, setHistory] = useState<ImportHistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch('http://localhost:5000/api/admin/catalog/import/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Error loading import history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const handleTemplateDownload = (format: 'xlsx' | 'csv') => {
    window.open(`http://localhost:5000/api/admin/catalog/template?format=${format}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSheetFile(e.target.files[0]);
      setPreviewData(null);
      setCommitResult(null);
      setError(null);
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setZipFile(e.target.files[0]);
      setCommitResult(null);
      setError(null);
    }
  };

  const handleUploadAndValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetFile) return;

    setValidating(true);
    setError(null);
    setPreviewData(null);
    setCommitResult(null);

    const formData = new FormData();
    formData.append('file', sheetFile);
    if (zipFile) {
      formData.append('imagesZip', zipFile);
    }

    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch('http://localhost:5000/api/admin/catalog/import/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse and validate file.');
      }
      setPreviewData(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during sheet validation.');
    } finally {
      setValidating(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData) return;

    setCommitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch('http://localhost:5000/api/admin/catalog/import/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          importId: previewData.importId,
          mode: importMode,
          createBrands: autoCreateBrands
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete catalog import.');
      }

      setCommitResult(data);
      setSuccess('Import process completed successfully!');
      setPreviewData(null);
      // Reset files
      setSheetFile(null);
      setZipFile(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred during import execution.');
    } finally {
      setCommitting(false);
    }
  };

  const handleDownloadErrorReport = (importId: string) => {
    window.open(`http://localhost:5000/api/admin/catalog/import/history/${importId}/error-report`);
  };

  return (
    <div className="space-y-lg text-left">
      {/* Notifications */}
      {error && (
        <div className="bg-red-50 text-red-800 p-md rounded-2xl border border-red-200 flex justify-between items-center animate-fade-in">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="material-symbols-outlined text-[18px]">close</button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-800 p-md rounded-2xl border border-green-200 flex justify-between items-center animate-fade-in">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="material-symbols-outlined text-[18px]">close</button>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="flex border-b border-slate-200 bg-white p-sm rounded-t-2xl shadow-sm">
        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-xs px-lg py-md font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'import' ? 'border-[#FFC107] text-[#FFC107]' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
          Product Import Center
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-xs px-lg py-md font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'history' ? 'border-[#FFC107] text-[#FFC107]' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">history</span>
          Import History & Reports
        </button>
      </div>

      {activeTab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* File Upload Panel */}
          <div className="lg:col-span-2 space-y-lg">
            {!previewData && !commitResult && (
              <form onSubmit={handleUploadAndValidate} className="bg-white p-lg rounded-2xl border border-slate-200 shadow-sm space-y-md">
                <h3 className="font-extrabold text-slate-900 text-headline-h6">Upload Product Catalog</h3>
                <p className="text-body-sm text-slate-400">Supported formats: Excel (.xlsx) and CSV. Maximum file size: 50MB.</p>

                {/* Dropzone for catalog sheet */}
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-xl flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer relative group">
                  <span className="material-symbols-outlined text-slate-300 text-[56px] group-hover:text-[#FFC107] transition-all">upload_file</span>
                  <p className="text-body-sm text-slate-700 font-bold mt-sm">
                    {sheetFile ? sheetFile.name : 'Select or drag & drop catalog spreadsheet'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-xs">products.xlsx or products.csv</p>
                  <input
                    type="file"
                    required
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                {/* Dropzone for zipped images */}
                <div className="border border-dashed border-slate-200 rounded-2xl p-md flex items-center justify-between bg-slate-50/30 hover:bg-slate-50 transition-all cursor-pointer relative group">
                  <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-[#FFC107] transition-all text-[28px]">folder_zip</span>
                    <div className="text-left">
                      <p className="text-xs text-slate-700 font-bold">
                        {zipFile ? zipFile.name : 'Attach Image Archive ZIP (Optional)'}
                      </p>
                      <p className="text-[10px] text-slate-400">ZIP file containing SKU.jpg or SKU.png images</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleZipChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {zipFile && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setZipFile(null); }}
                      className="w-7 h-7 rounded-full bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 flex items-center justify-center relative z-10"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                </div>

                {/* Action trigger */}
                <div className="flex justify-end pt-md">
                  <button
                    type="submit"
                    disabled={validating || !sheetFile}
                    className="flex items-center gap-xs bg-primary-container text-on-primary-container hover:bg-[#fabd00] disabled:bg-slate-100 disabled:text-slate-400 px-xl h-12 rounded-xl font-extrabold text-sm transition-all shadow-sm"
                  >
                    {validating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent"></div>
                        Validating Data...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">rule</span>
                        Validate Catalog Sheet
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Validation Preview Screen */}
            {previewData && (
              <div className="bg-white p-lg rounded-2xl border border-slate-200 shadow-sm space-y-lg animate-fade-in">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-headline-h6">Validation Summary</h3>
                    <p className="text-xs text-slate-400 font-medium">Review errors and warnings before submitting import.</p>
                  </div>
                  <button
                    onClick={() => setPreviewData(null)}
                    className="px-md py-sm border border-slate-200 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-500"
                  >
                    Clear Preview
                  </button>
                </div>

                {/* Scorecards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
                  <div className="bg-slate-50 border border-slate-100 p-md rounded-2xl text-center">
                    <span className="material-symbols-outlined text-slate-400 text-[24px]">list_alt</span>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-xs">Total Rows</p>
                    <p className="text-headline-h6 font-extrabold text-slate-900">{previewData.totalRows}</p>
                  </div>
                  <div className="bg-green-50/50 border border-green-100 p-md rounded-2xl text-center">
                    <span className="material-symbols-outlined text-green-500 text-[24px]">check_circle</span>
                    <p className="text-[10px] uppercase font-bold text-green-600 mt-xs">Valid Rows</p>
                    <p className="text-headline-h6 font-extrabold text-green-700">{previewData.validCount}</p>
                  </div>
                  <div className="bg-amber-50/50 border border-amber-100 p-md rounded-2xl text-center">
                    <span className="material-symbols-outlined text-amber-500 text-[24px]">warning</span>
                    <p className="text-[10px] uppercase font-bold text-amber-600 mt-xs">Warnings</p>
                    <p className="text-headline-h6 font-extrabold text-amber-700">{previewData.warningCount}</p>
                  </div>
                  <div className="bg-red-50/50 border border-red-100 p-md rounded-2xl text-center">
                    <span className="material-symbols-outlined text-red-500 text-[24px]">error</span>
                    <p className="text-[10px] uppercase font-bold text-red-600 mt-xs">Errors</p>
                    <p className="text-headline-h6 font-extrabold text-red-700">{previewData.errorCount}</p>
                  </div>
                </div>

                {/* Images Attachment Report */}
                {previewData.imagesReport && (
                  <div className="bg-slate-50 p-md rounded-2xl border border-slate-200/60 space-y-sm text-xs">
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-xs">
                      <span className="font-bold text-slate-950 flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[16px] text-amber-500">photo_library</span>
                        Image Zip Import Report
                      </span>
                      <span className="bg-green-100 text-green-800 font-bold px-sm py-0.5 rounded-full">
                        {previewData.imagesReport.matchedCount} Matched
                      </span>
                    </div>
                    {previewData.imagesReport.missingImages.length > 0 && (
                      <div className="space-y-xs">
                        <p className="font-bold text-slate-600">Products Missing Images ({previewData.imagesReport.missingImages.length}):</p>
                        <div className="flex flex-wrap gap-xs max-h-20 overflow-y-auto font-mono text-[10px] bg-white p-xs rounded border border-slate-100">
                          {previewData.imagesReport.missingImages.map(sku => (
                            <span key={sku} className="bg-slate-100 px-sm py-0.5 rounded text-slate-500">{sku}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {previewData.imagesReport.unmatchedImages.length > 0 && (
                      <div className="space-y-xs">
                        <p className="font-bold text-slate-600">ZIP Images with No Matching SKU ({previewData.imagesReport.unmatchedImages.length}):</p>
                        <div className="flex flex-wrap gap-xs max-h-20 overflow-y-auto font-mono text-[10px] bg-white p-xs rounded border border-slate-100">
                          {previewData.imagesReport.unmatchedImages.map(name => (
                            <span key={name} className="bg-slate-100 px-sm py-0.5 rounded text-slate-500">{name}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Import Strategy Config Card */}
                <div className="bg-[#FFC107]/5 border border-[#FFC107]/20 p-md rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-md items-center">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-xs">Select Import Strategy *</label>
                    <select
                      value={importMode}
                      onChange={(e) => setImportMode(e.target.value as any)}
                      className="w-full h-10 px-md border border-slate-200 rounded-xl bg-white focus:border-[#FFC107] focus:ring-0 text-xs font-bold text-slate-900"
                    >
                      <option value="ADD_UPDATE">Add New + Update Existing (Recommended)</option>
                      <option value="ADD_NEW">Only Create New Products (Skip Existing)</option>
                      <option value="UPDATE_EXISTING">Only Update Existing Products</option>
                      <option value="SYNC">Catalog Sync (Upsert + Archive Missing)</option>
                    </select>
                    {importMode === 'SYNC' && (
                      <p className="text-[10px] text-red-500 mt-xs font-semibold">
                        * WARNING: Products present in Arcus catalog but omitted from the sheet will be set to DISCONTINUED.
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-xs pl-0 md:pl-md">
                    <label className="flex items-center gap-xs text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={autoCreateBrands}
                        onChange={(e) => setAutoCreateBrands(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-[#FFC107] focus:ring-[#FFC107]"
                      />
                      Create Brands Automatically
                    </label>
                    <p className="text-[10px] text-slate-400">If checked, new brand profiles will be created immediately without leaving flow.</p>
                  </div>
                </div>

                {/* Warning & Suggestion Feed */}
                {previewData.warnings.length > 0 && (
                  <div className="space-y-sm">
                    <h4 className="font-bold text-xs text-amber-600 flex items-center gap-xs uppercase tracking-wide">
                      <span className="material-symbols-outlined text-[16px]">warning</span>
                      Smart Suggestions & Warnings ({previewData.warnings.length})
                    </h4>
                    <div className="max-h-56 overflow-y-auto border border-amber-100 rounded-xl bg-amber-50/20 divide-y divide-amber-50">
                      {previewData.warnings.slice(0, 100).map((w, idx) => (
                        <div key={idx} className="p-sm text-xs flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-500 mr-sm">Row {w.row}</span>
                            <span className="font-bold text-slate-900 font-mono mr-sm">{w.sku}</span>
                            <span className="text-slate-650">{w.warning}</span>
                          </div>
                          {w.suggestion && (
                            <span className="bg-amber-100 text-amber-800 font-bold px-sm py-0.5 rounded text-[10px] font-mono">
                              Mapped to {w.suggestion.categoryId}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Errors List */}
                {previewData.errors.length > 0 && (
                  <div className="space-y-sm">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-xs text-red-600 flex items-center gap-xs uppercase tracking-wide">
                        <span className="material-symbols-outlined text-[16px]">error</span>
                        Validation Errors ({previewData.errors.length})
                      </h4>
                      <button
                        onClick={() => handleDownloadErrorReport(previewData.importId)}
                        className="flex items-center gap-xs border border-red-200 text-red-600 hover:bg-red-50 px-sm py-1 rounded-xl text-xs font-bold"
                      >
                        <span className="material-symbols-outlined text-[14px]">download</span>
                        Download Error Sheet
                      </button>
                    </div>
                    <div className="max-h-56 overflow-y-auto border border-red-100 rounded-xl bg-red-50/20 divide-y divide-red-50">
                      {previewData.errors.slice(0, 100).map((err, idx) => (
                        <div key={idx} className="p-sm text-xs">
                          <span className="font-bold text-red-500 mr-sm">Row {err.row}</span>
                          <span className="font-bold text-slate-950 font-mono mr-md">{err.sku}</span>
                          <span className="text-slate-400 mr-sm">[{err.field}]</span>
                          <span className="text-red-700 font-bold">{err.error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Final Confirm Buttons */}
                <div className="flex justify-end gap-sm pt-md border-t border-slate-100">
                  <button
                    onClick={() => setPreviewData(null)}
                    className="px-lg h-12 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-500"
                  >
                    Cancel Import
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={committing || previewData.validCount === 0}
                    className="flex items-center gap-xs bg-[#FFC107] text-slate-950 hover:bg-[#fabd00] disabled:bg-slate-100 disabled:text-slate-400 px-xl h-12 rounded-xl font-extrabold text-sm transition-all shadow-sm shadow-[#FFC107]/20"
                  >
                    {committing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent"></div>
                        Syncing Database...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">publish</span>
                        Approve & Import {previewData.validCount} Products
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Post-Import Complete Screen */}
            {commitResult && (
              <div className="bg-white p-lg rounded-2xl border border-slate-200 shadow-sm space-y-md text-center py-xl animate-fade-in">
                <span className="material-symbols-outlined text-green-500 text-[64px] animate-bounce">task_alt</span>
                <h3 className="font-extrabold text-slate-900 text-headline-h6">Catalog Synced Successfully!</h3>
                <p className="text-body-sm text-slate-400 max-w-md mx-auto">{commitResult.auditMessage}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-md max-w-lg mx-auto pt-md">
                  <div className="bg-green-50/50 p-sm rounded-xl border border-green-100">
                    <p className="text-[10px] text-green-600 font-bold">Added</p>
                    <p className="font-extrabold text-lg text-green-800">{commitResult.addedCount}</p>
                  </div>
                  <div className="bg-blue-50/50 p-sm rounded-xl border border-blue-100">
                    <p className="text-[10px] text-blue-600 font-bold">Updated</p>
                    <p className="font-extrabold text-lg text-blue-800">{commitResult.updatedCount}</p>
                  </div>
                  <div className="bg-slate-50 p-sm rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-500 font-bold">Skipped</p>
                    <p className="font-extrabold text-lg text-slate-700">{commitResult.skippedCount}</p>
                  </div>
                  <div className="bg-red-50/50 p-sm rounded-xl border border-red-100">
                    <p className="text-[10px] text-red-650 font-bold">Failed</p>
                    <p className="font-extrabold text-lg text-red-800">{commitResult.failedCount}</p>
                  </div>
                </div>

                <div className="pt-lg flex justify-center gap-sm">
                  {commitResult.failedCount > 0 && (
                    <button
                      onClick={() => handleDownloadErrorReport(commitResult.importId)}
                      className="flex items-center gap-xs border border-red-200 text-red-600 hover:bg-red-50 px-lg h-11 rounded-xl text-xs font-bold"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      Download Failed Log
                    </button>
                  )}
                  <button
                    onClick={() => setCommitResult(null)}
                    className="bg-[#FFC107] text-slate-950 px-lg h-11 rounded-xl font-bold text-xs hover:bg-[#fabd00]"
                  >
                    Start New Import
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Guidelines & Download Card */}
          <div className="space-y-lg">
            {/* Download Template Card */}
            <div className="bg-slate-900 text-white p-lg rounded-2xl border border-slate-800 shadow-xl space-y-md">
              <span className="material-symbols-outlined text-[#FFC107] text-[40px]">download_sheet</span>
              <h3 className="font-extrabold text-md text-white">Import Templates</h3>
              <p className="text-xs text-slate-400">Download the pre-formatted Excel or CSV spreadsheet template to prepare your catalog data.</p>
              
              <div className="flex flex-col gap-sm pt-xs">
                <button
                  onClick={() => handleTemplateDownload('xlsx')}
                  className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 p-sm rounded-xl text-xs font-bold transition-all border border-slate-700"
                >
                  <span className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[18px] text-green-400">table_view</span>
                    Excel Template (.xlsx)
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-slate-400">download</span>
                </button>
                <button
                  onClick={() => handleTemplateDownload('csv')}
                  className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 p-sm rounded-xl text-xs font-bold transition-all border border-slate-700"
                >
                  <span className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[18px] text-slate-300">description</span>
                    CSV Template (.csv)
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-slate-400">download</span>
                </button>
              </div>
            </div>

            {/* Business Rules Card */}
            <div className="bg-white p-lg rounded-2xl border border-slate-200 shadow-sm space-y-md text-xs">
              <h4 className="font-bold text-[#FFC107] uppercase tracking-wider text-[10px]">Business Rules & Formats</h4>
              <ul className="space-y-sm text-slate-600 list-disc pl-md">
                <li><strong className="text-slate-900">SKU Field</strong>: Must be unique. Duplicates are flagged.</li>
                <li><strong className="text-slate-900">Auto-Mapping</strong>: The importer automatically maps headers like <span className="font-mono bg-slate-50 px-1">Name</span>, <span className="font-mono bg-slate-50 px-1">product_name</span>, etc.</li>
                <li><strong className="text-slate-900">Image ZIP Match</strong>: Pack files named <span className="font-mono bg-slate-50 px-1">SKU.jpg</span> or <span className="font-mono bg-slate-50 px-1">SKU.png</span>. The ZIP gets extracted and matched automatically.</li>
                <li><strong className="text-slate-900">Discontinued products</strong>: Sync Mode sets omitted products to DISCONTINUED without physical deletion.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white p-lg rounded-2xl border border-slate-200 shadow-sm space-y-md">
          <div className="flex justify-between items-center pb-md border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-headline-h6">Import History History</h3>
              <p className="text-xs text-slate-400 font-medium">Audit logs of all bulk imports and synchronization operations.</p>
            </div>
            <button
              onClick={fetchHistory}
              className="flex items-center gap-xs text-xs font-bold text-slate-500 hover:text-slate-900"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Refresh History
            </button>
          </div>

          {historyLoading ? (
            <div className="flex justify-center py-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFC107]"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-body-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-lg py-md">Import Date</th>
                    <th className="px-lg py-md">File Name</th>
                    <th className="px-lg py-md">Import Mode</th>
                    <th className="px-lg py-md">Imported By</th>
                    <th className="px-lg py-md text-center">Added</th>
                    <th className="px-lg py-md text-center">Updated</th>
                    <th className="px-lg py-md text-center">Failed</th>
                    <th className="px-lg py-md text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-lg py-md text-xs text-slate-500 font-medium">
                        {new Date(h.importDate).toLocaleString('en-IN')}
                      </td>
                      <td className="px-lg py-md font-bold text-slate-900">{h.fileName}</td>
                      <td className="px-lg py-md">
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-sm py-0.5 rounded-full font-bold">
                          {h.mode}
                        </span>
                      </td>
                      <td className="px-lg py-md font-semibold text-slate-600">{h.importedBy}</td>
                      <td className="px-lg py-md text-center font-bold text-green-700">{h.productsAdded}</td>
                      <td className="px-lg py-md text-center font-bold text-blue-700">{h.productsUpdated}</td>
                      <td className="px-lg py-md text-center font-bold text-red-700">{h.productsFailed}</td>
                      <td className="px-lg py-md text-right">
                        {h.productsFailed > 0 ? (
                          <button
                            onClick={() => handleDownloadErrorReport(h.id)}
                            className="flex items-center gap-xs ml-auto border border-red-200 text-red-600 hover:bg-red-50 px-sm py-1 rounded-xl text-xs font-bold"
                          >
                            <span className="material-symbols-outlined text-[14px]">download</span>
                            Error Sheet
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-green-500 flex items-center justify-end gap-2">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Clean Import
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-xl text-slate-400 font-semibold">
                        No import history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
