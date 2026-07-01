import * as React from 'react';
import { ChevronDown, ArrowUpDown, ChevronLeft, ChevronRight, Eye, MoreHorizontal } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../../components/ui/Table';
import { Button } from '../../../../../components/ui/Button';
import { Checkbox } from '../../../../../components/ui/Checkbox';
import { StatusBadge } from '../../../../../components/ui/StatusBadge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '../../../../../components/ui/DropdownMenu';
import type { RFQSummary } from '../../types/rfqTypes';
import { PRIORITY_COLORS } from '../../constants/priority';
import { cn } from '../../../../../components/ui/utils';

interface RFQTableProps {
  data: RFQSummary[];
  selectedRfqId: string | null;
  onSelectRFQ: (id: string) => void;
  selectedRows: Record<string, boolean>;
  onRowSelectChange: (id: string, checked: boolean) => void;
  onSelectAllRows: (checked: boolean) => void;
  onBulkStatusChange: (status: string) => void;
}

type SortField = 'rfqNumber' | 'companyName' | 'owner' | 'value' | 'lastUpdated' | 'dueDate';
type SortOrder = 'asc' | 'desc';

export function RFQTable({
  data,
  selectedRfqId,
  onSelectRFQ,
  selectedRows,
  onRowSelectChange,
  onSelectAllRows,
  onBulkStatusChange
}: RFQTableProps) {
  // Sort State
  const [sortField, setSortField] = React.useState<SortField>('rfqNumber');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc');

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = React.useState({
    rfqNumber: true,
    company: true,
    contact: true,
    status: true,
    priority: true,
    owner: true,
    value: true,
    lastUpdated: true,
    dueDate: true
  });

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const toggleColumn = (col: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Sort logic
  const sortedData = [...data].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'value') {
      return sortOrder === 'asc' 
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    }

    const strA = String(valA).toLowerCase();
    const strB = String(valB).toLowerCase();

    if (strA < strB) return sortOrder === 'asc' ? -1 : 1;
    if (strA > strB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const selectedCount = Object.values(selectedRows).filter(Boolean).length;
  const isAllSelected = paginatedData.length > 0 && paginatedData.every(r => selectedRows[r.id]);

  React.useEffect(() => {
    // Reset page if data length changes
    setCurrentPage(1);
  }, [data.length]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface p-4 text-left select-none animate-in fade-in duration-300">
      
      {/* Grid Controls Header: Bulk Selection Info & Column Visibility */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary font-semibold">
            {selectedCount} of {data.length} row(s) selected
          </span>
          {selectedCount > 0 && (
            <div className="flex items-center gap-1.5 ml-2 animate-in slide-in-from-left-2 duration-200">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Bulk Status:</span>
              {['Under Review', 'Negotiation', 'Approved', 'Rejected'].map(st => (
                <Button
                  key={st}
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkStatusChange(st)}
                  className="h-7 text-[10px] font-bold py-0.5 px-2 hover:bg-slate-100 border-border"
                >
                  {st}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Column Visibility Trigger */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs font-bold flex items-center gap-1">
              Columns
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white border border-border">
            <DropdownMenuLabel className="text-xs font-bold text-text-primary">Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/60" />
            {Object.keys(visibleColumns).map((col) => (
              <DropdownMenuCheckboxItem
                key={col}
                checked={visibleColumns[col as keyof typeof visibleColumns]}
                onCheckedChange={() => toggleColumn(col as keyof typeof visibleColumns)}
                className="text-xs font-semibold text-text-secondary capitalize"
              >
                {col === 'rfqNumber' ? 'RFQ Number' : col === 'companyName' ? 'Company Name' : col}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Responsive Table Wrapper */}
      <div className="flex-1 overflow-x-auto rounded border border-border min-h-[300px]">
        <Table className="w-full text-xs">
          <TableHeader className="bg-slate-50 border-b border-border">
            <TableRow>
              <TableHead className="w-12 text-center p-2.5">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(checked) => onSelectAllRows(!!checked)}
                  aria-label="Select all rows"
                />
              </TableHead>
              
              {visibleColumns.rfqNumber && (
                <TableHead className="p-3">
                  <button onClick={() => handleSort('rfqNumber')} className="flex items-center gap-1 font-bold text-text-secondary hover:text-text-primary uppercase">
                    RFQ Number
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
              )}

              {visibleColumns.company && (
                <TableHead className="p-3">
                  <button onClick={() => handleSort('companyName')} className="flex items-center gap-1 font-bold text-text-secondary hover:text-text-primary uppercase">
                    Company
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
              )}

              {visibleColumns.contact && (
                <TableHead className="p-3 font-bold text-text-secondary uppercase">Contact</TableHead>
              )}

              {visibleColumns.status && (
                <TableHead className="p-3 font-bold text-text-secondary uppercase">Status</TableHead>
              )}

              {visibleColumns.priority && (
                <TableHead className="p-3 font-bold text-text-secondary uppercase">Priority</TableHead>
              )}

              {visibleColumns.owner && (
                <TableHead className="p-3">
                  <button onClick={() => handleSort('owner')} className="flex items-center gap-1 font-bold text-text-secondary hover:text-text-primary uppercase">
                    Owner
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
              )}

              {visibleColumns.value && (
                <TableHead className="p-3 text-right">
                  <button onClick={() => handleSort('value')} className="flex items-center gap-1 font-bold text-text-secondary hover:text-text-primary uppercase ml-auto">
                    Est. Value
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
              )}

              {visibleColumns.lastUpdated && (
                <TableHead className="p-3">
                  <button onClick={() => handleSort('lastUpdated')} className="flex items-center gap-1 font-bold text-text-secondary hover:text-text-primary uppercase">
                    Last Updated
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
              )}

              {visibleColumns.dueDate && (
                <TableHead className="p-3">
                  <button onClick={() => handleSort('dueDate')} className="flex items-center gap-1 font-bold text-text-secondary hover:text-text-primary uppercase">
                    Due Date
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
              )}

              <TableHead className="w-16 p-3 text-right font-bold text-text-secondary uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="py-12 text-center text-text-secondary font-medium">
                  No records match the applied workspace filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => {
                const isSelected = selectedRfqId === row.id;
                const isChecked = !!selectedRows[row.id];

                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'hover:bg-slate-50/50 cursor-pointer transition-colors',
                      isSelected && 'bg-primary/5 hover:bg-primary/10 border-primary/20'
                    )}
                    onClick={() => onSelectRFQ(row.id)}
                  >
                    {/* Checkbox cell */}
                    <TableCell className="text-center p-2.5" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => onRowSelectChange(row.id, !!checked)}
                        aria-label={`Select row ${row.rfqNumber}`}
                      />
                    </TableCell>

                    {visibleColumns.rfqNumber && (
                      <TableCell className="p-3 font-mono font-bold text-text-primary">{row.rfqNumber}</TableCell>
                    )}

                    {visibleColumns.company && (
                      <TableCell className="p-3 font-semibold text-text-primary truncate max-w-[150px]">{row.companyName}</TableCell>
                    )}

                    {visibleColumns.contact && (
                      <TableCell className="p-3 text-text-secondary font-medium">{row.contactName}</TableCell>
                    )}

                    {visibleColumns.status && (
                      <TableCell className="p-3">
                        <StatusBadge status={row.status} />
                      </TableCell>
                    )}

                    {visibleColumns.priority && (
                      <TableCell className="p-3">
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded border', PRIORITY_COLORS[row.priority as keyof typeof PRIORITY_COLORS] || 'bg-slate-100')}>
                          {row.priority}
                        </span>
                      </TableCell>
                    )}

                    {visibleColumns.owner && (
                      <TableCell className="p-3 text-text-secondary font-semibold">{row.owner}</TableCell>
                    )}

                    {visibleColumns.value && (
                      <TableCell className="p-3 text-right font-bold text-text-primary">
                        ₹{row.value.toLocaleString('en-IN')}
                      </TableCell>
                    )}

                    {visibleColumns.lastUpdated && (
                      <TableCell className="p-3 text-text-secondary font-medium">
                        {new Date(row.lastUpdated).toLocaleDateString('en-IN')}
                      </TableCell>
                    )}

                    {visibleColumns.dueDate && (
                      <TableCell className="p-3 text-text-secondary font-medium">
                        {new Date(row.dueDate).toLocaleDateString('en-IN')}
                      </TableCell>
                    )}

                    <TableCell className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 rounded-full">
                            <MoreHorizontal className="h-4 w-4 text-text-secondary" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border border-border">
                          <DropdownMenuItem onClick={() => onSelectRFQ(row.id)} className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                            <Eye className="h-3.5 w-3.5 text-text-secondary" />
                            Open Drawer View
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer Controls */}
      <div className="flex items-center justify-between gap-4 mt-4">
        <span className="text-xs text-text-secondary font-semibold">
          Page {currentPage} of {totalPages} ({data.length} total items)
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="h-8 px-2 font-bold flex items-center"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="h-8 px-2 font-bold flex items-center"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
