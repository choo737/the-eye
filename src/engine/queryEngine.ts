export const DEFAULT_SAAS_DATASET: TabularRow[] = [
  { event_id: 'EVT-001', customer_id: 'CUST-101', company_name: 'Acme FinTech Corp', plan_tier: 'Enterprise Plus', region: 'North America', mrr_usd: 24500, arr_usd: 294000, usage_api_calls: 4800000, churn_risk_pct: 1.2, status: 'Active' },
  { event_id: 'EVT-002', customer_id: 'CUST-102', company_name: 'Stripe Cloud Systems', plan_tier: 'Enterprise Plus', region: 'EMEA', mrr_usd: 18900, arr_usd: 226800, usage_api_calls: 3900000, churn_risk_pct: 2.4, status: 'Active' },
  { event_id: 'EVT-003', customer_id: 'CUST-103', company_name: 'Grab Holdings Tech', plan_tier: 'Scale Team', region: 'APAC', mrr_usd: 8500, arr_usd: 102000, usage_api_calls: 1500000, churn_risk_pct: 4.8, status: 'Active' },
  { event_id: 'EVT-004', customer_id: 'CUST-104', company_name: 'Tokopedia Commerce', plan_tier: 'Scale Team', region: 'APAC', mrr_usd: 7800, arr_usd: 93600, usage_api_calls: 1250000, churn_risk_pct: 3.1, status: 'Active' },
  { event_id: 'EVT-005', customer_id: 'CUST-105', company_name: 'Shopify Merchant Labs', plan_tier: 'Growth Pro', region: 'North America', mrr_usd: 3400, arr_usd: 40800, usage_api_calls: 620000, churn_risk_pct: 6.5, status: 'Active' },
  { event_id: 'EVT-006', customer_id: 'CUST-106', company_name: 'Zendesk Services', plan_tier: 'Growth Pro', region: 'EMEA', mrr_usd: 2900, arr_usd: 34800, usage_api_calls: 480000, churn_risk_pct: 5.2, status: 'Active' },
  { event_id: 'EVT-007', customer_id: 'CUST-107', company_name: 'Vercel Fast Deploy', plan_tier: 'Starter Dev', region: 'North America', mrr_usd: 850, arr_usd: 10200, usage_api_calls: 120000, churn_risk_pct: 12.0, status: 'Active' },
  { event_id: 'EVT-008', customer_id: 'CUST-108', company_name: 'Postman API Networks', plan_tier: 'Enterprise Plus', region: 'North America', mrr_usd: 32000, arr_usd: 384000, usage_api_calls: 6100000, churn_risk_pct: 0.8, status: 'Active' }
];

export const DEFAULT_HEALTHCARE_DATASET: TabularRow[] = [
  { hospital_id: 'HOSP-01', hospital_name: 'Prince Court Medical Centre', city: 'Kuala Lumpur', latitude: 3.1505, longitude: 101.7198, clinical_department: 'Cardiology & Vascular', active_inpatients: 142, total_bed_capacity: 160, occupancy_rate_pct: 88.8, avg_length_of_stay_days: 3.8, emergency_wait_time_min: 14, quality_score: 98 },
  { hospital_id: 'HOSP-02', hospital_name: 'Gleneagles Hospital KL', city: 'Kuala Lumpur', latitude: 3.1592, longitude: 101.7388, clinical_department: 'Oncology & Radiotherapy', active_inpatients: 210, total_bed_capacity: 240, occupancy_rate_pct: 87.5, avg_length_of_stay_days: 5.2, emergency_wait_time_min: 18, quality_score: 96 },
  { hospital_id: 'HOSP-03', hospital_name: 'Subang Jaya Medical Centre', city: 'Selangor', latitude: 3.0768, longitude: 101.5901, clinical_department: 'Orthopaedics & Trauma', active_inpatients: 185, total_bed_capacity: 220, occupancy_rate_pct: 84.1, avg_length_of_stay_days: 4.1, emergency_wait_time_min: 22, quality_score: 94 },
  { hospital_id: 'HOSP-04', hospital_name: 'Island Hospital Penang', city: 'Penang', latitude: 5.4215, longitude: 100.3118, clinical_department: 'Neurology & Stroke Unit', active_inpatients: 160, total_bed_capacity: 190, occupancy_rate_pct: 84.2, avg_length_of_stay_days: 4.5, emergency_wait_time_min: 19, quality_score: 92 },
  { hospital_id: 'HOSP-05', hospital_name: 'KPJ Johor Specialist Hospital', city: 'Johor Bahru', latitude: 1.4889, longitude: 103.7378, clinical_department: 'Emergency & Acute Care', active_inpatients: 175, total_bed_capacity: 210, occupancy_rate_pct: 83.3, avg_length_of_stay_days: 3.4, emergency_wait_time_min: 25, quality_score: 90 },
  { hospital_id: 'HOSP-06', hospital_name: 'Timberland Medical Centre', city: 'Kuching', latitude: 1.5165, longitude: 110.3345, clinical_department: 'General Surgery', active_inpatients: 115, total_bed_capacity: 140, occupancy_rate_pct: 82.1, avg_length_of_stay_days: 3.9, emergency_wait_time_min: 21, quality_score: 88 },
  { hospital_id: 'HOSP-07', hospital_name: 'KPJ Sabah Specialist Hospital', city: 'Kota Kinabalu', latitude: 5.9612, longitude: 116.0798, clinical_department: 'Paediatrics & Neonatal', active_inpatients: 125, total_bed_capacity: 150, occupancy_rate_pct: 83.3, avg_length_of_stay_days: 3.1, emergency_wait_time_min: 16, quality_score: 91 },
  { hospital_id: 'HOSP-08', hospital_name: 'Kuantan Medical Centre', city: 'Kuantan', latitude: 3.8245, longitude: 103.3288, clinical_department: 'Gastroenterology', active_inpatients: 98, total_bed_capacity: 120, occupancy_rate_pct: 81.7, avg_length_of_stay_days: 3.6, emergency_wait_time_min: 28, quality_score: 86 }
];

export const DEFAULT_SUPPLY_CHAIN_DATASET: TabularRow[] = [
  { hub_code: 'HUB-KL01', hub_name: 'Port Klang Mega Logistics Gateway', state: 'Selangor', latitude: 2.9988, longitude: 101.3918, transport_mode: 'Heavy Haulage', daily_shipment_volume: 48500, on_time_delivery_pct: 96.8, transit_hours_avg: 4.2, fuel_cost_myr: 125000, warehouse_utilization_pct: 91.5 },
  { hub_code: 'HUB-KL02', hub_name: 'KLIA Air Cargo Super Hub', state: 'Selangor', latitude: 2.7433, longitude: 101.7012, transport_mode: 'Air Freight', daily_shipment_volume: 32000, on_time_delivery_pct: 98.4, transit_hours_avg: 2.1, fuel_cost_myr: 185000, warehouse_utilization_pct: 88.0 },
  { hub_code: 'HUB-PG01', hub_name: 'Batu Kawan Industrial Fulfillment', state: 'Penang', latitude: 5.2612, longitude: 100.4312, transport_mode: 'Road Express', daily_shipment_volume: 28500, on_time_delivery_pct: 95.2, transit_hours_avg: 5.8, fuel_cost_myr: 89000, warehouse_utilization_pct: 86.4 },
  { hub_code: 'HUB-JB01', hub_name: 'Tanjung Pelepas Container Hub', state: 'Johor', latitude: 1.3654, longitude: 103.5512, transport_mode: 'Ocean Freight', daily_shipment_volume: 42000, on_time_delivery_pct: 94.6, transit_hours_avg: 6.5, fuel_cost_myr: 142000, warehouse_utilization_pct: 93.2 },
  { hub_code: 'HUB-EC01', hub_name: 'Kuantan Port Deepwater Terminal', state: 'Pahang', latitude: 3.9788, longitude: 103.4288, transport_mode: 'Bulk Shipping', daily_shipment_volume: 18500, on_time_delivery_pct: 92.1, transit_hours_avg: 8.4, fuel_cost_myr: 62000, warehouse_utilization_pct: 78.5 },
  { hub_code: 'HUB-SW01', hub_name: 'Senari Port Logistics Center', state: 'Sarawak', latitude: 1.5645, longitude: 110.3988, transport_mode: 'Coastal Feeder', daily_shipment_volume: 16200, on_time_delivery_pct: 93.4, transit_hours_avg: 7.8, fuel_cost_myr: 54000, warehouse_utilization_pct: 82.0 },
  { hub_code: 'HUB-SB01', hub_name: 'Sepangar Bay Container Terminal', state: 'Sabah', latitude: 6.0688, longitude: 116.1412, transport_mode: 'Inter-Island Marine', daily_shipment_volume: 14800, on_time_delivery_pct: 91.8, transit_hours_avg: 9.2, fuel_cost_myr: 51000, warehouse_utilization_pct: 80.5 },
  { hub_code: 'HUB-IP01', hub_name: 'Ipoh Inland Dry Port Hub', state: 'Perak', latitude: 4.5712, longitude: 101.0812, transport_mode: 'Rail Cargo', daily_shipment_volume: 21000, on_time_delivery_pct: 95.8, transit_hours_avg: 5.1, fuel_cost_myr: 68000, warehouse_utilization_pct: 84.8 }
];

export function resolveFieldLabel(fieldName: string, widget?: WidgetSpec): string {
  if (!fieldName) return '';
  
  // 1. Check explicit label dictionary e.g. labels: { "tx_vol_myr": "Gross Banking Volume (RM)" }
  if (widget?.labels && widget.labels[fieldName]) {
    return widget.labels[fieldName];
  }
  if ((widget as any)?.measure_labels && (widget as any).measure_labels[fieldName]) {
    return (widget as any).measure_labels[fieldName];
  }

  // 2. Check structured measures array e.g. measures: [{ field: "tx_vol_myr", label: "Gross Banking Volume (RM)" }]
  if (Array.isArray(widget?.measures)) {
    const found = widget.measures.find((m: any) => (typeof m === 'object' && m !== null && m.field === fieldName));
    if (found && typeof found === 'object') {
      return (found as any).label || (found as any).name || fieldName;
    }
  }

  // 3. Check structured Y-axis measures e.g. y: [{ field: "tx_vol_myr", label: "Gross Banking Volume (RM)" }]
  if (Array.isArray(widget?.y)) {
    const found = widget.y.find((m: any) => (typeof m === 'object' && m !== null && m.field === fieldName));
    if (found && typeof found === 'object') {
      return (found as any).label || (found as any).name || fieldName;
    }
  }

  // 4. Check table columns config e.g. table_columns: [{ key: "tx_vol_myr", label: "Gross Banking Volume (RM)" }]
  if (Array.isArray(widget?.table_columns)) {
    const col = widget.table_columns.find(c => c.key === fieldName);
    if (col?.label) return col.label;
  }

  // 5. Fallback: exact field name as declared
  return fieldName;
}

export function getTimeWindowFactor(timeFilter: any): number {
  if (typeof timeFilter === 'object' && timeFilter?.startDate && timeFilter?.endDate) {
    const d1 = new Date(timeFilter.startDate).getTime();
    const d2 = new Date(timeFilter.endDate).getTime();
    const days = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
    return Math.min(1.5, Math.max(0.004, days / 236));
  }
  const t = String(timeFilter || 'ytd').toLowerCase();
  if (t === 'today' || t === 'yesterday') return 1 / 236;
  if (t === 'last_7_days' || t === '7d') return 7 / 236;
  if (t === 'last_30_days' || t === '30d') return 30 / 236;
  if (t === 'last_90_days' || t === '90d' || t === 'quarter') return 90 / 236;
  if (t === 'last_12_months' || t === '1y' || t === '365d') return 365 / 236;
  return 1.0; // YTD base
}

import { WidgetSpec } from '../core/types';

export interface FilterState {
  [filterId: string]: any;
}

export interface TabularRow {
  [columnName: string]: any;
}

export interface QueryResult {
  columns: string[];
  rows: TabularRow[];
  totalRows: number;
  durationMs?: number;
}

/**
 * Universal template string interpolator (e.g. "Showing {{grain}} stream for {{region}}")
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
 * Evaluates temporal aggregation grain dynamically based on time horizon
 */
export function resolveTemporalGrain(timePreset: string): { grain: string; grainLabel: string } {
  const norm = String(timePreset || '').toLowerCase();
  if (norm.includes('today') || norm.includes('yesterday') || norm === 'hour') {
    return { grain: 'hour', grainLabel: 'Hourly' };
  }
  if (norm.includes('7_days') || norm.includes('15_days') || norm.includes('30_days') || norm.includes('this_month') || norm === 'day') {
    return { grain: 'day', grainLabel: 'Daily' };
  }
  if (norm.includes('90_days') || norm.includes('3_months') || norm.includes('quarter') || norm.includes('last_month') || norm === 'week') {
    return { grain: 'week', grainLabel: 'Weekly' };
  }
  if (norm.includes('ytd') || norm.includes('year') || norm.includes('6_months')) {
    return { grain: 'month', grainLabel: 'Monthly' };
  }
  if (norm.includes('all_time') || norm.includes('lifetime')) {
    return { grain: 'quarter', grainLabel: 'Quarterly' };
  }
  return { grain: 'month', grainLabel: 'Monthly' };
}

/**
 * Generic filtering predicate: evaluates active filter state against any raw tabular row
 */
export function evaluateRowFilters(row: TabularRow, activeFilters: FilterState): boolean {
  for (const [filterKey, filterValue] of Object.entries(activeFilters)) {
    if (!filterValue || filterValue === 'All' || filterValue === 'All Divisions' || filterValue === 'All Regions') {
      continue;
    }

    if (filterKey.includes('time') || filterKey.includes('date')) {
      continue;
    }

    const activeFilterValues: string[] = Array.isArray(filterValue)
      ? filterValue.filter(v => !String(v).startsWith('All')).map(String)
      : [String(filterValue)].filter(v => !v.startsWith('All'));

    if (activeFilterValues.length === 0) continue;

    // Check if any column in the row satisfies this active filter selection
    const satisfies = Object.keys(row).some(col => {
      const colVal = String(row[col] ?? '').toLowerCase();
      return activeFilterValues.some(afv => {
        const normAfv = afv.toLowerCase();
        return colVal === normAfv || colVal.includes(normAfv) || normAfv.includes(colVal);
      });
    });

    if (!satisfies) return false;
  }
  return true;
}

/**
 * 100% Generic Visual Transformer:
 * Takes ANY raw dataset rows and transforms them according to the widget visual type
 */
export function transformGenericTabularData(
  widget: WidgetSpec, 
  rawRows: TabularRow[], 
  activeFilters: FilterState, 
  overrideGrain?: string
): any {
  const rawTime = activeFilters['time_range'] || activeFilters['date_range'] || 'ytd';
  const timePreset = typeof rawTime === 'object' && rawTime !== null ? rawTime.preset || 'custom' : String(rawTime || 'ytd');
  const timeLabel = typeof rawTime === 'object' && rawTime !== null ? rawTime.label || 'Custom' : String(rawTime || 'ytd');

  const { grain, grainLabel } = overrideGrain 
    ? { grain: overrideGrain, grainLabel: overrideGrain.toUpperCase() } 
    : resolveTemporalGrain(timePreset);

  const rawDivision = activeFilters['product_division'] || activeFilters['category'] || activeFilters['division'] || 'All Divisions';
  const hasDivisionFilter = rawDivision && !String(rawDivision).startsWith('All');

  const context: Record<string, any> = {
    ...activeFilters,
    time_range: timeLabel,
    grain: grainLabel,
    active_grain: grainLabel,
    product_division: hasDivisionFilter ? rawDivision : 'All Merchandise',
    division: hasDivisionFilter ? rawDivision : 'All Merchandise'
  };

  const dynamicTitle = interpolateString(widget.title, context);
  const dynamicSubtitle = widget.subtitle 
    ? interpolateString(widget.subtitle, context) 
    : hasDivisionFilter 
    ? `Showing ${grainLabel} stream for ${rawDivision} (${timeLabel})`
    : `Showing ${grainLabel} aggregation for ${timeLabel}`;

  // Apply generic row-level filtering
  const filteredRows = rawRows.filter(r => evaluateRowFilters(r, activeFilters));

  // 1. KPI Card: Generic Scalar Aggregation with Time Window & Type Resolution
  if (widget.type === 'kpi_card') {
    const valCol = widget.value || (widget as any).column || 'sales';
    const valColLower = String(valCol).toLowerCase();
    
    const isIdentifier = valColLower.includes('code') || valColLower.includes('id') || valColLower === 'branch_code' || valColLower === 'store_id';
    const isAvgOrScore = valColLower.includes('nps') || valColLower.includes('score') || valColLower.includes('rating') || valColLower.includes('avg') || widget.format?.includes('%');
    const isCount = (widget.format === '0,0' || valColLower.includes('count') || isIdentifier) && !isAvgOrScore;

    let total = 0;
    if (filteredRows.length > 0) {
      if (isIdentifier) {
        // Distinct count of entities (e.g. unique branches or stores)
        total = new Set(filteredRows.map(r => r[valCol] ?? r['store_id'] ?? r['branch_code'])).size;
      } else if (isAvgOrScore) {
        // Average score/NPS/percentage
        const sumVal = filteredRows.reduce((sum, r) => sum + (Number(r[valCol] || 0)), 0);
        total = +(sumVal / filteredRows.length).toFixed(1);
      } else if (isCount) {
        total = filteredRows.reduce((sum, r) => sum + (Number(r[valCol] || r['basket_items_count'] || r['atm_count'] || 1)), 0);
      } else {
        // Cumulative volume/revenue/fee: dynamically scaled by the selected date horizon
        const baseSum = filteredRows.reduce((sum, r) => sum + (Number(r[valCol] || r['transaction_volume_myr'] || r['gross_revenue_myr'] || r['revenue'] || r['sales'] || 0)), 0);
        const timeFactor = getTimeWindowFactor(activeFilters['time_range']);
        total = Math.round(baseSum * timeFactor);
      }
    }

    const sparkline = [0.85, 0.92, 0.88, 0.95, 0.91, 1.0].map(m => +(total * m).toFixed(isAvgOrScore ? 1 : 0));

    return {
      dynamicTitle,
      dynamicSubtitle,
      grain,
      activeGrain: grainLabel,
      value: total,
      target: widget.target ? interpolateString(widget.target, context) : undefined,
      comparison_label: widget.comparison_label || '+12.4% vs baseline',
      sparklineData: sparkline
    };
  }

  // 2. Donut / Pie Chart: Generic Categorical Grouping
  if (widget.type === 'donut_chart' || widget.type === 'pie_chart') {
    const dimCol = widget.dimension || 'product_division' || 'category';
    const metricCol = (widget.measures && widget.measures[0]) || 'gross_revenue_myr' || 'sales';

    const groupMap = new Map<string, number>();
    filteredRows.forEach(r => {
      const cat = String(r[dimCol] || r['category'] || r['region_cluster'] || 'Other');
      const val = Number(r[metricCol] || r['sales'] || r['gross_revenue_myr'] || 0);
      groupMap.set(cat, (groupMap.get(cat) || 0) + val);
    });

    const slices = Array.from(groupMap.entries()).map(([name, value]) => ({ name, value: Math.round(value) }));
    const data = slices.length > 0 ? slices : [{ name: 'No Data', value: 0 }];

    return {
      dynamicTitle,
      dynamicSubtitle,
      grain,
      activeGrain: grainLabel,
      slices: data,
      data
    };
  }

  // 3. Bar Chart: Generic Dimension vs Measure Grouping
  if (widget.type === 'bar_chart') {
    const dimCol = widget.dimension || 'region_cluster' || 'region';
    const measureCol = (widget.measures && widget.measures[0]) || 'gross_revenue_myr' || 'sales';
    const targetCol = (widget.measures && widget.measures[1]) || 'monthly_budget_target' || 'target';

    const categoriesMap = new Map<string, { actual: number; target: number }>();
    filteredRows.forEach(r => {
      const cat = String(r[dimCol] || r['region'] || r['category'] || 'Item');
      const actual = Number(r[measureCol] || r['sales'] || r['gross_revenue_myr'] || 0);
      const target = Number(r[targetCol] || r['target'] || r['monthly_budget_target'] || (actual * 0.95));
      const cur = categoriesMap.get(cat) || { actual: 0, target: 0 };
      categoriesMap.set(cat, { actual: cur.actual + actual, target: cur.target + target });
    });

    const categories = Array.from(categoriesMap.keys());
    const actualSeries = Array.from(categoriesMap.values()).map(v => Math.round(v.actual));
    const targetSeries = Array.from(categoriesMap.values()).map(v => Math.round(v.target));

    const useDualAxis = (widget.measures && widget.measures.length > 1) || Boolean((widget as any).dual_axis);

    const m1Name = typeof widget.measures?.[0] === 'object' ? (widget.measures[0] as any).field : widget.measures?.[0];
    const m2Name = typeof widget.measures?.[1] === 'object' ? (widget.measures[1] as any).field : widget.measures?.[1];

    const label1 = resolveFieldLabel(m1Name || measureCol, widget);
    const label2 = resolveFieldLabel(m2Name || targetCol, widget);

    return {
      dynamicTitle,
      dynamicSubtitle,
      grain,
      activeGrain: grainLabel,
      useDualAxis,
      categories: categories.length > 0 ? categories : ['No Data'],
      series: [
        { name: label1, data: actualSeries, yAxisIndex: 0 },
        { name: label2, data: targetSeries, yAxisIndex: useDualAxis ? 1 : 0 }
      ]
    };
  }

  // 4. Line / Area / POS Velocity Chart: Generic Time Grain Bucketing
  if (widget.type === 'line_chart' || widget.type === 'area_chart' || widget.type === 'combo_chart') {
    const dimCol = widget.dimension || 'transaction_date' || 'date';
    const measureCol = (widget.measures && widget.measures[0]) || 'gross_revenue_myr' || 'sales';
    const countCol = (widget.measures && widget.measures[1]) || 'basket_items_count' || 'customer_count';

    let categories: string[] = [];
    if (grain === 'hour') {
      categories = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'];
    } else if (grain === 'day') {
      categories = ['18 Aug', '19 Aug', '20 Aug', '21 Aug', '22 Aug', '23 Aug', '24 Aug'];
    } else if (grain === 'week') {
      categories = ['W24 (Jun)', 'W26 (Jun)', 'W28 (Jul)', 'W30 (Jul)', 'W32 (Aug)', 'W34 (Aug)'];
    } else {
      categories = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026'];
    }

    const totalActual = filteredRows.reduce((sum, r) => sum + Number(r[measureCol] || r['sales'] || 0), 0);
    const avgPerBucket = categories.length > 0 ? totalActual / categories.length : 0;

    const seriesData1 = categories.map((_, idx) => Math.round(avgPerBucket * (0.85 + (idx % 3) * 0.1)));
    const seriesData2 = categories.map((_, idx) => Math.round((avgPerBucket / 30) * (0.9 + (idx % 2) * 0.15)));

    const useDualAxis = (widget.measures && widget.measures.length > 1) || (widget as any).dual_axis || true;

    const m1Name = typeof widget.measures?.[0] === 'object' ? (widget.measures[0] as any).field : widget.measures?.[0];
    const m2Name = typeof widget.measures?.[1] === 'object' ? (widget.measures[1] as any).field : widget.measures?.[1];

    const label1 = resolveFieldLabel(m1Name || measureCol, widget);
    const label2 = resolveFieldLabel(m2Name || countCol, widget);

    return {
      dynamicTitle,
      dynamicSubtitle,
      grain,
      activeGrain: grainLabel,
      useDualAxis,
      categories,
      series: [
        { name: label1, data: seriesData1, yAxisIndex: 0 },
        { name: label2, data: seriesData2, yAxisIndex: 1 }
      ]
    };
  }

  // 6. Treemap Chart: Generic Hierarchical Sizing
  if (widget.type === 'treemap') {
    const dimCol = widget.dimension || 'category' || 'plan_tier' || 'clinical_department';
    const metricCol = (widget.measures && widget.measures[0]) || 'mrr_usd' || 'sales' || 'active_inpatients';

    const groupMap = new Map<string, number>();
    filteredRows.forEach(r => {
      const cat = String(r[dimCol] || r['category'] || r['region'] || 'Item');
      const val = Number(r[metricCol] || r['mrr_usd'] || r['sales'] || 1000);
      groupMap.set(cat, (groupMap.get(cat) || 0) + val);
    });

    const data = Array.from(groupMap.entries()).map(([name, value]) => ({ name, value: Math.round(value) }));
    return { dynamicTitle, dynamicSubtitle, grain, activeGrain: grainLabel, data };
  }

  // 7. Funnel Chart: Generic Conversion Stage
  if (widget.type === 'funnel') {
    const dimCol = widget.dimension || 'stage' || 'plan_tier';
    const metricCol = (widget.measures && widget.measures[0]) || 'value' || 'count' || 'mrr_usd';

    const groupMap = new Map<string, number>();
    filteredRows.forEach(r => {
      const stage = String(r[dimCol] || r['stage'] || 'Stage');
      const val = Number(r[metricCol] || 100);
      groupMap.set(stage, (groupMap.get(stage) || 0) + val);
    });

    const data = Array.from(groupMap.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);

    return { dynamicTitle, dynamicSubtitle, grain, activeGrain: grainLabel, data };
  }

  // 8. Gauge / Bullet: Metric vs Target
  if (widget.type === 'gauge' || widget.type === 'bullet_chart') {
    const metricCol = widget.value || (widget.measures && widget.measures[0]) || 'occupancy_rate_pct' || 'on_time_delivery_pct';
    const sumVal = filteredRows.reduce((sum, r) => sum + Number(r[metricCol] || 85), 0);
    const avgVal = filteredRows.length > 0 ? +(sumVal / filteredRows.length).toFixed(1) : 85;
    return { dynamicTitle, dynamicSubtitle, grain, activeGrain: grainLabel, value: avgVal, target: 100 };
  }

  // 9. Radar Chart: Multi-Axis Performance Index
  if (widget.type === 'radar') {
    const indicators = widget.radar_indicators || [
      { name: 'SLA Quality', max: 100 },
      { name: 'On-Time Delivery', max: 100 },
      { name: 'Fleet Utilization', max: 100 },
      { name: 'Safety Compliance', max: 100 },
      { name: 'Customer Satisfaction', max: 100 }
    ];
    return {
      dynamicTitle,
      dynamicSubtitle,
      grain,
      activeGrain: grainLabel,
      indicators,
      series: [{ value: [94, 96, 91, 98, 92], name: 'Operational Actuals' }]
    };
  }

  // 10. Scatter / Bubble Chart
  if (widget.type === 'scatter_chart' || widget.type === 'bubble_chart') {
    const m1 = (widget.measures && widget.measures[0]) || 'mrr_usd' || 'sales';
    const m2 = (widget.measures && widget.measures[1]) || 'usage_api_calls' || 'target';
    const nameCol = widget.dimension || 'company_name' || 'hospital_name' || 'hub_name';

    const data = filteredRows.map(r => [
      Number(r[m1] || 10000),
      Number(r[m2] || 50000),
      Number(r['churn_risk_pct'] || r['quality_score'] || 8),
      String(r[nameCol] || 'Entity')
    ]);

    return { dynamicTitle, dynamicSubtitle, grain, activeGrain: grainLabel, data };
  }

  // 5. Google Maps / Geospatial Widget
  if (widget.type === 'google_map' || widget.type === 'geo_map') {
    const latCol = (widget as any).latitude_col || 'latitude' || 'lat';
    const lngCol = (widget as any).longitude_col || 'longitude' || 'lng';
    const nameCol = (widget as any).name_col || 'store_name' || 'name';
    const valCol = (widget as any).value_col || 'gross_revenue_myr' || 'sales';
    const targetCol = (widget as any).target_col || 'monthly_budget_target' || 'target';

    const storeMap = new Map<string, any>();
    filteredRows.forEach(r => {
      const id = String(r['branch_code'] || r['store_id'] || r['id'] || r[nameCol]);
      const name = String(r[nameCol] || r['branch_name'] || r['store_name'] || id);
      const region = String(r['region'] || r['region_cluster'] || r['state'] || 'Malaysia');
      const manager = String(r['branch_manager'] || r['store_manager'] || r['manager'] || 'Branch Manager');
      const nps = Number(r['customer_nps'] || r['nps_score'] || r['nps'] || 88);
      const pos_count = Number(r['atm_count'] || r['pos_terminal_count'] || r['pos_count'] || 6);
      const target = Number(r[targetCol] || r['deposit_target_myr'] || r['monthly_budget_target'] || r['target'] || 0);

      if (!storeMap.has(id)) {
        storeMap.set(id, {
          id,
          store_id: id,
          branch_code: id,
          name,
          store_name: name,
          branch_name: name,
          lat: Number(r[latCol] || r['lat'] || 3.14),
          lng: Number(r[lngCol] || r['lng'] || 101.69),
          region,
          state: String(r['state'] || region),
          sales: 0,
          target,
          manager,
          nps,
          pos_count
        });
      }
      const entry = storeMap.get(id);
      entry.sales += Number(r[valCol] || r['transaction_volume_myr'] || r['gross_revenue_myr'] || r['sales'] || 0);
    });

    const mapPoints = Array.from(storeMap.values()).map(p => {
      const attainmentPct = p.target > 0 ? Math.round((p.sales / p.target) * 1000) / 10 : 100;
      let attainmentStatus = 'On Track';
      if (attainmentPct < 90) attainmentStatus = 'At Risk';
      else if (attainmentPct < 100) attainmentStatus = 'Warning';
      return {
        ...p,
        target_achievement_pct: attainmentPct,
        status: `${attainmentStatus} (${attainmentPct}%)`
      };
    });

    return {
      dynamicTitle,
      dynamicSubtitle,
      grain,
      activeGrain: grainLabel,
      mapPoints
    };
  }

  return {
    dynamicTitle,
    dynamicSubtitle,
    grain,
    activeGrain: grainLabel,
    columns: Object.keys(filteredRows[0] || {}),
    rows: filteredRows
  };
}

export const DEFAULT_CIMB_DATASET: TabularRow[] = [
  { branch_code: 'CIMB-0101', branch_name: 'CIMB Menara KL Sentral Main', region: 'Central Region', state: 'Kuala Lumpur', latitude: 3.1343, longitude: 101.6865, banking_product: 'Consumer CASA Deposits', transaction_channel: 'Over-the-Counter (OTC)', transaction_volume_myr: 29560000000, fee_income_myr: 85310000, deposit_target_myr: 32000000000, branch_manager: 'Datuk Faridah Rahman', customer_nps: 94, atm_count: 12 },
  { branch_code: 'CIMB-0102', branch_name: 'CIMB Jalan Raja Chulan Financial Hub', region: 'Central Region', state: 'Kuala Lumpur', latitude: 3.1498, longitude: 101.7088, banking_product: 'Mortgages & Home Loans', transaction_channel: 'Premier Wealth Desk', transaction_volume_myr: 22330000000, fee_income_myr: 64370000, deposit_target_myr: 24000000000, branch_manager: 'Tan Sri Lawrence Lim', customer_nps: 91, atm_count: 8 },
  { branch_code: 'CIMB-0103', branch_name: 'CIMB Damansara Uptown Commercial Hub', region: 'Central Region', state: 'Selangor', latitude: 3.1366, longitude: 101.6225, banking_product: 'Consumer CASA Deposits', transaction_channel: 'CIMB Clicks & Digital Hub', transaction_volume_myr: 16910000000, fee_income_myr: 48730000, deposit_target_myr: 18000000000, branch_manager: 'Michael Chong Wai Keat', customer_nps: 92, atm_count: 7 },
  { branch_code: 'CIMB-0301', branch_name: 'CIMB Johor Bahru City Centre Gateway', region: 'Southern Region', state: 'Johor', latitude: 1.4655, longitude: 103.7618, banking_product: 'SME & Commercial Loans', transaction_channel: 'Over-the-Counter (OTC)', transaction_volume_myr: 15110000000, fee_income_myr: 43490000, deposit_target_myr: 16000000000, branch_manager: 'Grace Goh Bee Lian', customer_nps: 88, atm_count: 8 },
  { branch_code: 'CIMB-0201', branch_name: 'CIMB Gurney Drive Premier Branch', region: 'Northern Region', state: 'Penang', latitude: 5.4398, longitude: 100.3090, banking_product: 'Wealth & Unit Trusts', transaction_channel: 'Premier Wealth Desk', transaction_volume_myr: 13890000000, fee_income_myr: 40020000, deposit_target_myr: 15000000000, branch_manager: 'Dr. Raj Kumar', customer_nps: 89, atm_count: 6 },
  { branch_code: 'CIMB-0501', branch_name: 'CIMB Kuching Waterfront Premier Center', region: 'East Malaysia', state: 'Sarawak', latitude: 1.5595, longitude: 103.3422, banking_product: 'Auto Financing & Hire Purchase', transaction_channel: 'Over-the-Counter (OTC)', transaction_volume_myr: 10260000000, fee_income_myr: 29570000, deposit_target_myr: 11000000000, branch_manager: 'Jonathan Ting Choon', customer_nps: 86, atm_count: 6 },
  { branch_code: 'CIMB-0502', branch_name: 'CIMB Kota Kinabalu Financial Center', region: 'East Malaysia', state: 'Sabah', latitude: 5.9804, longitude: 116.0735, banking_product: 'SME & Commercial Loans', transaction_channel: 'Premier Wealth Desk', transaction_volume_myr: 9060000000, fee_income_myr: 26110000, deposit_target_myr: 10000000000, branch_manager: 'Dayang Nurul Hidayah', customer_nps: 85, atm_count: 6 },
  { branch_code: 'CIMB-0401', branch_name: 'CIMB Kuantan Coastal Main Branch', region: 'East Coast', state: 'Pahang', latitude: 3.8077, longitude: 103.3260, banking_product: 'Consumer CASA Deposits', transaction_channel: 'ATM & Cash Deposit Machine', transaction_volume_myr: 5430000000, fee_income_myr: 15660000, deposit_target_myr: 6000000000, branch_manager: 'Haji Shahrul Azman', customer_nps: 82, atm_count: 5 }
];

export function executeWidgetQuery(widget: WidgetSpec, activeFilters: FilterState, overrideGrain?: string): any {
  const src = (widget.source || (widget as any).dataset || '').toLowerCase();
  let dataset = DEFAULT_STORE_DATASET;
  if (src.includes('cimb') || src.includes('bank')) {
    dataset = DEFAULT_CIMB_DATASET;
  } else if (src.includes('saas') || src.includes('subscription')) {
    dataset = DEFAULT_SAAS_DATASET;
  } else if (src.includes('health') || src.includes('hospital') || src.includes('clinical')) {
    dataset = DEFAULT_HEALTHCARE_DATASET;
  } else if (src.includes('supply') || src.includes('logistics') || src.includes('fleet')) {
    dataset = DEFAULT_SUPPLY_CHAIN_DATASET;
  }
  return transformGenericTabularData(widget, dataset, activeFilters, overrideGrain);
}


export const DEFAULT_STORE_DATASET: TabularRow[] = [
  { store_id: '7E-1082', store_name: 'KLCC Twin Towers Concourse', region_cluster: 'Klang Valley / Central', latitude: 3.1578, longitude: 101.7123, product_division: 'Fresh Food & Ready-to-Eat (RTE)', gross_revenue_myr: 12450000, basket_items_count: 4200, monthly_budget_target: 14000000, store_manager: 'Ahmad Zaki', nps_score: 96, pos_terminal_count: 8 },
  { store_id: '7E-2041', store_name: 'Mid Valley Megamall North Court', region_cluster: 'Klang Valley / Central', latitude: 3.1189, longitude: 101.6781, product_division: 'Beverages & Slurpee', gross_revenue_myr: 11200000, basket_items_count: 3600, monthly_budget_target: 12500000, store_manager: 'Michelle Tan', nps_score: 88, pos_terminal_count: 6 },
  { store_id: '7E-0492', store_name: 'Gurney Plaza Waterfront', region_cluster: 'Northern Region', latitude: 5.4377, longitude: 100.3098, product_division: 'Snacks & Confectionery', gross_revenue_myr: 9450000, basket_items_count: 2800, monthly_budget_target: 10500000, store_manager: 'Rajeswary S.', nps_score: 84, pos_terminal_count: 5 },
  { store_id: '7E-3118', store_name: 'JB City Square Customs Hub', region_cluster: 'Southern Region', latitude: 1.4619, longitude: 103.7638, product_division: 'Tobacco & Core Services', gross_revenue_myr: 10890000, basket_items_count: 3100, monthly_budget_target: 11500000, store_manager: 'Kevin Wong', nps_score: 78, pos_terminal_count: 6 },
  { store_id: '7E-0842', store_name: 'KLIA2 Departure Hall Terminal', region_cluster: 'Klang Valley / Central', latitude: 2.7456, longitude: 101.6841, product_division: 'Fresh Food & Ready-to-Eat (RTE)', gross_revenue_myr: 14210000, basket_items_count: 4800, monthly_budget_target: 15000000, store_manager: 'Noraini Mohd', nps_score: 98, pos_terminal_count: 10 },
  { store_id: '7E-1934', store_name: 'Ipoh Old Town Heritage', region_cluster: 'Northern Region', latitude: 4.5975, longitude: 101.0772, product_division: 'General & Personal Care', gross_revenue_myr: 4680000, basket_items_count: 1900, monthly_budget_target: 6000000, store_manager: 'Chong Wei Lun', nps_score: 42, pos_terminal_count: 4 },
  { store_id: '7E-4421', store_name: 'Kuantan Teluk Cempedak Beach', region_cluster: 'East Coast & Islands', latitude: 3.8168, longitude: 103.3654, product_division: 'Beverages & Slurpee', gross_revenue_myr: 4250000, basket_items_count: 2200, monthly_budget_target: 7000000, store_manager: 'Fatimah Ali', nps_score: 68, pos_terminal_count: 4 },
  { store_id: '7E-5512', store_name: 'Kuching Waterfront Heritage', region_cluster: 'Sabah & Sarawak', latitude: 1.5583, longitude: 110.3444, product_division: 'Snacks & Confectionery', gross_revenue_myr: 4520000, basket_items_count: 2400, monthly_budget_target: 8500000, store_manager: 'Leonard Jabu', nps_score: 74, pos_terminal_count: 5 }
];
