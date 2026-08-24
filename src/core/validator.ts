import { DashboardSpec, ValidationResult } from './types';

export function validateDashboardSpec(spec: any): ValidationResult {
  const errors: ValidationResult['errors'] = [];

  if (!spec) {
    return {
      valid: false,
      errors: [{ path: 'root', message: 'Specification is empty or undefined', severity: 'error' }]
    };
  }

  if (!spec.id || typeof spec.id !== 'string') {
    errors.push({ path: 'id', message: 'Dashboard "id" is required and must be a string', severity: 'error' });
  }

  if (!spec.title || typeof spec.title !== 'string') {
    errors.push({ path: 'title', message: 'Dashboard "title" is required', severity: 'error' });
  }

  if (!spec.data_sources || !Array.isArray(spec.data_sources) || spec.data_sources.length === 0) {
    errors.push({ path: 'data_sources', message: 'At least one data source must be defined', severity: 'error' });
  } else {
    spec.data_sources.forEach((ds: any, index: number) => {
      if (!ds.id) {
        errors.push({ path: `data_sources[${index}].id`, message: 'Data source must have an "id"', severity: 'error' });
      }
      if (!ds.type) {
        errors.push({ path: `data_sources[${index}].type`, message: 'Data source must specify a valid "type"', severity: 'error' });
      }
    });
  }

  const dataSourceIds = new Set((spec.data_sources || []).map((ds: any) => ds.id));

  if (!spec.widgets || !Array.isArray(spec.widgets) || spec.widgets.length === 0) {
    errors.push({ path: 'widgets', message: 'Dashboard must contain at least one widget', severity: 'error' });
  } else {
    spec.widgets.forEach((widget: any, index: number) => {
      const prefix = `widgets[${index}] (${widget.id || index})`;
      if (!widget.id) {
        errors.push({ path: `${prefix}.id`, message: 'Widget must have an "id"', severity: 'error' });
      }
      if (!widget.type) {
        errors.push({ path: `${prefix}.type`, message: 'Widget must specify a "type"', severity: 'error' });
      }
      if (!widget.source) {
        errors.push({ path: `${prefix}.source`, message: 'Widget must specify a "source" data source', severity: 'error' });
      } else if (!dataSourceIds.has(widget.source) && widget.source !== 'mock') {
        errors.push({ 
          path: `${prefix}.source`, 
          message: `Data source "${widget.source}" is not declared in "data_sources" list`, 
          severity: 'warning' 
        });
      }

      if (!widget.position || typeof widget.position.w !== 'number') {
        errors.push({ path: `${prefix}.position.w`, message: 'Widget position width "w" (1-12) is required', severity: 'error' });
      }
    });
  }

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors
  };
}
