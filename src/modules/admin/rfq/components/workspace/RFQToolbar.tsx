import { Search, RotateCcw, Download, Plus } from 'lucide-react';
import { Select } from '../../../../../components/ui/Select';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import { OWNERS, LOCATIONS, VALUE_RANGES, SAVED_FILTERS } from '../../constants/filters';
import { RFQPriority } from '../../constants/priority';

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
    { label: 'Select Saved Filter...', value: 'none' },
    ...SAVED_FILTERS.map(f => ({ label: f.name, value: f.id }))
  ];

  return (
    <div className="flex flex-col gap-4 w-full bg-surface-secondary/20 p-4 border-b border-border text-left select-none animate-in fade-in duration-300">
      {/* Top Search & Primary Triggers Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            <Search className="h-4 w-4" />
          </span>
          <Input
            placeholder="Search by RFQ #, company, or project type..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 border-border bg-surface w-full"
          />
        </div>

        {/* Global Saved Filter Selector & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Saved Filters */}
          <div className="w-52">
            <Select
              options={savedFilterOptions}
              value={savedFilterId || 'none'}
              onChange={(e) => onApplySavedFilter(e.target.value)}
              placeholder="Saved Filters"
              className="h-10 text-xs font-semibold"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('csv')}
            className="h-10 text-xs font-bold flex items-center gap-1.5"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onCreateRFQ}
            className="h-10 text-xs font-extrabold flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Create RFQ
          </Button>
        </div>
      </div>

      {/* Bottom Segmented Filter Options Row */}
      <div className="flex flex-wrap items-end gap-3 pt-1 border-t border-border/40">
        <div className="w-40">
          <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Priority</span>
          <Select
            options={priorityOptions}
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <div className="w-44">
          <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Owner</span>
          <Select
            options={ownerOptions}
            value={owner}
            onChange={(e) => onOwnerChange(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <div className="w-44">
          <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Location</span>
          <Select
            options={locationOptions}
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <div className="w-48">
          <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Value Est.</span>
          <Select
            options={valueOptions}
            value={valueRangeIndex}
            onChange={(e) => onValueRangeChange(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        {/* Clear Filters Option */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="h-9 px-3 text-xs font-bold text-text-secondary hover:text-text-primary border-dashed border-border flex items-center gap-1 ml-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
}
