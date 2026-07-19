/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import type {
  ColumnDef,
  SortingState,
  VisibilityState,
  ColumnOrderState,
} from '@tanstack/react-table';
import { useGridPreferences } from './useGridPreferences';
import { useWorkspace } from '../workspace/WorkspaceContext';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Download,
  Settings2,
} from 'lucide-react';

interface BulkAction {
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedRows: any[]) => void;
}

interface EnterpriseGridProps<TData> {
  gridId: string;
  columns: ColumnDef<TData, any>[];
  data: TData[];
  bulkActions?: BulkAction[];
  onRowClick?: (row: TData) => void;
  exportFileName?: string;
}

export function EnterpriseGrid<TData>({
  gridId,
  columns,
  data,
  bulkActions = [],
  onRowClick,
  exportFileName = 'export',
}: EnterpriseGridProps<TData>) {
  const { densityMode } = useWorkspace();
  const isCompact = densityMode === 'COMPACT';

  const { preferences, savePreferences } = useGridPreferences(gridId);

  // States
  const [sorting, setSorting] = useState<SortingState>(preferences.sorting || []);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(preferences.columnVisibility || {});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(preferences.columnOrder || []);
  const [rowSelection, setRowSelection] = useState({});

  // Selection column definition prepended if bulk actions exist
  const finalColumns = useMemo(() => {
    if (bulkActions.length === 0) return columns;

    const selectionColumn: ColumnDef<TData, any> = {
      id: 'selection',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
        />
      ),
      size: 40,
    };
    return [selectionColumn, ...columns];
  }, [columns, bulkActions]);

  const table = useReactTable({
    data,
    columns: finalColumns,
    state: {
      sorting,
      columnVisibility,
      columnOrder,
      rowSelection,
    },
    onSortingChange: (updater) => {
      const nextSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(nextSorting);
      savePreferences({ sorting: nextSorting });
    },
    onColumnVisibilityChange: (updater) => {
      const nextVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater;
      setColumnVisibility(nextVisibility);
      savePreferences({ columnVisibility: nextVisibility });
    },
    onColumnOrderChange: (updater) => {
      const nextOrder = typeof updater === 'function' ? updater(columnOrder) : updater;
      setColumnOrder(nextOrder);
      savePreferences({ columnOrder: nextOrder });
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const selectedRows = table.getSelectedRowModel().flatRows.map((r) => r.original);

  const handleExportCSV = () => {
    if (data.length === 0) return;
    const headers = columns.map((col) => col.id || col.header?.toString() || '').filter(Boolean);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...data.map((row: any) =>
          headers
            .map((h) => {
              const val = row[h];
              return typeof val === 'object' ? JSON.stringify(val) : String(val).replace(/,/g, '');
            })
            .join(',')
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportFileName}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Table Actions Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-600">
                {selectedRows.length} selected
              </span>
              <div className="h-4 w-px bg-slate-200" />
              {bulkActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => action.onClick(selectedRows)}
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Column Toggle Options */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-xs transition-all">
              <Settings2 size={14} />
              Columns
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-md py-1.5 hidden group-hover:block z-50 max-h-60 overflow-y-auto">
              <div className="px-3 py-1 text-2xs font-semibold text-slate-400 uppercase tracking-wider">
                Visible Columns
              </div>
              {table.getAllLeafColumns().map((column) => {
                if (column.id === 'selection') return null;
                return (
                  <label
                    key={column.id}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-xs text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      className="rounded border-slate-300 text-primary focus:ring-primary w-3.5 h-3.5"
                    />
                    {column.id}
                  </label>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-xs transition-all"
            title="Export CSV"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-50 z-10 shadow-[inset_0_-1px_0_rgba(226,232,240,1)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={`text-slate-500 font-semibold select-none border-b border-slate-200 ${
                        isCompact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'
                      }`}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-1.5 cursor-pointer ${
                            header.column.getCanSort() ? 'hover:text-slate-800' : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span>
                              {isSorted === 'asc' ? (
                                <ChevronUp size={14} />
                              ) : isSorted === 'desc' ? (
                                <ChevronDown size={14} />
                              ) : (
                                <ChevronsUpDown size={14} className="text-slate-300" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={`hover:bg-slate-50/70 border-b border-slate-100 transition-all ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${row.getIsSelected() ? 'bg-primary/5 hover:bg-primary/10' : ''}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`text-slate-700 ${
                      isCompact ? 'px-3 py-2 text-xs' : 'px-4 py-3.5 text-sm'
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="h-3 w-px bg-slate-200" />
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
              savePreferences({ pageSize: Number(e.target.value) });
            }}
            className="border-slate-200 rounded-md py-1 text-slate-600 focus:ring-primary text-xs"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-2xs"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-2xs"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
