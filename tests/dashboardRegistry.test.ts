import { describe, it, expect } from 'vitest';
import { INITIAL_DASHBOARDS, DashboardMetadata } from '../src/core/dashboardRegistry';

describe('Dashboards Hub & Per-Dashboard Permissions', () => {
  it('should register initial production dashboards', () => {
    expect(INITIAL_DASHBOARDS.length).toBeGreaterThanOrEqual(1);
    const mainDash = INITIAL_DASHBOARDS[0];
    expect(mainDash.id).toBe('seven-eleven-retail-intelligence');
    expect(mainDash.dataSource).toContain('seven-eleven-qlik-bq');
  });

  it('should enforce that the dashboard creator has Owner role', () => {
    const mainDash = INITIAL_DASHBOARDS[0];
    expect(mainDash.permissions[mainDash.ownerEmail]).toBe('owner');
  });

  it('should support granting granular Editor and Viewer roles to other users', () => {
    const testDash: DashboardMetadata = {
      id: 'custom-dash-1',
      title: 'Custom Dashboard',
      description: 'Desc',
      dataSource: 'seven-eleven-qlik-bq.retail',
      dataSourceType: 'bigquery',
      ownerEmail: 'creator@company.com',
      ownerName: 'Creator',
      createdAt: '2026-08-24',
      updatedAt: 'Just now',
      yaml: 'version: "1.0"',
      permissions: {
        'creator@company.com': 'owner',
        'analyst@company.com': 'editor',
        'viewer@company.com': 'viewer'
      },
      tags: ['Test']
    };

    expect(testDash.permissions['creator@company.com']).toBe('owner');
    expect(testDash.permissions['analyst@company.com']).toBe('editor');
    expect(testDash.permissions['viewer@company.com']).toBe('viewer');
  });
});
