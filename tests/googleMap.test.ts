import { describe, it, expect } from 'vitest';
import { validateDashboardSpec } from '../src/core/validator';
import { executeWidgetQuery } from '../src/engine/queryEngine';
import { WidgetSpec } from '../src/core/types';

describe('Google Maps & Geospatial Intelligence Widget', () => {
  it('should validate google_map widget specification with drilldown sub_widgets', () => {
    const validSpec = {
      id: 'test-dash',
      title: 'Geospatial Test',
      data_sources: [{ id: 'bq1', type: 'bigquery' }],
      widgets: [
        {
          id: 'map1',
          title: 'Store Locations',
          type: 'google_map',
          source: 'bq1',
          position: { w: 12, h: 6 },
          map_config: {
            center: { lat: 3.1390, lng: 101.6869 },
            zoom: 6,
            style: 'google_streets',
            metric_field: 'target_achievement_pct',
            color_scale: {
              min: 80,
              max: 110,
              min_color: '#ef4444',
              mid_color: '#eab308',
              max_color: '#22c55e'
            }
          },
          drilldown: {
            enabled: true,
            title: 'Store Deep-Dive: {{selected_store_name}}',
            sub_widgets: [
              {
                id: 'store_hourly_velocity',
                title: 'Hourly Velocity',
                type: 'line_chart',
                x: 'hour',
                y: ['Sales', 'Transactions'],
                dual_axis: true
              },
              {
                id: 'store_category_donut',
                title: 'Store Category Share',
                type: 'donut_chart',
                category: 'category',
                value: 'sales'
              }
            ]
          }
        }
      ]
    };

    const result = validateDashboardSpec(validSpec);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should execute google_map query and maintain all store pins with Google Sheets targets', () => {
    const mapWidget: WidgetSpec = {
      id: 'map_stores',
      title: 'Store Map',
      type: 'google_map',
      source: 'bq_gsheet_store_mesh',
      position: { w: 12, h: 4 }
    };

    const res = executeWidgetQuery(mapWidget, {});
    expect(res.mapPoints.length).toBeGreaterThanOrEqual(8);
    expect(res.mapPoints[0].target_achievement_pct).toBeDefined();
    expect(res.mapPoints[0].target).toBeDefined();
  });
});
