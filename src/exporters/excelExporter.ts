import * as XLSX from 'xlsx';
import { DashboardSpec } from '../core/types';
import { executeWidgetQuery } from '../engine/queryEngine';

export function exportDashboardToExcel(spec: DashboardSpec, activeFilters: Record<string, any> = {}) {
  const wb = XLSX.utils.book_new();

  // Tab 1: KPI Overview
  const kpis = spec.widgets.filter(w => w.type === 'kpi_card');
  const kpiData = kpis.map(w => {
    const q = executeWidgetQuery(w, activeFilters);
    return {
      'Metric Name': w.title,
      'Value': q?.value ?? '',
      'Target': q?.target ?? '',
      'Comparison Delta': w.comparison_label ?? ''
    };
  });
  const kpiSheet = XLSX.utils.json_to_sheet(kpiData);
  XLSX.utils.book_append_sheet(wb, kpiSheet, 'Executive KPIs');

  // Tab 2: Tables & Detailed Rows
  const tableWidgets = spec.widgets.filter(w => w.type === 'table');
  tableWidgets.forEach((tw, idx) => {
    const q = executeWidgetQuery(tw, activeFilters);
    if (q?.rows && Array.isArray(q.rows)) {
      const sheet = XLSX.utils.json_to_sheet(q.rows);
      const sheetName = tw.title.slice(0, 28) || `Table ${idx + 1}`;
      XLSX.utils.book_append_sheet(wb, sheet, sheetName);
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

  if (chartDataRows.length > 0) {
    const chartSheet = XLSX.utils.json_to_sheet(chartDataRows);
    XLSX.utils.book_append_sheet(wb, chartSheet, 'Visualizations Data');
  }

  const fileName = `${spec.id || 'the-eye-dashboard'}_workbook.xlsx`;
  XLSX.writeFile(wb, fileName);
  return fileName;
}
