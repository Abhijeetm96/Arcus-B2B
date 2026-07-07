import React, { useState, useRef } from 'react';
import { exportToCSV, parseCSV } from '../utils/csvHelpers';

export interface ImportField {
  label: string;
  key: string;
  required?: boolean;
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: ImportField[];
  templateFileName: string;
  onImportRow: (row: Record<string, any>) => Promise<void>;
  onSuccess: (message: string) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  title,
  fields,
  templateFileName,
  onImportRow,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [failures, setFailures] = useState<{ rowData: Record<string, any>; rowNum: number; error: string }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Download Template CSV
  const handleDownloadTemplate = () => {
    const emptyRow: Record<string, string> = {};
    fields.forEach(f => {
      emptyRow[f.key] = f.required ? '[Required]' : '';
    });
    
    const csvHeaders = fields.map(f => ({ label: f.label, key: f.key }));
    exportToCSV([emptyRow], csvHeaders, templateFileName);
  };

  // 2. Read and Parse CSV File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setFile(null);
    setParsedRows([]);
    setFailures([]);

    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const grid = parseCSV(text);

        if (grid.length < 2) {
          setError('CSV file is empty or missing headers.');
          return;
        }

        const rawHeaders = grid[0].map(h => h.trim().toLowerCase());

        // Map column labels to keys
        const keyMap: Record<number, string> = {};
        fields.forEach(f => {
          const colIdx = rawHeaders.findIndex(
            rh => rh === f.label.toLowerCase() || rh === f.key.toLowerCase()
          );
          if (colIdx !== -1) {
            keyMap[colIdx] = f.key;
          }
        });

        // Validate required headers are present
        const missingFields = fields.filter(
          f => f.required && !Object.values(keyMap).includes(f.key)
        );
        if (missingFields.length > 0) {
          setError(
            `Missing required column headers: ${missingFields.map(f => f.label).join(', ')}`
          );
          return;
        }

        // Map data rows to objects
        const objects: Record<string, any>[] = [];
        for (let rIdx = 1; rIdx < grid.length; rIdx++) {
          const row = grid[rIdx];
          const obj: Record<string, any> = {};
          
          fields.forEach(f => {
            obj[f.key] = ''; // default empty
          });

          row.forEach((cell, cIdx) => {
            const key = keyMap[cIdx];
            if (key) {
              obj[key] = cell.trim();
            }
          });

          // Only add rows that have at least one non-empty value
          if (Object.values(obj).some(v => v !== '')) {
            objects.push(obj);
          }
        }

        if (objects.length === 0) {
          setError('No valid data rows found in the CSV file.');
          return;
        }

        setParsedRows(objects);
      } catch (err: any) {
        setError(`Failed to parse CSV file: ${err.message}`);
      }
    };
    reader.readAsText(selectedFile);
  };

  // 3. Batch Process and Import Rows
  const handleStartImport = async () => {
    if (parsedRows.length === 0) return;
    setImporting(true);
    setError(null);
    setFailures([]);
    setProgress({ current: 0, total: parsedRows.length });

    const failedImports: typeof failures = [];
    let successCount = 0;

    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      const rowNum = i + 2; // 1-indexed plus header row

      // Basic required field validation before sending request
      const missingRequired = fields.filter(f => f.required && !row[f.key]);
      if (missingRequired.length > 0) {
        failedImports.push({
          rowData: row,
          rowNum,
          error: `Missing required field(s): ${missingRequired.map(f => f.label).join(', ')}`
        });
        setProgress(prev => ({ ...prev, current: i + 1 }));
        continue;
      }

      try {
        await onImportRow(row);
        successCount++;
      } catch (err: any) {
        failedImports.push({
          rowData: row,
          rowNum,
          error: err.message || 'Unknown server error.'
        });
      }
      setProgress(prev => ({ ...prev, current: i + 1 }));
    }

    setImporting(false);
    setFailures(failedImports);

    if (failedImports.length === 0) {
      onSuccess(`Successfully imported all ${successCount} records!`);
      handleClose();
    } else {
      setError(
        `Import completed with errors. Successfully loaded: ${successCount}. Failed: ${failedImports.length}.`
      );
    }
  };

  // 4. Download Failed Rows report CSV
  const handleDownloadErrors = () => {
    if (failures.length === 0) return;
    
    const errorReportHeaders = [
      { label: 'Row Number', key: 'rowNum' },
      { label: 'Error Reason', key: 'error' },
      ...fields.map(f => ({ label: f.label, key: f.key }))
    ];

    const errorReportData = failures.map(f => ({
      rowNum: f.rowNum,
      error: f.error,
      ...f.rowData
    }));

    exportToCSV(errorReportData, errorReportHeaders, 'import_failures_report.csv');
  };

  const handleClose = () => {
    setFile(null);
    setParsedRows([]);
    setError(null);
    setImporting(false);
    setFailures([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-md text-left">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-lg py-md border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
          <h3 className="font-extrabold text-slate-900 text-body-md">
            {title}
          </h3>
          <button
            onClick={handleClose}
            disabled={importing}
            className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-lg space-y-md overflow-y-auto flex-1">
          {/* Notifications */}
          {error && (
            <div className="bg-red-50 text-red-800 p-md rounded border border-red-200 text-xs font-semibold space-y-xs">
              <div>{error}</div>
              {failures.length > 0 && (
                <button
                  onClick={handleDownloadErrors}
                  className="flex items-center gap-xs text-red-900 hover:underline font-bold mt-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Download Failure Report CSV
                </button>
              )}
            </div>
          )}

          {/* Template Download instructions */}
          {!importing && failures.length === 0 && (
            <div className="bg-slate-50 p-md rounded border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-700">Need a CSV template?</div>
                <div className="text-slate-400">Download pre-formatted columns.</div>
              </div>
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-xs bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-md py-sm rounded font-bold transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-[14px]">download</span>
                Template
              </button>
            </div>
          )}

          {/* Upload Input */}
          {!importing && (
            <div className="space-y-sm">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Upload CSV File
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-primary p-xl rounded-lg text-center cursor-pointer transition-colors bg-slate-50/50"
              >
                <span className="material-symbols-outlined text-[40px] text-slate-300 block mb-sm">csv</span>
                {file ? (
                  <div className="space-y-xs">
                    <span className="font-bold text-slate-800 text-sm">{file.name}</span>
                    <span className="block text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB • {parsedRows.length} rows parsed</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 font-semibold">
                    Drag and drop or <span className="text-primary underline">browse</span> your CSV file.
                  </span>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Parse Preview */}
          {parsedRows.length > 0 && !importing && (
            <div className="space-y-sm">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Preview Data (First 3 Rows)
              </label>
              <div className="border border-slate-200 rounded overflow-hidden">
                <div className="overflow-x-auto max-h-40">
                  <table className="w-full text-[10px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                        {fields.map(f => (
                          <th key={f.key} className="px-sm py-xs whitespace-nowrap">{f.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {parsedRows.slice(0, 3).map((row, idx) => (
                        <tr key={idx}>
                          {fields.map(f => (
                            <td key={f.key} className="px-sm py-xs truncate max-w-[120px]">{row[f.key] || <span className="text-slate-350 italic">empty</span>}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Import Processing view */}
          {importing && (
            <div className="space-y-md text-center py-lg">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
              <div className="space-y-xs">
                <div className="font-extrabold text-sm text-slate-800">Processing Import...</div>
                <div className="text-xs text-slate-400 font-bold">
                  Importing row {progress.current} of {progress.total}
                </div>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-150"
                  style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Actions Footer */}
          {!importing && (
            <div className="flex justify-end gap-sm pt-md border-t border-slate-100 shrink-0">
              <button
                onClick={handleClose}
                className="px-lg h-11 border border-slate-200 rounded hover:bg-slate-50 text-slate-600 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleStartImport}
                disabled={parsedRows.length === 0}
                className="flex items-center justify-center gap-xs bg-primary text-slate-950 hover:bg-[#fabd00] disabled:bg-slate-100 disabled:text-slate-400 px-lg h-11 rounded font-extrabold text-xs transition-all shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                Confirm & Import
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
