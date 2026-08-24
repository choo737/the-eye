import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, X, Lock, ChevronDown } from 'lucide-react';

interface DateRangePickerProps {
  value?: string | { startDate?: string; endDate?: string; preset?: string };
  onChange: (value: any) => void;
  label?: string;
  minDate?: string;
  maxDate?: string;
  maxBackdate?: string; // e.g. "12m", "6m", "1y", "90d"
  availablePresets?: string[];
}

interface DatePreset {
  id: string;
  label: string;
  getRange: () => { start: Date; end: Date };
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  label = 'Date Range',
  minDate,
  maxDate,
  maxBackdate,
  availablePresets
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reference base date (2026-08-24)
  const baseDate = useMemo(() => new Date(2026, 7, 24), []);

  // Helper to parse relative date expressions like "-12m", "6m", "1y", "today"
  const parseDateExpression = (expr?: string, isMin: boolean = true): Date => {
    if (!expr) {
      if (maxBackdate && isMin) {
        return parseRelativeWindow(maxBackdate);
      }
      return isMin ? new Date(2024, 0, 1) : new Date(2026, 11, 31);
    }

    const trimmed = expr.trim().toLowerCase();
    if (trimmed === 'today' || trimmed === 'now') return new Date(2026, 7, 24);
    if (trimmed.startsWith('-') || trimmed.endsWith('m') || trimmed.endsWith('y') || trimmed.endsWith('d')) {
      return parseRelativeWindow(trimmed);
    }

    const parsed = new Date(expr);
    return isNaN(parsed.getTime()) ? (isMin ? new Date(2024, 0, 1) : new Date(2026, 11, 31)) : parsed;
  };

  const parseRelativeWindow = (windowStr: string): Date => {
    const clean = windowStr.replace(/[^0-9a-z]/gi, '').toLowerCase();
    const d = new Date(baseDate.getTime());

    if (clean.endsWith('m')) {
      const months = parseInt(clean) || 12;
      d.setMonth(d.getMonth() - months);
    } else if (clean.endsWith('y')) {
      const years = parseInt(clean) || 1;
      d.setFullYear(d.getFullYear() - years);
    } else if (clean.endsWith('d')) {
      const days = parseInt(clean) || 30;
      d.setDate(d.getDate() - days);
    }
    return d;
  };

  const parsedMinDate = useMemo(() => {
    if (maxBackdate && !minDate) {
      return parseRelativeWindow(maxBackdate);
    }
    return parseDateExpression(minDate, true);
  }, [minDate, maxBackdate, baseDate]);

  const parsedMaxDate = useMemo(() => {
    return parseDateExpression(maxDate, false);
  }, [maxDate, baseDate]);

  const ALL_PRESETS: DatePreset[] = [
    {
      id: 'today',
      label: 'Today',
      getRange: () => ({ start: new Date(2026, 7, 24), end: new Date(2026, 7, 24) })
    },
    {
      id: 'yesterday',
      label: 'Yesterday',
      getRange: () => ({ start: new Date(2026, 7, 23), end: new Date(2026, 7, 23) })
    },
    {
      id: 'last_7_days',
      label: 'Last 7 Day(s)',
      getRange: () => ({ start: new Date(2026, 7, 18), end: new Date(2026, 7, 24) })
    },
    {
      id: 'last_15_days',
      label: 'Last 15 Day(s)',
      getRange: () => ({ start: new Date(2026, 7, 10), end: new Date(2026, 7, 24) })
    },
    {
      id: 'last_30_days',
      label: 'Last 30 Day(s)',
      getRange: () => ({ start: new Date(2026, 6, 25), end: new Date(2026, 7, 24) })
    },
    {
      id: 'this_month',
      label: 'This Month',
      getRange: () => ({ start: new Date(2026, 7, 1), end: new Date(2026, 7, 24) })
    },
    {
      id: 'last_month',
      label: 'Last Month',
      getRange: () => ({ start: new Date(2026, 6, 1), end: new Date(2026, 6, 31) })
    },
    {
      id: 'last_3_months',
      label: 'Last 3 Month(s)',
      getRange: () => ({ start: new Date(2026, 4, 1), end: new Date(2026, 7, 24) })
    },
    {
      id: 'last_6_months',
      label: 'Last 6 Month(s)',
      getRange: () => ({ start: new Date(2026, 1, 1), end: new Date(2026, 7, 24) })
    },
    {
      id: 'ytd',
      label: 'Year to Date (YTD)',
      getRange: () => ({ start: new Date(2026, 0, 1), end: new Date(2026, 7, 24) })
    },
    {
      id: 'all_time',
      label: 'All-Time Historical',
      getRange: () => ({ start: new Date(parsedMinDate), end: new Date(2026, 7, 24) })
    }
  ];

  const activePresets = useMemo(() => {
    if (!availablePresets || availablePresets.length === 0) return ALL_PRESETS;
    return ALL_PRESETS.filter(p => availablePresets.includes(p.id));
  }, [availablePresets, parsedMinDate]);

  const [selectedPreset, setSelectedPreset] = useState<string>('ytd');
  const [startDate, setStartDate] = useState<Date>(new Date(2026, 0, 1));
  const [endDate, setEndDate] = useState<Date>(new Date(2026, 7, 24));
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Text input states for direct typing
  const [fromInputText, setFromInputText] = useState<string>('01/01/2026');
  const [toInputText, setToInputText] = useState<string>('08/24/2026');
  const [inputError, setInputError] = useState<string | null>(null);

  // Month and Year views for Left & Right calendar cards
  const [leftViewMonth, setLeftViewMonth] = useState<number>(6); // July
  const [leftViewYear, setLeftViewYear] = useState<number>(2026);
  const [rightViewMonth, setRightViewMonth] = useState<number>(7); // August
  const [rightViewYear, setRightViewYear] = useState<number>(2026);

  const formatDateString = (d: Date): string => {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  const parseInputDate = (str: string): Date | null => {
    const parts = str.trim().split(/[\/\-\.]/);
    if (parts.length !== 3) return null;
    let mm = parseInt(parts[0]);
    let dd = parseInt(parts[1]);
    let yyyy = parseInt(parts[2]);
    if (yyyy < 100) yyyy += 2000;
    if (isNaN(mm) || isNaN(dd) || isNaN(yyyy)) return null;
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31 || yyyy < 2000 || yyyy > 2050) return null;
    const d = new Date(yyyy, mm - 1, dd);
    return isNaN(d.getTime()) ? null : d;
  };

  useEffect(() => {
    setFromInputText(formatDateString(startDate));
    setToInputText(formatDateString(endDate));
  }, [startDate, endDate]);

  useEffect(() => {
    if (typeof value === 'string') {
      const match = ALL_PRESETS.find(p => p.id === value);
      if (match) {
        setSelectedPreset(match.id);
        const { start, end } = match.getRange();
        setStartDate(start);
        setEndDate(end);
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const isDateDisabled = (date: Date): boolean => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const min = new Date(parsedMinDate.getFullYear(), parsedMinDate.getMonth(), parsedMinDate.getDate());
    const max = new Date(parsedMaxDate.getFullYear(), parsedMaxDate.getMonth(), parsedMaxDate.getDate());
    return d < min || d > max;
  };

  // Direct typing handlers
  const handleFromType = (val: string) => {
    setFromInputText(val);
    const parsed = parseInputDate(val);
    if (parsed) {
      if (isDateDisabled(parsed)) {
        setInputError(`Date must be between ${formatDateString(parsedMinDate)} and ${formatDateString(parsedMaxDate)}`);
        return;
      }
      setInputError(null);
      setSelectedPreset('custom');
      setStartDate(parsed);
      setLeftViewMonth(parsed.getMonth());
      setLeftViewYear(parsed.getFullYear());
    }
  };

  const handleToType = (val: string) => {
    setToInputText(val);
    const parsed = parseInputDate(val);
    if (parsed) {
      if (isDateDisabled(parsed)) {
        setInputError(`Date must be between ${formatDateString(parsedMinDate)} and ${formatDateString(parsedMaxDate)}`);
        return;
      }
      setInputError(null);
      setSelectedPreset('custom');
      setEndDate(parsed);
      setRightViewMonth(parsed.getMonth());
      setRightViewYear(parsed.getFullYear());
    }
  };

  const handleSelectPreset = (preset: DatePreset) => {
    setSelectedPreset(preset.id);
    const { start, end } = preset.getRange();
    setStartDate(start);
    setEndDate(end);
    setInputError(null);

    setLeftViewMonth(start.getMonth());
    setLeftViewYear(start.getFullYear());
    let nextMonth = start.getMonth() + 1;
    let nextYear = start.getFullYear();
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    setRightViewMonth(nextMonth);
    setRightViewYear(nextYear);
  };

  const handleApply = () => {
    setIsOpen(false);
    onChange({
      startDate: formatDateString(startDate),
      endDate: formatDateString(endDate),
      preset: selectedPreset,
      label: selectedPreset === 'custom' 
        ? `${formatDateString(startDate)} – ${formatDateString(endDate)}` 
        : ALL_PRESETS.find(p => p.id === selectedPreset)?.label || `${formatDateString(startDate)} – ${formatDateString(endDate)}`
    });
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const YEAR_OPTIONS = [2024, 2025, 2026, 2027];

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    setSelectedPreset('custom');
    setInputError(null);
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(date);
    } else if (startDate && !endDate) {
      if (date < startDate) {
        setStartDate(date);
        setEndDate(startDate);
      } else {
        setEndDate(date);
      }
    }
  };

  // Render month card with Month & Year Select Dropdowns for instant 1-click jumps
  const renderCalendarCard = (
    month: number, 
    year: number, 
    setMonth: (m: number) => void,
    setYear: (y: number) => void,
    onPrev: () => void, 
    onNext: () => void
  ) => {
    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({ date: d, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true });
    }

    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }

    return (
      <div className="flex-1 bg-slate-900/90 rounded-2xl p-3 border border-slate-800/80 shadow-inner">
        {/* Month & Year Selectors Header */}
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800">
          <button
            type="button"
            onClick={onPrev}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Quick Month & Year Dropdown Selectors */}
          <div className="flex items-center gap-1.5">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-bold text-slate-200 cursor-pointer focus:outline-none focus:border-cyan-500"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx}>{name}</option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-bold text-cyan-400 cursor-pointer focus:outline-none focus:border-cyan-500"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onNext}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Weekday Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1.5 uppercase">
          {weekdays.map(w => (
            <div key={w} className="py-0.5">{w}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
          {days.map((item, idx) => {
            const disabled = isDateDisabled(item.date);
            const isStart = !disabled && startDate && item.date.toDateString() === startDate.toDateString();
            const isEnd = !disabled && endDate && item.date.toDateString() === endDate.toDateString();
            const inRange = !disabled && startDate && endDate && item.date >= startDate && item.date <= endDate;
            const inHoverRange = !disabled && startDate && !endDate && hoverDate && item.date >= startDate && item.date <= hoverDate;

            let cellClass = 'h-7 flex items-center justify-center rounded-lg transition text-xs ';

            if (disabled) {
              cellClass += 'text-slate-700 opacity-25 cursor-not-allowed pointer-events-none ';
            } else if (!item.isCurrentMonth) {
              cellClass += 'text-slate-600 hover:text-slate-400 cursor-pointer ';
            } else if (isStart || isEnd) {
              cellClass += 'bg-cyan-500 text-slate-950 font-black shadow-md scale-105 z-10 cursor-pointer ';
            } else if (inRange || inHoverRange) {
              cellClass += 'bg-cyan-500/20 text-cyan-200 font-semibold cursor-pointer ';
            } else {
              cellClass += 'text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer ';
            }

            return (
              <div
                key={idx}
                onClick={() => handleDateClick(item.date)}
                onMouseEnter={() => !disabled && setHoverDate(item.date)}
                className={cellClass}
              >
                {item.date.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const displayLabel = ALL_PRESETS.find(p => p.id === selectedPreset)?.label 
    ? `${formatDateString(startDate)} – ${formatDateString(endDate)} (${ALL_PRESETS.find(p => p.id === selectedPreset)?.label})`
    : `${formatDateString(startDate)} – ${formatDateString(endDate)}`;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-left font-semibold text-cyan-300 flex items-center justify-between shadow-inner transition group"
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="truncate">{displayLabel}</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 ml-1.5 font-bold">
          Select Date
        </span>
      </button>

      {/* Advanced Dual Calendar Popover Modal with Direct Typing & Quick Month/Year Dropdowns */}
      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-2 z-50 bg-slate-950 border border-slate-700 rounded-3xl p-4 sm:p-5 shadow-2xl w-[680px] max-w-[calc(100vw-2rem)] animate-in fade-in zoom-in-95 duration-150"
          style={{ backgroundColor: '#020617', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(51, 65, 85, 0.6)' }}
        >
          {/* Top Date Inputs Row (Direct Editable Typing Enabled) */}
          <div className="flex flex-col gap-2 pb-3 mb-3 border-b border-slate-800">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 focus-within:border-cyan-500/80 rounded-xl px-3.5 py-2 shadow-inner transition">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">From</span>
                <input
                  type="text"
                  value={fromInputText}
                  onChange={(e) => handleFromType(e.target.value)}
                  placeholder="MM/DD/YYYY"
                  className="w-full bg-transparent text-xs font-mono font-bold text-cyan-300 focus:outline-none placeholder:text-slate-600"
                />
              </div>
              <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 focus-within:border-cyan-500/80 rounded-xl px-3.5 py-2 shadow-inner transition">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">To</span>
                <input
                  type="text"
                  value={toInputText}
                  onChange={(e) => handleToType(e.target.value)}
                  placeholder="MM/DD/YYYY"
                  className="w-full bg-transparent text-xs font-mono font-bold text-cyan-300 focus:outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            {inputError && (
              <span className="text-[10px] text-rose-400 font-semibold px-1 animate-in fade-in">
                ⚠️ {inputError}
              </span>
            )}

            {(minDate || maxDate || maxBackdate) && (
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-cyan-500/70" /> Allowed Window ({maxBackdate ? `Max ${maxBackdate} Backdate` : 'Bound'}):
                </span>
                <span className="text-cyan-400 font-bold">
                  {formatDateString(parsedMinDate)} – {formatDateString(parsedMaxDate)}
                </span>
              </div>
            )}
          </div>

          {/* Main Body: Dual Month Cards with Month/Year Pickers + Quick Presets Sidebar */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left Month Calendar Card */}
            {renderCalendarCard(
              leftViewMonth, 
              leftViewYear, 
              (m) => setLeftViewMonth(m),
              (y) => setLeftViewYear(y),
              () => {
                if (leftViewMonth === 0) {
                  setLeftViewMonth(11);
                  setLeftViewYear(leftViewYear - 1);
                } else {
                  setLeftViewMonth(leftViewMonth - 1);
                }
              },
              () => {
                if (leftViewMonth === 11) {
                  setLeftViewMonth(0);
                  setLeftViewYear(leftViewYear + 1);
                } else {
                  setLeftViewMonth(leftViewMonth + 1);
                }
              }
            )}

            {/* Right Month Calendar Card */}
            {renderCalendarCard(
              rightViewMonth, 
              rightViewYear, 
              (m) => setRightViewMonth(m),
              (y) => setRightViewYear(y),
              () => {
                if (rightViewMonth === 0) {
                  setRightViewMonth(11);
                  setRightViewYear(rightViewYear - 1);
                } else {
                  setRightViewMonth(rightViewMonth - 1);
                }
              },
              () => {
                if (rightViewMonth === 11) {
                  setRightViewMonth(0);
                  setRightViewYear(rightViewYear + 1);
                } else {
                  setRightViewMonth(rightViewMonth + 1);
                }
              }
            )}

            {/* Right Quick Presets Sidebar */}
            <div className="w-full md:w-40 bg-slate-900/90 rounded-2xl p-2.5 border border-slate-800/80 flex flex-col gap-1 overflow-y-auto max-h-[300px] shadow-inner">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 px-2 pb-1 border-b border-slate-800">
                Quick Presets
              </span>
              {activePresets.map((preset) => {
                const isSelected = selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{preset.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setSelectedPreset('custom')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition mt-1 pt-1.5 border-t border-slate-800 ${
                  selectedPreset === 'custom'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Custom Range
              </button>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3.5 mt-3.5 border-t border-slate-800">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
