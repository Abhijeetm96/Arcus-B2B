import React from 'react';
import { X } from 'lucide-react';
import type { FilterCondition, FilterField } from './AdvancedFilterBuilder';

interface FilterChipsProps {
  conditions: FilterCondition[];
  fields: FilterField[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  conditions,
  fields,
  onRemove,
  onClearAll,
}) => {
  if (conditions.length === 0) return null;

  const renderValue = (c: FilterCondition) => {
    if (c.operator.startsWith('relative_')) {
      return c.operator.replace('relative_', '').replace(/_/g, ' ');
    }
    if (c.operator === 'between') {
      return `${c.value} to ${c.valueEnd}`;
    }
    return String(c.value);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border-b border-slate-100">
      <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider pl-1.5 pr-0.5">
        Filters:
      </span>
      {conditions.map((condition) => {
        const fieldLabel = fields.find((f) => f.key === condition.field)?.label || condition.field;
        return (
          <div
            key={condition.id}
            className="flex items-center gap-1 bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs shadow-2xs font-medium"
          >
            <span>{fieldLabel}</span>
            <span className="text-slate-400 font-normal">
              {condition.operator.replace(/_/g, ' ')}
            </span>
            <span className="text-slate-800">{renderValue(condition)}</span>
            <button
              onClick={() => onRemove(condition.id)}
              className="text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 p-0.5 ml-0.5 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
      <button
        onClick={onClearAll}
        className="text-2xs font-semibold text-primary hover:underline hover:text-primary-hover px-2 py-1 transition-colors"
      >
        Clear All
      </button>
    </div>
  );
};
