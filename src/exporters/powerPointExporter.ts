import pptxgen from 'pptxgenjs';
import { DashboardSpec } from '../core/types';
import { executeWidgetQuery } from '../engine/queryEngine';

export async function exportDashboardToPowerPoint(spec: DashboardSpec, activeFilters: Record<string, any> = {}) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = spec.title;
  pptx.author = 'The Eye Declarative BI';

  // Slide 1: Cover Slide
  const coverSlide = pptx.addSlide();
  coverSlide.background = { color: '0B132B' };
  
  coverSlide.addText(spec.title, {
    x: 1.0,
    y: 2.2,
    w: 8.0,
    h: 1.2,
    fontSize: 32,
    bold: true,
    color: '38BDF8',
    fontFace: 'Arial'
  });

  coverSlide.addText(spec.description || 'Generated automatically via The Eye Declarative BI Engine', {
    x: 1.0,
    y: 3.4,
    w: 8.0,
    h: 0.8,
    fontSize: 16,
    color: '94A3B8',
    fontFace: 'Arial'
  });

  coverSlide.addText(`Generated: ${new Date().toLocaleDateString()} | Code-First BI Platform`, {
    x: 1.0,
    y: 6.0,
    w: 8.0,
    h: 0.5,
    fontSize: 12,
    color: '64748B',
    fontFace: 'Arial'
  });

  // Slide 2: Executive Summary & KPIs
  const kpiSlide = pptx.addSlide();
  kpiSlide.background = { color: '0F172A' };
  
  kpiSlide.addText('Executive Key Performance Indicators', {
    x: 0.8,
    y: 0.6,
    w: 8.0,
    h: 0.6,
    fontSize: 22,
    bold: true,
    color: 'F8FAFC',
    fontFace: 'Arial'
  });

  const kpiWidgets = spec.widgets.filter(w => w.type === 'kpi_card');
  kpiWidgets.slice(0, 4).forEach((widget, idx) => {
    const queryData = executeWidgetQuery(widget, activeFilters);
    const posX = 0.8 + idx * 2.8;
    
    // KPI Card Background Shape
    kpiSlide.addShape(pptx.ShapeType.rect, {
      x: posX,
      y: 1.8,
      w: 2.6,
      h: 3.2,
      fill: { color: '1E293B' },
      line: { color: '334155', width: 1 }
    });

    kpiSlide.addText(widget.title, {
      x: posX + 0.15,
      y: 2.0,
      w: 2.3,
      h: 0.6,
      fontSize: 12,
      bold: true,
      color: '94A3B8'
    });

    let displayVal = queryData?.value;
    if (typeof displayVal === 'number') {
      if (displayVal > 1000000) displayVal = `$${(displayVal / 1000000).toFixed(2)}M`;
      else if (displayVal > 1000) displayVal = `${(displayVal / 1000).toFixed(1)}k`;
      else if (widget.format && widget.format.includes('%')) displayVal = `${displayVal.toFixed(1)}%`;
    }

    kpiSlide.addText(String(displayVal || '-'), {
      x: posX + 0.15,
      y: 2.8,
      w: 2.3,
      h: 0.8,
      fontSize: 24,
      bold: true,
      color: '38BDF8'
    });

    if (widget.comparison_label) {
      kpiSlide.addText(widget.comparison_label, {
        x: posX + 0.15,
        y: 4.2,
        w: 2.3,
        h: 0.4,
        fontSize: 11,
        color: '10B981',
        bold: true
      });
    }
  });

  // Slide 3: Charts & Breakdown Data Table
  const chartWidgets = spec.widgets.filter(w => w.type !== 'kpi_card');
  for (const widget of chartWidgets) {
    const slide = pptx.addSlide();
    slide.background = { color: '0F172A' };
    
    slide.addText(widget.title, {
      x: 0.8,
      y: 0.6,
      w: 8.0,
      h: 0.5,
      fontSize: 20,
      bold: true,
      color: 'F8FAFC'
    });

    if (widget.subtitle) {
      slide.addText(widget.subtitle, {
        x: 0.8,
        y: 1.1,
        w: 8.0,
        h: 0.4,
        fontSize: 12,
        color: '94A3B8'
      });
    }

    const data = executeWidgetQuery(widget, activeFilters);
    if (data?.rows) {
      // Table rendering
      const tableHeaders = (widget.table_columns || Object.keys(data.rows[0] || {})).map(c => typeof c === 'string' ? c : c.label);
      const tableRows = [
        tableHeaders.map(h => ({ text: h, options: { bold: true, fill: '1E293B', color: '38BDF8', fontSize: 11 } })),
        ...data.rows.slice(0, 7).map((row: any) => {
          const cols = widget.table_columns ? widget.table_columns.map(c => row[c.key]) : Object.values(row);
          return cols.map(val => ({ text: String(val ?? ''), options: { color: 'F1F5F9', fill: '0F172A', fontSize: 10 } }));
        })
      ];

      slide.addTable(tableRows, {
        x: 0.8,
        y: 1.8,
        w: 8.4,
        colW: [2.2, 1.4, 1.2, 1.2, 1.2, 1.2]
      });
    } else if (data?.categories && data?.series) {
      // Bar / Line Chart slide placeholder summary
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 1.8,
        w: 8.4,
        h: 4.8,
        fill: { color: '1E293B' },
        line: { color: '38BDF8', width: 1 }
      });

      slide.addText(`Interactive Visual: ${widget.type.replace('_', ' ').toUpperCase()}`, {
        x: 1.2,
        y: 2.2,
        w: 7.6,
        h: 0.5,
        fontSize: 16,
        bold: true,
        color: '38BDF8'
      });

      const seriesSummary = data.series.map((s: any) => `• ${s.name}: Latest val = ${s.data[s.data.length - 1] ?? 'N/A'}`).join('\n');
      slide.addText(`Data Metrics:\n${seriesSummary}`, {
        x: 1.2,
        y: 2.8,
        w: 7.6,
        h: 2.0,
        fontSize: 13,
        color: 'E2E8F0'
      });
    }
  }

  // Save PPTX
  const fileName = `${spec.id || 'the-eye-dashboard'}_executive_presentation.pptx`;
  await pptx.writeFile({ fileName });
  return fileName;
}
