export type DataSourceType = 
  | 'duckdb'
  | 'postgres'
  | 'mysql'
  | 'mssql'
  | 'bigquery'
  | 'snowflake'
  | 'databricks'
  | 'google_sheet'
  | 'excel'
  | 'rest_api'
  | 'mock';

export interface JoinSpec {
  type?: 'inner' | 'left' | 'right' | 'full';
  target_source: string;
  on: string; // e.g. "store_id = target.store_id"
}

export interface DataSourceSpec {
  id: string;
  name?: string;
  type: DataSourceType;
  url?: string;
  connection_string?: string;
  project?: string;
  dataset?: string;
  table?: string;
  query?: string;             // Custom BigQuery / SQL query or virtual dataset
  dimensions?: string[];
  metrics?: string[];
  joins?: JoinSpec[];
  database?: string;
  warehouse?: string;
  host?: string;
  port?: number;
  sheet_id?: string;
  range?: string;
  path?: string;
  refresh_interval?: string;
  cache?: CacheSpec;
  options?: Record<string, any>;
}

export type FilterType = 
  | 'daterange' 
  | 'multi_select' 
  | 'single_select' 
  | 'number_range' 
  | 'search';

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface FilterSpec {
  id: string;
  label: string;
  type: FilterType;
  source?: string;
  column?: string;
  default?: any;
  options?: FilterOption[];
  placeholder?: string;
  min_date?: string;           // e.g. "2025-01-01" or relative "-12m", "-6m", "-1y"
  max_date?: string;           // e.g. "2026-12-31" or relative "today", "+6m"
  max_backdate?: string;       // e.g. "12m", "6m", "1y", "90d" (max historical lookback window)
  available_presets?: string[]; // e.g. ["today", "last_7_days", "last_30_days", "ytd"]
}

export type WidgetType = 
  // 1. Tables
  | 'table'
  | 'pivot_table'
  // 2. Scorecards / KPI Cards
  | 'kpi_card'
  | 'scorecard'
  // 3. Time Series & Cartesian Charts
  | 'line_chart'
  | 'bar_chart'
  | 'horizontal_bar'
  | 'stacked_bar'
  | 'stacked_bar_100'
  | 'area_chart'
  | 'combo_chart'
  | 'waterfall'
  // 4. Pie & Donut Charts
  | 'pie_chart'
  | 'donut_chart'
  // 5. Geospatial & Google Maps
  | 'google_map'
  | 'geo_map'
  | 'bubble_map'
  // 6. Scatter & Correlation
  | 'scatter_chart'
  | 'bubble_chart'
  // 7. Performance & Range Gauges
  | 'gauge'
  | 'bullet_chart'
  | 'funnel'
  | 'radar'
  // 8. Hierarchical & Flows
  | 'treemap'
  | 'heatmap'
  | 'sankey';

export interface WidgetPosition {
  x?: number;
  y?: number;
  w: number; // 1-12 columns
  h?: number; // height in grid units or px
}

export interface WidgetInteraction {
  on_click_filter?: {
    filter_id: string;
    field: string;
  };
  drill_down?: {
    target_dashboard?: string;
    pass_filters?: string[];
  };
}

export interface MeasureConfig {
  field: string;
  name?: string;
  label?: string;
  axis?: 'left' | 'right';
  format?: string;
  color?: string;
}

export interface ColorScaleSpec {
  metric_field?: string; // e.g. "nps_rating"
  min: number;
  max: number;
  min_color: string; // e.g. "#ef4444" (Red)
  mid_color?: string; // e.g. "#eab308" (Yellow)
  max_color: string; // e.g. "#22c55e" (Green)
}

export interface MapTableViewSpec {
  enabled?: boolean;
  title?: string;
  columns?: Array<{
    key: string;
    label: string;
    format?: string;
    align?: 'left' | 'center' | 'right';
    badge?: boolean;
  }>;
}

export interface MapConfigSpec {
  center?: { lat: number; lng: number };
  zoom?: number;
  style?: 'dark' | 'roadmap' | 'satellite' | 'night';
  layer_type?: 'pins' | 'heatmap' | 'clusters' | 'pins_and_heatmap';
  lat_field?: string;
  lng_field?: string;
  value_field?: string;
  metric_field?: string; // e.g. "nps_rating"
  color_scale?: ColorScaleSpec;
  tooltip_fields?: string[];
  show_table?: boolean;
  table_view?: MapTableViewSpec;
}

export interface SubWidgetSpec {
  id: string;
  title: string;
  subtitle?: string;
  type: 'line_chart' | 'bar_chart' | 'donut_chart' | 'kpi_card' | 'table';
  x?: string;
  y?: string | string[];
  category?: string;
  value?: string;
  dual_axis?: boolean;
  format?: string;
}

export interface DrilldownSpec {
  enabled: boolean;
  title?: string;
  subtitle?: string;
  target_param?: string; // e.g. "store_id"
  sub_widgets?: SubWidgetSpec[];
}

export interface WidgetSpec {
  id: string;
  title: string;
  subtitle?: string;
  type: WidgetType;
  source: string;
  query?: string;
  position: WidgetPosition;
  
  // Visual & Schema Mapping (100% Declarative)
  x?: string;
  y?: string | string[] | MeasureConfig[];
  group_by?: string;
  category?: string;
  value?: string;
  target?: string;
  format?: string; // e.g. "$0.0a", "0.0%", "0,0"
  color_scheme?: string | string[];
  sparkline?: boolean;
  comparison_label?: string;
  dual_axis?: boolean;
  auto_grain?: boolean;
  
  // Customization
  smooth?: boolean;
  stacked?: boolean;
  show_values?: boolean;
  radar_indicators?: Array<{ name: string; max?: number }>;
  map_config?: MapConfigSpec;
  drilldown?: DrilldownSpec;
  table_columns?: Array<{
    key: string;
    label: string;
    format?: string;
    align?: 'left' | 'center' | 'right';
    badge?: boolean;
  }>;
  labels?: Record<string, string>;
  measure_labels?: Record<string, string>;
  
  interaction?: WidgetInteraction;
}

export type DashboardTheme = 
  | 'modern-dark'
  | 'minimal-light'
  | 'cyberpunk'
  | 'corporate-navy'
  | 'emerald-slate';

export interface DashboardLayout {
  columns: number;
  row_height?: number;
  responsive?: boolean;
}

export interface ComputedFieldSpec {
  name: string;
  formula: string; // e.g. "sales_actual / budget_target * 100"
  format?: string;
}

export interface DataMeshSpec {
  id: string;
  name: string;
  primary_source: string;
  secondary_source: string;
  join_type: 'inner' | 'left' | 'right' | 'full';
  join_on: string | { primary_key: string; secondary_key: string };
  computed_fields?: ComputedFieldSpec[];
}

export interface CacheSpec {
  enabled?: boolean;
  ttl?: string; // e.g. "5m", "15m", "1h", "24h"
  strategy?: 'stale_while_revalidate' | 'cache_first' | 'network_only';
  max_entries?: number;
}

export interface CacheTelemetry {
  isCacheHit: boolean;
  executionTimeMs: number;
  cachedAt?: string;
  bytesSavedEst?: string;
}

export interface CurrencySpec {
  symbol?: string; // e.g. "RM", "$", "€", "£", "¥", "SGD"
  code?: string;   // e.g. "MYR", "USD", "EUR", "SGD"
  position?: 'prefix' | 'suffix';
  space?: boolean;
}

export interface DashboardSpec {
  version: string;
  id: string;
  title: string;
  description?: string;
  theme?: DashboardTheme;
  currency?: CurrencySpec;
  refresh_interval?: string;
  cache?: CacheSpec;
  data_sources: DataSourceSpec[];
  data_mesh?: DataMeshSpec[];
  filters?: FilterSpec[];
  layout?: DashboardLayout;
  widgets: WidgetSpec[];
}

export interface LintDiagnostic {
  path: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  line?: number;
  column?: number;
  suggestion?: string;
  fixAction?: {
    label: string;
    replacement: string;
    targetString?: string;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: LintDiagnostic[];
}

export interface QueryResult {
  columns: string[];
  data: Record<string, any>[];
  total_count: number;
  execution_time_ms: number;
}
