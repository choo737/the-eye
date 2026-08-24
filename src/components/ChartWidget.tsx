import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { WidgetSpec } from '../core/types';
import { formatValue } from '../utils/formatters';
import { resolveFieldLabel } from '../engine/queryEngine';
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
    const cyanPalette = ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa', '#2dd4bf', '#fb923c'];

    // 1. Donut and Pie Charts
    if (effectiveType === 'donut_chart' || effectiveType === 'pie_chart') {
      const pieData = data?.data || [];
      return {
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            const formattedVal = formatValue(params.value, widget.format || 'RM 0.0a');
            const metricKey = typeof widget.measures?.[0] === 'object' ? (widget.measures[0] as any).field : widget.measures?.[0];
            const metricTitle = resolveFieldLabel(metricKey || 'value', widget);
            return `<div style="font-weight: bold; margin-bottom: 2px;">${params.name}</div>
                    <div style="display: flex; align-items: center; gap: 8px; justify-content: space-between;">
                      <span>${params.marker} ${metricTitle}:</span>
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
            center: ['50%', '40%'],
            radius: effectiveType === 'donut_chart' ? ['38%', '64%'] : '60%',
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 6,
              borderColor: '#0f172a',
              borderWidth: 2
            },
            label: { show: false, position: 'center' },
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

    // 2. Gauge Chart & Bullet Chart
    if (effectiveType === 'gauge' || effectiveType === 'bullet_chart') {
      const metricVal = typeof data?.value === 'number' ? data.value : 88.4;
      const targetVal = typeof data?.target === 'number' ? data.target : 100;
      return {
        series: [
          {
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            center: ['50%', '75%'],
            radius: '95%',
            min: 0,
            max: targetVal > 100 ? targetVal : 100,
            splitNumber: 5,
            axisLine: {
              lineStyle: {
                width: 14,
                color: [
                  [0.3, '#ef4444'],
                  [0.7, '#eab308'],
                  [1, '#22c55e']
                ]
              }
            },
            pointer: {
              icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
              length: '12%',
              width: 12,
              offsetCenter: [0, '-60%'],
              itemStyle: { color: '#38bdf8' }
            },
            axisTick: { length: 8, lineStyle: { color: 'auto', width: 1 } },
            splitLine: { length: 14, lineStyle: { color: 'auto', width: 2 } },
            axisLabel: { color: '#94a3b8', fontSize: 10, distance: -35 },
            title: { offsetCenter: [0, '-20%'], fontSize: 12, color: '#94a3b8' },
            detail: {
              fontSize: 22,
              offsetCenter: [0, '0%'],
              valueAnimation: true,
              formatter: (val: number) => formatValue(val, widget.format || '0.0%'),
              color: '#f8fafc',
              fontWeight: 'bold'
            },
            data: [{ value: metricVal, name: widget.title }]
          }
        ]
      };
    }

    // 3. Treemap Chart
    if (effectiveType === 'treemap') {
      const treeData = data?.data || (data?.categories ? data.categories.map((c: string, i: number) => ({
        name: c,
        value: data?.series?.[0]?.data?.[i] || 1000
      })) : [
        { name: 'Division A', value: 45000 },
        { name: 'Division B', value: 32000 },
        { name: 'Division C', value: 21000 },
        { name: 'Division D', value: 14000 }
      ]);
      return {
        tooltip: {
          formatter: (params: any) => `${params.name}: <strong>${formatValue(params.value, widget.format || 'RM 0.0a')}</strong>`,
          backgroundColor: '#0f172a',
          borderColor: '#334155',
          textStyle: { color: '#f8fafc' }
        },
        series: [
          {
            type: 'treemap',
            data: treeData,
            leafDepth: 1,
            roam: false,
            label: {
              show: true,
              formatter: (p: any) => `${p.name}\n${formatValue(p.value, widget.format || 'RM 0.0a')}`,
              fontSize: 11,
              color: '#f8fafc'
            },
            itemStyle: { borderColor: '#0f172a', borderWidth: 2, gapWidth: 2 }
          }
        ]
      };
    }

    // 4. Sankey Flow Diagram
    if (effectiveType === 'sankey') {
      const sankeyData = data?.data || {
        nodes: [
          { name: 'POS Transactions' },
          { name: 'Cash / DuitNow' },
          { name: 'Credit / Debit Card' },
          { name: 'Ready-to-Eat' },
          { name: 'Beverages' },
          { name: 'Snacks' }
        ],
        links: [
          { source: 'POS Transactions', target: 'Cash / DuitNow', value: 45000 },
          { source: 'POS Transactions', target: 'Credit / Debit Card', value: 55000 },
          { source: 'Cash / DuitNow', target: 'Ready-to-Eat', value: 25000 },
          { source: 'Cash / DuitNow', target: 'Beverages', value: 20000 },
          { source: 'Credit / Debit Card', target: 'Beverages', value: 25000 },
          { source: 'Credit / Debit Card', target: 'Snacks', value: 30000 }
        ]
      };
      return {
        tooltip: { trigger: 'item', triggerOn: 'mousemove', backgroundColor: '#0f172a', textStyle: { color: '#f8fafc' } },
        series: [
          {
            type: 'sankey',
            data: sankeyData.nodes,
            links: sankeyData.links,
            emphasis: { focus: 'adjacency' },
            lineStyle: { color: 'gradient', curveness: 0.5 },
            itemStyle: { borderColor: '#1e293b', borderWidth: 1 },
            label: { color: '#f8fafc', fontSize: 10 }
          }
        ]
      };
    }

    // 5. Heatmap Matrix
    if (effectiveType === 'heatmap') {
      const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const heatmapData = [];
      for (let i = 0; i < days.length; i++) {
        for (let j = 0; j < hours.length; j++) {
          heatmapData.push([j, i, Math.floor(Math.random() * 80 + 20)]);
        }
      }
      return {
        tooltip: {
          position: 'top',
          formatter: (p: any) => `${days[p.value[1]]} @ ${hours[p.value[0]]}: <strong>${p.value[2]} tx/hr</strong>`,
          backgroundColor: '#0f172a',
          textStyle: { color: '#f8fafc' }
        },
        grid: { top: 20, bottom: 30, left: 45, right: 15 },
        xAxis: { type: 'category', data: hours, splitArea: { show: true }, axisLabel: { color: textColor, fontSize: 10 } },
        yAxis: { type: 'category', data: days, splitArea: { show: true }, axisLabel: { color: textColor, fontSize: 10 } },
        visualMap: {
          min: 0,
          max: 100,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: 0,
          show: false,
          inRange: { color: ['#0f172a', '#0284c7', '#38bdf8', '#34d399', '#fbbf24'] }
        },
        series: [{ type: 'heatmap', data: heatmapData, label: { show: false } }]
      };
    }

    // 6. Scatter & Bubble Chart
    if (effectiveType === 'scatter_chart' || effectiveType === 'bubble_chart') {
      const scatterPoints = data?.data || (data?.categories ? data.categories.map((c: string, i: number) => [
        data?.series?.[0]?.data?.[i] || 1000,
        data?.series?.[1]?.data?.[i] || 1200,
        8,
        c
      ]) : [
        [30000, 32000, 8, 'Entity Alpha'],
        [25000, 27000, 6, 'Entity Beta'],
        [20000, 19000, 5, 'Entity Gamma']
      ]);
      return {
        tooltip: {
          formatter: (p: any) => `${p.value[3]}: Target ${formatValue(p.value[0], 'RM 0,0')} | Sales ${formatValue(p.value[1], 'RM 0,0')}`,
          backgroundColor: '#0f172a',
          textStyle: { color: '#f8fafc' }
        },
        grid: { top: 30, left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'value',
          name: 'Target (RM)',
          nameTextStyle: { color: textColor, fontSize: 10 },
          splitLine: { lineStyle: { color: gridLineColor } },
          axisLabel: { color: textColor, fontSize: 10, formatter: (v: number) => formatValue(v, 'RM 0.0a') }
        },
        yAxis: {
          type: 'value',
          name: 'Actual Sales (RM)',
          nameTextStyle: { color: textColor, fontSize: 10 },
          splitLine: { lineStyle: { color: gridLineColor } },
          axisLabel: { color: textColor, fontSize: 10, formatter: (v: number) => formatValue(v, 'RM 0.0a') }
        },
        series: [
          {
            type: 'scatter',
            symbolSize: (val: any[]) => Math.max(12, val[2] * 3),
            data: scatterPoints,
            itemStyle: { color: '#38bdf8', shadowBlur: 8, shadowColor: 'rgba(56, 189, 248, 0.5)' }
          }
        ]
      };
    }

    // 7. Funnel Chart
    if (effectiveType === 'funnel') {
      const funnelData = data?.data || [
        { value: 100, name: 'Footfall / Visitors' },
        { value: 68, name: 'Store Browsers' },
        { value: 42, name: 'Items in Basket' },
        { value: 34, name: 'Checkout Complete' }
      ];
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

    // 8. Radar Chart
    if (effectiveType === 'radar') {
      const indicators = data?.indicators || [
        { name: 'POS Velocity', max: 100 },
        { name: 'Basket Size', max: 100 },
        { name: 'Staff NPS', max: 100 },
        { name: 'Stock Fill Rate', max: 100 },
        { name: 'Digital Payment %', max: 100 }
      ];
      const series = data?.series || [
        { value: [92, 84, 96, 88, 79], name: 'Current Outlets' }
      ];
      return {
        tooltip: { backgroundColor: '#0f172a', borderColor: '#334155', textStyle: { color: '#f8fafc' } },
        radar: {
          indicator: indicators,
          radius: '65%',
          splitNumber: 4,
          axisName: { color: '#94a3b8', fontSize: 10 },
          splitLine: { lineStyle: { color: gridLineColor } },
          splitArea: { show: true, areaStyle: { color: ['rgba(30, 41, 59, 0.4)', 'rgba(15, 23, 42, 0.6)'] } },
          axisLine: { lineStyle: { color: gridLineColor } }
        },
        series: [
          {
            type: 'radar',
            data: series,
            areaStyle: { color: 'rgba(56, 189, 248, 0.25)' },
            lineStyle: { color: '#38bdf8', width: 2 },
            itemStyle: { color: '#38bdf8' }
          }
        ]
      };
    }

    // 9. Cartesian Charts (Line, Spline, Bar, Horizontal Bar, Stacked Bar, 100% Stacked, Area, Combo)
    const categories = data?.categories || [];
    const useDualAxis = !!data?.useDualAxis || effectiveType === 'combo_chart';
    const isHorizontal = effectiveType === 'horizontal_bar';

    const seriesList = (data?.series || []).map((s: any, idx: number) => {
      const isArea = effectiveType === 'area_chart';
      const isBar = effectiveType === 'bar_chart' || effectiveType === 'horizontal_bar' || effectiveType === 'stacked_bar' || effectiveType === 'stacked_bar_100' || (effectiveType === 'combo_chart' && idx === 0);
      const color = cyanPalette[idx % cyanPalette.length];

      return {
        name: s.name,
        type: isBar ? 'bar' : 'line',
        yAxisIndex: (s.yAxisIndex !== undefined && !isHorizontal) ? s.yAxisIndex : 0,
        stack: (effectiveType === 'stacked_bar' || effectiveType === 'stacked_bar_100') ? 'total' : undefined,
        smooth: widget.smooth ?? true,
        data: s.data,
        itemStyle: {
          color: color,
          borderRadius: isBar ? (isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]) : 0
        },
        areaStyle: isArea ? {
          opacity: 0.25,
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: color },
              { offset: 1, color: 'transparent' }
            ]
          }
        } : undefined
      };
    });

    const primaryAxisName = Array.isArray(widget.y) ? widget.y[0] : (widget.y || widget.title || 'Value');
    const secondaryAxisName = Array.isArray(widget.y) && widget.y[1] ? widget.y[1] : 'Secondary Metric';

    const valueAxisConfig = {
      type: 'value',
      name: primaryAxisName,
      nameTextStyle: { color: textColor, fontSize: 10 },
      splitLine: { lineStyle: { color: gridLineColor } },
      axisLabel: {
        color: textColor,
        fontSize: 11,
        formatter: (val: number) => formatValue(val, widget.format || 'RM 0.0a')
      }
    };

    const categoryAxisConfig = {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: gridLineColor } },
      axisLabel: { color: textColor, fontSize: 11 }
    };

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', crossStyle: { color: '#64748b' } },
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
      xAxis: isHorizontal ? valueAxisConfig : categoryAxisConfig,
      yAxis: isHorizontal ? categoryAxisConfig : (useDualAxis ? [
        valueAxisConfig,
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
      ] : [valueAxisConfig]),
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
