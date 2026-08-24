import React from 'react';
import { Filter, Calendar, Layers, Tag, X } from 'lucide-react';
import { FilterSpec } from '../core/types';

interface FilterBarProps {
  filters?: FilterSpec[];
  activeFilters: Record<string, any>;
  onFilterChange: (filterId: string, value: any) => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters = [],
  activeFilters,
  onFilterChange,
  onResetFilters
}) => {
  if (filters.length === 0) return null;

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-wrap items-center gap-3 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider pr-2 border-r border-slate-800">
        <Filter className="w-3.5 h-3.5 text-cyan-400" />
        <span>Filters</span>
      </div>

      {filters.map((filter) => {
        const val = activeFilters[filter.id] ?? filter.default;

        if (filter.type === 'daterange') {
          return (
            <div key={filter.id} className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400 font-medium">{filter.label}:</span>
              <select
                value={typeof val === 'string' ? val : '2026-YTD'}
                onChange={(e) => onFilterChange(filter.id, e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="2026-YTD">2026 YTD</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_90_days">Last Quarter</option>
                <option value="all_time">All Time</option>
              </select>
            </div>
          );
        }

        if (filter.type === 'multi_select' || filter.type === 'single_select') {
          const options = filter.options || [];
          return (
            <div key={filter.id} className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400 font-medium">{filter.label}:</span>
              <select
                value={Array.isArray(val) ? val[0] : val}
                onChange={(e) => onFilterChange(filter.id, filter.type === 'multi_select' ? [e.target.value] : e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                {options.map((opt) => (
                  <option key={String(opt.value)} value={String(opt.value)} className="bg-slate-900 text-slate-200">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        return null;
      })}

      <button
        onClick={onResetFilters}
        className="ml-auto text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-medium hover:underline transition"
      >
        <X className="w-3 h-3" /> Reset All
      </button>
    </div>
  );
};
