import { describe, it, expect } from 'vitest';
import { validateDashboardSpec } from '../src/core/validator';
import { parseDashboardYaml } from '../src/core/parser';
import { SEVEN_ELEVEN_QLIK_BQ_YAML } from '../src/core/sampleDashboards';

describe('AST Schema Linter & Typo Diagnostic Engine', () => {
  it('should validate production 7-Eleven YAML without errors', () => {
    const result = parseDashboardYaml(SEVEN_ELEVEN_QLIK_BQ_YAML);
    expect(result.spec).not.toBeNull();
    expect(result.validation.valid).toBe(true);
    expect(result.validation.errors.filter(e => e.severity === 'error')).toHaveLength(0);
  });

  it('should detect typos in data source types and suggest the correct type with quick-fix', () => {
    const invalidYaml = `
version: "1.0"
id: "test-dash"
title: "Test"
data_sources:
  - id: bq1
    type: bigquerey
widgets:
  - id: w1
    type: kpi_card
    source: bq1
    position: { w: 4 }
`;
    const result = parseDashboardYaml(invalidYaml);
    expect(result.validation.valid).toBe(false);
    const typoError = result.validation.errors.find(e => e.path.includes('type'));
    expect(typoError).toBeDefined();
    expect(typoError?.message).toContain('Did you mean "bigquery"?');
    expect(typoError?.fixAction?.replacement).toBe('bigquery');
  });

  it('should detect typos in widget types and suggest valid replacements', () => {
    const invalidYaml = `
version: "1.0"
id: "test-dash"
title: "Test"
data_sources:
  - id: bq1
    type: bigquery
widgets:
  - id: w1
    type: barr_chart
    source: bq1
    position: { w: 6 }
`;
    const result = parseDashboardYaml(invalidYaml);
    expect(result.validation.valid).toBe(false);
    const widgetError = result.validation.errors.find(e => e.message.includes('Invalid widget type'));
    expect(widgetError).toBeDefined();
    expect(widgetError?.message).toContain('Did you mean "bar_chart"?');
  });

  it('should enforce the 12-column grid layout constraint', () => {
    const invalidYaml = `
version: "1.0"
id: "test-dash"
title: "Test"
data_sources:
  - id: bq1
    type: bigquery
widgets:
  - id: w1
    type: kpi_card
    source: bq1
    position: { w: 16 }
`;
    const result = parseDashboardYaml(invalidYaml);
    expect(result.validation.valid).toBe(false);
    const gridError = result.validation.errors.find(e => e.path.includes('position.w'));
    expect(gridError).toBeDefined();
    expect(gridError?.message).toContain('exceeds 12-column grid system');
  });

  it('should detect undeclared data source references', () => {
    const invalidYaml = `
version: "1.0"
id: "test-dash"
title: "Test"
data_sources:
  - id: bq_prod
    type: bigquery
widgets:
  - id: w1
    type: kpi_card
    source: undeclared_source
    position: { w: 4 }
`;
    const result = parseDashboardYaml(invalidYaml);
    expect(result.validation.valid).toBe(false);
    const refError = result.validation.errors.find(e => e.message.includes('not declared in data_sources'));
    expect(refError).toBeDefined();
  });
});
