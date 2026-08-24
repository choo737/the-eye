import { WidgetSpec } from '../core/types';

export interface FilterState {
  [filterId: string]: any;
}

export function interpolateString(template: string, context: Record<string, any>): string {
  if (!template) return '';
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const val = context[key];
    if (val === undefined || val === null) return '';
    if (Array.isArray(val)) return val.join(', ');
    return String(val);
  });
}

function normalizeKey(str: string): string {
  return String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchesFilter(targetValue: string, filterValues: string[]): boolean {
  if (filterValues.length === 0) return true;
  const targetNorm = normalizeKey(targetValue);
  return filterValues.some(fv => {
    const fvNorm = normalizeKey(fv);
    if (fvNorm.startsWith('all')) return true;
    return targetNorm.includes(fvNorm) || fvNorm.includes(targetNorm);
  });
}

// Canonical regional metadata table (Stores & Sales Distribution)
const REGION_REGISTRY = [
  { name: 'Klang Valley / Central', stores: 1240, salesWeight: 0.48, avgBasket: 24.50 },
  { name: 'Northern Region', stores: 580, salesWeight: 0.23, avgBasket: 19.20 },
  { name: 'Southern Region', stores: 460, salesWeight: 0.18, avgBasket: 22.40 },
  { name: 'East Coast & Islands', stores: 190, salesWeight: 0.07, avgBasket: 18.20 },
  { name: 'Sabah & Sarawak', stores: 110, salesWeight: 0.04, avgBasket: 20.10 }
];

export function executeWidgetQuery(widget: WidgetSpec, activeFilters: FilterState, overrideGrain?: string): any {
  const timeRange = activeFilters['time_range'] || activeFilters['date_range'] || '2026-YTD';
  
  let effectiveGrain = overrideGrain;
  if (!effectiveGrain) {
    if (timeRange === 'last_30_days' || timeRange === '30d') effectiveGrain = 'day';
    else if (timeRange === 'last_90_days' || timeRange === '90d' || timeRange === 'quarter') effectiveGrain = 'week';
    else if (timeRange === 'all_time' || timeRange === 'lifetime') effectiveGrain = 'quarter';
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

  // Build interpolation context
  const context: Record<string, any> = {
    ...activeFilters,
    time_range: timeLabel,
    grain: grainLabel,
    active_grain: grainLabel
  };

  const dynamicTitle = interpolateString(widget.title, context);
  const dynamicSubtitle = widget.subtitle ? interpolateString(widget.subtitle, context) : `Showing ${grainLabel} rollup for ${timeLabel}`;

  // Time volume multiplier (applies to flow metrics like Revenue / Sales, NOT entity counts like store outlets)
  let timeFlowMultiplier = 1.0;
  if (timeRange === 'last_30_days') timeFlowMultiplier = 0.28;
  else if (timeRange === 'last_90_days') timeFlowMultiplier = 0.65;
  else if (timeRange === 'all_time') timeFlowMultiplier = 1.45;

  // Extract selected regions
  const rawRegion = activeFilters['store_region'] || activeFilters['region'] || ['All Regions'];
  const selectedRegionList: string[] = Array.isArray(rawRegion) ? rawRegion : [rawRegion];
  const isAllRegions = selectedRegionList.includes('All Regions') || selectedRegionList.length === 0;

  // Compute exact regional aggregations
  let matchedRegions = REGION_REGISTRY;
  if (!isAllRegions) {
    matchedRegions = REGION_REGISTRY.filter(r => matchesFilter(r.name, selectedRegionList));
    if (matchedRegions.length === 0) matchedRegions = REGION_REGISTRY;
  }

  const totalStores = matchedRegions.reduce((sum, r) => sum + r.stores, 0);
  const regionSalesFraction = matchedRegions.reduce((sum, r) => sum + r.salesWeight, 0);
  const weightedBasket = matchedRegions.reduce((sum, r) => sum + (r.avgBasket * (r.stores / totalStores)), 0);

  // Extract division/category filter
  const rawDivision = activeFilters['product_division'] || activeFilters['category'] || 'All Divisions';
  let divisionMultiplier = 1.0;
  if (rawDivision && !String(rawDivision).startsWith('All')) {
    const divStr = String(rawDivision).toLowerCase();
    if (divStr.includes('fresh') || divStr.includes('rte')) divisionMultiplier = 0.32;
    else if (divStr.includes('beverage') || divStr.includes('slurpee')) divisionMultiplier = 0.28;
    else if (divStr.includes('snack')) divisionMultiplier = 0.22;
    else if (divStr.includes('tobacco')) divisionMultiplier = 0.18;
    else divisionMultiplier = 0.40;
  }

  // -------------------------------------------------------------
  // 1. KPI WIDGET EXECUTION (Point-in-Time vs Flow Metric Aware)
  // -------------------------------------------------------------
  if (widget.type === 'kpi_card') {
    // A) Store Count (Entity count - does not scale with time)
    if (widget.value === 'store_count' || widget.format === '0,0') {
      return {
        dynamicTitle,
        dynamicSubtitle,
        value: totalStores,
        comparison_label: isAllRegions ? '+28 new store openings' : `+${Math.round(totalStores * 0.03)} in selected regions`,
        sparklineData: [
          Math.round(totalStores * 0.92),
          Math.round(totalStores * 0.95),
          Math.round(totalStores * 0.98),
          totalStores
        ]
      };
    }

    // B) Average Basket Size (ABV)
    if (widget.value === 'basket_size' || (widget.format?.includes('$0.00') && !widget.format?.includes('a'))) {
      const computedAbv = +(weightedBasket * (divisionMultiplier > 0.8 ? 1 : 1.12)).toFixed(2);
      return {
        dynamicTitle,
        dynamicSubtitle,
        value: computedAbv,
        comparison_label: timeRange === 'last_30_days' ? '+$0.65 / basket' : '+$1.85 / basket',
        sparklineData: [13.2, 13.8, 14.5, 15.1, 15.8, computedAbv]
      };
    }

    // C) Fresh Food & RTE Percentage
    if (widget.format?.includes('%')) {
      const rtePct = String(rawDivision).startsWith('All') ? 28.6 : (String(rawDivision).includes('Fresh') ? 100 : 8.4);
      return {
        dynamicTitle,
        dynamicSubtitle,
        value: rtePct,
        comparison_label: '+3.8% mix shift',
        sparklineData: [21.0, 22.8, 24.5, 26.0, 27.4, rtePct]
      };
    }

    // D) POS Gross Sales (Additive Flow metric)
    const baseAnnualSales = 78450000;
    const computedSales = Math.round(baseAnnualSales * regionSalesFraction * divisionMultiplier * timeFlowMultiplier);
    const targetSales = `$${((85.0 * regionSalesFraction * divisionMultiplier * timeFlowMultiplier)).toFixed(1)}M`;

    return {
      dynamicTitle,
      dynamicSubtitle,
      value: computedSales,
      target: targetSales,
      comparison_label: timeRange === 'last_30_days' ? '+8.4% vs prev 30d' : '+14.2% YoY',
      sparklineData: [0.75, 0.82, 0.88, 0.93, 0.97, 1.0].map(m => Math.round(computedSales * m))
    };
  }

  // -------------------------------------------------------------
  // 2. PIE / DONUT WIDGET EXECUTION
  // -------------------------------------------------------------
  if (widget.type === 'donut_chart' || widget.type === 'pie_chart') {
    let slices = [
      { name: 'Fresh Food & Ready-to-Eat (RTE)', value: Math.round(24500000 * regionSalesFraction * timeFlowMultiplier) },
      { name: 'Beverages & Slurpee', value: Math.round(19800000 * regionSalesFraction * timeFlowMultiplier) },
      { name: 'Snacks & Confectionery', value: Math.round(15600000 * regionSalesFraction * timeFlowMultiplier) },
      { name: 'Tobacco & Core Services', value: Math.round(12800000 * regionSalesFraction * timeFlowMultiplier) },
      { name: 'General & Personal Care', value: Math.round(7850000 * regionSalesFraction * timeFlowMultiplier) }
    ];

    if (rawDivision && !String(rawDivision).startsWith('All')) {
      const match = slices.filter(s => matchesFilter(s.name, [String(rawDivision)]));
      if (match.length > 0) slices = match;
    }

    return {
      dynamicTitle,
      dynamicSubtitle,
      data: slices
    };
  }

  // -------------------------------------------------------------
  // 3. RADAR WIDGET EXECUTION
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
        { name: 'MQL Website Traffic', value: Math.round(450000 * regionSalesFraction * timeFlowMultiplier) },
        { name: 'PQL App Signups', value: Math.round(48000 * regionSalesFraction * timeFlowMultiplier) },
        { name: 'SQL Store Leads', value: Math.round(8400 * regionSalesFraction * timeFlowMultiplier) },
        { name: 'Demo / Proposal', value: Math.round(3200 * regionSalesFraction * timeFlowMultiplier) },
        { name: 'Closed Contract', value: Math.round(620 * regionSalesFraction * timeFlowMultiplier) }
      ]
    };
  }

  // -------------------------------------------------------------
  // 5. TABLE WIDGET EXECUTION
  // -------------------------------------------------------------
  if (widget.type === 'table') {
    const allRows = [
      { store_id: '7E-1082', store_name: 'KLCC Twin Towers Concourse', region: 'Klang Valley / Central', daily_sales: Math.round(38400 * divisionMultiplier), avg_basket: 24.50, compliance: 'Healthy / Audited', pos_terminal_count: 4 },
      { store_id: '7E-2041', store_name: 'Mid Valley Megamall North Court', region: 'Klang Valley / Central', daily_sales: Math.round(31200 * divisionMultiplier), avg_basket: 21.80, compliance: 'Healthy / Audited', pos_terminal_count: 3 },
      { store_id: '7E-0492', store_name: 'Gurney Plaza Waterfront', region: 'Northern Region', daily_sales: Math.round(24500 * divisionMultiplier), avg_basket: 19.20, compliance: 'Healthy / Audited', pos_terminal_count: 2 },
      { store_id: '7E-3118', store_name: 'JB City Square Customs Hub', region: 'Southern Region', daily_sales: Math.round(28900 * divisionMultiplier), avg_basket: 22.40, compliance: 'Healthy / Audited', pos_terminal_count: 3 },
      { store_id: '7E-0842', store_name: 'KLIA2 Departure Hall Terminal', region: 'Klang Valley / Central', daily_sales: Math.round(42100 * divisionMultiplier), avg_basket: 29.80, compliance: 'Healthy / Audited', pos_terminal_count: 4 },
      { store_id: '7E-1934', store_name: 'Ipoh Old Town Heritage', region: 'Northern Region', daily_sales: Math.round(16800 * divisionMultiplier), avg_basket: 15.60, compliance: 'Low Stock Alert', pos_terminal_count: 2 },
      { store_id: '7E-4421', store_name: 'Kuantan Teluk Cempedak Beach', region: 'East Coast & Islands', daily_sales: Math.round(19500 * divisionMultiplier), avg_basket: 18.20, compliance: 'Healthy / Audited', pos_terminal_count: 2 },
      { store_id: '7E-5512', store_name: 'Kuching Waterfront Heritage', region: 'Sabah & Sarawak', daily_sales: Math.round(21400 * divisionMultiplier), avg_basket: 20.10, compliance: 'Healthy / Audited', pos_terminal_count: 3 }
    ];

    let filteredRows = allRows;
    if (!isAllRegions) {
      filteredRows = allRows.filter(row => matchesFilter(row.region, selectedRegionList));
      if (filteredRows.length === 0) filteredRows = allRows;
    }

    return {
      dynamicTitle,
      dynamicSubtitle,
      rows: filteredRows
    };
  }

  // -------------------------------------------------------------
  // 6. CARTESIAN TIME-SERIES & CATEGORY BAR CHARTS
  // -------------------------------------------------------------
  const yMeasures = Array.isArray(widget.y) ? widget.y : (widget.y ? [widget.y] : ['Sales Volume']);
  const isDualAxis = widget.dual_axis || (yMeasures.length > 1 && yMeasures.some(m => String(m).toLowerCase().includes('count') || String(m).toLowerCase().includes('rate')));
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
        if (isSecondary) return Math.round((18000 + trend * 12000) * (totalStores / 2580));
        return Math.round((2400 + trend * 1600) * 1000 * regionSalesFraction * divisionMultiplier);
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

  // Category Bar Chart (exact clusters for selected regions)
  const series = yMeasures.map((measure) => {
    const measureName = typeof measure === 'string' ? measure : (measure as any).name || (measure as any).field;
    const isTarget = measureName.toLowerCase().includes('target');
    return {
      name: measureName,
      data: matchedRegions.map((c) => {
        const val = isTarget ? (c.salesWeight * 78.45 * 1.06) : (c.salesWeight * 78.45);
        return Math.round(val * 1000000 * divisionMultiplier * timeFlowMultiplier);
      })
    };
  });

  return {
    dynamicTitle,
    dynamicSubtitle,
    useDualAxis: isDualAxis,
    categories: matchedRegions.map(c => c.name),
    series
  };
}
