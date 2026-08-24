import { describe, it, expect } from 'vitest';
import { validateDashboardSpec } from '../src/core/validator';
import { executeWidgetQuery } from '../src/engine/queryEngine';
import { WidgetSpec } from '../src/core/types';

describe('Google Maps & Geospatial Intelligence Widget', () => {
  it('should validate google_map widget specification', () => {
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
          position: { w: 12, h: 4 },
          map_config: {
            center: { lat: 3.1390, lng: 101.6869 },
            zoom: 6,
            style: 'dark',
            layer_type: 'pins_and_heatmap'
          }
        }
      ]
    };

    const result = validateDashboardSpec(validSpec);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should execute google_map query and filter store pins by region', () => {
    const mapWidget: WidgetSpec = {
      id: 'map_stores',
      title: 'Store Map',
      type: 'google_map',
      source: 'bq_test',
      position: { w: 12, h: 4 }
    };

    // 1. All regions
    const resAll = executeWidgetQuery(mapWidget, {});
    expect(resAll.mapPoints.length).toBeGreaterThanOrEqual(8);

    // 2. Filter to Northern Region
    const resNorth = executeWidgetQuery(mapWidget, { store_region: 'Northern Region' });
    expect(resNorth.mapPoints).toHaveLength(2);
    expect(resNorth.mapPoints.every((p: any) => p.region === 'Northern Region')).toBe(true);
  });
});
