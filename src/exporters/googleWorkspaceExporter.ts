import { DashboardSpec } from '../core/types';
import { executeWidgetQuery } from '../engine/queryEngine';

export function generateGoogleWorkspaceReport(spec: DashboardSpec, activeFilters: Record<string, any> = {}) {
  // Generates Markdown & structured payload for Google Docs / Google Slides / Google Sheets
  let md = `# 📊 ${spec.title}\n\n`;
  md += `> **Subtitle:** ${spec.description || 'Enterprise Declarative BI'}\n`;
  md += `> **Generated on:** ${new Date().toISOString()}\n\n`;
  
  md += `## 🎯 Executive Summary & KPIs\n\n`;
  md += `| KPI Metric | Current Value | Target | Variance |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;

  const kpis = spec.widgets.filter(w => w.type === 'kpi_card');
  kpis.forEach(w => {
    const q = executeWidgetQuery(w, activeFilters);
    md += `| **${w.title}** | \`${q?.value ?? '-'}\` | \`${q?.target ?? '-'}\` | ${w.comparison_label || '-'} |\n`;
  });

  md += `\n## 📈 Core Visualizations & Analytics\n\n`;
  const charts = spec.widgets.filter(w => w.type !== 'kpi_card' && w.type !== 'table');
  charts.forEach(c => {
    md += `### ${c.title}\n`;
    if (c.subtitle) md += `*${c.subtitle}*\n\n`;
    md += `- **Type:** \`${c.type}\`\n`;
    md += `- **Data Source:** \`${c.source}\`\n\n`;
  });

  return md;
}
