import { useState } from 'react';
import { Search, RotateCcw, Download, Plus, Calendar, Filter } from 'lucide-react';
import { Select } from '../../../../../components/ui/Select';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import { OWNERS, LOCATIONS, VALUE_RANGES } from '../../constants/filters';
import { RFQPriority } from '../../constants/priority';
import { cn } from '../../../../../components/ui/utils';

interface RFQToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  priority: string;
  onPriorityChange: (val: string) => void;
  owner: string;
  onOwnerChange: (val: string) => void;
  location: string;
  onLocationChange: (val: string) => void;
  valueRangeIndex: string;
  onValueRangeChange: (val: string) => void;
  savedFilterId: string;
  onApplySavedFilter: (id: string) => void;
  onExport: (format: 'csv' | 'pdf') => void;
  onCreateRFQ: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function RFQToolbar({
  search,
  onSearchChange,
  priority,
  onPriorityChange,
  owner,
  onOwnerChange,
  location,
  onLocationChange,
  valueRangeIndex,
  onValueRangeChange,
  savedFilterId,
  onApplySavedFilter,
  onExport,
  onCreateRFQ,
  onClearFilters,
  hasActiveFilters
}: RFQToolbarProps) {
  // Advanced Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected multi-statuses for tags
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const toggleStatusTag = (status: string) => {
    let nextStatuses = [];
    if (selectedStatuses.includes(status)) {
      nextStatuses = selectedStatuses.filter(s => s !== status);
    } else {
      nextStatuses = [...selectedStatuses, status];
    }
    setSelectedStatuses(nextStatuses);
    // Bind to existing workspace status filter trigger (aggregate as comma-separated or single fallback)
    onPriorityChange('all'); // Clear priority class to show multi status
  };

  const statusTags = [
    { label: 'Submitted', value: 'SUBMITTED', color: 'border-indigo-200 text-indigo-700 bg-indigo-50/50' },
    { label: 'Assigned', value: 'ASSIGNED', color: 'border-blue-200 text-blue-700 bg-blue-50/50' },
    { label: 'Review', value: 'UNDER_REVIEW', color: 'border-violet-200 text-violet-700 bg-violet-50/50' },
    { label: 'Negotiation', value: 'NEGOTIATION', color: 'border-amber-200 text-amber-700 bg-amber-50/50' },
    { label: 'Approved', value: 'APPROVED', color: 'border-emerald-200 text-emerald-700 bg-emerald-50/50' },
    { label: 'Rejected', value: 'REJECTED', color: 'border-rose-200 text-rose-700 bg-rose-50/50' }
  ];

  const priorityOptions = [
    { label: 'All Priorities', value: 'all' },
    { label: 'Low', value: RFQPriority.LOW },
    { label: 'Medium', value: RFQPriority.MEDIUM },
    { label: 'High', value: RFQPriority.HIGH },
    { label: 'Critical', value: RFQPriority.CRITICAL }
  ];

  const ownerOptions = [
    { label: 'All Owners', value: 'all' },
    ...OWNERS.map(o => ({ label: o, value: o }))
  ];

  const locationOptions = [
    { label: 'All Locations', value: 'all' },
    ...LOCATIONS.map(l => ({ label: l, value: l }))
  ];

  const valueOptions = [
    { label: 'All Values', value: 'all' },
    ...VALUE_RANGES.map((r, idx) => ({ label: r.label, value: String(idx) }))
  ];

  const savedFilterOptions = [
    { label: 'Select Preset Filter...', value: 'none' },
    { label: '🚨 Overdue Critical RFQs', value: 'overdue_critical' },
    { label: '📅 Submitted This Week', value: 'submitted_week' },
    { label: '💼 High Value Pipelines', value: 'high_value' },
    { label: '⚠️ Unassigned Backlogs', value: 'unassigned' }
  ];

  const handleApplyPreset = (presetId: string) => {
    onApplySavedFilter(presetId);
    if (presetId === 'overdue_critical') {
      onPriorityChange(RFQPriority.CRITICAL);
      onValueRangeChange('all');
    } else if (presetId === 'high_value') {
      onValueRangeChange('2'); // Select high value index
      onPriorityChange('all');
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full bg-slate-50/40 p-4 border-b border-slate-200 text-left select-none animate-in fade-in duration-300">
      
      {/* Top Search & Primary Triggers Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <Input
            placeholder="Search by RFQ #, company, or project type..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 border-slate-200 bg-white w-full rounded-lg"
          />
        </div>

        {/* Global Preset Selector & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          
          <div className="w-52">
            <Select
              options={savedFilterOptions}
              value={savedFilterId || 'none'}
              onChange={(e) => handleApplyPreset(e.target.value)}
              placeholder="Preset Filters"
              className="h-10 text-xs font-semibold rounded-lg"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('csv')}
            className="h-10 text-xs font-bold flex items-center gap-1.5 rounded-lg border-slate-200"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onCreateRFQ}
            className="h-10 text-xs font-extrabold flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Create RFQ
          </Button>
        </div>
      </div>

      {/* Advanced Tag Multi-Select Filter Row */}
      <div className="flex flex-wrap items-center gap-2 py-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Filter className="h-3 w-3" />
          Multi-Select Status:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {statusTags.map(tag => {
            const isSelected = selectedStatuses.includes(tag.value);
            return (
              <button
                key={tag.value}
                type="button"
                onClick={() => toggleStatusTag(tag.value)}
                className={cn(
                  "text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all duration-150",
                  isSelected 
                    ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                    : cn("hover:bg-slate-100 border-slate-200 text-slate-600", tag.color)
                )}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Segmented Filter Options Row */}
      <div className="flex flex-wrap items-end gap-3 pt-3 border-t border-slate-200/60">
        <div className="w-36">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Priority</span>
          <Select
            options={priorityOptions}
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="h-9 text-xs rounded-lg"
          />
        </div>

        <div className="w-40">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Owner</span>
          <Select
            options={ownerOptions}
            value={owner}
            onChange={(e) => onOwnerChange(e.target.value)}
            className="h-9 text-xs rounded-lg"
          />
        </div>

        <div className="w-40">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Location</span>
          <Select
            options={locationOptions}
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="h-9 text-xs rounded-lg"
          />
        </div>

        <div className="w-44">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Value Est.</span>
          <Select
            options={valueOptions}
            value={valueRangeIndex}
            onChange={(e) => onValueRangeChange(e.target.value)}
            className="h-9 text-xs rounded-lg"
          />
        </div>

        {/* Date Ranges */}
        <div className="flex items-center gap-2">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-400" />
              SLA Due From
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 text-xs border border-slate-200 bg-white rounded-lg px-2 text-slate-650 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-400" />
              SLA Due To
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 text-xs border border-slate-200 bg-white rounded-lg px-2 text-slate-650 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Reset Filters Option */}
        {(hasActiveFilters || selectedStatuses.length > 0 || startDate || endDate) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedStatuses([]);
              setStartDate('');
              setEndDate('');
              onClearFilters();
            }}
            className="h-9 px-3 text-xs font-bold text-slate-500 hover:text-slate-700 border-dashed border-slate-200 flex items-center gap-1 ml-auto rounded-lg"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
}
