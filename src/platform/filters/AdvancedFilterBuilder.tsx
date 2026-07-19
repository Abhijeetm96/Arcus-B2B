/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Plus, Trash2, Check, X } from 'lucide-react';

export interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: any;
  valueEnd?: any; // For 'between' ranges
}

export interface FilterField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'enum';
  options?: string[];
}

interface AdvancedFilterBuilderProps {
  fields: FilterField[];
  onApply: (conditions: FilterCondition[]) => void;
  onClose: () => void;
  initialConditions?: FilterCondition[];
}

const OPERATORS_BY_TYPE = {
  string: ['contains', 'equals', 'starts_with', 'ends_with'],
  number: ['equals', 'greater_than', 'less_than', 'between'],
  date: ['equals', 'before', 'after', 'between', 'relative_today', 'relative_past_7_days', 'relative_past_30_days'],
  boolean: ['equals'],
  enum: ['equals', 'in'],
};

export const AdvancedFilterBuilder: React.FC<AdvancedFilterBuilderProps> = ({
  fields,
  onApply,
  onClose,
  initialConditions = [],
}) => {
  const [conditions, setConditions] = useState<FilterCondition[]>(() => {
    return initialConditions.length > 0
      ? initialConditions
      : [{ id: 'cond_initial', field: fields[0]?.key || '', operator: 'equals', value: '' }];
  });

  const handleAddCondition = () => {
    setConditions((prev) => [
      ...prev,
      {
        id: `cond_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        field: fields[0]?.key || '',
        operator: 'equals',
        value: '',
      },
    ]);
  };

  const handleRemoveCondition = (id: string) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpdateCondition = (id: string, updates: Partial<FilterCondition>) => {
    setConditions((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const next = { ...c, ...updates };
          // Reset operator if field changes
          if (updates.field) {
            const fieldType = fields.find((f) => f.key === updates.field)?.type || 'string';
            next.operator = OPERATORS_BY_TYPE[fieldType][0];
            next.value = '';
            next.valueEnd = undefined;
          }
          return next;
        }
        return c;
      })
    );
  };

  const handleApply = () => {
    // Filter out incomplete conditions
    const valid = conditions.filter((c) => c.field && c.operator && c.value !== '');
    onApply(valid);
    onClose();
  };

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-lg w-full max-w-2xl z-30">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Advanced Filters</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-1">
        {conditions.map((condition) => {
          const activeField = fields.find((f) => f.key === condition.field);
          const fieldType = activeField?.type || 'string';
          const operators = OPERATORS_BY_TYPE[fieldType] || [];

          return (
            <div key={condition.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {/* Field Select */}
              <select
                value={condition.field}
                onChange={(e) => handleUpdateCondition(condition.id, { field: e.target.value })}
                className="w-full sm:w-44 border-slate-200 rounded-md py-1 text-slate-700 text-xs focus:ring-primary focus:border-primary"
              >
                {fields.map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.label}
                  </option>
                ))}
              </select>

              {/* Operator Select */}
              <select
                value={condition.operator}
                onChange={(e) => handleUpdateCondition(condition.id, { operator: e.target.value })}
                className="w-full sm:w-36 border-slate-200 rounded-md py-1 text-slate-700 text-xs focus:ring-primary focus:border-primary"
              >
                {operators.map((op) => (
                  <option key={op} value={op}>
                    {op.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>

              {/* Value Input */}
              {condition.operator !== 'relative_today' &&
                condition.operator !== 'relative_past_7_days' &&
                condition.operator !== 'relative_past_30_days' && (
                  <div className="flex items-center gap-2 flex-1 w-full">
                    {fieldType === 'enum' && activeField?.options ? (
                      <select
                        value={condition.value}
                        onChange={(e) => handleUpdateCondition(condition.id, { value: e.target.value })}
                        className="w-full border-slate-200 rounded-md py-1 text-slate-700 text-xs focus:ring-primary focus:border-primary"
                      >
                        <option value="">Select Value</option>
                        {activeField.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : fieldType === 'date' ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <input
                          type="date"
                          value={condition.value}
                          onChange={(e) => handleUpdateCondition(condition.id, { value: e.target.value })}
                          className="w-full border-slate-200 rounded-md py-1 text-slate-700 text-xs focus:ring-primary focus:border-primary"
                        />
                        {condition.operator === 'between' && (
                          <>
                            <span className="text-2xs text-slate-400">and</span>
                            <input
                              type="date"
                              value={condition.valueEnd || ''}
                              onChange={(e) => handleUpdateCondition(condition.id, { valueEnd: e.target.value })}
                              className="w-full border-slate-200 rounded-md py-1 text-slate-700 text-xs focus:ring-primary focus:border-primary"
                            />
                          </>
                        )}
                      </div>
                    ) : fieldType === 'boolean' ? (
                      <select
                        value={String(condition.value)}
                        onChange={(e) => handleUpdateCondition(condition.id, { value: e.target.value === 'true' })}
                        className="w-full border-slate-200 rounded-md py-1 text-slate-700 text-xs focus:ring-primary focus:border-primary"
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-1.5 w-full">
                        <input
                          type={fieldType === 'number' ? 'number' : 'text'}
                          value={condition.value}
                          onChange={(e) => handleUpdateCondition(condition.id, { value: e.target.value })}
                          placeholder="Enter value"
                          className="w-full border-slate-200 rounded-md py-1 text-slate-700 text-xs focus:ring-primary focus:border-primary"
                        />
                        {condition.operator === 'between' && (
                          <>
                            <span className="text-2xs text-slate-400">and</span>
                            <input
                              type="number"
                              value={condition.valueEnd || ''}
                              onChange={(e) => handleUpdateCondition(condition.id, { valueEnd: e.target.value })}
                              placeholder="Max"
                              className="w-full border-slate-200 rounded-md py-1 text-slate-700 text-xs focus:ring-primary focus:border-primary"
                            />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

              {/* Remove Action */}
              {conditions.length > 1 && (
                <button
                  onClick={() => handleRemoveCondition(condition.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 self-end sm:self-center transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <button
          onClick={handleAddCondition}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          <Plus size={14} /> Add Filter Rule
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-primary hover:bg-primary-hover text-white shadow-xs"
          >
            <Check size={14} /> Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
