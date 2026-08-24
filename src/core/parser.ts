import * as yaml from 'js-yaml';
import { DashboardSpec, ValidationResult } from './types';
import { validateDashboardSpec } from './validator';

export interface ParseResult {
  spec: DashboardSpec | null;
  rawYaml: string;
  validation: ValidationResult;
  parseError?: string;
}

export function parseDashboardYaml(yamlString: string): ParseResult {
  try {
    const parsed = yaml.load(yamlString) as DashboardSpec;
    if (!parsed || typeof parsed !== 'object') {
      return {
        spec: null,
        rawYaml: yamlString,
        validation: { valid: false, errors: [{ path: 'root', message: 'YAML root must be an object', severity: 'error' }] },
        parseError: 'Root content is not a valid YAML object'
      };
    }
    const validation = validateDashboardSpec(parsed, yamlString);
    return {
      spec: parsed,
      rawYaml: yamlString,
      validation
    };
  } catch (err: any) {
    return {
      spec: null,
      rawYaml: yamlString,
      validation: {
        valid: false,
        errors: [{ path: 'syntax', message: err.message || 'YAML parsing syntax error', severity: 'error' }]
      },
      parseError: err.message || 'Invalid YAML syntax'
    };
  }
}

export function stringifyDashboardSpec(spec: DashboardSpec): string {
  return yaml.dump(spec, {
    indent: 2,
    lineWidth: 120,
    noRefs: true
  });
}
