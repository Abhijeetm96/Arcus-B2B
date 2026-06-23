import React, { useEffect, useState } from 'react';

interface AuditLog {
  id?: number;
  actionType: string;
  details: string;
  performedBy: string;
  timestamp?: string;
}

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clickable log detail states
  const [selectedEntity, setSelectedEntity] = useState<{ type: string; id: string } | null>(null);
  const [entityData, setEntityData] = useState<any>(null);
  const [entityLoading, setEntityLoading] = useState(false);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('arcus_token');
        const res = await fetch('http://localhost:5000/api/admin/audit-logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load system audit logs.');
        const data = await res.json();
        // Sort logs: newest first if timestamp exists
        const sorted = data.sort((a: AuditLog, b: AuditLog) => {
          if (!a.timestamp || !b.timestamp) return 0;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        setLogs(sorted);
      } catch (err: any) {
        setError(err.message || 'Error fetching system audit logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const details = log.details || '';
    const actionType = log.actionType || '';
    const performedBy = log.performedBy || '';

    const matchSearch = details.toLowerCase().includes(search.toLowerCase()) ||
                        actionType.toLowerCase().includes(search.toLowerCase()) ||
                        performedBy.toLowerCase().includes(search.toLowerCase());

    const matchType = typeFilter === 'all' || actionType === typeFilter;

    return matchSearch && matchType;
  });

  const getActionBadgeClass = (type: string) => {
    switch (type) {
      case 'SETTINGS_CHANGE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'INVENTORY_CHANGE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'RFQ_UPDATE':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'CATALOG_CHANGE':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'SETTINGS_CHANGE':
        return 'settings';
      case 'INVENTORY_CHANGE':
        return 'warehouse';
      case 'RFQ_UPDATE':
        return 'request_quote';
      case 'CATALOG_CHANGE':
        return 'category';
      default:
        return 'history';
    }
  };

  const formatTimestamp = (ts?: string) => {
    if (!ts) return 'N/A';
    try {
      const date = new Date(ts);
      return date.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return ts;
    }
  };

  const parseClickableEntity = (details: string) => {
    const rfqMatch = details.match(/RFQ\s*(?:#|No\.?)?\s*([a-zA-Z0-9_-]+)/i);
    const orderMatch = details.match(/(?:Order|ord_)\s*(?:#|No\.?)?\s*([a-zA-Z0-9_]+)/i);
    const productMatch = details.match(/Product\s+(?:created|updated|deleted|adjusted)?\s*(?:for|:)?\s*([a-zA-Z0-9\s_-]+?)\s*\((?:SKU:\s*)?([a-zA-Z0-9_-]+)\)/i) || details.match(/SKU:\s*([a-zA-Z0-9_-]+)/i);

    if (rfqMatch) {
      return { type: 'rfq', id: rfqMatch[1] };
    }
    if (orderMatch) {
      return { type: 'order', id: orderMatch[1] };
    }
    if (productMatch) {
      const sku = productMatch[2] || productMatch[1];
      return { type: 'product', id: sku };
    }
    return null;
  };

  const handleEntityClick = async (type: string, id: string) => {
    setSelectedEntity({ type, id });
    setEntityLoading(true);
    setEntityData(null);
    try {
      const token = localStorage.getItem('arcus_token');
      if (type === 'product') {
        const res = await fetch(`http://localhost:5000/api/admin/products`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          let flat: any[] = [];
          if (Array.isArray(data)) {
            if (data.length > 0 && 'products' in data[0]) {
              data.forEach((c: any) => flat.push(...c.products));
            } else {
              flat = data;
            }
          }
          const found = flat.find(p => p.sku?.toLowerCase() === id.toLowerCase() || p.id?.toLowerCase() === id.toLowerCase());
          setEntityData(found || { name: 'Unknown Product', sku: id, price: 0 });
        }
      } else if (type === 'rfq') {
        const res = await fetch(`http://localhost:5000/api/rfqs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const found = data.find((r: any) => r.id === id);
          setEntityData(found);
        }
      } else if (type === 'order') {
        const res = await fetch(`http://localhost:5000/api/admin/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const found = data.find((o: any) => o.id === id || String(o.id).includes(id));
          setEntityData(found);
        }
      }
    } catch (err) {
      console.error('Error fetching entity details:', err);
    } finally {
      setEntityLoading(false);
    }
  };

  return (
    <div className="space-y-md text-left">
      {/* Notifications */}
      {error && (
        <div className="bg-red-50 text-red-800 p-md rounded-2xl border border-red-200">
          <p className="font-semibold">Error: {error}</p>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md bg-white p-md rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-sm w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[250px] md:max-w-md">
            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search by action, details, actor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-xxl pr-md border border-slate-200 rounded-xl text-body-sm focus:border-[#FFC107] focus:ring-0 bg-slate-50"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-11 px-md border border-slate-200 rounded-xl text-body-sm bg-slate-50 focus:border-[#FFC107] focus:ring-0 font-bold"
          >
            <option value="all">All Action Types</option>
            <option value="SETTINGS_CHANGE">Settings Changes</option>
            <option value="INVENTORY_CHANGE">Inventory Changes</option>
            <option value="RFQ_UPDATE">RFQ Pipeline Updates</option>
            <option value="CATALOG_CHANGE">Catalog Changes</option>
          </select>
        </div>

        <div className="text-xs bg-slate-100 text-slate-500 rounded-xl px-md py-sm font-extrabold font-label-caps uppercase tracking-wide">
          {filteredLogs.length} Events logged
        </div>
      </div>

      {/* Audit Logs Table */}
      {loading ? (
        <div className="flex justify-center py-xl">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FFC107]"></div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-lg py-md w-1/5">Timestamp</th>
                  <th className="px-lg py-md w-1/5">Action Type</th>
                  <th className="px-lg py-md w-2/5">Activity Details</th>
                  <th className="px-lg py-md w-1/5">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log, index) => (
                  <tr key={log.id || index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-lg py-md text-slate-500 font-mono text-xs whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-lg py-md">
                      <span className={`text-[10px] font-bold px-md py-1 rounded-full border inline-flex items-center gap-xs capitalize ${getActionBadgeClass(log.actionType)}`}>
                        <span className="material-symbols-outlined text-[12px]">{getActionIcon(log.actionType)}</span>
                        {log.actionType.replace('_', ' ').toLowerCase()}
                      </span>
                    </td>
                    <td className="px-lg py-md font-medium text-slate-700 break-words leading-relaxed">
                      {(() => {
                        const ent = parseClickableEntity(log.details);
                        if (ent) {
                          return (
                            <button
                              onClick={() => handleEntityClick(ent.type, ent.id)}
                              className="text-left text-[#FFC107] font-bold hover:underline hover:text-amber-600 transition-all inline-flex items-center gap-xs cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                              {log.details}
                            </button>
                          );
                        }
                        return log.details;
                      })()}
                    </td>
                    <td className="px-lg py-md font-bold text-slate-900">
                      {log.performedBy}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-xl text-slate-400 font-semibold">
                      No system log entries found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Side-Drawer Details Panel */}
      {selectedEntity && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer" 
              onClick={() => setSelectedEntity(null)}
            ></div>

            {/* Slide-over panel */}
            <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col text-left">
                {/* Header */}
                <div className="px-lg py-md border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-body-md capitalize flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[#FFC107]">
                        {selectedEntity.type === 'product' ? 'category' : selectedEntity.type === 'rfq' ? 'request_quote' : 'receipt_long'}
                      </span>
                      {selectedEntity.type} Details
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {selectedEntity.id}</p>
                  </div>
                  <button
                    onClick={() => setSelectedEntity(null)}
                    className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-lg space-y-lg">
                  {entityLoading ? (
                    <div className="flex flex-col justify-center items-center py-xl space-y-md h-60">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FFC107]"></div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Fetching details...</p>
                    </div>
                  ) : !entityData ? (
                    <div className="text-center py-xl text-slate-400 space-y-sm">
                      <span className="material-symbols-outlined text-[48px] text-slate-300">error_outline</span>
                      <p className="font-semibold text-body-sm">Details could not be resolved.</p>
                      <p className="text-xs text-slate-400">The referenced entity may have been deleted or is not accessible.</p>
                    </div>
                  ) : (
                    <div className="space-y-lg">
                      {/* Product details view */}
                      {selectedEntity.type === 'product' && (
                        <div className="space-y-md">
                          <div className="bg-slate-50 p-md rounded-xl border border-slate-100 space-y-sm">
                            <h4 className="font-extrabold text-slate-900 text-body-sm">{entityData.name}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">{entityData.description || 'No description provided.'}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-sm">
                            <div>
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">SKU</span>
                              <span className="text-body-sm font-mono font-bold text-slate-800">{entityData.sku || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Brand</span>
                              <span className="text-body-sm font-bold text-slate-800">{entityData.brand || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Model</span>
                              <span className="text-body-sm font-bold text-slate-800">{entityData.model || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Price</span>
                              <span className="text-body-sm font-black text-amber-600">{entityData.price || 'N/A'}</span>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-md space-y-sm">
                            <h5 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Inventory Metrics</h5>
                            <div className="grid grid-cols-3 gap-xs bg-slate-50 p-sm rounded-lg border border-slate-100 text-center font-bold text-[10px]">
                              <div>
                                <p className="text-slate-400 font-medium">Available</p>
                                <p className="text-slate-800 text-body-xs font-black">{entityData.inventory?.available ?? entityData.stock ?? 0}</p>
                              </div>
                              <div>
                                <p className="text-slate-400 font-medium">Reserved</p>
                                <p className="text-slate-800 text-body-xs font-black">{entityData.inventory?.reserved ?? 0}</p>
                              </div>
                              <div>
                                <p className="text-slate-400 font-medium">Reorder Level</p>
                                <p className="text-slate-800 text-body-xs font-black">{entityData.inventory?.reorderLevel ?? 10}</p>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-md grid grid-cols-2 gap-sm text-xs">
                            <div>
                              <span className="block text-[10px] font-bold text-slate-400 uppercase">GST Rate</span>
                              <span className="font-bold text-slate-700">{entityData.gstRate ?? 18}%</span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-slate-400 uppercase">HSN Code</span>
                              <span className="font-bold text-slate-700 font-mono">{entityData.hsnCode || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-slate-400 uppercase">Min Order Qty</span>
                              <span className="font-bold text-slate-700">{entityData.minimumOrderQuantity || 1} {entityData.minimumOrderUnit || 'Piece'}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-slate-400 uppercase">Lead Time (Days)</span>
                              <span className="font-bold text-slate-700">{entityData.leadTimeDays || 3} Days</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* RFQ details view */}
                      {selectedEntity.type === 'rfq' && (
                        <div className="space-y-md">
                          <div className="flex justify-between items-start bg-slate-50 p-md rounded-xl border border-slate-100">
                            <div>
                              <h4 className="font-extrabold text-slate-900 text-body-sm">{entityData.title || 'Inquiry Request'}</h4>
                              <p className="text-xs text-slate-400 mt-1">Submitted by buyer: {entityData.buyerId || 'Guest'}</p>
                            </div>
                            <span className="px-md py-1 rounded-full text-[10px] font-black uppercase bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20">
                              {entityData.status || 'Submitted'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-sm">
                            <div>
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Target Budget</span>
                              <span className="text-body-sm font-bold text-slate-800">{entityData.budget || 'Open / Not Specified'}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Submission Date</span>
                              <span className="text-body-sm font-bold text-slate-800">{entityData.timestamp ? new Date(entityData.timestamp).toLocaleDateString() : 'N/A'}</span>
                            </div>
                          </div>

                          {entityData.items && entityData.items.length > 0 && (
                            <div className="border-t border-slate-100 pt-md space-y-sm">
                              <h5 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Requested Items</h5>
                              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                                {entityData.items.map((item: any, i: number) => (
                                  <div key={i} className="p-md bg-white hover:bg-slate-50/50 flex justify-between items-center text-xs">
                                    <div>
                                      <p className="font-bold text-slate-900">{item.productName || item.productId}</p>
                                      <p className="text-slate-400 text-[10px]">SKU: {item.sku || 'N/A'}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-slate-900">Qty: {item.quantity}</p>
                                      {item.targetPrice && <p className="text-amber-600 font-semibold">Target: {item.targetPrice}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Order details view */}
                      {selectedEntity.type === 'order' && (
                        <div className="space-y-md">
                          <div className="flex justify-between items-start bg-slate-50 p-md rounded-xl border border-slate-100">
                            <div>
                              <h4 className="font-extrabold text-slate-900 text-body-sm">Order Summary</h4>
                              <p className="text-xs text-slate-400 mt-1">Customer: {entityData.userId || 'N/A'}</p>
                            </div>
                            <span className="px-md py-1 rounded-full text-[10px] font-black uppercase bg-green-50 text-green-700 border border-green-200">
                              {entityData.status || 'PENDING'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-sm">
                            <div>
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Value</span>
                              <span className="text-body-sm font-black text-amber-600">₹{entityData.totalAmount || entityData.totalPrice || '0.00'}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Placed At</span>
                              <span className="text-body-sm font-bold text-slate-800">{entityData.createdAt || entityData.timestamp || 'N/A'}</span>
                            </div>
                          </div>

                          {entityData.items && entityData.items.length > 0 && (
                            <div className="border-t border-slate-100 pt-md space-y-sm">
                              <h5 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Line Items</h5>
                              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                                {entityData.items.map((item: any, i: number) => (
                                  <div key={i} className="p-md bg-white hover:bg-slate-50/50 flex justify-between items-center text-xs">
                                    <div>
                                      <p className="font-bold text-slate-900">{item.productName || item.name}</p>
                                      <p className="text-slate-400 text-[10px]">Price: ₹{item.unitPrice || item.price}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-black text-slate-800">x{item.quantity}</p>
                                      <p className="font-bold text-amber-600">₹{(item.quantity * (item.unitPrice || item.price || 0)).toFixed(2)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-lg py-md border-t border-slate-200 bg-slate-50 flex justify-end">
                  <button
                    onClick={() => setSelectedEntity(null)}
                    className="px-xl h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Close Drawer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
