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

export interface DataSourceSpec {
  id: string;
  name?: string;
  type: DataSourceType;
  url?: string;
  connection_string?: string;
  project?: string;
  dataset?: string;
  database?: string;
  warehouse?: string;
  host?: string;
  port?: number;
  sheet_id?: string;
  range?: string;
  path?: string;
  refresh_interval?: string;
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
}

export type WidgetType = 
  | 'kpi_card'
  | 'line_chart'
  | 'bar_chart'
  | 'stacked_bar'
  | 'area_chart'
  | 'pie_chart'
  | 'donut_chart'
  | 'scatter_chart'
  | 'heatmap'
  | 'treemap'
  | 'sankey'
  | 'radar'
  | 'funnel'
  | 'gauge'
  | 'table';

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
  axis?: 'left' | 'right';
  format?: string;
  color?: string;
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
  table_columns?: Array<{
    key: string;
    label: string;
    format?: string;
    align?: 'left' | 'center' | 'right';
    badge?: boolean;
  }>;
  
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

export interface DashboardSpec {
  version: string;
  id: string;
  title: string;
  description?: string;
  theme?: DashboardTheme;
  refresh_interval?: string;
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
