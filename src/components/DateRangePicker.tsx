import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, X, Clock } from 'lucide-react';

interface DateRangePickerProps {
  value?: string | { startDate?: string; endDate?: string; preset?: string };
  onChange: (value: any) => void;
  label?: string;
}

interface DatePreset {
  id: string;
  label: string;
  getRange: () => { start: Date; end: Date };
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  label = 'Date Range'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reference date: 2026-08-24 (Dashboard current date)
  const baseDate = new Date(2026, 7, 24); // Aug 24, 2026

  const PRESETS: DatePreset[] = [
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
      id: '2026-YTD',
      label: '2026 YTD',
      getRange: () => ({ start: new Date(2026, 0, 1), end: new Date(2026, 7, 24) })
    },
    {
      id: 'all_time',
      label: 'All-Time Historical',
      getRange: () => ({ start: new Date(2025, 0, 1), end: new Date(2026, 7, 24) })
    }
  ];

  // Internal state
  const [selectedPreset, setSelectedPreset] = useState<string>('2026-YTD');
  const [startDate, setStartDate] = useState<Date>(new Date(2026, 0, 1));
  const [endDate, setEndDate] = useState<Date>(new Date(2026, 7, 24));
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Calendar views
  const [leftViewMonth, setLeftViewMonth] = useState<number>(6); // July 2026
  const [leftViewYear, setLeftViewYear] = useState<number>(2026);
  const [rightViewMonth, setRightViewMonth] = useState<number>(7); // August 2026
  const [rightViewYear, setRightViewYear] = useState<number>(2026);

  // Parse incoming value
  useEffect(() => {
    if (typeof value === 'string') {
      const match = PRESETS.find(p => p.id === value);
      if (match) {
        setSelectedPreset(match.id);
        const { start, end } = match.getRange();
        setStartDate(start);
        setEndDate(end);
      }
    }
  }, [value]);

  // Click outside to close
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

  const formatDateString = (d: Date): string => {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  const handleSelectPreset = (preset: DatePreset) => {
    setSelectedPreset(preset.id);
    const { start, end } = preset.getRange();
    setStartDate(start);
    setEndDate(end);
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
        : PRESETS.find(p => p.id === selectedPreset)?.label || `${formatDateString(startDate)} – ${formatDateString(endDate)}`
    });
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const handlePrevLeftMonth = () => {
    if (leftViewMonth === 0) {
      setLeftViewMonth(11);
      setLeftViewYear(leftViewYear - 1);
    } else {
      setLeftViewMonth(leftViewMonth - 1);
    }
  };

  const handleNextLeftMonth = () => {
    if (leftViewMonth === 11) {
      setLeftViewMonth(0);
      setLeftViewYear(leftViewYear + 1);
    } else {
      setLeftViewMonth(leftViewMonth + 1);
    }
  };

  const handlePrevRightMonth = () => {
    if (rightViewMonth === 0) {
      setRightViewMonth(11);
      setRightViewYear(rightViewYear - 1);
    } else {
      setRightViewMonth(rightViewMonth - 1);
    }
  };

  const handleNextRightMonth = () => {
    if (rightViewMonth === 11) {
      setRightViewMonth(0);
      setRightViewYear(rightViewYear + 1);
    } else {
      setRightViewMonth(rightViewMonth + 1);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedPreset('custom');
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

  // Helper to render a month calendar grid
  const renderCalendar = (month: number, year: number) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true });
    }

    // Next month leading days (fill 42 slots for standard 6-row grid)
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }

    return (
      <div className="flex-1 min-w-[240px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-200">
            {monthNames[month]} – {year}
          </span>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1">
          {weekdays.map(w => (
            <div key={w} className="py-1">{w}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {days.map((item, idx) => {
            const isStart = startDate && item.date.toDateString() === startDate.toDateString();
            const isEnd = endDate && item.date.toDateString() === endDate.toDateString();
            const inRange = startDate && endDate && item.date >= startDate && item.date <= endDate;
            const inHoverRange = startDate && !endDate && hoverDate && item.date >= startDate && item.date <= hoverDate;

            let cellClass = 'py-1.5 rounded-lg font-medium transition cursor-pointer ';
            if (!item.isCurrentMonth) {
              cellClass += 'text-slate-600 hover:text-slate-400 ';
            } else if (isStart || isEnd) {
              cellClass += 'bg-cyan-500 text-slate-950 font-bold shadow-md ';
            } else if (inRange || inHoverRange) {
              cellClass += 'bg-cyan-500/20 text-cyan-200 font-semibold ';
            } else {
              cellClass += 'text-slate-300 hover:bg-slate-800 hover:text-white ';
            }

            return (
              <div
                key={idx}
                onClick={() => handleDateClick(item.date)}
                onMouseEnter={() => setHoverDate(item.date)}
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

  const displayLabel = PRESETS.find(p => p.id === selectedPreset)?.label 
    ? `${formatDateString(startDate)} – ${formatDateString(endDate)} (${PRESETS.find(p => p.id === selectedPreset)?.label})`
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
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 ml-1.5">
          Select Date
        </span>
      </button>

      {/* Advanced Dual Calendar Popover Modal */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-slate-950/98 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl w-[680px] max-w-[90vw] animate-in fade-in zoom-in-95 duration-150">
          {/* Top Date Inputs Row */}
          <div className="grid grid-cols-2 gap-3 pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">From</span>
              <input
                type="text"
                readOnly
                value={formatDateString(startDate)}
                className="w-full bg-transparent text-xs font-mono font-bold text-white focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">To</span>
              <input
                type="text"
                readOnly
                value={formatDateString(endDate)}
                className="w-full bg-transparent text-xs font-mono font-bold text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Main Body: Dual Month Calendars + Right Presets Sidebar */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left & Right Dual Calendars */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Calendar Navigation Arrows */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevLeftMonth}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextLeftMonth}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevRightMonth}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextRightMonth}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dual Month Calendar Renderers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderCalendar(leftViewMonth, leftViewYear)}
                {renderCalendar(rightViewMonth, rightViewYear)}
              </div>
            </div>

            {/* Right Quick Presets Sidebar */}
            <div className="w-full md:w-44 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4 flex flex-col gap-1 overflow-y-auto max-h-[260px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">
                Quick Presets
              </span>
              {PRESETS.map((preset) => {
                const isSelected = selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span>{preset.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
              <button
                onClick={() => setSelectedPreset('custom')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold text-left transition ${
                  selectedPreset === 'custom'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                Custom Range
              </button>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 mt-4 border-t border-slate-800">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
