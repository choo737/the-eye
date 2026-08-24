import { describe, it, expect } from 'vitest';
import { FilterSpec } from '../src/core/types';
import { validateDashboardSpec } from '../src/core/validator';

describe('Advanced Date Range & Filter Bar Specifications', () => {
  it('should support daterange filter type with custom presets and configurable min/max date bounds', () => {
    const dateFilter: FilterSpec = {
      id: 'time_range',
      label: 'Time Horizon',
      type: 'daterange',
      default: 'ytd',
      min_date: '2025-01-01',
      max_date: '2026-12-31',
      available_presets: ['today', 'last_7_days', 'last_30_days', 'ytd']
    };

    expect(dateFilter.type).toBe('daterange');
    expect(dateFilter.default).toBe('ytd');
    expect(dateFilter.min_date).toBe('2025-01-01');
    expect(dateFilter.max_date).toBe('2026-12-31');
    expect(dateFilter.available_presets).toHaveLength(4);
  });

  it('should validate dashboard with min_date and max_date filter configurations', () => {
    const spec = {
      id: 'test-dash',
      title: 'Filter Spec Test',
      data_sources: [{ id: 'ds1', type: 'bigquery' }],
      filters: [
        {
          id: 'date_filter',
          label: 'Date Range',
          type: 'daterange',
          default: 'ytd',
          min_date: '2024-01-01',
          max_date: '2026-12-31'
        }
      ],
      widgets: [
        {
          id: 'kpi1',
          title: 'Total Sales',
          type: 'kpi_card',
          source: 'ds1',
          position: { w: 4, h: 2 }
        }
      ]
    };

    const res = validateDashboardSpec(spec);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('should support multi_select filter type with region options', () => {
    const multiFilter: FilterSpec = {
      id: 'region_cluster',
      label: 'Store Region Clusters',
      type: 'multi_select',
      default: ['All Regions'],
      options: [
        { label: 'All Regions (All Clusters)', value: 'All Regions' },
        { label: 'Klang Valley / Central', value: 'Klang Valley / Central' },
        { label: 'Northern Region (Penang / Perak)', value: 'Northern Region' }
      ]
    };

    expect(multiFilter.type).toBe('multi_select');
    expect(multiFilter.options).toHaveLength(3);
  });
});
