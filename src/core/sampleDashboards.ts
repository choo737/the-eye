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
  
  - id: targets_sheet
    name: "Q3 Board Targets (Google Sheet)"
    type: google_sheet
    sheet_id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
    range: "Targets!A1:F50"

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

  - id: customer_tier
    label: "Subscription Tier"
    type: single_select
    default: "All Tiers"
    options:
      - label: "All Tiers"
        value: "All Tiers"
      - label: "Enterprise"
        value: "Enterprise"
      - label: "Mid-Market"
        value: "Mid-Market"
      - label: "Startup / Pro"
        value: "Startup / Pro"

  - id: time_range
    label: "Time Horizon"
    type: daterange
    default: "2026-YTD"

layout:
  columns: 12
  row_height: 100

widgets:
  # Row 1: KPI Metrics
  - id: kpi_arr
    title: "Annual Recurring Revenue (ARR)"
    type: kpi_card
    source: revenue_lakehouse
    position: { x: 0, y: 0, w: 3, h: 2 }
    value: "arr"
    target: "arr_target"
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

  # Row 2: Charts
  - id: arr_trend_chart
    title: "ARR Growth Trajectory & Forecast"
    subtitle: "Actuals vs Target vs Pipeline Forecast"
    type: area_chart
    source: revenue_lakehouse
    position: { x: 0, y: 2, w: 8, h: 4 }
    x: "month"
    y: ["Actual ARR", "Forecast ARR", "Target"]
    format: "$0.0a"
    smooth: true
    interaction:
      on_click_filter:
        filter_id: "region"
        field: "region"

  - id: tier_donut
    title: "Revenue by Customer Tier"
    subtitle: "Enterprise vs Mid-Market vs SMB"
    type: donut_chart
    source: revenue_lakehouse
    position: { x: 8, y: 2, w: 4, h: 4 }
    category: "tier"
    value: "revenue"
    format: "$0.0a"

  # Row 3: Regional Breakdown & Conversion Funnel
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

  # Row 4: Account Performance Table
  - id: top_accounts_table
    title: "Key Enterprise Accounts & Health Score"
    subtitle: "Real-time usage, health telemetry, and contract renewal status"
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

export const ECOMMERCE_DASHBOARD_YAML = `version: "1.0"
id: "ecommerce-omnichannel"
title: "The Eye — Omnichannel Retail & E-Commerce"
description: "Cross-channel revenue, conversion rates, order velocity, and inventory dynamics"
theme: "emerald-slate"
refresh_interval: "30s"

data_sources:
  - id: bq_store
    name: "BigQuery Commerce Production"
    type: bigquery
    project: "retail-analytics-2026"
    dataset: "omnichannel"

filters:
  - id: channel
    label: "Sales Channel"
    type: multi_select
    default: ["All Channels"]
    options:
      - label: "All Channels"
        value: "All Channels"
      - label: "Direct Web Store"
        value: "Direct Web Store"
      - label: "Amazon Marketplace"
        value: "Amazon Marketplace"
      - label: "TikTok Shop"
        value: "TikTok Shop"
      - label: "Physical Flagship Stores"
        value: "Physical Flagship Stores"

  - id: category
    label: "Product Category"
    type: single_select
    default: "All Categories"
    options:
      - label: "All Categories"
        value: "All Categories"
      - label: "Consumer Electronics"
        value: "Consumer Electronics"
      - label: "Apparel & Footwear"
        value: "Apparel & Footwear"
      - label: "Home & Lifestyle"
        value: "Home & Lifestyle"

layout:
  columns: 12

widgets:
  - id: kpi_gmv
    title: "Gross Merchandise Value (GMV)"
    type: kpi_card
    source: bq_store
    position: { x: 0, y: 0, w: 3, h: 2 }
    value: "gmv"
    format: "$0.00a"
    comparison_label: "+24.8% vs last week"
    sparkline: true

  - id: kpi_orders
    title: "Total Orders Completed"
    type: kpi_card
    source: bq_store
    position: { x: 3, y: 0, w: 3, h: 2 }
    value: "orders"
    format: "0,0"
    comparison_label: "+12.1% order volume"
    sparkline: true

  - id: kpi_aov
    title: "Average Order Value (AOV)"
    type: kpi_card
    source: bq_store
    position: { x: 6, y: 0, w: 3, h: 2 }
    value: "aov"
    format: "$0.00"
    comparison_label: "+$8.50 optimization"
    sparkline: true

  - id: kpi_conversion
    title: "Checkout Conversion Rate"
    type: kpi_card
    source: bq_store
    position: { x: 9, y: 0, w: 3, h: 2 }
    value: "cvr"
    format: "0.00%"
    comparison_label: "+0.45% uplift"
    sparkline: true

  - id: hourly_sales_trend
    title: "Intraday Sales Velocity (Orders & Revenue)"
    subtitle: "Real-time stream across all channels"
    type: line_chart
    source: bq_store
    position: { x: 0, y: 2, w: 8, h: 4 }
    x: "hour"
    y: ["Online Revenue", "In-Store Revenue"]
    format: "$0.0a"
    smooth: true

  - id: channel_share_pie
    title: "Revenue Share by Channel"
    subtitle: "Direct vs Marketplace vs Social Commerce"
    type: pie_chart
    source: bq_store
    position: { x: 8, y: 2, w: 4, h: 4 }
    category: "channel"
    value: "revenue"
    format: "$0.0a"

  - id: category_performance_bar
    title: "Top Product Categories GMV & Margin"
    type: bar_chart
    source: bq_store
    position: { x: 0, y: 6, w: 7, h: 4 }
    x: "category"
    y: ["GMV", "Gross Profit"]
    format: "$0.0a"

  - id: inventory_radar
    title: "Supply Chain & Fulfillment Health"
    subtitle: "Fulfillment speed, stock levels, return rates"
    type: radar
    source: bq_store
    position: { x: 7, y: 6, w: 5, h: 4 }

  - id: top_products_table
    title: "High Velocity Products & Stock Alerts"
    type: table
    source: bq_store
    position: { x: 0, y: 10, w: 12, h: 4 }
    table_columns:
      - key: "product_name"
        label: "Product Name"
      - key: "sku"
        label: "SKU"
      - key: "units_sold"
        label: "Units Sold"
        format: "0,0"
        align: "right"
      - key: "revenue"
        label: "Revenue"
        format: "$0,0"
        align: "right"
      - key: "stock_status"
        label: "Inventory Status"
        badge: true
      - key: "margin"
        label: "Margin"
        format: "0.0%"
        align: "right"
`;

export const SAMPLE_DASHBOARDS: Record<string, { name: string; yaml: string }> = {
  'saas-executive': {
    name: 'Executive SaaS & Revenue Overview',
    yaml: SAAS_EXECUTIVE_DASHBOARD_YAML,
  },
  'ecommerce-retail': {
    name: 'Omnichannel Retail & E-Commerce',
    yaml: ECOMMERCE_DASHBOARD_YAML,
  },
};
