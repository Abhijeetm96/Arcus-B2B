import { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
import type { RFQDetail } from '../../../types/rfqTypes';
import { EmptyStateContainer } from '../../shared/EmptyStateContainer';

interface ItemsTabProps {
  rfq: RFQDetail;
}

type SortField = 'itemName' | 'quantity' | 'targetPrice';
type SortOrder = 'asc' | 'desc';

export function ItemsTab({ rfq }: ItemsTabProps) {
  const items = rfq.items || [];
  
  // States
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [sortField, setSortField] = useState<SortField>('itemName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // Resizable column widths in pixels
  const [colWidths, setColWidths] = useState<Record<string, number>>({
    name: 200,
    spec: 220,
    qty: 90,
    price: 110
  });

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
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
  const sortedItems = [...items].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (sortField === 'quantity') {
      aVal = Number(a.quantity) || 0;
      bVal = Number(b.quantity) || 0;
    } else if (sortField === 'targetPrice') {
      aVal = Number(a.targetPrice) || 0;
      bVal = Number(b.targetPrice) || 0;
    } else {
      aVal = String(a.itemName || '').toLowerCase();
      bVal = String(b.itemName || '').toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Simple Column Resizing Logic
  const startResize = (colKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = colWidths[colKey];

    const doDrag = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      setColWidths(prev => ({
        ...prev,
        [colKey]: Math.max(70, startWidth + deltaX)
      }));
    };

    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  return (
    <div className="space-y-4 text-left select-none animate-in fade-in duration-200 h-[450px] flex flex-col">
      {items.length === 0 ? (
        <EmptyStateContainer
          title="No Items Found"
          description="This RFQ does not contain any requested materials or items list."
          icon={Layers}
        />
      ) : (
        <div className="border border-slate-100 rounded-lg overflow-hidden bg-white shadow-sm flex-1 flex flex-col">
          <div className="overflow-y-auto overflow-x-auto flex-1">
            <table className="w-full text-xs text-left border-collapse table-layout-fixed">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                <tr className="text-slate-500 font-bold uppercase tracking-wider">
                  <th 
                    style={{ width: colWidths.name }}
                    className="py-3 px-3 relative select-none"
                  >
                    <div 
                      onClick={() => handleSort('itemName')}
                      className="flex items-center gap-1.5 cursor-pointer hover:text-slate-800 transition-colors"
                    >
                      Item / Material
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                    <div 
                      onMouseDown={(e) => startResize('name', e)}
                      className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-slate-300"
                    />
                  </th>
                  <th 
                    style={{ width: colWidths.spec }}
                    className="py-3 px-3 relative select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      Specification
                    </div>
                    <div 
                      onMouseDown={(e) => startResize('spec', e)}
                      className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-slate-300"
                    />
                  </th>
                  <th 
                    style={{ width: colWidths.qty }}
                    className="py-3 px-3 text-right relative select-none"
                  >
                    <div 
                      onClick={() => handleSort('quantity')}
                      className="flex items-center justify-end gap-1.5 cursor-pointer hover:text-slate-800 transition-colors"
                    >
                      Qty
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                    <div 
                      onMouseDown={(e) => startResize('qty', e)}
                      className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-slate-300"
                    />
                  </th>
                  <th 
                    style={{ width: colWidths.price }}
                    className="py-3 px-3 text-right relative select-none"
                  >
                    <div 
                      onClick={() => handleSort('targetPrice')}
                      className="flex items-center justify-end gap-1.5 cursor-pointer hover:text-slate-800 transition-colors"
                    >
                      Target Price
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                    <div 
                      onMouseDown={(e) => startResize('price', e)}
                      className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-slate-300"
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedItems.map((it) => {
                  const isExpanded = expandedRows[it.id] || false;
                  return (
                    <tr key={it.id} className="hover:bg-slate-50/40 transition-colors flex-col">
                      <td colSpan={4} className="p-0">
                        <div 
                          onClick={() => toggleRow(it.id)}
                          className="flex items-center w-full py-3 px-3 cursor-pointer select-none"
                        >
                          <div style={{ width: colWidths.name }} className="font-bold text-slate-800 flex items-center gap-2 truncate pr-2">
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-400 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
                            {it.itemName}
                          </div>
                          <div style={{ width: colWidths.spec }} className="text-slate-500 font-medium truncate pr-2">
                            {it.description || 'N/A'}
                          </div>
                          <div style={{ width: colWidths.qty }} className="text-right font-mono font-bold text-slate-700 pr-2">
                            {it.quantity} <span className="text-[10px] text-slate-500 font-semibold">{it.unit}</span>
                          </div>
                          <div style={{ width: colWidths.price }} className="text-right font-bold text-slate-800">
                            {it.targetPrice ? `₹${it.targetPrice.toLocaleString('en-IN')}` : 'N/A'}
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="bg-slate-50/70 p-3 border-t border-slate-100 text-xs text-slate-600 space-y-2 select-none animate-in slide-in-from-top-1 duration-150">
                            <div>
                              <span className="font-semibold text-slate-700">Detailed Description:</span>{' '}
                              {it.description || 'No detailed specifications provided.'}
                            </div>
                            <div className="flex gap-6 text-[10px]">
                              <div>
                                <span className="font-semibold text-slate-700">Unit of Measurement:</span>{' '}
                                <span className="bg-white border px-1.5 py-0.5 rounded text-slate-600 font-medium">{it.unit}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-slate-700">Item Index ID:</span>{' '}
                                <span className="font-mono text-slate-500">{it.id}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
