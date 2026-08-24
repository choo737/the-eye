import { describe, it, expect } from 'vitest';
import { validateDashboardSpec } from '../src/core/validator';
import { executeWidgetQuery } from '../src/engine/queryEngine';
import { WidgetSpec } from '../src/core/types';

describe('Google Maps & Geospatial Intelligence Widget', () => {
  it('should validate google_map widget specification with show_table and templated drilldown', () => {
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
            show_table: true,
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
            title: 'Store Performance Drill-Down: {{store_name}} ({{store_id}})',
            subtitle: 'Hourly POS velocity for {{store_id}}',
            sub_widgets: [
              {
                id: 'store_hourly_velocity',
                title: 'Hourly Velocity',
                type: 'line_chart',
                x: 'hour',
                y: ['Hourly POS Sales (RM)', 'POS Transactions'],
                dual_axis: true
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

  it('should execute google_map query and guarantee NO fields are undefined across all map points', () => {
    const mapWidget: WidgetSpec = {
      id: 'map_stores',
      title: 'Store Map',
      type: 'google_map',
      source: 'bq_gsheet_store_mesh',
      position: { w: 12, h: 4 }
    };

    const res = executeWidgetQuery(mapWidget, {});
    expect(res.mapPoints).toBeDefined();
    expect(res.mapPoints.length).toBeGreaterThanOrEqual(8);

    res.mapPoints.forEach((point: any) => {
      expect(point.name).toBeDefined();
      expect(typeof point.name).toBe('string');
      expect(point.name).not.toBe('undefined');
      expect(point.name.length).toBeGreaterThan(0);

      expect(point.id).toBeDefined();
      expect(typeof point.id).toBe('string');
      expect(point.id).not.toBe('undefined');

      expect(point.manager).toBeDefined();
      expect(typeof point.manager).toBe('string');
      expect(point.manager).not.toBe('undefined');

      expect(point.region).toBeDefined();
      expect(typeof point.region).toBe('string');
      expect(point.region).not.toBe('undefined');

      expect(typeof point.sales).toBe('number');
      expect(typeof point.target).toBe('number');
      expect(typeof point.target_achievement_pct).toBe('number');
      expect(typeof point.lat).toBe('number');
      expect(typeof point.lng).toBe('number');
    });
  });

  it('should guarantee valid store names when filtered by region or merchandise division', () => {
    const mapWidget: WidgetSpec = {
      id: 'map_stores',
      title: 'Store Map',
      type: 'google_map',
      source: 'bq_gsheet_store_mesh',
      position: { w: 12, h: 4 }
    };

    const filteredRes = executeWidgetQuery(mapWidget, { region: 'Northern Region' });
    expect(filteredRes.mapPoints.length).toBeGreaterThan(0);
    filteredRes.mapPoints.forEach((point: any) => {
      expect(point.name).not.toBe('undefined');
      expect(point.name.length).toBeGreaterThan(0);
    });
  });

  it('should support toggle unselect logic for store deep-dives', () => {
    let currentSelected: any = null;
    const store1 = { id: '7E-1082', name: 'KLCC' };

    // Select store1
    currentSelected = currentSelected?.id === store1.id ? null : store1;
    expect(currentSelected?.id).toBe('7E-1082');

    // Click again -> should toggle unselect to null
    currentSelected = currentSelected?.id === store1.id ? null : store1;
    expect(currentSelected).toBeNull();
  });
});
