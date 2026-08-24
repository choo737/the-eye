import React from 'react';
import { WidgetSpec } from '../core/types';
import { formatValue } from '../utils/formatters';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';

interface KpiWidgetProps {
  widget: WidgetSpec;
  data: any;
}

export const KpiWidget: React.FC<KpiWidgetProps> = ({ widget, data }) => {
  const rawValue = data?.value;
  const formattedValue = (rawValue !== undefined && rawValue !== null)
    ? formatValue(rawValue, widget.format || '0,0')
    : '-';

  const comparisonText = data?.comparison_label || widget.comparison_label;
  const isPositive = comparisonText?.includes('+') || comparisonText?.includes('uplift');
  const isNegative = comparisonText?.includes('-');
  const displayTitle = data?.dynamicTitle || widget.title;

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all shadow-sm group">
      <div>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
            {displayTitle}
          </h3>
          {widget.target && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500" title={`Target: ${widget.target}`}>
              <Target className="w-3 h-3 text-cyan-400/70" />
              <span className="font-mono text-slate-400">{data?.target || widget.target}</span>
            </span>
          )}
        </div>

        <div className="mt-2.5 flex items-baseline gap-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            {formattedValue}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
        {comparisonText ? (
          <div className={`flex items-center gap-1 text-xs font-semibold ${
            isPositive ? 'text-emerald-400' : isNegative ? 'text-cyan-400' : 'text-slate-400'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : isNegative ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>{comparisonText}</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500">Live Telemetry</span>
        )}

        {/* Dynamic Sparkline SVG */}
        {data?.sparklineData && data.sparklineData.length > 0 && (
          <div className="h-6 w-20 flex items-end gap-1">
            {data.sparklineData.map((val: number, idx: number) => {
              const max = Math.max(...data.sparklineData);
              const heightPct = max > 0 ? Math.max(15, Math.round((val / max) * 100)) : 20;
              return (
                <div
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-t-sm transition-all duration-300 opacity-80 group-hover:opacity-100"
                  style={{ height: `${heightPct}%` }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
