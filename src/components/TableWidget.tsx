import React, { useState } from 'react';
import { WidgetSpec } from '../core/types';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface TableWidgetProps {
  widget: WidgetSpec;
  data: any;
}

export const TableWidget: React.FC<TableWidgetProps> = ({ widget, data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const rows: any[] = data?.rows || [];
  const columns = widget.table_columns || (rows.length > 0 ? Object.keys(rows[0]).map(k => ({ key: k, label: k })) : []);

  const filteredRows = rows.filter(row => {
    if (!searchTerm) return true;
    return Object.values(row).some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return sortOrder === 'asc' 
      ? String(aVal).localeCompare(String(bVal)) 
      : String(bVal).localeCompare(String(aVal));
  });

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const displayTitle = data?.dynamicTitle || widget.title;
  const displaySubtitle = data?.dynamicSubtitle || widget.subtitle;

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all shadow-sm h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 tracking-tight">{displayTitle}</h3>
          {displaySubtitle && <p className="text-xs text-slate-400 mt-0.5">{displaySubtitle}</p>}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-full sm:w-48"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-4 py-3 cursor-pointer hover:text-white transition select-none ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                    <span>{col.label}</span>
                    {sortKey === col.key && (
                      sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                  No matching records found
                </td>
              </tr>
            ) : (
              sortedRows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-850/60 transition">
                  {columns.map(col => {
                    const rawVal = row[col.key];
                    let display = rawVal;

                    if (col.format === '$0,0' && typeof rawVal === 'number') {
                      display = `$${rawVal.toLocaleString()}`;
                    } else if (col.format === '0.0%' && typeof rawVal === 'number') {
                      display = `${rawVal.toFixed(1)}%`;
                    } else if (col.format === '0,0' && typeof rawVal === 'number') {
                      display = Math.round(rawVal).toLocaleString();
                    }

                    return (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-slate-200 font-medium ${col.align === 'right' ? 'text-right font-mono' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                      >
                        {col.badge ? (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            String(rawVal).toLowerCase().includes('healthy') || String(rawVal).toLowerCase().includes('excellent') || String(rawVal).toLowerCase().includes('audited')
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : String(rawVal).toLowerCase().includes('warning') || String(rawVal).toLowerCase().includes('low stock')
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : String(rawVal).toLowerCase().includes('critical')
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          }`}>
                            {rawVal}
                          </span>
                        ) : (
                          display
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
