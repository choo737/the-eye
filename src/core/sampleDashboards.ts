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
  # Row 1: KPI Metrics (Configurable Titles, Targets, and Formats)
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

  # Row 2: Configurable Time Series & Category Breakdown
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

export const SAAS_EXECUTIVE_DASHBOARD_YAML = `version: "1.0"
id: "saas-executive-growth"
title: "The Eye — Executive SaaS & Revenue Overview"
description: "Global enterprise metrics, recurring revenue, net retention, and acquisition funnel"
theme: "modern-dark"
refresh_interval: "1m"

data_sources:
  - id: revenue_lakehouse
    name: "Snowflake & Databricks Lakehouse"
    type: snowflake
    warehouse: "ANALYTICS_WH"
    database: "PROD_FINANCE"

filters:
  - id: region
    label: "Geographic Region"
    type: multi_select
    default: ["All Regions"]
    options:
      - label: "All Regions"
        value: "All Regions"
      - label: "North America"
        value: "North America"
      - label: "EMEA"
        value: "EMEA"
      - label: "APAC"
        value: "APAC"
      - label: "LATAM"
        value: "LATAM"

layout:
  columns: 12

widgets:
  - id: kpi_arr
    title: "Annual Recurring Revenue (ARR)"
    type: kpi_card
    source: revenue_lakehouse
    position: { x: 0, y: 0, w: 3, h: 2 }
    value: "arr"
    target: "$52.0M"
    format: "$0.00a"
    comparison_label: "+18.4% YoY"
    sparkline: true

  - id: kpi_nrr
    title: "Net Revenue Retention (NRR)"
    type: kpi_card
    source: revenue_lakehouse
    position: { x: 3, y: 0, w: 3, h: 2 }
    value: "nrr"
    target: "120%"
    format: "0.0%"
    comparison_label: "+3.2% vs target"
    sparkline: true

  - id: kpi_cac_payback
    title: "CAC Payback Period"
    type: kpi_card
    source: revenue_lakehouse
    position: { x: 6, y: 0, w: 3, h: 2 }
    value: "cac_months"
    format: "0.0 mos"
    comparison_label: "-2.1 mos QoQ"
    sparkline: true

  - id: kpi_active_accounts
    title: "Enterprise Logos"
    type: kpi_card
    source: revenue_lakehouse
    position: { x: 9, y: 0, w: 3, h: 2 }
    value: "active_logos"
    format: "0,0"
    comparison_label: "+142 new logos"
    sparkline: true

  - id: arr_trend_chart
    title: "ARR Growth Trajectory & Forecast"
    subtitle: "Showing {{active_grain}} trajectory for {{time_range}}"
    type: area_chart
    source: revenue_lakehouse
    position: { x: 0, y: 2, w: 8, h: 4 }
    x: "date"
    y: ["Actual ARR", "Target"]
    format: "$0.0a"
    smooth: true

  - id: tier_donut
    title: "Revenue by Customer Tier"
    subtitle: "Enterprise vs Mid-Market vs SMB"
    type: donut_chart
    source: revenue_lakehouse
    position: { x: 8, y: 2, w: 4, h: 4 }
    category: "tier"
    value: "revenue"
    format: "$0.0a"

  - id: regional_bar
    title: "ARR Contribution by Region"
    subtitle: "Stacked by New vs Expansion ARR"
    type: stacked_bar
    source: revenue_lakehouse
    position: { x: 0, y: 6, w: 6, h: 4 }
    x: "region"
    y: ["New ARR", "Expansion ARR"]
    format: "$0.0a"

  - id: acquisition_funnel
    title: "Sales Pipeline Conversion Funnel"
    subtitle: "MQL -> SQL -> Demo -> Proposal -> Closed Won"
    type: funnel
    source: revenue_lakehouse
    position: { x: 6, y: 6, w: 6, h: 4 }
    category: "stage"
    value: "count"
    format: "0,0"

  - id: top_accounts_table
    title: "Key Enterprise Accounts & Health Score"
    type: table
    source: revenue_lakehouse
    position: { x: 0, y: 10, w: 12, h: 4 }
    table_columns:
      - key: "account_name"
        label: "Account Name"
      - key: "region"
        label: "Region"
      - key: "tier"
        label: "Tier"
        badge: true
      - key: "arr"
        label: "Current ARR"
        format: "$0,0"
        align: "right"
      - key: "nrr"
        label: "NRR"
        format: "0.0%"
        align: "right"
      - key: "health_score"
        label: "Health Status"
        badge: true
      - key: "renewal_date"
        label: "Renewal Date"
        align: "center"
`;

export const SAMPLE_DASHBOARDS: Record<string, { name: string; yaml: string }> = {
  'seven-eleven-bq': {
    name: '🏪 7-Eleven BigQuery (seven-eleven-qlik-bq)',
    yaml: SEVEN_ELEVEN_QLIK_BQ_YAML,
  },
  'saas-executive': {
    name: '📈 Executive SaaS & Revenue Overview',
    yaml: SAAS_EXECUTIVE_DASHBOARD_YAML,
  },
};
