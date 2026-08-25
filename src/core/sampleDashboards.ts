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
    table: "fct_pos_transactions"
    query: |
      SELECT 
        transaction_date,
        store_id,
        store_name,
        region_cluster,
        product_division,
        category,
        gross_revenue_myr,
        basket_items_count,
        transaction_id
      FROM \`the-eye-bi-platform.retail_analytics.fct_pos_transactions\`
      WHERE transaction_date BETWEEN @start_date AND @end_date
    options:
      auth_mode: "google_oauth_adc_delegated"
      location: "asia-southeast1"

  - id: gsheet_store_targets
    name: "Store Budget & Manager Quotas (Google Sheet)"
    type: google_sheet
    sheet_id: "1kxhTv9TKA1RJSJcV017xVq4jADPSZxx8bSuSWxgGii4"
    table: "Targets"
    range: "Targets!A1:E20"
    query: "SELECT store_id, store_manager, q3_budget_target FROM [Targets!A1:E20]"

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
    default: "ytd"

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
    title: "Regional Store Performance vs Budget Target"
    subtitle: "Actual POS Revenue vs Target across Regional Store Operating Clusters"
    type: bar_chart
    source: bq_seven_eleven
    position: { x: 0, y: 6, w: 7, h: 4 }
    x: "region"
    y: ["Actual Revenue", "Target Revenue"]
    format: "RM 0.0a"
    interaction:
      on_click_filter:
        filter_id: "store_region"
        field: "region"

  - id: 7eleven_radar
    title: "Store Operations & Supply Chain Health"
    subtitle: "Operational metrics and store audit scores"
    type: radar
    source: bq_seven_eleven
    position: { x: 7, y: 6, w: 5, h: 4 }

  # Row 4: Interactive Google Maps Geospatial Intelligence & Store Dive-in Sub-Widgets
  - id: outlet_geo_map
    title: "Store Outlets Revenue Target Attainment (Google Maps × Google Sheets)"
    subtitle: "All outlet locations plotted on Google Maps with configurable table view and store drilldown sub-widgets"
    type: google_map
    source: bq_gsheet_store_mesh
    position: { x: 0, y: 10, w: 12, h: 6 }
    map_config:
      center: { lat: 3.1390, lng: 101.6869 }
      zoom: 6
      style: "google_streets"
      show_table: true   # Set to false to hide table form below the map
      metric_field: "target_achievement_pct"
      color_scale:
        min: 80
        max: 110
        min_color: "#ef4444"   # Red (At Risk <90%)
        mid_color: "#eab308"   # Amber (Warning 90-99%)
        max_color: "#22c55e"   # Green (On Track >=100%)
    drilldown:
      enabled: true
      title: "Store Performance Drill-Down: {{store_name}} ({{store_id}})"
      subtitle: "Intraday transaction velocity, product category mix, and budget attainment for {{store_id}}"
      sub_widgets:
        - id: store_transaction_velocity
          title: "POS Transaction Velocity & Customer Traffic"
          type: line_chart
          x: "time_grain"
          y: ["POS Sales (RM)", "POS Transactions"]
          dual_axis: true
        - id: store_category_donut
          title: "Product Division Share"
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

export const CIMB_BANK_BQ_YAML = `version: "1.0"
id: "cimb-bank-branch-intelligence"
title: "CIMB Bank Malaysia — Omnichannel Branch & Wealth Intelligence (the-eye-bi-platform)"
description: "Live BigQuery analytics for CIMB Malaysia branch banking, CASA deposits, mortgage disbursements, and OTC transaction velocity"
theme: "corporate-navy"
refresh_interval: "30s"

cache:
  enabled: true
  ttl: "15m"
  strategy: "stale_while_revalidate"

data_sources:
  - id: bq_cimb_bank
    name: "CIMB Bank BigQuery Live (the-eye-bi-platform)"
    type: bigquery
    project: "the-eye-bi-platform"
    dataset: "cimb_bank_warehouse"
    table: "fct_branch_transactions"
    query: |
      SELECT 
        transaction_date,
        transaction_hour,
        branch_code,
        branch_name,
        region,
        state,
        latitude,
        longitude,
        banking_product,
        transaction_channel,
        transaction_volume_myr,
        fee_income_myr,
        customer_queue_time_min,
        customer_nps
      FROM \`the-eye-bi-platform.cimb_bank_warehouse.fct_branch_transactions\`
      WHERE transaction_date BETWEEN @start_date AND @end_date
    options:
      auth_mode: "google_oauth_adc_delegated"
      location: "asia-southeast1"

filters:
  - id: region
    label: "Branch Banking Region"
    type: multi_select
    column: "region"
    default: ["All Regions"]
    options:
      - label: "All Regions (National Network)"
        value: "All Regions"
      - label: "Central Region (KL & Selangor)"
        value: "Central Region"
      - label: "Northern Region (Penang & Perak)"
        value: "Northern Region"
      - label: "Southern Region (Johor & Melaka)"
        value: "Southern Region"
      - label: "East Coast (Pahang & Terengganu)"
        value: "East Coast"
      - label: "East Malaysia (Sarawak & Sabah)"
        value: "East Malaysia"

  - id: banking_product
    label: "Banking Portfolio Division"
    type: single_select
    column: "banking_product"
    default: "All Products"
    options:
      - label: "All Products (Total Balance Sheet)"
        value: "All Products"
      - label: "Consumer CASA Deposits"
        value: "Consumer CASA Deposits"
      - label: "Mortgages & Home Loans"
        value: "Mortgages & Home Loans"
      - label: "SME & Commercial Loans"
        value: "SME & Commercial Loans"
      - label: "Wealth & Unit Trusts"
        value: "Wealth & Unit Trusts"
      - label: "Auto Financing & Hire Purchase"
        value: "Auto Financing & Hire Purchase"

  - id: time_range
    label: "Fiscal Reporting Horizon"
    type: daterange
    default: "ytd"
    max_backdate: "12m"

layout:
  columns: 12
  row_height: 100

widgets:
  # Row 1: Key Banking Executive Scorecards
  - id: kpi_total_volume
    title: "Total Banking Transaction Volume"
    type: kpi_card
    source: bq_cimb_bank
    position: { x: 0, y: 0, w: 3, h: 2 }
    value: "transaction_volume_myr"
    format: "RM 0.00a"
    comparison_label: "+18.6% vs Q3 target"
    sparkline: true

  - id: kpi_fee_income
    title: "Net Fee & Commission Income"
    type: kpi_card
    source: bq_cimb_bank
    position: { x: 3, y: 0, w: 3, h: 2 }
    value: "fee_income_myr"
    format: "RM 0.00a"
    comparison_label: "+RM 24.5M non-interest income"
    sparkline: true

  - id: kpi_active_branches
    title: "CIMB Full-Service Branches"
    type: kpi_card
    source: bq_cimb_bank
    position: { x: 6, y: 0, w: 3, h: 2 }
    value: "branch_code"
    format: "0,0"
    comparison_label: "100% operational uptime"
    sparkline: true

  - id: kpi_customer_nps
    title: "Branch Experience & NPS Score"
    type: kpi_card
    source: bq_cimb_bank
    position: { x: 9, y: 0, w: 3, h: 2 }
    value: "customer_nps"
    format: "0.0"
    comparison_label: "+4.2 pts branch satisfaction"
    sparkline: true

  # Row 2: Charts
  - id: cimb_velocity_chart
    title: "Branch Transaction Velocity & OTC Volume"
    subtitle: "Showing {{active_grain}} stream for {{banking_product}} ({{time_range}})"
    type: line_chart
    source: bq_cimb_bank
    position: { x: 0, y: 2, w: 8, h: 4 }
    dimension: "transaction_date"
    measures: ["transaction_volume_myr", "fee_income_myr"]
    labels:
      transaction_volume_myr: "Gross Banking Volume (RM)"
      fee_income_myr: "Net Non-Interest Fee Income (RM)"
    dual_axis: true

  - id: cimb_product_mix
    title: "Banking Product Portfolio Mix"
    subtitle: "Asset & Deposit Distribution across {{region}}"
    type: donut_chart
    source: bq_cimb_bank
    position: { x: 8, y: 2, w: 4, h: 4 }
    dimension: "banking_product"
    measures: ["transaction_volume_myr"]

  # Row 3: Regional Performance vs Budget Target
  - id: cimb_regional_bar
    title: "Regional Branch Asset Growth vs Target Allocation"
    subtitle: "Actual Volume vs Target for {{region}}"
    type: bar_chart
    source: bq_cimb_bank
    position: { x: 0, y: 6, w: 12, h: 4 }
    dimension: "region"
    measures: ["transaction_volume_myr", "deposit_target_myr"]
    labels:
      transaction_volume_myr: "Actual Branch Volume (RM)"
      deposit_target_myr: "Fiscal Target Allocation (RM)" 

  # Row 4: Interactive Branch Network GIS Map
  - id: cimb_branch_network_map
    title: "CIMB Malaysia Commercial Branch Network & Deep-Dive"
    subtitle: "Geospatial telemetry, ATM hubs, and manager performance for {{region}}"
    type: google_map
    source: bq_cimb_bank
    position: { x: 0, y: 10, w: 12, h: 6 }
    latitude_col: "latitude"
    longitude_col: "longitude"
    name_col: "branch_name"
    value_col: "transaction_volume_myr"
    map_config:
      default_center: [4.2105, 101.9758]
      default_zoom: 6
      marker_style: "status_color"
      show_table: true
    drilldown:
      enabled: true
      target_dimension: "branch_name"
      sub_widgets:
        - id: branch_growth_stream
          title: "Branch Transaction Velocity & OTC Footfall"
          subtitle: "Showing {{active_grain}} volume stream for selected branch"
          type: line_chart
          position: { x: 0, y: 0, w: 6, h: 3 }
        - id: branch_product_mix
          title: "Branch Banking Product Distribution"
          subtitle: "Portfolio breakdown for selected branch"
          type: donut_chart
          position: { x: 6, y: 0, w: 6, h: 3 }
`;

export const SAAS_GROWTH_BQ_YAML = `version: "1.0"
id: "saas-subscription-growth-intelligence"
title: "Cloud SaaS Platform — Subscription Growth & NRR Intelligence"
description: "Live BigQuery warehouse for SaaS multi-tenant telemetry, MRR expansion, plan tiers, and retention risk"
theme: "modern-dark"
currency:
  symbol: "$"
  code: "USD"
  position: "prefix"
  space: false
layout:
  columns: 12
  gap: 16

data_sources:
  - id: "bq_saas"
    type: "bigquery"
    project_id: "the-eye-bi-platform"
    dataset: "saas_analytics"
    table: "fct_subscription_events"
    location: "asia-southeast1"

filters:
  - id: "time_range"
    label: "Billing Period"
    type: "daterange"
    default_value: "ytd"
    options:
      - label: "Today"
        value: "today"
      - label: "Last 30 Days"
        value: "30d"
      - label: "Year to Date (YTD)"
        value: "ytd"

  - id: "plan_tier"
    label: "Subscription Tier"
    type: "single_select"
    default_value: "all"
    options:
      - label: "All Tiers"
        value: "all"
      - label: "Enterprise Plus"
        value: "Enterprise Plus"
      - label: "Scale Team"
        value: "Scale Team"
      - label: "Growth Pro"
        value: "Growth Pro"

widgets:
  - id: saas_kpi_mrr
    title: "Monthly Recurring Revenue (MRR)"
    type: kpi_card
    source: bq_saas
    position: { x: 0, y: 0, w: 3, h: 2 }
    value: "mrr_usd"
    format: "$0.0a"
    comparison_label: "+18.4% YoY"

  - id: saas_kpi_arr
    title: "Annualized Run Rate (ARR)"
    type: kpi_card
    source: bq_saas
    position: { x: 3, y: 0, w: 3, h: 2 }
    value: "arr_usd"
    format: "$0.0a"
    comparison_label: "+24.2% Net Expansion"

  - id: saas_kpi_customers
    title: "Active Enterprise Accounts"
    type: kpi_card
    source: bq_saas
    position: { x: 6, y: 0, w: 3, h: 2 }
    value: "customer_id"
    format: "0,0"
    comparison_label: "Zero Net Churn"

  - id: saas_kpi_churn
    title: "Average Churn Risk Index"
    type: kpi_card
    source: bq_saas
    position: { x: 9, y: 0, w: 3, h: 2 }
    value: "churn_risk_pct"
    format: "0.0%"
    comparison_label: "-1.8% vs last quarter"

  - id: saas_treemap_plans
    title: "Subscription Tier MRR Contribution"
    type: treemap
    source: bq_saas
    position: { x: 0, y: 2, w: 6, h: 4 }
    dimension: "plan_tier"
    measures: ["mrr_usd"]
    format: "$0.0a"

  - id: saas_scatter_ltv
    title: "Account MRR vs API Telemetry Consumption"
    type: scatter_chart
    source: bq_saas
    position: { x: 6, y: 2, w: 6, h: 4 }
    dimension: "company_name"
    measures: ["mrr_usd", "usage_api_calls"]
    format: "$0.0a"

  - id: saas_table_accounts
    title: "Enterprise Customer Health & License Directory"
    type: table
    source: bq_saas
    position: { x: 0, y: 6, w: 12, h: 4 }
    table_columns:
      - key: "customer_id"
        label: "Account ID"
      - key: "company_name"
        label: "Enterprise Customer"
      - key: "plan_tier"
        label: "Subscription Plan"
      - key: "mrr_usd"
        label: "Monthly MRR ($)"
        format: "$0,0"
        align: "right"
      - key: "usage_api_calls"
        label: "API Calls / Mo"
        format: "0,0"
        align: "right"
      - key: "status"
        label: "Account Status"
        badge: true
`;

export const HEALTHCARE_OPERATIONS_BQ_YAML = `version: "1.0"
id: "healthcare-hospital-clinical-operations"
title: "National Hospital Network — Clinical Census & Bed Occupancy"
description: "Live BigQuery analytics for hospital census, emergency department triage wait times, and clinical quality ratings"
theme: "corporate-navy"
currency:
  symbol: "RM"
  code: "MYR"
  position: "prefix"
  space: true
layout:
  columns: 12
  gap: 16

data_sources:
  - id: "bq_health"
    type: "bigquery"
    project_id: "the-eye-bi-platform"
    dataset: "healthcare_operations"
    table: "fct_hospital_census"
    location: "asia-southeast1"

filters:
  - id: "time_range"
    label: "Reporting Period"
    type: "daterange"
    default_value: "today"
    options:
      - label: "Today (Live Shift)"
        value: "today"
      - label: "Last 7 Days"
        value: "7d"
      - label: "Year to Date (YTD)"
        value: "ytd"

widgets:
  - id: health_kpi_inpatients
    title: "Total Inpatients Admitted"
    type: kpi_card
    source: bq_health
    position: { x: 0, y: 0, w: 3, h: 2 }
    value: "active_inpatients"
    format: "0,0"
    comparison_label: "+4.2% vs yesterday"

  - id: health_kpi_beds
    title: "Total Operational Beds"
    type: kpi_card
    source: bq_health
    position: { x: 3, y: 0, w: 3, h: 2 }
    value: "total_bed_capacity"
    format: "0,0"
    comparison_label: "1,430 Network Total"

  - id: health_kpi_occupancy
    title: "Network Bed Occupancy Rate"
    type: kpi_card
    source: bq_health
    position: { x: 6, y: 0, w: 3, h: 2 }
    value: "occupancy_rate_pct"
    format: "0.0%"
    comparison_label: "Target 85.0%"

  - id: health_kpi_ed_wait
    title: "Emergency Triage Wait Time"
    type: kpi_card
    source: bq_health
    position: { x: 9, y: 0, w: 3, h: 2 }
    value: "emergency_wait_time_min"
    format: "0,0"
    comparison_label: "Minutes (Under SLA)"

  - id: health_gauge_occupancy
    title: "Clinical Bed Utilization Gauge"
    type: gauge
    source: bq_health
    position: { x: 0, y: 2, w: 4, h: 4 }
    value: "occupancy_rate_pct"
    format: "0.0%"

  - id: health_dept_bar
    title: "Inpatient Volume by Clinical Department"
    type: bar_chart
    source: bq_health
    position: { x: 4, y: 2, w: 8, h: 4 }
    dimension: "clinical_department"
    measures: ["active_inpatients", "total_bed_capacity"]
    labels:
      active_inpatients: "Occupied Beds"
      total_bed_capacity: "Department Capacity"

  - id: health_gis_network
    title: "National Tertiary Hospital Network GIS"
    type: google_map
    source: bq_health
    position: { x: 0, y: 6, w: 12, h: 6 }
    latitude_col: "latitude"
    longitude_col: "longitude"
    name_col: "hospital_name"
    value_col: "active_inpatients"
    labels:
      id: "Hospital Code"
      name: "Medical Centre"
      region: "State / City"
      volume: "Active Inpatients"
      nps: "Quality Score"
      manager: "Lead Medical Director"
`;

export const SUPPLY_CHAIN_LOGISTICS_BQ_YAML = `version: "1.0"
id: "supply-chain-logistics-fleet-telemetry"
title: "Asia-Pacific Logistics & Freight Fleet Telemetry"
description: "Live BigQuery analytics for freight terminals, on-time delivery SLA compliance, transit velocity, and fuel costs"
theme: "emerald-slate"
currency:
  symbol: "RM"
  code: "MYR"
  position: "prefix"
  space: true
layout:
  columns: 12
  gap: 16

data_sources:
  - id: "bq_supply"
    type: "bigquery"
    project_id: "the-eye-bi-platform"
    dataset: "supply_chain_logistics"
    table: "fct_fleet_shipments"
    location: "asia-southeast1"

filters:
  - id: "time_range"
    label: "Shipment Window"
    type: "daterange"
    default_value: "30d"
    options:
      - label: "Today (Live Dispatch)"
        value: "today"
      - label: "Last 30 Days"
        value: "30d"
      - label: "Year to Date (YTD)"
        value: "ytd"

widgets:
  - id: supply_kpi_volume
    title: "Daily Freight Shipments"
    type: kpi_card
    source: bq_supply
    position: { x: 0, y: 0, w: 3, h: 2 }
    value: "daily_shipment_volume"
    format: "0,0"
    comparison_label: "+11.2% Month-over-Month"

  - id: supply_kpi_otd
    title: "On-Time Delivery SLA Rate"
    type: kpi_card
    source: bq_supply
    position: { x: 3, y: 0, w: 3, h: 2 }
    value: "on_time_delivery_pct"
    format: "0.0%"
    comparison_label: "SLA Benchmark 95.0%"

  - id: supply_kpi_transit
    title: "Average Transit Duration"
    type: kpi_card
    source: bq_supply
    position: { x: 6, y: 0, w: 3, h: 2 }
    value: "transit_hours_avg"
    format: "0.0"
    comparison_label: "Hours per Consignment"

  - id: supply_kpi_fuel
    title: "Fleet Fuel & Operating Cost"
    type: kpi_card
    source: bq_supply
    position: { x: 9, y: 0, w: 3, h: 2 }
    value: "fuel_cost_myr"
    format: "RM 0.0a"
    comparison_label: "-3.4% Optimization"

  - id: supply_radar_quality
    title: "Fleet Operations SLA Maturity Index"
    type: radar
    source: bq_supply
    position: { x: 0, y: 2, w: 6, h: 4 }
    radar_indicators:
      - { name: "On-Time Delivery", max: 100 }
      - { name: "Warehouse Utilization", max: 100 }
      - { name: "Transit Velocity", max: 100 }
      - { name: "Fuel Efficiency", max: 100 }
      - { name: "Cargo Safety & Audit", max: 100 }

  - id: supply_bar_transport
    title: "Shipment Volume by Multimodal Transport"
    type: bar_chart
    source: bq_supply
    position: { x: 6, y: 2, w: 6, h: 4 }
    dimension: "transport_mode"
    measures: ["daily_shipment_volume", "fuel_cost_myr"]
    labels:
      daily_shipment_volume: "Consignment Volume"
      fuel_cost_myr: "Fuel Spend (RM)"
    dual_axis: true

  - id: supply_gis_hubs
    title: "Regional Distribution Gateway & Container Hubs"
    type: google_map
    source: bq_supply
    position: { x: 0, y: 6, w: 12, h: 6 }
    latitude_col: "latitude"
    longitude_col: "longitude"
    name_col: "hub_name"
    value_col: "daily_shipment_volume"
    labels:
      id: "Hub Code"
      name: "Gateway Hub"
      region: "State"
      volume: "Daily Shipments"
      nps: "On-Time SLA %"
      manager: "Terminal Lead"
`;

