import * as React from 'react';
import { LayoutDashboard, TableProperties, Sparkles, X } from 'lucide-react';
import { WorkspaceLayout } from '../../../components/layout/WorkspaceLayout';
import { RFQLayout } from './components/layout/RFQLayout';
import { RFQDashboard } from './components/dashboard/RFQDashboard';
import { RFQSidebar } from './components/workspace/RFQSidebar';
import { RFQToolbar } from './components/workspace/RFQToolbar';
import { RFQTable } from './components/workspace/RFQTable';
import { RFQDetailDrawer } from './components/drawer/RFQDetailDrawer';
import { LoadingState } from '../../../components/shared/States';
import { rfqService } from './services/rfq.service';
import type { RFQSummary, RFQDetail, RFQTimelineEvent } from './types/rfqTypes';
import { VALUE_RANGES, SAVED_FILTERS } from './constants/filters';
import { RFQStatus } from './constants/status';
import { RFQCreateDialog } from './components/workspace/RFQCreateDialog';

export function RFQWorkspace() {
  // 1. Navigation & Layout Tab State
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'workspace'>('dashboard');

  // 2. Data Lists State
  const [allRfqs, setAllRfqs] = React.useState<RFQSummary[]>([]);
  const [rfqSummaries, setRfqSummaries] = React.useState<RFQSummary[]>([]);
  const [selectedRfqDetail, setSelectedRfqDetail] = React.useState<RFQDetail | null>(null);
  const [activities, setActivities] = React.useState<(RFQTimelineEvent & { rfqNumber: string; companyName: string })[]>([]);
  
  // 3. UI Loading & Feedback States
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<Record<string, boolean>>({});
  
  // Toast Alert Notification state
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // 4. Primary Filters State
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [priorityFilter, setPriorityFilter] = React.useState('all');
  const [ownerFilter, setOwnerFilter] = React.useState('all');
  const [locationFilter, setLocationFilter] = React.useState('all');
  const [valueRangeIndex, setValueRangeIndex] = React.useState('all');
  const [savedFilterId, setSavedFilterId] = React.useState('none');

  // Load RFQ dataset and activities
  const loadData = async () => {
    setIsLoading(true);
    try {
      const minVal = valueRangeIndex !== 'all' ? VALUE_RANGES[Number(valueRangeIndex)].min : undefined;
      const maxVal = valueRangeIndex !== 'all' ? VALUE_RANGES[Number(valueRangeIndex)].max : undefined;

      const list = await rfqService.getRFQList({
        search,
        priority: priorityFilter,
        owner: ownerFilter,
        location: locationFilter,
        minVal,
        maxVal
      });
      setAllRfqs(list);

      const filtered = statusFilter === 'all'
        ? list
        : list.filter(r => r.status === statusFilter);
      setRfqSummaries(filtered);

      // Extract activities for recent activity log (from all mock details)
      const allActivities: (RFQTimelineEvent & { rfqNumber: string; companyName: string })[] = [];
      // Fetch details of first 10 for the timeline feed (fast mapping)
      for (const item of list.slice(0, 10)) {
        const detail = await rfqService.getRFQDetail(item.id);
        if (detail && detail.timeline) {
          detail.timeline.forEach(evt => {
            allActivities.push({
              ...evt,
              rfqNumber: detail.rfqNumber,
              companyName: detail.companyName
            });
          });
        }
      }
      setActivities(
        allActivities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 8)
      );
    } catch (err) {
      console.error('Failed to load RFQs', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRFQ = async (data: any) => {
    try {
      setIsLoading(true);
      await rfqService.createRFQ(data);
      setIsCreateOpen(false);
      triggerToast('RFQ successfully dispatched and created', 'success');
      await loadData();
    } catch (err) {
      console.error(err);
      triggerToast('Failed to create RFQ', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger reload on filter adjustments
  React.useEffect(() => {
    const handler = setTimeout(() => {
      loadData();
    }, 150); // slight debounce for search inputs
    return () => clearTimeout(handler);
  }, [search, statusFilter, priorityFilter, ownerFilter, locationFilter, valueRangeIndex]);

  // Load single RFQ details when clicked
  const handleSelectRFQ = async (id: string) => {
    try {
      const detail = await rfqService.getRFQDetail(id);
      if (detail) {
        setSelectedRfqDetail(detail);
        setIsDrawerOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper trigger to show custom alert banner
  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Reset all workspace filters
  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setOwnerFilter('all');
    setLocationFilter('all');
    setValueRangeIndex('all');
    setSavedFilterId('none');
    setSelectedRows({});
    triggerToast('Workspace filters cleared', 'info');
  };

  // Apply predefined saved filters
  const handleApplySavedFilter = (id: string) => {
    setSavedFilterId(id);
    if (id === 'none') {
      handleClearFilters();
      return;
    }
    const filter = SAVED_FILTERS.find(f => f.id === id);
    if (filter) {
      setStatusFilter(filter.status);
      setPriorityFilter(filter.priority);
      setOwnerFilter(filter.owner);
      if ('minVal' in filter) {
        setValueRangeIndex('3'); // ₹20L - ₹1Cr range index
      } else {
        setValueRangeIndex('all');
      }
      triggerToast(`Applied Saved Filter: "${filter.name}"`, 'success');
    }
  };

  // Sidebar category filter counts calculator
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: allRfqs.length };
    
    // Add counts for specific statuses using base categories
    Object.values(RFQStatus).forEach(st => {
      counts[st] = allRfqs.filter(r => r.status === st).length;
    });
    return counts;
  }, [allRfqs]);

  // Handle detailed note posts (interactive drawer notes tab)
  const handleAddNote = async (text: string, isInternal: boolean, parentCommentId?: string) => {
    if (!selectedRfqDetail) return;
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch(`http://localhost:5000/api/admin/rfqs/${selectedRfqDetail.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ text, isInternal, parentCommentId })
      });
      if (!res.ok) throw new Error('Failed to post comment');
      
      triggerToast(isInternal ? 'Internal note added' : 'Customer comment posted', 'success');
      await handleRefreshDrawer();
      loadData(); // reload dashboard activity feed
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefreshDrawer = async () => {
    if (!selectedRfqDetail) return;
    try {
      const detail = await rfqService.getRFQDetail(selectedRfqDetail.id);
      if (detail) {
        setSelectedRfqDetail(detail);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Drawer action dispatcher
  const handleDrawerAction = async (actionKey: string) => {
    if (!selectedRfqDetail) return;
    try {
      if (actionKey === 'CREATE_QUOTATION') {
        const updated = await rfqService.createQuotation(
          selectedRfqDetail.id,
          { value: selectedRfqDetail.value * 0.95, validityDays: 30 },
          'Vikram Sharma',
          'Sales Representative'
        );
        setSelectedRfqDetail(updated);
        triggerToast(`Quotation Version ${updated.quotations.length}.0 Drafted`, 'success');
      } else if (actionKey === 'CONVERT_TO_ORDER') {
        const updated = await rfqService.changeStatus(
          selectedRfqDetail.id,
          RFQStatus.CONVERTED,
          'Vikram Sharma',
          'Sales Representative'
        );
        setSelectedRfqDetail(updated);
        triggerToast(`RFQ successfully converted to Order ORD-2026-CONF`, 'success');
      } else if (actionKey === 'ASSIGN') {
        const updated = await rfqService.assignOwner(
          selectedRfqDetail.id,
          'Vikram Sharma',
          'Vikram Sharma',
          'Sales Representative'
        );
        setSelectedRfqDetail(updated);
        triggerToast('RFQ assigned to your pipeline', 'success');
      } else {
        // Fallback for mock actions
        triggerToast(`Mock Trigger: Action "${actionKey}" executed for ${selectedRfqDetail.rfqNumber}`, 'info');
      }
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk actions status dispatcher
  const handleBulkStatusChange = async (newStatus: string) => {
    const idsToChange = Object.keys(selectedRows).filter(id => selectedRows[id]);
    if (idsToChange.length === 0) return;

    setIsLoading(true);
    try {
      for (const id of idsToChange) {
        await rfqService.changeStatus(id, newStatus, 'Vikram Sharma', 'Sales Representative');
      }
      setSelectedRows({});
      triggerToast(`Successfully transitioned ${idsToChange.length} RFQs to "${newStatus}"`, 'success');
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const hasActiveFilters = search !== '' || statusFilter !== 'all' || priorityFilter !== 'all' || ownerFilter !== 'all' || locationFilter !== 'all' || valueRangeIndex !== 'all';

  return (
    <RFQLayout>
      {/* Page Title & Navigation Switches */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="font-extrabold text-2xl text-text-primary tracking-tight">RFQ Control Center</h2>
          <p className="text-xs text-text-secondary mt-1">
            Manage incoming procurement briefs, quotation negotiations, and order bookings.
          </p>
        </div>

        {/* View Mode Tab switcher */}
        <div className="inline-flex items-center rounded bg-slate-100 p-1 border border-border shrink-0 self-start md:self-center">
          <button
            onClick={() => { setActiveTab('dashboard'); setIsDrawerOpen(false); }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white text-text-primary shadow-sm border border-border'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('workspace')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded transition-all ${
              activeTab === 'workspace'
                ? 'bg-white text-text-primary shadow-sm border border-border'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <TableProperties className="h-4 w-4" />
            RFQ Workspace
          </button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`flex items-center justify-between p-3 border rounded text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-250'
              : toast.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border-amber-250'
              : 'bg-slate-50 text-slate-800 border-border'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-current hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Workspace Frame */}
      {isLoading && rfqSummaries.length === 0 ? (
        <LoadingState text="Bootstrapping RFQ Workspace..." />
      ) : activeTab === 'dashboard' ? (
        <RFQDashboard
          rfqs={allRfqs}
          activities={activities}
          onSelectRFQ={handleSelectRFQ}
          onViewAll={() => setActiveTab('workspace')}
          onActionClick={(action) => triggerToast(`Mock Trigger: Dashboard Quick Action "${action}" launched`, 'info')}
        />
      ) : (
        <WorkspaceLayout
          splitPane
          workspaceSidebar={
            <RFQSidebar
              selectedStatus={statusFilter}
              onStatusChange={(status) => { setStatusFilter(status); setSelectedRows({}); }}
              counts={statusCounts}
            />
          }
          workspaceDetails={
            <RFQTable
              data={rfqSummaries}
              selectedRfqId={selectedRfqDetail?.id || null}
              onSelectRFQ={handleSelectRFQ}
              selectedRows={selectedRows}
              onRowSelectChange={(id, checked) => setSelectedRows(prev => ({ ...prev, [id]: checked }))}
              onSelectAllRows={(checked) => {
                const updated: Record<string, boolean> = {};
                rfqSummaries.forEach(r => { updated[r.id] = checked; });
                setSelectedRows(updated);
              }}
              onBulkStatusChange={handleBulkStatusChange}
            />
          }
          toolbar={
            <RFQToolbar
              search={search}
              onSearchChange={setSearch}
              priority={priorityFilter}
              onPriorityChange={setPriorityFilter}
              owner={ownerFilter}
              onOwnerChange={setOwnerFilter}
              location={locationFilter}
              onLocationChange={setLocationFilter}
              valueRangeIndex={valueRangeIndex}
              onValueRangeChange={setValueRangeIndex}
              savedFilterId={savedFilterId}
              onApplySavedFilter={handleApplySavedFilter}
              onExport={(fmt) => triggerToast(`Mock Export: Initiated down-streaming RFQ summary data to ${fmt.toUpperCase()}`, 'success')}
              onCreateRFQ={() => setIsCreateOpen(true)}
              onClearFilters={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          }
        />
      )}

      {/* Details Side-Drawer / Pull Sheet overlay */}
      <RFQDetailDrawer
        rfq={selectedRfqDetail}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAddNote={handleAddNote}
        onDownloadAttachment={(fname) => triggerToast(`Mock Download: Commencing download of attachment "${fname}"`, 'success')}
        onDownloadQuote={(qid) => {
          const token = localStorage.getItem('arcus_token') || '';
          window.open(`/api/documents/${qid}?format=pdf&download=true&token=${encodeURIComponent(token)}`, '_blank');
        }}
        onAction={handleDrawerAction}
        onRefresh={handleRefreshDrawer}
      />

      <RFQCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateRFQ}
      />
    </RFQLayout>
  );
}
