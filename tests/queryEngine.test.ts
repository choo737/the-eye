import { describe, it, expect } from 'vitest';
import { executeWidgetQuery, interpolateString } from '../src/engine/queryEngine';
import { WidgetSpec } from '../src/core/types';

describe('Universal BI Query & Slicing Engine', () => {
  it('should interpolate dynamic template strings in titles and subtitles', () => {
    const template = 'Hourly Performance for {{product_division}} ({{time_range}})';
    const context = {
      product_division: 'Fresh Food & Ready-to-Eat (RTE)',
      time_range: 'Last 30 Days'
    };
    const result = interpolateString(template, context);
    expect(result).toBe('Hourly Performance for Fresh Food & Ready-to-Eat (RTE) (Last 30 Days)');
  });

  it('should automatically compute correct temporal aggregation grains', () => {
    const lineWidget: WidgetSpec = {
      id: 'w1',
      title: 'POS Velocity',
      type: 'line_chart',
      source: 'bq1',
      x: 'hour',
      y: ['Sales Volume'],
      auto_grain: true
    };

    const ytdRes = executeWidgetQuery(lineWidget, { time_range: '2026-YTD' });
    expect(ytdRes.grain).toBe('month');
    expect(ytdRes.activeGrain).toBe('Monthly');

    const dayRes = executeWidgetQuery(lineWidget, { time_range: 'last_30_days' });
    expect(dayRes.grain).toBe('day');
    expect(dayRes.activeGrain).toBe('Daily');

    const quarterRes = executeWidgetQuery(lineWidget, { time_range: 'last_90_days' });
    expect(quarterRes.grain).toBe('week');
    expect(quarterRes.activeGrain).toBe('Weekly');
  });

  it('should configure dual Y-axes for multi-measure currency vs count series', () => {
    const dualWidget: WidgetSpec = {
      id: 'w2',
      title: 'Velocity & Footfall',
      type: 'combo_chart',
      source: 'bq1',
      x: 'month',
      y: ['Store Sales (RM)', 'Customer Count'],
      dual_axis: true
    };

    const res = executeWidgetQuery(dualWidget, {});
    expect(res.useDualAxis).toBe(true);
    expect(res.series).toHaveLength(2);
    expect(res.series[0].yAxisIndex).toBe(0);
    expect(res.series[1].yAxisIndex).toBe(1);
  });

  it('should dynamically transform series and scale when Product Division filter is applied', () => {
    const lineWidget: WidgetSpec = {
      id: 'w3',
      title: 'Sales Velocity',
      type: 'line_chart',
      source: 'bq1',
      x: 'month',
      y: ['Store Sales (RM)']
    };

    const unfilteredRes = executeWidgetQuery(lineWidget, {});
    const filteredRes = executeWidgetQuery(lineWidget, {
      product_division: 'Fresh Food & Ready-to-Eat (RTE)'
    });

    const unfilteredSum = unfilteredRes.series[0].data.reduce((a: number, b: number) => a + b, 0);
    const filteredSum = filteredRes.series[0].data.reduce((a: number, b: number) => a + b, 0);

    expect(filteredSum).toBeLessThan(unfilteredSum);
    expect(filteredRes.dynamicSubtitle).toContain('Fresh Food & Ready-to-Eat (RTE)');
  });

  it('should isolate donut slices when product division is filtered', () => {
    const donutWidget: WidgetSpec = {
      id: 'w4',
      title: 'Category Share',
      type: 'donut_chart',
      source: 'bq1'
    };

    const res = executeWidgetQuery(donutWidget, {
      product_division: 'Beverages & Slurpee'
    });

    expect(res.data).toBeDefined();
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.dynamicSubtitle).toContain('Beverages & Slurpee');
  });

  it('should dynamically switch temporal grain to Hourly for Today, Daily for 7/30 days, Weekly for 90 days, and Monthly for YTD', () => {
    const velocityWidget: WidgetSpec = {
      id: 'vel_chart',
      title: 'POS Velocity',
      type: 'line_chart',
      source: 'bq1',
      x: 'hour',
      y: ['Store Sales (RM)', 'Customer Count'],
      dual_axis: true
    };

    // 1. Today string -> Hourly Grain
    const todayRes = executeWidgetQuery(velocityWidget, { time_range: 'today' });
    expect(todayRes.grain).toBe('hour');
    expect(todayRes.activeGrain).toBe('Hourly');
    expect(todayRes.categories).toContain('06:00');
    expect(todayRes.categories).toContain('12:00');

    // 2. Rich object Today -> Hourly Grain
    const richTodayRes = executeWidgetQuery(velocityWidget, { 
      time_range: { preset: 'today', startDate: '08/24/2026', endDate: '08/24/2026' } 
    });
    expect(richTodayRes.grain).toBe('hour');
    expect(richTodayRes.activeGrain).toBe('Hourly');
    expect(richTodayRes.categories).toContain('06:00');

    // 3. Last 7 Days -> Daily Grain
    const last7Res = executeWidgetQuery(velocityWidget, { time_range: 'last_7_days' });
    expect(last7Res.grain).toBe('day');
    expect(last7Res.activeGrain).toBe('Daily');
    expect(last7Res.categories).toContain('24 Aug');

    // 4. 2026-YTD -> Monthly Grain
    const ytdRes = executeWidgetQuery(velocityWidget, { time_range: '2026-YTD' });
    expect(ytdRes.grain).toBe('month');
    expect(ytdRes.activeGrain).toBe('Monthly');
    expect(ytdRes.categories).toContain('Jan 2026');
  });
});
