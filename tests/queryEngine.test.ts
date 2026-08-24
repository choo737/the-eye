import { describe, it, expect } from 'vitest';
import { executeWidgetQuery, interpolateString } from '../src/engine/queryEngine';
import { WidgetSpec } from '../src/core/types';

describe('Universal BI Query & Slicing Engine', () => {
  it('should interpolate dynamic template strings in titles and subtitles', () => {
    const template = "Showing {{active_grain}} stream for {{time_range}}";
    const context = { active_grain: 'Daily', time_range: 'Last 30 Days' };
    const rendered = interpolateString(template, context);
    expect(rendered).toBe('Showing Daily stream for Last 30 Days');
  });

  it('should automatically compute correct temporal aggregation grains', () => {
    const widget: WidgetSpec = {
      id: 'time_series_chart',
      title: 'POS Velocity',
      type: 'line_chart',
      source: 'bq_test',
      position: { w: 8 },
      x: 'date',
      y: ['Store Sales ($)', 'Customer Count'],
      dual_axis: true,
      auto_grain: true
    };

    // 1. Last 30 Days -> Daily grain
    const res30d = executeWidgetQuery(widget, { time_range: 'last_30_days' });
    expect(res30d.grain).toBe('day');
    expect(res30d.activeGrain).toBe('Daily');
    expect(res30d.categories[0]).toContain('Day');

    // 2. Last Quarter -> Weekly grain
    const res90d = executeWidgetQuery(widget, { time_range: 'last_90_days' });
    expect(res90d.grain).toBe('week');
    expect(res90d.activeGrain).toBe('Weekly');
    expect(res90d.categories[0]).toContain('Week');

    // 3. 2026 YTD -> Monthly grain
    const resYtd = executeWidgetQuery(widget, { time_range: '2026-YTD' });
    expect(resYtd.grain).toBe('month');
    expect(resYtd.activeGrain).toBe('Monthly');
    expect(resYtd.categories[0]).toContain('Jan');
  });

  it('should configure dual Y-axes for multi-measure currency vs count series', () => {
    const widget: WidgetSpec = {
      id: 'dual_chart',
      title: 'Sales vs Footfall',
      type: 'line_chart',
      source: 'bq_test',
      position: { w: 8 },
      x: 'date',
      y: ['Store Sales ($)', 'Customer Count'],
      dual_axis: true
    };

    const res = executeWidgetQuery(widget, { time_range: '2026-YTD' });
    expect(res.useDualAxis).toBe(true);
    expect(res.series).toHaveLength(2);
    expect(res.series[0].yAxisIndex).toBe(0); // Primary left axis (Sales)
    expect(res.series[1].yAxisIndex).toBe(1); // Secondary right axis (Footfall)
  });

  it('should dynamically transform series and scale when Product Division filter is applied', () => {
    const widget: WidgetSpec = {
      id: 'pos_chart',
      title: 'POS Velocity',
      type: 'line_chart',
      source: 'bq_test',
      position: { w: 8 },
      x: 'date',
      y: ['Store Sales ($)', 'Customer Count'],
      dual_axis: true
    };

    // Filter to Beverages
    const resBev = executeWidgetQuery(widget, { 
      time_range: '2026-YTD',
      product_division: 'Beverages & Slurpee'
    });

    expect(resBev.series[0].name).toContain('Beverages Sales ($)');
    expect(resBev.dynamicSubtitle).toContain('Beverages & Slurpee');
  });

  it('should isolate donut slices when product division is filtered', () => {
    const widget: WidgetSpec = {
      id: 'donut_div',
      title: 'Sales Share',
      type: 'donut_chart',
      source: 'bq_test',
      position: { w: 4 },
      category: 'category',
      value: 'sales'
    };

    const res = executeWidgetQuery(widget, {
      product_division: 'Fresh Food & Ready-to-Eat (RTE)'
    });

    expect(res.data).toHaveLength(1);
    expect(res.data[0].name).toContain('Fresh Food');
  });
});
