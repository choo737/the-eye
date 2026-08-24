import React, { useState, useRef, useEffect } from 'react';
import { Filter, Calendar, Layers, X, Check, ChevronDown } from 'lucide-react';
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
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (filters.length === 0) return null;

  const hasActiveFilterOverrides = Object.entries(activeFilters).some(([_, val]) => {
    if (Array.isArray(val)) return val.length > 0 && !val.includes('All Regions') && !val.includes('All Channels') && !val.includes('All Divisions');
    return val && val !== '2026-YTD' && !String(val).startsWith('All');
  });

  return (
    <div ref={containerRef} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3 relative z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Filter className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Filter & Slice Controls
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                Cross-Filtering Active
              </span>
            </div>
          </div>
        </div>

        {hasActiveFilterOverrides && (
          <button
            onClick={onResetFilters}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition"
          >
            <X className="w-3.5 h-3.5" /> Clear All Filters
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
              <div key={filter.id} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between gap-1.5">
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

          // 2. Multi-Select Filter with Checkbox Menu
          if (filter.type === 'multi_select') {
            const options = filter.options || [];
            const selectedList: string[] = Array.isArray(val) ? val : (val ? [val] : ['All Regions']);
            const isAllSelected = selectedList.includes('All Regions') || selectedList.includes('All Channels') || selectedList.length === 0;
            const isOpen = openDropdownId === filter.id;

            const handleToggleOption = (optVal: string) => {
              if (optVal === 'All Regions' || optVal === 'All Channels') {
                onFilterChange(filter.id, [optVal]);
                return;
              }

              let updated = selectedList.filter(s => s !== 'All Regions' && s !== 'All Channels');
              if (updated.includes(optVal)) {
                updated = updated.filter(s => s !== optVal);
                if (updated.length === 0) updated = ['All Regions'];
              } else {
                updated.push(optVal);
              }
              onFilterChange(filter.id, updated);
            };

            return (
              <div key={filter.id} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between gap-1.5 relative">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{filter.label}</span>
                  </div>
                  {!isAllSelected && (
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-bold">
                      {selectedList.length} Selected
                    </span>
                  )}
                </div>

                {/* Dropdown Trigger */}
                <button
                  type="button"
                  onClick={() => setOpenDropdownId(isOpen ? null : filter.id)}
                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-indigo-300 font-semibold flex items-center justify-between transition"
                >
                  <span className="truncate">
                    {isAllSelected ? 'All Selected (All Clusters)' : selectedList.join(', ')}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 space-y-1 max-h-56 overflow-y-auto">
                    {options.map((opt) => {
                      const optStr = String(opt.value);
                      const isChecked = selectedList.includes(optStr) || (isAllSelected && optStr.startsWith('All'));
                      return (
                        <div
                          key={optStr}
                          onClick={() => handleToggleOption(optStr)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition select-none ${
                            isChecked ? 'bg-cyan-500/10 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isChecked && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // 3. Single-Select Filter
          if (filter.type === 'single_select') {
            const options = filter.options || [];
            const currentVal = typeof val === 'string' ? val : (options[0]?.value || '');

            return (
              <div key={filter.id} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between gap-1.5">
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
