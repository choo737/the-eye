import { describe, it, expect } from 'vitest';
import { parseDashboardYaml } from '../src/core/parser';
import { executeWidgetQuery } from '../src/engine/queryEngine';
import { 
  CIMB_BANK_BQ_YAML, 
  SEVEN_ELEVEN_QLIK_BQ_YAML, 
  SAAS_GROWTH_BQ_YAML, 
  HEALTHCARE_OPERATIONS_BQ_YAML, 
  SUPPLY_CHAIN_LOGISTICS_BQ_YAML 
} from '../src/core/sampleDashboards';

describe('Multi-Industry Enterprise Scenarios & Chart Types Quality Suite', () => {
  const dashboards = [
    { name: 'Commercial Banking (CIMB)', yaml: CIMB_BANK_BQ_YAML, expectedWidgets: 5 },
    { name: 'Omnichannel Retail (7-Eleven)', yaml: SEVEN_ELEVEN_QLIK_BQ_YAML, expectedWidgets: 5 },
    { name: 'Cloud SaaS Growth', yaml: SAAS_GROWTH_BQ_YAML, expectedWidgets: 7 },
    { name: 'Healthcare Operations', yaml: HEALTHCARE_OPERATIONS_BQ_YAML, expectedWidgets: 7 },
    { name: 'Supply Chain & Fleet Telemetry', yaml: SUPPLY_CHAIN_LOGISTICS_BQ_YAML, expectedWidgets: 7 }
  ];

  dashboards.forEach(({ name, yaml, expectedWidgets }) => {
    it(`should parse and validate ${name} dashboard with zero AST errors`, () => {
      const { spec, validation } = parseDashboardYaml(yaml);
      expect(spec).toBeDefined();
      expect(spec!.id).toBeDefined();
      expect(spec!.widgets.length).toBeGreaterThanOrEqual(expectedWidgets);
      const errors = validation.errors.filter(d => d.severity === 'error');
      expect(errors).toHaveLength(0);
    });

    it(`should successfully execute queries for every widget in ${name}`, () => {
      const { spec } = parseDashboardYaml(yaml);
      spec!.widgets.forEach(widget => {
        const res = executeWidgetQuery(widget, { time_range: 'ytd' });
        expect(res).toBeDefined();
        if (widget.type === 'kpi_card') {
          expect(typeof res.value).toBe('number');
          expect(isNaN(res.value)).toBe(false);
        } else if (widget.type === 'donut_chart' || widget.type === 'pie_chart') {
          expect(Array.isArray(res.data)).toBe(true);
        } else if (widget.type === 'treemap' || widget.type === 'funnel') {
          expect(Array.isArray(res.data)).toBe(true);
          expect(res.data.length).toBeGreaterThan(0);
        } else if (widget.type === 'gauge' || widget.type === 'bullet_chart') {
          expect(typeof res.value).toBe('number');
        } else if (widget.type === 'radar') {
          expect(Array.isArray(res.indicators)).toBe(true);
          expect(Array.isArray(res.series)).toBe(true);
        } else if (widget.type === 'scatter_chart' || widget.type === 'bubble_chart') {
          expect(Array.isArray(res.data)).toBe(true);
        } else if (widget.type === 'google_map') {
          expect(Array.isArray(res.mapPoints)).toBe(true);
          expect(res.mapPoints.length).toBeGreaterThan(0);
        }
      });
    });
  });

  it('should verify SaaS Treemap and Scatter plot data format', () => {
    const { spec } = parseDashboardYaml(SAAS_GROWTH_BQ_YAML);
    const treemapWidget = spec!.widgets.find(w => w.type === 'treemap')!;
    const scatterWidget = spec!.widgets.find(w => w.type === 'scatter_chart')!;

    const treeRes = executeWidgetQuery(treemapWidget, {});
    expect(treeRes.data.some((d: any) => d.name === 'Enterprise Plus')).toBe(true);

    const scatterRes = executeWidgetQuery(scatterWidget, {});
    expect(scatterRes.data.length).toBeGreaterThan(0);
    expect(scatterRes.data[0][0]).toBeGreaterThan(0); // MRR
  });

  it('should verify Healthcare Clinical Inpatients and Bed Occupancy Gauge', () => {
    const { spec } = parseDashboardYaml(HEALTHCARE_OPERATIONS_BQ_YAML);
    const gaugeWidget = spec!.widgets.find(w => w.type === 'gauge')!;
    const mapWidget = spec!.widgets.find(w => w.type === 'google_map')!;

    const gaugeRes = executeWidgetQuery(gaugeWidget, {});
    expect(gaugeRes.value).toBeGreaterThan(80);

    const mapRes = executeWidgetQuery(mapWidget, {});
    expect(mapRes.mapPoints.some((p: any) => p.name.includes('Gleneagles'))).toBe(true);
  });

  it('should verify Supply Chain Fleet Radar SLA index and Hub Map', () => {
    const { spec } = parseDashboardYaml(SUPPLY_CHAIN_LOGISTICS_BQ_YAML);
    const radarWidget = spec!.widgets.find(w => w.type === 'radar')!;
    const mapWidget = spec!.widgets.find(w => w.type === 'google_map')!;

    const radarRes = executeWidgetQuery(radarWidget, {});
    expect(radarRes.indicators.length).toBe(5);

    const mapRes = executeWidgetQuery(mapWidget, {});
    expect(mapRes.mapPoints.some((p: any) => p.name.includes('Port Klang'))).toBe(true);
  });
});
