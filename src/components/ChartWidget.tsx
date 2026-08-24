import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { WidgetSpec } from '../core/types';
import { BarChart2, TrendingUp, Layers } from 'lucide-react';

interface ChartWidgetProps {
  widget: WidgetSpec;
  data: any;
  onChartClick?: (params: any) => void;
  onGrainChange?: (grain: string) => void;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ 
  widget, 
  data, 
  onChartClick,
  onGrainChange 
}) => {
  const [chartTypeOverride, setChartTypeOverride] = useState<string | null>(null);

  const effectiveType = chartTypeOverride || widget.type;

  const option = useMemo(() => {
    const textColor = '#94a3b8';
    const gridLineColor = 'rgba(255, 255, 255, 0.06)';
    const cyanPalette = ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa'];

    if (effectiveType === 'donut_chart' || effectiveType === 'pie_chart') {
      const pieData = data?.data || [];
      return {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
          backgroundColor: '#0f172a',
          borderColor: '#334155',
          textStyle: { color: '#f8fafc' }
        },
        legend: {
          bottom: '2%',
          left: 'center',
          textStyle: { color: textColor, fontSize: 11 },
          icon: 'circle'
        },
        color: cyanPalette,
        series: [
          {
            name: widget.title,
            type: 'pie',
            radius: effectiveType === 'donut_chart' ? ['45%', '72%'] : '68%',
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 6,
              borderColor: '#0f172a',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 13,
                fontWeight: 'bold',
                color: '#f8fafc'
              }
            },
            data: pieData
          }
        ]
      };
    }

    if (effectiveType === 'funnel') {
      const funnelData = data?.data || [];
      return {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}',
          backgroundColor: '#0f172a',
          borderColor: '#334155',
          textStyle: { color: '#f8fafc' }
        },
        color: cyanPalette,
        series: [
          {
            name: widget.title,
            type: 'funnel',
            left: '10%',
            top: 20,
            bottom: 20,
            width: '80%',
            min: 0,
            max: funnelData[0]?.value || 100,
            minSize: '15%',
            maxSize: '100%',
            sort: 'descending',
            gap: 4,
            label: {
              show: true,
              position: 'inside',
              color: '#fff',
              fontSize: 11
            },
            data: funnelData
          }
        ]
      };
    }

    if (effectiveType === 'radar') {
      const indicators = data?.indicators || [];
      const series = data?.series || [];
      return {
        tooltip: {
          backgroundColor: '#0f172a',
          borderColor: '#334155',
          textStyle: { color: '#f8fafc' }
        },
        radar: {
          indicator: indicators,
          radius: '65%',
          splitNumber: 4,
          axisName: {
            color: '#94a3b8',
            fontSize: 10
          },
          splitLine: {
            lineStyle: { color: gridLineColor }
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ['rgba(30, 41, 59, 0.4)', 'rgba(15, 23, 42, 0.6)']
            }
          },
          axisLine: {
            lineStyle: { color: gridLineColor }
          }
        },
        series: [
          {
            type: 'radar',
            data: series,
            areaStyle: {
              color: 'rgba(56, 189, 248, 0.25)'
            },
            lineStyle: {
              color: '#38bdf8',
              width: 2
            },
            itemStyle: {
              color: '#38bdf8'
            }
          }
        ]
      };
    }

    // Default Cartesian charts (Line, Area, Bar, Stacked Bar)
    const categories = data?.categories || [];
    const useDualAxis = !!data?.useDualAxis;

    const seriesList = (data?.series || []).map((s: any, idx: number) => {
      const isArea = effectiveType === 'area_chart';
      const isBar = effectiveType === 'bar_chart' || effectiveType === 'stacked_bar';
      const color = cyanPalette[idx % cyanPalette.length];

      return {
        name: s.name,
        type: isBar ? 'bar' : 'line',
        yAxisIndex: s.yAxisIndex !== undefined ? s.yAxisIndex : 0,
        stack: effectiveType === 'stacked_bar' ? 'total' : undefined,
        smooth: widget.smooth ?? true,
        data: s.data,
        itemStyle: {
          color: color,
          borderRadius: isBar ? [4, 4, 0, 0] : 0
        },
        areaStyle: isArea ? {
          opacity: 0.25,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: color },
              { offset: 1, color: 'transparent' }
            ]
          }
        } : undefined
      };
    });

    const yAxisConfig = useDualAxis ? [
      {
        type: 'value',
        name: 'Sales ($)',
        nameTextStyle: { color: textColor, fontSize: 10 },
        splitLine: { lineStyle: { color: gridLineColor } },
        axisLabel: {
          color: textColor,
          fontSize: 11,
          formatter: (val: number) => {
            if (val >= 1000000) return `$${(val / 1000000).toFixed(0)}M`;
            if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
            return `$${val}`;
          }
        }
      },
      {
        type: 'value',
        name: 'Footfall / Count',
        nameTextStyle: { color: textColor, fontSize: 10 },
        splitLine: { show: false },
        axisLabel: {
          color: '#818cf8',
          fontSize: 11,
          formatter: (val: number) => {
            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
            if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
            return val;
          }
        }
      }
    ] : [
      {
        type: 'value',
        splitLine: { lineStyle: { color: gridLineColor } },
        axisLabel: {
          color: textColor,
          fontSize: 11,
          formatter: (val: number) => {
            if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M`;
            if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
            return val;
          }
        }
      }
    ];

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: { color: '#64748b' }
        },
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc' }
      },
      legend: {
        top: 0,
        right: '2%',
        textStyle: { color: textColor, fontSize: 11 },
        icon: 'roundRect'
      },
      grid: {
        top: 35,
        left: '3%',
        right: useDualAxis ? '4%' : '3%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: { lineStyle: { color: gridLineColor } },
        axisLabel: { 
          color: textColor, 
          fontSize: 11,
          rotate: categories.length > 8 ? 20 : 0
        },
        axisTick: { show: false }
      },
      yAxis: yAxisConfig,
      series: seriesList
    };
  }, [widget, data, effectiveType]);

  const onEvents = useMemo(() => ({
    click: (params: any) => {
      if (onChartClick) onChartClick(params);
    }
  }), [onChartClick]);

  const isCartesian = ['line_chart', 'area_chart', 'bar_chart', 'stacked_bar'].includes(widget.type);
  const subtitleDisplay = data?.dynamicSubtitle || widget.subtitle;

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all shadow-sm h-full group">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100 tracking-tight">{widget.title}</h3>
            {data?.activeGrain && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {data.activeGrain} Grain
              </span>
            )}
          </div>
          {subtitleDisplay && <p className="text-xs text-slate-400 mt-0.5">{subtitleDisplay}</p>}
        </div>

        {/* Quick Granularity / Chart Morphing Switcher */}
        {isCartesian && (
          <div className="flex items-center gap-1 self-end sm:self-auto bg-slate-950/80 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setChartTypeOverride('line_chart')}
              title="Line Chart"
              className={`p-1 rounded text-xs transition ${effectiveType === 'line_chart' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartTypeOverride('bar_chart')}
              title="Bar Chart"
              className={`p-1 rounded text-xs transition ${effectiveType === 'bar_chart' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartTypeOverride('area_chart')}
              title="Area Chart"
              className={`p-1 rounded text-xs transition ${effectiveType === 'area_chart' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 w-full min-h-[220px]">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          onEvents={onEvents}
          opts={{ renderer: 'canvas' }}
        />
      </div>
    </div>
  );
};
