import React from 'react';
import { Filter, Calendar, Layers, X, Check } from 'lucide-react';
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

  const hasActiveFilterOverrides = Object.keys(activeFilters).length > 0;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Interactive Global Filter Bar
          </span>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            (Cross-Filtering Enabled)
          </span>
        </div>

        {hasActiveFilterOverrides && (
          <button
            onClick={onResetFilters}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition"
          >
            <X className="w-3.5 h-3.5" /> Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {filters.map((filter) => {
          const val = activeFilters[filter.id] ?? filter.default;

          // 1. Date Range Filter
          if (filter.type === 'daterange') {
            const currentVal = typeof val === 'string' ? val : '2026-YTD';
            return (
              <div key={filter.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-between gap-1.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{filter.label}</span>
                </div>
                <select
                  value={currentVal}
                  onChange={(e) => onFilterChange(filter.id, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="2026-YTD">📅 2026 YTD (Full Year)</option>
                  <option value="last_90_days">📅 Last Quarter (Q2 2026)</option>
                  <option value="last_30_days">📅 Last 30 Days (Current Month)</option>
                  <option value="all_time">📅 All-Time Historical</option>
                </select>
              </div>
            );
          }

          // 2. Multi-Select Filter (Interactive Chips / Dropdown)
          if (filter.type === 'multi_select') {
            const options = filter.options || [];
            const selectedList: string[] = Array.isArray(val) ? val : [val];
            const currentSelected = selectedList[0] || 'All Regions';

            return (
              <div key={filter.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-between gap-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{filter.label}</span>
                  </div>
                  {!selectedList.includes('All Regions') && !selectedList.includes('All Channels') && (
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-mono">
                      Filtered: {selectedList.length}
                    </span>
                  )}
                </div>

                <select
                  value={currentSelected}
                  onChange={(e) => {
                    const chosen = e.target.value;
                    onFilterChange(filter.id, chosen === 'All Regions' || chosen === 'All Channels' ? [chosen] : [chosen]);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-indigo-300 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
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

          // 3. Single-Select Filter
          if (filter.type === 'single_select') {
            const options = filter.options || [];
            const currentVal = typeof val === 'string' ? val : (options[0]?.value || '');

            return (
              <div key={filter.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-between gap-1.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{filter.label}</span>
                </div>
                <select
                  value={String(currentVal)}
                  onChange={(e) => onFilterChange(filter.id, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
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
      </div>
    </div>
  );
};
