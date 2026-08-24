import { describe, it, expect } from 'vitest';
import { validateDashboardSpec } from '../src/core/validator';
import { SEVEN_ELEVEN_QLIK_BQ_YAML } from '../src/core/sampleDashboards';
import * as yaml from 'js-yaml';

describe('AST Schema Linter & Typo Diagnostic Engine', () => {
  it('should validate production 7-Eleven YAML without errors', () => {
    const parsed = yaml.load(SEVEN_ELEVEN_QLIK_BQ_YAML);
    const result = validateDashboardSpec(parsed);
    expect(result.valid).toBe(true);
    expect(result.errors.filter(e => e.severity === 'error')).toHaveLength(0);
  });

  it('should detect typos in data source types and suggest the correct type with quick-fix', () => {
    const invalidSpec = {
      id: 'dash1',
      title: 'Test Dash',
      data_sources: [
        { id: 'ds1', type: 'big_query' } // Typo for bigquery
      ],
      widgets: []
    };

    const result = validateDashboardSpec(invalidSpec);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    const typoErr = result.errors.find(e => e.path.includes('type'));
    expect(typoErr).toBeDefined();
    expect(typoErr?.fixAction?.replacement).toBe('bigquery');
  });

  it('should detect typos in widget types and suggest valid replacements', () => {
    const invalidSpec = {
      id: 'dash2',
      title: 'Test Dash',
      data_sources: [{ id: 'ds1', type: 'duckdb' }],
      widgets: [
        {
          id: 'w1',
          title: 'Sales Chart',
          type: 'linechart', // Typo for line_chart
          source: 'ds1',
          position: { w: 6, h: 4 }
        }
      ]
    };

    const result = validateDashboardSpec(invalidSpec);
    expect(result.valid).toBe(false);
    const widgetErr = result.errors.find(e => e.path.includes('type'));
    expect(widgetErr?.fixAction?.replacement).toBe('line_chart');
  });

  it('should enforce the 12-column grid layout constraint', () => {
    const invalidGridSpec = {
      id: 'dash3',
      title: 'Grid Test',
      data_sources: [{ id: 'ds1', type: 'duckdb' }],
      widgets: [
        {
          id: 'w1',
          title: 'Too Wide',
          type: 'kpi_card',
          source: 'ds1',
          position: { w: 16, h: 2 } // Exceeds 12 cols
        }
      ]
    };

    const result = validateDashboardSpec(invalidGridSpec);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message.includes('12-column'))).toBe(true);
  });

  it('should detect undeclared data source references', () => {
    const missingSourceSpec = {
      id: 'dash4',
      title: 'Missing Source',
      data_sources: [{ id: 'valid_ds', type: 'duckdb' }],
      widgets: [
        {
          id: 'w1',
          title: 'Orphan Widget',
          type: 'kpi_card',
          source: 'non_existent_ds',
          position: { w: 4, h: 2 }
        }
      ]
    };

    const result = validateDashboardSpec(missingSourceSpec);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message.includes('non_existent_ds'))).toBe(true);
  });

  it('should validate data sources with explicit SQL queries and table specifications', () => {
    const specWithSql = {
      id: 'sql-test',
      title: 'SQL Spec Test',
      data_sources: [
        {
          id: 'bq_sales',
          type: 'bigquery',
          project: 'the-eye-bi-platform',
          dataset: 'retail_analytics',
          table: 'fct_pos_transactions',
          query: 'SELECT store_id, SUM(sales) AS revenue FROM `the-eye-bi-platform.retail_analytics.fct_pos_transactions` GROUP BY 1'
        }
      ],
      widgets: [
        {
          id: 'kpi1',
          title: 'Total Sales',
          type: 'kpi_card',
          source: 'bq_sales',
          position: { w: 4, h: 2 }
        }
      ]
    };

    const res = validateDashboardSpec(specWithSql);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });
});
