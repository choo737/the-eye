# 👁️ The Eye — Declarative Code-First BI & Data Visualization Platform

**The Eye** is an LLM-native, code-first Business Intelligence and Data Visualization platform. It replaces traditional opaque drag-and-drop BI tools (Power BI, Looker Studio, Tableau) with a **declarative YAML/JSON specification ("Dashboard as Code")** that can be created, version-controlled, maintained, and auto-repaired by LLM agents.

---

## 🚀 Key Highlights

1. **Dashboard as Code (DaC)**:
   - Full dashboard state (data queries, metrics, chart types, filters, responsive grid layout) configured entirely in declarative `dashboard.yaml`.
   - Native GitOps, PR reviews, CI/CD automated linting, and LLM patch maintenance.

2. **Universal Data Connectors**:
   - **Cloud Warehouses**: Google BigQuery, Snowflake, Databricks Lakehouse.
   - **RDBMS**: PostgreSQL, MySQL, Microsoft SQL Server (MSSQL).
   - **Spreadsheets & Files**: Google Sheets (live range sync), Microsoft Excel (`.xlsx`), CSV, Parquet, REST APIs.
   - **Fast In-Memory OLAP**: Client-side DuckDB-WASM engine for high-speed SQL execution.

3. **Enterprise Visualization Engine**:
   - Powered by **Apache ECharts** (KPI scorecards with sparklines, line charts, stacked bar charts, area charts, donut/pie, funnel, radar, treemap, heatmap, interactive tables).
   - **Interactive Cross-Filtering**: Clicking any chart slice immediately filters dependent widgets across the canvas.

4. **Microsoft 365 & Google Workspace Integrations**:
   - **Microsoft PowerPoint**: One-click generation of native `.pptx` presentation slide decks.
   - **Microsoft Excel**: Multi-tab formatted `.xlsx` workbooks with formulas and KPI summaries.
   - **Google Workspace**: Live Google Sheets connector + Google Docs / Slides markdown executive briefings.

5. **AI Copilot & Studio IDE**:
   - Split-screen visual development environment with Monaco YAML editor on the left and live responsive canvas on the right.
   - Conversational LLM Copilot that accepts natural language instructions, generates schema diffs, and self-heals validation errors.

---

## 🛠️ Quick Start

```bash
# Clone the repository
git clone https://github.com/choo737/the-eye.git
cd the-eye

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open `http://localhost:5173` to explore **The Eye Studio**.

---

## 📄 Example `dashboard.yaml` Spec

```yaml
version: "1.0"
id: "saas-executive-growth"
title: "Executive SaaS & Revenue Overview"
theme: "modern-dark"

data_sources:
  - id: revenue_lakehouse
    type: snowflake
    warehouse: "ANALYTICS_WH"
    database: "PROD_FINANCE"

filters:
  - id: region
    label: "Geographic Region"
    type: multi_select
    default: ["All Regions"]

layout:
  columns: 12

widgets:
  - id: kpi_arr
    title: "Annual Recurring Revenue (ARR)"
    type: kpi_card
    source: revenue_lakehouse
    position: { w: 3, h: 2 }
    value: "arr"
    format: "$0.00a"
    comparison_label: "+18.4% YoY"
    sparkline: true

  - id: arr_trend_chart
    title: "ARR Growth Trajectory & Forecast"
    type: area_chart
    source: revenue_lakehouse
    position: { w: 8, h: 4 }
    x: "month"
    y: ["Actual ARR", "Forecast ARR", "Target"]
    format: "$0.0a"
    smooth: true
```

---

## 📜 License

Apache 2.0 License © 2026 Jacky Choo
