import { describe, it, expect } from 'vitest';
import { generateGoogleWorkspaceReport } from '../src/exporters/googleWorkspaceExporter';
import { parseDashboardYaml } from '../src/core/parser';
import { SEVEN_ELEVEN_QLIK_BQ_YAML } from '../src/core/sampleDashboards';

describe('Universal Office & Workspace Exporters', () => {
  it('should generate structured Google Workspace Markdown report from declarative spec', () => {
    const { spec } = parseDashboardYaml(SEVEN_ELEVEN_QLIK_BQ_YAML);
    expect(spec).not.toBeNull();
    if (!spec) return;

    const report = generateGoogleWorkspaceReport(spec, { time_range: '2026-YTD' });
    expect(report).toContain(spec.title);
    expect(report).toContain('Total POS Gross Sales');
    expect(report).toContain('Average Basket Size (ABV)');
    expect(report).toContain('POS Transaction Velocity & Footfall');
  });
});
