export const SEVEN_ELEVEN_QLIK_BQ_YAML = `version: "1.0"
id: "seven-eleven-retail-intelligence"
title: "The Eye — 7-Eleven Store & POS Analytics (the-eye-bi-platform)"
description: "Federated Data Mesh combining Live BigQuery POS Telemetry with Google Sheets Regional Target Allocations"
theme: "emerald-slate"
refresh_interval: "30s"

cache:
  enabled: true
  ttl: "15m"
  strategy: "stale_while_revalidate"

data_sources:
  - id: bq_seven_eleven
    name: "7-Eleven BigQuery Live (the-eye-bi-platform)"
    type: bigquery
    project: "the-eye-bi-platform"
    dataset: "retail_analytics"
    options:
      auth_mode: "google_oauth_adc_delegated"
      location: "asia-southeast1"

  - id: gsheet_store_targets
    name: "Store Budget & Manager Quotas (Google Sheet)"
    type: google_sheet
    sheet_id: "1kxhTv9TKA1RJSJcV017xVq4jADPSZxx8bSuSWxgGii4"
    range: "Targets!A1:E20"

# Multi-Source Declarative Data Mesh Join Model
data_mesh:
  - id: bq_gsheet_store_mesh
    name: "BigQuery POS Actuals × Google Sheet Q3 Targets"
    primary_source: bq_seven_eleven
    secondary_source: gsheet_store_targets
    join_type: left
    join_on: "store_id"
    computed_fields:
      - name: "target_achievement_pct"
        formula: "(daily_sales / q3_budget_target) * 100"
        format: "0.0%"
      - name: "variance_to_budget"
        formula: "daily_sales - q3_budget_target"
        format: "RM 0,0"

filters:
  - id: store_region
    label: "Store Region / Cluster"
    type: multi_select
    default: ["All Regions"]
    options:
      - label: "All Regions"
        value: "All Regions"
      - label: "Klang Valley / Central"
        value: "Klang Valley / Central"
      - label: "Northern Region"
        value: "Northern Region"
      - label: "Southern Region"
        value: "Southern Region"
      - label: "East Coast & Islands"
        value: "East Coast & Islands"
      - label: "Sabah & Sarawak"
        value: "Sabah & Sarawak"

  - id: product_division
    label: "Product Division"
    type: single_select
    default: "All Divisions"
    options:
      - label: "All Divisions"
        value: "All Divisions"
      - label: "Fresh Food & Ready-to-Eat (RTE)"
        value: "Fresh Food & Ready-to-Eat (RTE)"
      - label: "Beverages & Slurpee"
        value: "Beverages & Slurpee"
      - label: "Snacks & Confectionery"
        value: "Snacks & Confectionery"
      - label: "Tobacco & Core Services"
        value: "Tobacco & Core Services"
      - label: "General & Personal Care"
        value: "General & Personal Care"

  - id: time_range
    label: "POS Transaction Horizon"
    type: daterange
    default: "2026-YTD"

layout:
  columns: 12
  row_height: 100

widgets:
  # Row 1: KPI Metrics
  - id: kpi_pos_sales
    title: "Total POS Gross Sales"
    type: kpi_card
    source: bq_seven_eleven
    position: { x: 0, y: 0, w: 3, h: 2 }
    value: "gross_sales"
    target: "RM 85.0M"
    format: "RM 0.00a"
    comparison_label: "+14.2% YoY"
    sparkline: true

  - id: kpi_basket_size
    title: "Average Basket Size (ABV)"
    type: kpi_card
    source: bq_seven_eleven
    position: { x: 3, y: 0, w: 3, h: 2 }
    value: "basket_size"
    format: "RM 0.00"
    comparison_label: "+RM 1.85 / basket"
    sparkline: true

  - id: kpi_store_count
    title: "Active 7-Eleven Outlets"
    type: kpi_card
    source: bq_seven_eleven
    position: { x: 6, y: 0, w: 3, h: 2 }
    value: "store_count"
    format: "0,0"
    comparison_label: "+28 new store openings"
    sparkline: true

  - id: kpi_rte_share
    title: "Fresh Food & RTE Penetration"
    type: kpi_card
    source: bq_seven_eleven
    position: { x: 9, y: 0, w: 3, h: 2 }
    value: "rte_pct"
    format: "0.0%"
    comparison_label: "+3.8% mix shift"
    sparkline: true

  # Row 2: Charts
  - id: pos_velocity_chart
    title: "POS Transaction Velocity & Footfall"
    subtitle: "Showing {{active_grain}} stream for {{product_division}} ({{time_range}})"
    type: line_chart
    source: bq_seven_eleven
    position: { x: 0, y: 2, w: 8, h: 4 }
    x: "date"
    y: ["Store Sales (RM)", "Customer Count"]
    dual_axis: true
    auto_grain: true
    format: "RM 0.0a"
    smooth: true

  - id: division_share_donut
    title: "Sales Share by Product Category"
    subtitle: "Category distribution for {{time_range}}"
    type: donut_chart
    source: bq_seven_eleven
    position: { x: 8, y: 2, w: 4, h: 4 }
    category: "category"
    value: "sales"
    format: "RM 0.0a"
    interaction:
      on_click_filter:
        filter_id: "product_division"
        field: "category"

  # Row 3: Regional Store Performance & Inventory Radar
  - id: regional_sales_bar
    title: "Store Cluster Performance & Same-Store-Sales (SSS)"
    subtitle: "Actual POS Revenue vs Target across Clusters"
    type: bar_chart
    source: bq_seven_eleven
    position: { x: 0, y: 6, w: 7, h: 4 }
    x: "cluster"
    y: ["Actual Revenue", "Target Revenue"]
    format: "RM 0.0a"
    interaction:
      on_click_filter:
        filter_id: "store_region"
        field: "cluster"

  - id: 7eleven_radar
    title: "Store Operations & Supply Chain Health"
    subtitle: "Operational metrics and store audit scores"
    type: radar
    source: bq_seven_eleven
    position: { x: 7, y: 6, w: 5, h: 4 }

  # Row 4: Interactive Google Maps Geospatial Intelligence & Store Dive-in Sub-Widgets
  - id: outlet_geo_map
    title: "Store Outlets Revenue Target Attainment (Google Maps × Google Sheets)"
    subtitle: "All outlet locations plotted on Google Maps with declarative store drilldown sub-widgets"
    type: google_map
    source: bq_gsheet_store_mesh
    position: { x: 0, y: 10, w: 12, h: 6 }
    map_config:
      center: { lat: 3.1390, lng: 101.6869 }
      zoom: 6
      style: "google_streets"
      metric_field: "target_achievement_pct"
      color_scale:
        min: 80
        max: 110
        min_color: "#ef4444"   # Red (At Risk <90%)
        mid_color: "#eab308"   # Amber (Warning 90-99%)
        max_color: "#22c55e"   # Green (On Track >=100%)
    drilldown:
      enabled: true
      title: "Store Deep-Dive: {{selected_store_name}}"
      subtitle: "Hourly POS velocity, category share, and commercial target variance"
      sub_widgets:
        - id: store_hourly_velocity
          title: "Hourly POS Transaction Velocity"
          type: line_chart
          x: "hour"
          y: ["Hourly POS Sales (RM)", "POS Transactions"]
          dual_axis: true
        - id: store_category_donut
          title: "Store Category Share"
          type: donut_chart
          category: "category"
          value: "sales"

  # Row 5: Meshed Federated Data Table (BigQuery Actuals + Google Sheet Targets)
  - id: meshed_store_performance_table
    title: "Store Performance & Attainment Intelligence"
    subtitle: "Combined POS actuals and commercial targets from federated data mesh"
    type: table
    source: bq_gsheet_store_mesh
    position: { x: 0, y: 14, w: 12, h: 4 }
    table_columns:
      - key: "store_id"
        label: "Store ID"
      - key: "store_name"
        label: "Outlet Location"
      - key: "store_manager"
        label: "Store Manager"
      - key: "daily_sales"
        label: "Actual POS Sales (RM)"
        format: "RM 0,0"
        align: "right"
      - key: "q3_budget_target"
        label: "Q3 Budget Target (RM)"
        format: "RM 0,0"
        align: "right"
      - key: "target_achievement_pct"
        label: "Attainment %"
        format: "0.0%"
        align: "right"
      - key: "audit_grade"
        label: "Audit Grade"
        badge: true
`;

export const SAMPLE_DASHBOARDS: Record<string, { name: string; yaml: string }> = {
  'seven-eleven-bq': {
    name: '🏪 7-Eleven BigQuery × Google Sheets (Data Mesh)',
    yaml: SEVEN_ELEVEN_QLIK_BQ_YAML,
  },
};
