import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

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

  const [selectedPreset, setSelectedPreset] = useState<string>('2026-YTD');
  const [startDate, setStartDate] = useState<Date>(new Date(2026, 0, 1));
  const [endDate, setEndDate] = useState<Date>(new Date(2026, 7, 24));
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Default calendar month views: Left = July 2026, Right = August 2026
  const [leftViewMonth, setLeftViewMonth] = useState<number>(6); // July (0-indexed)
  const [leftViewYear, setLeftViewYear] = useState<number>(2026);
  const [rightViewMonth, setRightViewMonth] = useState<number>(7); // August (0-indexed)
  const [rightViewYear, setRightViewYear] = useState<number>(2026);

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

    // Center calendar view around selected range
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

  // Left Calendar Navigation
  const prevLeftMonth = () => {
    if (leftViewMonth === 0) {
      setLeftViewMonth(11);
      setLeftViewYear(leftViewYear - 1);
    } else {
      setLeftViewMonth(leftViewMonth - 1);
    }
  };

  const nextLeftMonth = () => {
    if (leftViewMonth === 11) {
      setLeftViewMonth(0);
      setLeftViewYear(leftViewYear + 1);
    } else {
      setLeftViewMonth(leftViewMonth + 1);
    }
  };

  // Right Calendar Navigation
  const prevRightMonth = () => {
    if (rightViewMonth === 0) {
      setRightViewMonth(11);
      setRightViewYear(rightViewYear - 1);
    } else {
      setRightViewMonth(rightViewMonth - 1);
    }
  };

  const nextRightMonth = () => {
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

  // Helper to render an isolated Month Calendar Card with dedicated navigation header
  const renderCalendarCard = (
    month: number, 
    year: number, 
    onPrev: () => void, 
    onNext: () => void
  ) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
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

    // Next month leading days (fill standard 42 slots)
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }

    return (
      <div className="flex-1 bg-slate-900/90 rounded-2xl p-3 border border-slate-800/80 shadow-inner">
        {/* Month Header with aligned prev/next arrows */}
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800">
          <button
            type="button"
            onClick={onPrev}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-extrabold text-slate-100 tracking-tight">
            {monthNames[month]} – {year}
          </span>

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
            const isStart = startDate && item.date.toDateString() === startDate.toDateString();
            const isEnd = endDate && item.date.toDateString() === endDate.toDateString();
            const inRange = startDate && endDate && item.date >= startDate && item.date <= endDate;
            const inHoverRange = startDate && !endDate && hoverDate && item.date >= startDate && item.date <= hoverDate;

            let cellClass = 'h-8 flex items-center justify-center rounded-lg transition cursor-pointer ';

            if (!item.isCurrentMonth) {
              cellClass += 'text-slate-600 hover:text-slate-400 ';
            } else if (isStart || isEnd) {
              cellClass += 'bg-cyan-500 text-slate-950 font-black shadow-md scale-105 z-10 ';
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
        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 ml-1.5 font-bold">
          Select Date
        </span>
      </button>

      {/* Advanced Dual Calendar Popover Modal (Solid 100% Opacity Background & Crisp Borders) */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 z-50 bg-slate-950 border border-slate-700 rounded-3xl p-5 shadow-2xl w-[730px] max-w-[95vw] animate-in fade-in zoom-in-95 duration-150"
          style={{ backgroundColor: '#020617', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(51, 65, 85, 0.6)' }}
        >
          {/* Top Date Inputs Row */}
          <div className="grid grid-cols-2 gap-3 pb-3.5 mb-3.5 border-b border-slate-800">
            <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 shadow-inner">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">From</span>
              <input
                type="text"
                readOnly
                value={formatDateString(startDate)}
                className="w-full bg-transparent text-xs font-mono font-bold text-cyan-300 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 shadow-inner">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">To</span>
              <input
                type="text"
                readOnly
                value={formatDateString(endDate)}
                className="w-full bg-transparent text-xs font-mono font-bold text-cyan-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Main Body: Separated Dual Calendars + Right Presets Sidebar */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left Month Calendar Card */}
            {renderCalendarCard(leftViewMonth, leftViewYear, prevLeftMonth, nextLeftMonth)}

            {/* Right Month Calendar Card */}
            {renderCalendarCard(rightViewMonth, rightViewYear, prevRightMonth, nextRightMonth)}

            {/* Right Quick Presets Sidebar */}
            <div className="w-full md:w-48 bg-slate-900/90 rounded-2xl p-3 border border-slate-800/80 flex flex-col gap-1 overflow-y-auto max-h-[300px] shadow-inner">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 px-2 pb-1 border-b border-slate-800">
                Quick Presets
              </span>
              {PRESETS.map((preset) => {
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
