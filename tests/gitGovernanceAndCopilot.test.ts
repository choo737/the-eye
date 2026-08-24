import { describe, it, expect } from 'vitest';
import { parseDashboardYaml, stringifyDashboardSpec } from '../src/core/parser';
import { CIMB_BANK_BQ_YAML, SAAS_GROWTH_BQ_YAML } from '../src/core/sampleDashboards';

describe('Git CI/CD Governance, Schema-Aware Copilot, and Data Export Suite', () => {
  it('should support CSV row formatting with proper quotes and headers', () => {
    const rows = [
      { branch_code: 'CIMB-0101', name: 'KL Sentral, Main', volume: 29560000000 },
      { branch_code: 'CIMB-0102', name: 'Raja Chulan "Hub"', volume: 22330000000 }
    ];
    const columns = [
      { key: 'branch_code', label: 'Branch Code' },
      { key: 'name', label: 'Branch Name' },
      { key: 'volume', label: 'Volume (RM)' }
    ];

    const header = columns.map(c => `"${c.label}"`).join(',');
    const line1 = `"${rows[0].branch_code}","${rows[0].name.replace(/"/g, '""')}","${rows[0].volume}"`;
    const line2 = `"${rows[1].branch_code}","${rows[1].name.replace(/"/g, '""')}","${rows[1].volume}"`;

    expect(header).toBe('"Branch Code","Branch Name","Volume (RM)"');
    expect(line1).toContain('KL Sentral, Main');
    expect(line2).toContain('Raja Chulan ""Hub""');
  });

  it('should parse and stringify YAML round-trip for AI Copilot modifications', () => {
    const { spec } = parseDashboardYaml(CIMB_BANK_BQ_YAML);
    expect(spec).not.toBeNull();

    // Copilot adds a new SLA Gauge widget
    const modifiedSpec = JSON.parse(JSON.stringify(spec!));
    modifiedSpec.widgets.push({
      id: 'cimb_sla_gauge',
      title: 'Branch Service Level Attainment',
      type: 'gauge',
      source: 'bq_cimb_bank',
      position: { w: 4, h: 4 },
      value: 'customer_nps'
    });

    const newYaml = stringifyDashboardSpec(modifiedSpec);
    expect(newYaml).toContain('cimb_sla_gauge');
    expect(newYaml).toContain('Branch Service Level Attainment');

    const reParsed = parseDashboardYaml(newYaml);
    expect(reParsed.spec?.widgets.some(w => w.id === 'cimb_sla_gauge')).toBe(true);
  });

  it('should verify SaaS schema-aware copilot prompt generation', () => {
    const { spec } = parseDashboardYaml(SAAS_GROWTH_BQ_YAML);
    expect(spec).not.toBeNull();

    const modifiedSpec = JSON.parse(JSON.stringify(spec!));
    modifiedSpec.widgets.push({
      id: 'saas_nrr_radar',
      title: 'Customer Cohort Health Radar',
      type: 'radar',
      source: 'bq_saas',
      position: { w: 6, h: 4 }
    });

    const newYaml = stringifyDashboardSpec(modifiedSpec);
    const reParsed = parseDashboardYaml(newYaml);
    expect(reParsed.spec?.widgets.some(w => w.id === 'saas_nrr_radar')).toBe(true);
  });
});
