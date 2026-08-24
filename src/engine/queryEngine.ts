import { WidgetSpec } from '../core/types';

export interface FilterState {
  [filterId: string]: any;
}

/**
 * Template variable interpolator for titles, subtitles, and query strings.
 * Supports: {{filter_id}}, {{grain}}, {{time_label}}, {{region}}, etc.
 */
export function interpolateString(template: string, context: Record<string, any>): string {
  if (!template) return '';
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const val = context[key];
    if (val === undefined || val === null) return '';
    if (Array.isArray(val)) return val.join(', ');
    return String(val);
  });
}

/**
 * Pure Schema-Driven Generic Query Engine.
 * Operates strictly on widget declarations (x, y, category, value, format, query)
 * without hardcoding any widget IDs or widget names.
 */
export function executeWidgetQuery(widget: WidgetSpec, activeFilters: FilterState, overrideGrain?: string): any {
  // Extract active filter dimensions
  const timeRange = activeFilters['time_range'] || '2026-YTD';
  
  // Calculate dynamic grain
  let effectiveGrain = overrideGrain;
  if (!effectiveGrain) {
    if (timeRange === 'last_30_days') effectiveGrain = 'day';
    else if (timeRange === 'last_90_days') effectiveGrain = 'week';
    else if (timeRange === 'all_time') effectiveGrain = 'quarter';
    else effectiveGrain = 'month';
  }

  const timeLabel = 
    timeRange === 'last_30_days' ? 'Last 30 Days' :
    timeRange === 'last_90_days' ? 'Last Quarter' :
    timeRange === 'all_time' ? 'All Time' : '2026 YTD';

  const grainLabel = 
    effectiveGrain === 'day' ? 'Daily' :
    effectiveGrain === 'week' ? 'Weekly' :
    effectiveGrain === 'quarter' ? 'Quarterly' :
    effectiveGrain === 'hour' ? 'Hourly' : 'Monthly';

  // Build interpolation context for dynamic titles/subtitles
  const context: Record<string, any> = {
    ...activeFilters,
    time_range: timeLabel,
    grain: grainLabel,
    active_grain: grainLabel
  };

  const dynamicTitle = interpolateString(widget.title, context);
  const dynamicSubtitle = widget.subtitle ? interpolateString(widget.subtitle, context) : `Showing ${grainLabel} rollup for ${timeLabel}`;

  // Filter multipliers for synthetic OLAP generation based on dimensions
  let scale = 1.0;
  Object.entries(activeFilters).forEach(([key, val]) => {
    if (Array.isArray(val) && !val.includes('All Regions') && !val.includes('All Channels') && val.length > 0) {
      scale *= Math.min(1.0, val.length * 0.38);
    } else if (typeof val === 'string' && !val.startsWith('All')) {
      scale *= 0.55;
    }
  });

  if (timeRange === 'last_30_days') scale *= 0.28;
  else if (timeRange === 'last_90_days') scale *= 0.65;
  else if (timeRange === 'all_time') scale *= 1.45;

  // -------------------------------------------------------------
  // 1. KPI WIDGET EXECUTION (Declarative value, target, sparkline)
  // -------------------------------------------------------------
  if (widget.type === 'kpi_card') {
    let baseVal = 78450000;
    if (widget.format?.includes('%')) baseVal = 28.6;
    else if (widget.format?.includes('$0.00') && !widget.format?.includes('a')) baseVal = 16.48;
    else if (widget.format === '0,0') baseVal = 2580;
    else if (widget.format?.includes('mos')) baseVal = 11.4;

    const computedVal = widget.format?.includes('%') 
      ? +(baseVal * (scale > 0.6 ? 1 : 0.95)).toFixed(1)
      : widget.format?.includes('$0.00') && !widget.format?.includes('a')
      ? +(baseVal * (scale > 0.6 ? 1 : 1.08)).toFixed(2)
      : Math.round(baseVal * scale);

    const comparisonText = timeRange === 'last_30_days' 
      ? '+8.4% vs prev 30 days' 
      : timeRange === 'last_90_days' 
      ? '+16.2% vs Q1' 
      : widget.comparison_label || '+14.2% YoY';

    return {
      dynamicTitle,
      dynamicSubtitle,
      value: computedVal,
      target: widget.target ? interpolateString(widget.target, context) : undefined,
      comparison_label: comparisonText,
      sparklineData: [0.75, 0.82, 0.88, 0.93, 0.97, 1.0].map(m => +(computedVal * m).toFixed(1))
    };
  }

  // -------------------------------------------------------------
  // 2. PIE / DONUT WIDGET EXECUTION (Declarative category & value)
  // -------------------------------------------------------------
  if (widget.type === 'donut_chart' || widget.type === 'pie_chart') {
    const rawCategoryFilter = activeFilters['product_division'] || activeFilters['customer_tier'] || activeFilters['category'] || 'All';
    let slices = [
      { name: 'Fresh Food & Ready-to-Eat (RTE)', value: Math.round(24500000 * scale) },
      { name: 'Beverages & Slurpee', value: Math.round(19800000 * scale) },
      { name: 'Snacks & Confectionery', value: Math.round(15600000 * scale) },
      { name: 'Tobacco & Core Services', value: Math.round(12800000 * scale) },
      { name: 'General & Personal Care', value: Math.round(7850000 * scale) }
    ];

    if (rawCategoryFilter && !String(rawCategoryFilter).startsWith('All')) {
      const match = slices.filter(s => s.name.toLowerCase().includes(String(rawCategoryFilter).toLowerCase().slice(0, 5)));
      if (match.length > 0) slices = match;
    }

    return {
      dynamicTitle,
      dynamicSubtitle,
      data: slices
    };
  }

  // -------------------------------------------------------------
  // 3. RADAR WIDGET EXECUTION (Declarative indicators)
  // -------------------------------------------------------------
  if (widget.type === 'radar') {
    const indicators = widget.radar_indicators || [
      { name: 'On-Shelf Availability', max: 100 },
      { name: 'Fresh Food Wastage Control', max: 100 },
      { name: 'POS Transaction Speed', max: 100 },
      { name: 'Cold Chain Compliance', max: 100 },
      { name: 'Store Audit Score', max: 100 }
    ];

    return {
      dynamicTitle,
      dynamicSubtitle,
      indicators,
      series: [
        { name: widget.title, value: [94, 86, 96, 98, 92] }
      ]
    };
  }

  // -------------------------------------------------------------
  // 4. FUNNEL WIDGET EXECUTION
  // -------------------------------------------------------------
  if (widget.type === 'funnel') {
    return {
      dynamicTitle,
      dynamicSubtitle,
      data: [
        { name: 'MQL Website Traffic', value: Math.round(450000 * scale) },
        { name: 'PQL App Signups', value: Math.round(48000 * scale) },
        { name: 'SQL Store Leads', value: Math.round(8400 * scale) },
        { name: 'Demo / Proposal', value: Math.round(3200 * scale) },
        { name: 'Closed Contract', value: Math.round(620 * scale) }
      ]
    };
  }

  // -------------------------------------------------------------
  // 5. TABLE WIDGET EXECUTION (Declarative table_columns)
  // -------------------------------------------------------------
  if (widget.type === 'table') {
    const storeRegionFilter = activeFilters['store_region'] || activeFilters['region'];
    const allRows = [
      { store_id: '7E-1082', store_name: 'KLCC Twin Towers Concourse', region: 'Klang Valley / Central', daily_sales: Math.round(38400 * scale), avg_basket: 24.50, compliance: 'Healthy / Audited', pos_terminal_count: 4 },
      { store_id: '7E-2041', store_name: 'Mid Valley Megamall North Court', region: 'Klang Valley / Central', daily_sales: Math.round(31200 * scale), avg_basket: 21.80, compliance: 'Healthy / Audited', pos_terminal_count: 3 },
      { store_id: '7E-0492', store_name: 'Gurney Plaza Waterfront', region: 'Northern Region', daily_sales: Math.round(24500 * scale), avg_basket: 19.20, compliance: 'Healthy / Audited', pos_terminal_count: 2 },
      { store_id: '7E-3118', store_name: 'JB City Square Customs Hub', region: 'Southern Region', daily_sales: Math.round(28900 * scale), avg_basket: 22.40, compliance: 'Healthy / Audited', pos_terminal_count: 3 },
      { store_id: '7E-0842', store_name: 'KLIA2 Departure Hall Terminal', region: 'Klang Valley / Central', daily_sales: Math.round(42100 * scale), avg_basket: 29.80, compliance: 'Healthy / Audited', pos_terminal_count: 4 },
      { store_id: '7E-1934', store_name: 'Ipoh Old Town Heritage', region: 'Northern Region', daily_sales: Math.round(16800 * scale), avg_basket: 15.60, compliance: 'Low Stock Alert', pos_terminal_count: 2 },
      { store_id: '7E-4421', store_name: 'Kuantan Teluk Cempedak Beach', region: 'East Coast & Islands', daily_sales: Math.round(19500 * scale), avg_basket: 18.20, compliance: 'Healthy / Audited', pos_terminal_count: 2 },
      { store_id: '7E-5512', store_name: 'Kuching Waterfront Heritage', region: 'East Coast & Islands', daily_sales: Math.round(21400 * scale), avg_basket: 20.10, compliance: 'Healthy / Audited', pos_terminal_count: 3 }
    ];

    let filteredRows = allRows;
    if (storeRegionFilter && !storeRegionFilter.includes('All Regions') && storeRegionFilter.length > 0) {
      const selected = Array.isArray(storeRegionFilter) ? storeRegionFilter : [storeRegionFilter];
      filteredRows = filteredRows.filter(r => selected.some(s => r.region.toLowerCase().includes(String(s).toLowerCase().slice(0, 5))));
    }

    return {
      dynamicTitle,
      dynamicSubtitle,
      rows: filteredRows
    };
  }

  // -------------------------------------------------------------
  // 6. CARTESIAN TIME-SERIES & CATEGORY CHARTS (Line, Bar, Area)
  // -------------------------------------------------------------
  // Determine series names from declarative YAML `y` array
  const yMeasures = Array.isArray(widget.y) ? widget.y : (widget.y ? [widget.y] : ['Sales Volume']);
  const isDualAxis = widget.dual_axis || (yMeasures.length > 1 && yMeasures.some(m => String(m).toLowerCase().includes('count') || String(m).toLowerCase().includes('rate')));

  // Category vs Time-series detection
  const isTimeSeries = widget.x === 'hour' || widget.x === 'date' || widget.x === 'month' || widget.x === 'time' || widget.auto_grain;

  if (isTimeSeries) {
    let categories: string[] = [];
    if (effectiveGrain === 'day') {
      categories = ['Aug 01', 'Aug 04', 'Aug 07', 'Aug 10', 'Aug 13', 'Aug 16', 'Aug 19', 'Aug 22', 'Aug 24'];
    } else if (effectiveGrain === 'week') {
      categories = ['W1 Jun', 'W2 Jun', 'W3 Jun', 'W4 Jun', 'W1 Jul', 'W2 Jul', 'W3 Jul', 'W4 Jul', 'W1 Aug', 'W2 Aug', 'W3 Aug', 'W4 Aug'];
    } else if (effectiveGrain === 'hour') {
      categories = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'];
    } else {
      categories = ['Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26'];
    }

    const series = yMeasures.map((measure, idx) => {
      const measureName = typeof measure === 'string' ? measure : (measure as any).name || (measure as any).field;
      const isSecondary = isDualAxis && idx > 0 && (measureName.toLowerCase().includes('count') || measureName.toLowerCase().includes('rate'));

      const baseNumbers = categories.map((_, i) => {
        const trend = (i + 1) / categories.length;
        if (isSecondary) return Math.round((18000 + trend * 12000) * (scale > 0.5 ? 1 : scale * 1.5));
        return Math.round((2400 + trend * 1600) * 1000 * scale);
      });

      return {
        name: measureName,
        yAxisIndex: isSecondary ? 1 : 0,
        data: baseNumbers
      };
    });

    return {
      dynamicTitle,
      dynamicSubtitle,
      grain: effectiveGrain,
      activeGrain: grainLabel,
      useDualAxis: isDualAxis,
      categories,
      series
    };
  }

  // Category Bar Chart (e.g. Regions or Clusters)
  let categories = ['Klang Valley / Central', 'Northern Region', 'Southern Region', 'East Coast & Islands', 'Sabah & Sarawak'];
  const storeRegionFilter = activeFilters['store_region'] || activeFilters['region'];
  if (storeRegionFilter && !storeRegionFilter.includes('All Regions') && storeRegionFilter.length > 0) {
    const selected = Array.isArray(storeRegionFilter) ? storeRegionFilter : [storeRegionFilter];
    categories = categories.filter(c => selected.some(s => c.toLowerCase().includes(String(s).toLowerCase().slice(0, 5))));
    if (categories.length === 0) categories = selected;
  }

  const series = yMeasures.map((measure) => {
    const measureName = typeof measure === 'string' ? measure : (measure as any).name || (measure as any).field;
    return {
      name: measureName,
      data: categories.map((_, i) => Math.round((32.5 - i * 6.5) * 1000000 * scale))
    };
  });

  return {
    dynamicTitle,
    dynamicSubtitle,
    useDualAxis: isDualAxis,
    categories,
    series
  };
}
