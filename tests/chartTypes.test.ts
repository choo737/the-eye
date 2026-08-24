import { describe, it, expect } from 'vitest';
import { validateDashboardSpec } from '../src/core/validator';
import { executeWidgetQuery } from '../src/engine/queryEngine';
import { WidgetSpec, WidgetType } from '../src/core/types';

describe('Exhaustive Looker Studio / Data Studio Chart Types Coverage', () => {
  const ALL_LOOKER_STUDIO_CHART_TYPES: WidgetType[] = [
    // 1. Tables & Pivots
    'table',
    'pivot_table',
    // 2. Scorecards
    'kpi_card',
    'scorecard',
    // 3. Time Series & Cartesian
    'line_chart',
    'bar_chart',
    'horizontal_bar',
    'stacked_bar',
    'stacked_bar_100',
    'area_chart',
    'combo_chart',
    'waterfall',
    // 4. Pie & Donut
    'pie_chart',
    'donut_chart',
    // 5. Maps & Geospatial
    'google_map',
    'geo_map',
    'bubble_map',
    // 6. Scatter & Bubble
    'scatter_chart',
    'bubble_chart',
    // 7. Gauges & Performance
    'gauge',
    'bullet_chart',
    'funnel',
    'radar',
    // 8. Hierarchical & Flows
    'treemap',
    'heatmap',
    'sankey'
  ];

  it('should validate every single Looker Studio chart type against the declarative schema', () => {
    ALL_LOOKER_STUDIO_CHART_TYPES.forEach((chartType) => {
      const spec = {
        id: `test-dash-${chartType}`,
        title: `Testing ${chartType}`,
        data_sources: [{ id: 'bq1', type: 'bigquery' }],
        widgets: [
          {
            id: `widget-${chartType}`,
            title: `Widget for ${chartType}`,
            type: chartType,
            source: 'bq1',
            position: { w: 6, h: 4 }
          }
        ]
      };

      const result = validateDashboardSpec(spec);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  it('should execute query correctly for all chart categories without crashing', () => {
    ALL_LOOKER_STUDIO_CHART_TYPES.forEach((chartType) => {
      const widget: WidgetSpec = {
        id: `widget_query_${chartType}`,
        title: `Widget Query for ${chartType}`,
        type: chartType,
        source: 'bq_seven_eleven',
        position: { w: 6, h: 4 }
      };

      const res = executeWidgetQuery(widget, {});
      expect(res).toBeDefined();
    });
  });
});
