import { DashboardSpec } from '../core/types';
import { executeWidgetQuery } from '../engine/queryEngine';

function escapeXml(unsafe: any): string {
  if (unsafe === undefined || unsafe === null) return '';
  const str = String(unsafe);
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function createWorksheetXml(name: string, rows: Record<string, any>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);

  let xml = `  <Worksheet ss:Name="${escapeXml(name)}">\n`;
  xml += `    <Table>\n`;

  // Header Row
  xml += `      <Row ss:StyleID="Header">\n`;
  headers.forEach(h => {
    xml += `        <Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>\n`;
  });
  xml += `      </Row>\n`;

  // Data Rows
  rows.forEach(r => {
    xml += `      <Row>\n`;
    headers.forEach(h => {
      const val = r[h];
      const isNum = typeof val === 'number';
      xml += `        <Cell><Data ss:Type="${isNum ? 'Number' : 'String'}">${escapeXml(val)}</Data></Cell>\n`;
    });
    xml += `      </Row>\n`;
  });

  xml += `    </Table>\n`;
  xml += `  </Worksheet>\n`;
  return xml;
}

export function exportDashboardToExcel(spec: DashboardSpec, activeFilters: Record<string, any> = {}) {
  // Tab 1: KPI Overview
  const kpis = spec.widgets.filter(w => w.type === 'kpi_card');
  const kpiRows = kpis.map(w => {
    const q = executeWidgetQuery(w, activeFilters);
    return {
      'Metric Name': w.title,
      'Value': q?.value ?? '',
      'Target': q?.target ?? '',
      'Comparison Delta': w.comparison_label ?? ''
    };
  });

  // Tab 2: Tables & Detailed Rows
  const tableRowsList: { name: string; rows: any[] }[] = [];
  const tableWidgets = spec.widgets.filter(w => w.type === 'table');
  tableWidgets.forEach((tw, idx) => {
    const q = executeWidgetQuery(tw, activeFilters);
    if (q?.rows && Array.isArray(q.rows)) {
      tableRowsList.push({
        name: tw.title.slice(0, 28) || `Table ${idx + 1}`,
        rows: q.rows
      });
    }
  });

  // Tab 3: Chart Series Data
  const chartWidgets = spec.widgets.filter(w => w.type !== 'kpi_card' && w.type !== 'table');
  const chartDataRows: any[] = [];
  chartWidgets.forEach(cw => {
    const q = executeWidgetQuery(cw, activeFilters);
    if (q?.categories && q?.series) {
      q.categories.forEach((cat: string, i: number) => {
        const row: any = { 'Chart': cw.title, 'Category / Time': cat };
        q.series.forEach((s: any) => {
          row[s.name] = s.data[i];
        });
        chartDataRows.push(row);
      });
    } else if (q?.data && Array.isArray(q.data)) {
      q.data.forEach((item: any) => {
        chartDataRows.push({ 'Chart': cw.title, ...item });
      });
    }
  });

  let xmlDoc = `<?xml version="1.0"?>\n`;
  xmlDoc += `<?mso-application progid="Excel.Sheet"?>\n`;
  xmlDoc += `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n`;
  xmlDoc += ` xmlns:o="urn:schemas-microsoft-com:office:office"\n`;
  xmlDoc += ` xmlns:x="urn:schemas-microsoft-com:office:excel"\n`;
  xmlDoc += ` xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"\n`;
  xmlDoc += ` xmlns:html="http://www.w3.org/TR/REC-html40">\n`;
  xmlDoc += `  <Styles>\n`;
  xmlDoc += `    <Style ss:ID="Header">\n`;
  xmlDoc += `      <Font ss:Bold="1" ss:Color="#FFFFFF" />\n`;
  xmlDoc += `      <Interior ss:Color="#0F172A" ss:Pattern="Solid" />\n`;
  xmlDoc += `    </Style>\n`;
  xmlDoc += `  </Styles>\n`;

  if (kpiRows.length > 0) xmlDoc += createWorksheetXml('Executive KPIs', kpiRows);
  tableRowsList.forEach(t => {
    if (t.rows.length > 0) xmlDoc += createWorksheetXml(t.name, t.rows);
  });
  if (chartDataRows.length > 0) xmlDoc += createWorksheetXml('Visualizations Data', chartDataRows);

  xmlDoc += `</Workbook>`;

  const blob = new Blob([xmlDoc], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const fileName = `${spec.id || 'the-eye-dashboard'}_workbook.xls`;
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return fileName;
}
