import React from 'react';
import { WidgetSpec } from '../core/types';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';

interface KpiWidgetProps {
  widget: WidgetSpec;
  data: any;
}

export const KpiWidget: React.FC<KpiWidgetProps> = ({ widget, data }) => {
  const rawValue = data?.value;
  let formattedValue = '-';

  if (typeof rawValue === 'number') {
    if (widget.format === '$0.00a' || widget.format === '$0.0a') {
      if (rawValue >= 1000000) {
        formattedValue = `$${(rawValue / 1000000).toFixed(2)}M`;
      } else if (rawValue >= 1000) {
        formattedValue = `$${(rawValue / 1000).toFixed(1)}k`;
      } else {
        formattedValue = `$${rawValue.toLocaleString()}`;
      }
    } else if (widget.format === '0.0%' || widget.format === '0.00%') {
      formattedValue = `${rawValue.toFixed(1)}%`;
    } else if (widget.format === '0,0') {
      formattedValue = Math.round(rawValue).toLocaleString();
    } else if (widget.format && widget.format.includes('mos')) {
      formattedValue = `${rawValue.toFixed(1)} mos`;
    } else {
      formattedValue = rawValue.toLocaleString();
    }
  } else if (rawValue !== undefined) {
    formattedValue = String(rawValue);
  }

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

        {widget.sparkline && data?.sparklineData && (
          <div className="flex items-end gap-0.5 h-5 w-16">
            {data.sparklineData.map((val: number, idx: number) => {
              const max = Math.max(...data.sparklineData);
              const min = Math.min(...data.sparklineData);
              const heightPercent = max === min ? 50 : Math.max(15, Math.round(((val - min) / (max - min)) * 100));
              return (
                <div
                  key={idx}
                  style={{ height: `${heightPercent}%` }}
                  className="flex-1 bg-gradient-to-t from-cyan-500/40 to-cyan-400 rounded-t-sm group-hover:from-cyan-400 group-hover:to-sky-300 transition-all"
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
