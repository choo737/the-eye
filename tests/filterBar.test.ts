import { describe, it, expect } from 'vitest';
import { FilterSpec } from '../src/core/types';

describe('Advanced Date Range & Filter Bar Specifications', () => {
  it('should support daterange filter type with custom presets', () => {
    const dateFilter: FilterSpec = {
      id: 'time_range',
      label: 'Time Horizon',
      type: 'daterange',
      default: '2026-YTD'
    };

    expect(dateFilter.type).toBe('daterange');
    expect(dateFilter.default).toBe('2026-YTD');
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
