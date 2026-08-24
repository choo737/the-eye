import React, { useState, useRef, useEffect } from 'react';
import { Filter, Calendar, Layers, X, Check, ChevronDown, Sparkles } from 'lucide-react';
import { FilterSpec } from '../core/types';
import { DateRangePicker } from './DateRangePicker';

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
    if (typeof val === 'object' && val !== null) return true;
    return val && val !== '2026-YTD' && !String(val).startsWith('All');
  });

  return (
    <div ref={containerRef} className="bg-slate-900/95 border border-slate-800 rounded-3xl p-4 shadow-2xl backdrop-blur-xl space-y-3 relative z-30">
      {/* Filter Bar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-sm">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">
                Filter & Slice Controls
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold font-mono">
                Sticky Top Pin Active
              </span>
            </div>
          </div>
        </div>

        {hasActiveFilterOverrides && (
          <button
            onClick={onResetFilters}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition shadow-sm"
          >
            <X className="w-3.5 h-3.5" /> Clear All Filters
          </button>
        )}
      </div>

      {/* Filter Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {filters.map((filter) => {
          const val = activeFilters[filter.id] ?? filter.default;

          // 1. Advanced Dual-Calendar Date Range Filter
          if (filter.type === 'daterange') {
            return (
              <div key={filter.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between gap-1.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{filter.label}</span>
                </div>
                <DateRangePicker
                  value={val}
                  onChange={(newRange) => onFilterChange(filter.id, newRange)}
                  label={filter.label}
                  minDate={filter.min_date}
                  maxDate={filter.max_date}
                  availablePresets={filter.available_presets}
                />
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
              <div key={filter.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between gap-1.5 relative">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{filter.label}</span>
                  </div>
                  {!isAllSelected && (
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-mono font-bold">
                      {selectedList.length} Selected
                    </span>
                  )}
                </div>

                {/* Dropdown Trigger */}
                <button
                  type="button"
                  onClick={() => setOpenDropdownId(isOpen ? null : filter.id)}
                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 text-xs text-indigo-300 font-semibold flex items-center justify-between transition"
                >
                  <span className="truncate">
                    {isAllSelected ? 'All Selected (All Clusters)' : selectedList.join(', ')}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                </button>

                {/* Popover Menu */}
                {isOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-slate-950 border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-800/60 animate-in fade-in duration-150">
                    {options.map((opt) => {
                      const isChecked = selectedList.includes(String(opt.value));
                      return (
                        <div
                          key={String(opt.value)}
                          onClick={() => handleToggleOption(String(opt.value))}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 cursor-pointer text-xs transition"
                        >
                          <span className={isChecked ? 'text-white font-bold' : 'text-slate-400'}>
                            {opt.label}
                          </span>
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${isChecked ? 'bg-cyan-500 border-cyan-500 text-slate-950' : 'border-slate-700 bg-slate-900'}`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // 3. Single-Select Dropdown
          return (
            <div key={filter.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between gap-1.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <Filter className="w-3.5 h-3.5 text-emerald-400" />
                <span>{filter.label}</span>
              </div>
              <select
                value={val || ''}
                onChange={(e) => onFilterChange(filter.id, e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-300 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {(filter.options || []).map((opt) => (
                  <option key={String(opt.value)} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
};
