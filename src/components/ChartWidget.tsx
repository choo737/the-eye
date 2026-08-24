import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { WidgetSpec } from '../core/types';
import { formatValue } from '../utils/formatters';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart, 
  TrendingUp, 
  Info,
  Maximize2,
  Table as TableIcon
} from 'lucide-react';

interface ChartWidgetProps {
  widget: WidgetSpec;
  data: any;
  onChartClick?: (params: any) => void;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  widget,
  data,
  onChartClick
}) => {
  const [chartTypeOverride, setChartTypeOverride] = useState<string | null>(null);

  const effectiveType = chartTypeOverride || widget.type;

  const option = useMemo(() => {
    const textColor = '#94a3b8';
    const gridLineColor = 'rgba(255, 255, 255, 0.06)';
    const cyanPalette = ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa'];

    // 1. Donut and Pie Charts (Strict Declarative Formatting)
    if (effectiveType === 'donut_chart' || effectiveType === 'pie_chart') {
      const pieData = data?.data || [];
      return {
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            const formattedVal = formatValue(params.value, widget.format || 'RM 0.0a');
            return `<div style="font-weight: bold; margin-bottom: 2px;">${params.name}</div>
                    <div style="display: flex; align-items: center; gap: 8px; justify-content: space-between;">
                      <span>${params.marker} Sales:</span>
                      <strong>${formattedVal}</strong>
                      <span style="color: #94a3b8; font-size: 11px;">(${params.percent}%)</span>
                    </div>`;
          },
          backgroundColor: '#0f172a',
          borderColor: '#334155',
          textStyle: { color: '#f8fafc' }
        },
        legend: {
          bottom: 4,
          left: 'center',
          itemWidth: 9,
          itemHeight: 9,
          itemGap: 10,
          type: 'scroll',
          pageIconColor: '#38bdf8',
          pageTextStyle: { color: '#94a3b8', fontSize: 10 },
          textStyle: { color: textColor, fontSize: 10.5 },
          icon: 'circle'
        },
        color: cyanPalette,
        series: [
          {
            name: data?.dynamicTitle || widget.title,
            type: 'pie',
            center: ['50%', '40%'], // Raised center to avoid legend collision
            radius: effectiveType === 'donut_chart' ? ['38%', '64%'] : '60%',
            avoidLabelOverlap: true,
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
                fontSize: 12,
                fontWeight: 'bold',
                color: '#f8fafc',
                formatter: (params: any) => `${params.name}\n${formatValue(params.value, widget.format || 'RM 0.0a')}`
              }
            },
            data: pieData
          }
        ]
      };
    }

    // 2. Funnel Charts
    if (effectiveType === 'funnel') {
      const funnelData = data?.data || [];
      return {
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => `${params.name}: <strong>${formatValue(params.value, widget.format || '0,0')}</strong>`,
          backgroundColor: '#0f172a',
          borderColor: '#334155',
          textStyle: { color: '#f8fafc' }
        },
        color: cyanPalette,
        series: [
          {
            name: data?.dynamicTitle || widget.title,
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
              fontSize: 11,
              formatter: (params: any) => `${params.name}: ${formatValue(params.value, widget.format || '0,0')}`
            },
            data: funnelData
          }
        ]
      };
    }

    // 3. Radar Charts
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

    // 4. Default Cartesian charts (Line, Area, Bar, Stacked Bar)
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

    const primaryAxisName = Array.isArray(widget.y) ? widget.y[0] : (widget.y || 'Sales (RM)');
    const secondaryAxisName = Array.isArray(widget.y) && widget.y[1] ? widget.y[1] : 'Footfall / Count';

    const yAxisConfig = useDualAxis ? [
      {
        type: 'value',
        name: primaryAxisName,
        nameTextStyle: { color: textColor, fontSize: 10 },
        splitLine: { lineStyle: { color: gridLineColor } },
        axisLabel: {
          color: textColor,
          fontSize: 11,
          formatter: (val: number) => formatValue(val, widget.format || 'RM 0.0a')
        }
      },
      {
        type: 'value',
        name: secondaryAxisName,
        nameTextStyle: { color: textColor, fontSize: 10 },
        splitLine: { show: false },
        axisLabel: {
          color: '#818cf8',
          fontSize: 11,
          formatter: (val: number) => formatValue(val, '0.0a')
        }
      }
    ] : [
      {
        type: 'value',
        name: primaryAxisName,
        splitLine: { lineStyle: { color: gridLineColor } },
        axisLabel: {
          color: textColor,
          fontSize: 11,
          formatter: (val: number) => formatValue(val, widget.format || 'RM 0.0a')
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
        textStyle: { color: '#f8fafc' },
        formatter: (params: any[]) => {
          let res = `<div style="font-weight: bold; margin-bottom: 4px;">${params[0].axisValueLabel || params[0].name}</div>`;
          params.forEach(p => {
            const isCount = p.seriesName.toLowerCase().includes('count') || p.seriesName.toLowerCase().includes('transaction');
            const fmt = isCount ? '0,0' : (widget.format || 'RM 0,0');
            const val = formatValue(p.value, fmt);
            res += `<div style="display: flex; justify-content: space-between; gap: 16px; margin-top: 2px;">
              <span>${p.marker} ${p.seriesName}</span>
              <strong>${val}</strong>
            </div>`;
          });
          return res;
        }
      },
      legend: {
        top: 0,
        left: 'center',
        itemGap: 16,
        textStyle: { color: textColor, fontSize: 11 },
        icon: 'roundRect'
      },
      grid: {
        top: 40,
        left: '2%',
        right: useDualAxis ? '3%' : '2%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: { lineStyle: { color: gridLineColor } },
        axisLabel: { color: textColor, fontSize: 11 }
      },
      yAxis: yAxisConfig,
      series: seriesList
    };
  }, [widget, data, effectiveType]);

  const onEvents = useMemo(() => {
    return {
      click: (params: any) => {
        if (onChartClick) {
          onChartClick(params);
        }
      }
    };
  }, [onChartClick]);

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800/80 p-4 relative shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-100 text-sm">
              {data?.dynamicTitle || widget.title}
            </h3>
            {widget.auto_grain && data?.activeGrain && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase tracking-wider">
                {data.activeGrain} Grain
              </span>
            )}
          </div>
          {widget.subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">
              {data?.dynamicSubtitle || widget.subtitle}
            </p>
          )}
        </div>

        {/* Chart View Mode Controls */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          {widget.type === 'line_chart' && (
            <>
              <button
                onClick={() => setChartTypeOverride('line_chart')}
                className={`p-1.5 rounded-lg transition ${effectiveType === 'line_chart' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                title="Line View"
              >
                <LineChartIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setChartTypeOverride('bar_chart')}
                className={`p-1.5 rounded-lg transition ${effectiveType === 'bar_chart' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                title="Bar View"
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setChartTypeOverride('area_chart')}
                className={`p-1.5 rounded-lg transition ${effectiveType === 'area_chart' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                title="Area View"
              >
                <TrendingUp className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 min-h-[220px]">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          onEvents={onEvents}
        />
      </div>
    </div>
  );
};
