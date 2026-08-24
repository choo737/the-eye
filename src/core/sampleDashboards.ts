export const SEVEN_ELEVEN_QLIK_BQ_YAML = `version: "1.0"
id: "seven-eleven-retail-intelligence"
title: "The Eye — 7-Eleven Store & POS Analytics (seven-eleven-qlik-bq)"
description: "Live BigQuery production analytics for 7-Eleven omnichannel stores, POS transactions, basket size, and inventory velocity"
theme: "emerald-slate"
refresh_interval: "30s"

data_sources:
  - id: bq_seven_eleven
    name: "7-Eleven BigQuery Production (seven-eleven-qlik-bq)"
    type: bigquery
    project: "seven-eleven-qlik-bq"
    dataset: "retail_analytics"
    options:
      auth_mode: "google_oauth_adc_delegated"
      location: "US"

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
      - label: "Tobacco & Services"
        value: "Tobacco & Services"

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
    target: "$85.0M"
    format: "$0.00a"
    comparison_label: "+14.2% YoY"
    sparkline: true
    query: |
      SELECT sum(total_amount) as gross_sales 
      FROM \`seven-eleven-qlik-bq.retail_analytics.daily_store_sales\`
      WHERE store_region IN (:store_region)

  - id: kpi_basket_size
    title: "Average Basket Size (ABV)"
    type: kpi_card
    source: bq_seven_eleven
    position: { x: 3, y: 0, w: 3, h: 2 }
    value: "basket_size"
    format: "$0.00"
    comparison_label: "+$1.85 / basket"
    sparkline: true
    query: |
      SELECT avg(basket_amount) as basket_size 
      FROM \`seven-eleven-qlik-bq.retail_analytics.pos_baskets\`

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
    subtitle: "Showing {{active_grain}} stream for {{time_range}} from BigQuery (seven-eleven-qlik-bq)"
    type: line_chart
    source: bq_seven_eleven
    position: { x: 0, y: 2, w: 8, h: 4 }
    x: "date"
    y: ["Store Sales ($)", "Customer Count"]
    dual_axis: true
    auto_grain: true
    format: "$0.0a"
    smooth: true

  - id: division_share_donut
    title: "Sales Share by Product Category"
    subtitle: "Category distribution for {{time_range}}"
    type: donut_chart
    source: bq_seven_eleven
    position: { x: 8, y: 2, w: 4, h: 4 }
    category: "category"
    value: "sales"
    format: "$0.0a"
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
    format: "$0.0a"
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

  # Row 4: Top Outlets & SKU Movement Table
  - id: store_performance_table
    title: "Top Outlets Performance & POS Velocity"
    subtitle: "Direct BigQuery push-down query results"
    type: table
    source: bq_seven_eleven
    position: { x: 0, y: 10, w: 12, h: 4 }
    table_columns:
      - key: "store_id"
        label: "Store ID"
      - key: "store_name"
        label: "Outlet Location"
      - key: "region"
        label: "Region"
      - key: "daily_sales"
        label: "Daily Sales"
        format: "$0,0"
        align: "right"
      - key: "avg_basket"
        label: "Avg Basket"
        format: "$0.00"
        align: "right"
      - key: "compliance"
        label: "Audit & Stock Status"
        badge: true
      - key: "pos_terminal_count"
        label: "POS Terminals"
        align: "center"
`;

export const SAMPLE_DASHBOARDS: Record<string, { name: string; yaml: string }> = {
  'seven-eleven-bq': {
    name: '🏪 7-Eleven BigQuery (seven-eleven-qlik-bq)',
    yaml: SEVEN_ELEVEN_QLIK_BQ_YAML,
  },
};
