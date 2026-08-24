# 👁️ The Eye — Enterprise Architecture & Best Practice Standards

> **Core Axiom:** *The Eye is a Universal, Generic Declarative BI Engine (equivalent to Power BI, Tableau, and Looker Studio). Never hardcode domain logic, widget IDs, filter keys, regional names, holiday strings, or dataset schemas in code.*

---

## 🏛️ Rule 1: Zero Hardcoding Architecture (Universal BI Engine)

Like Microsoft Power BI, Tableau, or Looker Studio, **The Eye** is a generic visual and query runtime engine.

### Strict Coding Commandments:
1. **Never Branch on Widget IDs or Titles**:
   - ❌ `if (widget.id === 'kpi_sales')` or `if (widget.title.includes('POS'))`
   - ✅ Read `widget.type`, `widget.value`, `widget.format`, `widget.x`, `widget.y` generically.
2. **Never Hardcode Domain / Regional / Holiday Strings**:
   - ❌ Hardcoding `['Klang Valley', 'CNY', 'Raya', 'Black Friday']` in runtime code.
   - ✅ All category labels, dimensions, and time grains come strictly from the **SQL result set, filter definitions in YAML, or ISO standard calendar mathematics**.
3. **Template String Interpolation**:
   - Widget titles and subtitles support dynamic mustache templates:
     `title: "{{metric_name}} by {{dimension}}"`
     `subtitle: "Showing {{active_grain}} aggregation for {{time_range}}"`
4. **Dynamic Dual-Axis Scaling**:
   - When plotting mixed metrics (e.g. Sales in `$` vs Count/Percentage), the engine reads `widget.dual_axis: true` or automatically maps secondary measures to the right Y-axis.

---

## 🔐 Rule 2: Enterprise Authentication, SSO & RBAC

1. **Google OAuth 2.0 / SAML Single Sign-On (SSO)**:
   - Configurable via the **Admin Console**.
   - Supports **Hosted Domain (`hd`) restriction** to enforce that only employees from authorized corporate domains (`@jackychoo.altostrat.com`, `@google.com`, `@company.com`) can log in.
2. **Role-Based Access Control (RBAC)**:
   - **👑 Owner**: Administrative control over SSO, domain whitelists, user role assignment, and dashboard deletion.
   - **✏️ Editor**: Dashboard creation, YAML specification editing, SQL query authoring, and export privileges.
   - **👁️ Viewer**: Read-only consumption mode. Can interact with filters, drill-downs, and cross-filtering, but **cannot view or edit raw code or database secrets**.
3. **Per-Dashboard Access Control**:
   - Creating a dashboard designates the creator as the **Owner**.
   - Dashboard owners can grant granular `Editor` or `Viewer` permissions to specific colleagues by email.

---

## ⚡ Rule 3: BigQuery Push-Down Query Execution & IAM Authority

1. **Push-Down SQL Execution**:
   - Always push aggregations (`SUM`, `AVG`, `COUNT`), filtering (`WHERE`), and partitioning down to BigQuery / Snowflake.
2. **Delegated Identity Propagation**:
   - The user's OAuth access token is passed down to BigQuery so Google Cloud IAM Row-Level Security (RLS) and Column-Level Security (CLS) are enforced at the database level.

---

## 📦 Rule 4: Universal Interoperability & Export Standards

1. **Microsoft Office Suite**:
   - **PowerPoint (`.pptx`)**: Generates presentation decks with native editable shapes, titles, and data tables via `pptxgenjs`.
   - **Excel (`.xlsx`)**: Generates multi-tab workbooks with structured data schemas.
2. **Google Workspace**:
   - **Google Docs & Slides**: Markdown and document payloads structured for immediate cloud synchronization.
