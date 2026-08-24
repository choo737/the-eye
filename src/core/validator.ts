import { ValidationResult, LintDiagnostic } from './types';

const VALID_DATA_SOURCE_TYPES = [
  'bigquery',
  'postgres',
  'mysql',
  'mssql',
  'snowflake',
  'databricks',
  'duckdb',
  'google_sheet',
  'excel',
  'rest_api',
  'mock'
];

const VALID_WIDGET_TYPES = [
  'kpi_card',
  'line_chart',
  'bar_chart',
  'stacked_bar',
  'area_chart',
  'pie_chart',
  'donut_chart',
  'scatter_chart',
  'heatmap',
  'treemap',
  'sankey',
  'radar',
  'funnel',
  'gauge',
  'table'
];

const VALID_THEMES = [
  'emerald-slate',
  'modern-dark',
  'minimal-light',
  'cyberpunk',
  'corporate-navy'
];

const VALID_FILTER_TYPES = [
  'daterange',
  'multi_select',
  'single_select',
  'number_range',
  'search'
];

const STANDARD_FORMAT_PATTERNS = [
  '$0.00a',
  '$0.0a',
  '$0.00',
  '$0,0',
  '0.0%',
  '0.00%',
  '0,0',
  '0.0 mos'
];

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function findClosestMatch(input: string, allowedList: string[]): string | null {
  if (!input) return null;
  const inputLower = input.toLowerCase().replace(/[^a-z0-9_]/g, '');
  let closest: string | null = null;
  let minDistance = Infinity;

  for (const candidate of allowedList) {
    const candidateLower = candidate.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const dist = levenshteinDistance(inputLower, candidateLower);
    if (dist < minDistance && dist <= Math.max(3, Math.floor(candidate.length / 2))) {
      minDistance = dist;
      closest = candidate;
    }
  }
  return closest;
}

function findLineInYaml(yamlText: string, searchKey: string, searchValue?: string): { line: number; column: number } {
  if (!yamlText) return { line: 1, column: 1 };
  const lines = yamlText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const lineStr = lines[i];
    if (searchValue && lineStr.includes(searchKey) && lineStr.includes(searchValue)) {
      return { line: i + 1, column: Math.max(1, lineStr.indexOf(searchValue) + 1) };
    }
    if (!searchValue && lineStr.includes(searchKey)) {
      return { line: i + 1, column: Math.max(1, lineStr.indexOf(searchKey) + 1) };
    }
  }
  return { line: 1, column: 1 };
}

export function validateDashboardSpec(spec: any, rawYaml?: string): ValidationResult {
  const errors: LintDiagnostic[] = [];

  if (!spec) {
    return {
      valid: false,
      errors: [{ path: 'root', message: 'Specification is empty or contains invalid YAML syntax', severity: 'error', line: 1 }]
    };
  }

  // 1. Root Attribute Validation
  if (!spec.id || typeof spec.id !== 'string') {
    const loc = findLineInYaml(rawYaml || '', 'id:');
    errors.push({ path: 'id', message: 'Dashboard "id" is required (e.g. id: "retail-analytics")', severity: 'error', line: loc.line });
  }

  if (!spec.title || typeof spec.title !== 'string') {
    const loc = findLineInYaml(rawYaml || '', 'title:');
    errors.push({ path: 'title', message: 'Dashboard "title" is required', severity: 'error', line: loc.line });
  }

  if (spec.theme && !VALID_THEMES.includes(spec.theme)) {
    const loc = findLineInYaml(rawYaml || '', 'theme:', spec.theme);
    const suggestion = findClosestMatch(spec.theme, VALID_THEMES);
    errors.push({
      path: 'theme',
      message: `Invalid theme "${spec.theme}".${suggestion ? ` Did you mean "${suggestion}"?` : ''} Valid themes: [${VALID_THEMES.join(', ')}]`,
      severity: 'warning',
      line: loc.line,
      suggestion: suggestion || undefined,
      fixAction: suggestion ? { label: `Replace with "${suggestion}"`, replacement: suggestion, targetString: spec.theme } : undefined
    });
  }

  // 2. Data Sources Validation & Typo Detection
  if (!spec.data_sources || !Array.isArray(spec.data_sources) || spec.data_sources.length === 0) {
    const loc = findLineInYaml(rawYaml || '', 'data_sources:');
    errors.push({ path: 'data_sources', message: 'At least one data source must be defined under "data_sources"', severity: 'error', line: loc.line });
  } else {
    const seenDsIds = new Set<string>();
    spec.data_sources.forEach((ds: any, index: number) => {
      const pathPrefix = `data_sources[${index}]`;

      if (!ds.id) {
        errors.push({ path: `${pathPrefix}.id`, message: 'Data source must declare an "id"', severity: 'error' });
      } else if (seenDsIds.has(ds.id)) {
        const loc = findLineInYaml(rawYaml || '', 'id:', ds.id);
        errors.push({ path: `${pathPrefix}.id`, message: `Duplicate data source id "${ds.id}"`, severity: 'error', line: loc.line });
      } else {
        seenDsIds.add(ds.id);
      }

      if (!ds.type) {
        errors.push({ path: `${pathPrefix}.type`, message: 'Data source must specify a "type"', severity: 'error' });
      } else if (!VALID_DATA_SOURCE_TYPES.includes(ds.type)) {
        const loc = findLineInYaml(rawYaml || '', 'type:', ds.type);
        const suggestion = findClosestMatch(ds.type, VALID_DATA_SOURCE_TYPES);
        errors.push({
          path: `${pathPrefix}.type`,
          message: `Invalid data source type "${ds.type}".${suggestion ? ` Did you mean "${suggestion}"?` : ''} Allowed types: [${VALID_DATA_SOURCE_TYPES.join(', ')}]`,
          severity: 'error',
          line: loc.line,
          suggestion: suggestion || undefined,
          fixAction: suggestion ? { label: `Fix type to "${suggestion}"`, replacement: suggestion, targetString: ds.type } : undefined
        });
      }
    });
  }

  const declaredDataSources = new Set((spec.data_sources || []).map((ds: any) => ds.id));
  const declaredFilters = new Set((spec.filters || []).map((f: any) => f.id));

  // 3. Filters Validation
  if (spec.filters && Array.isArray(spec.filters)) {
    spec.filters.forEach((filter: any, index: number) => {
      const pathPrefix = `filters[${index}] (${filter.id || index})`;
      if (!filter.id) {
        errors.push({ path: `${pathPrefix}.id`, message: 'Filter must have an "id"', severity: 'error' });
      }
      if (filter.type && !VALID_FILTER_TYPES.includes(filter.type)) {
        const loc = findLineInYaml(rawYaml || '', 'type:', filter.type);
        const suggestion = findClosestMatch(filter.type, VALID_FILTER_TYPES);
        errors.push({
          path: `${pathPrefix}.type`,
          message: `Invalid filter type "${filter.type}".${suggestion ? ` Did you mean "${suggestion}"?` : ''} Allowed: [${VALID_FILTER_TYPES.join(', ')}]`,
          severity: 'error',
          line: loc.line,
          suggestion: suggestion || undefined,
          fixAction: suggestion ? { label: `Fix filter type to "${suggestion}"`, replacement: suggestion, targetString: filter.type } : undefined
        });
      }
    });
  }

  // 4. Widgets Validation & Semantic Checks
  if (!spec.widgets || !Array.isArray(spec.widgets) || spec.widgets.length === 0) {
    const loc = findLineInYaml(rawYaml || '', 'widgets:');
    errors.push({ path: 'widgets', message: 'Dashboard must contain at least one widget', severity: 'error', line: loc.line });
  } else {
    const seenWidgetIds = new Set<string>();

    spec.widgets.forEach((widget: any, index: number) => {
      const pathPrefix = `widgets[${index}] (${widget.id || index})`;

      // Unique ID check
      if (!widget.id) {
        errors.push({ path: `${pathPrefix}.id`, message: 'Widget must declare an "id"', severity: 'error' });
      } else if (seenWidgetIds.has(widget.id)) {
        const loc = findLineInYaml(rawYaml || '', 'id:', widget.id);
        errors.push({ path: `${pathPrefix}.id`, message: `Duplicate widget id "${widget.id}" detected`, severity: 'error', line: loc.line });
      } else {
        seenWidgetIds.add(widget.id);
      }

      // Type check & typo suggestion
      if (!widget.type) {
        errors.push({ path: `${pathPrefix}.type`, message: 'Widget must specify a "type"', severity: 'error' });
      } else if (!VALID_WIDGET_TYPES.includes(widget.type)) {
        const loc = findLineInYaml(rawYaml || '', 'type:', widget.type);
        const suggestion = findClosestMatch(widget.type, VALID_WIDGET_TYPES);
        errors.push({
          path: `${pathPrefix}.type`,
          message: `Invalid widget type "${widget.type}".${suggestion ? ` Did you mean "${suggestion}"?` : ''} Supported: [${VALID_WIDGET_TYPES.join(', ')}]`,
          severity: 'error',
          line: loc.line,
          suggestion: suggestion || undefined,
          fixAction: suggestion ? { label: `Fix widget type to "${suggestion}"`, replacement: suggestion, targetString: widget.type } : undefined
        });
      }

      // Source reference check
      if (!widget.source) {
        errors.push({ path: `${pathPrefix}.source`, message: 'Widget must specify a "source" data source id', severity: 'error' });
      } else if (!declaredDataSources.has(widget.source) && widget.source !== 'mock') {
        const loc = findLineInYaml(rawYaml || '', 'source:', widget.source);
        const availableSources = Array.from(declaredDataSources);
        const suggestion = findClosestMatch(widget.source, availableSources);
        errors.push({
          path: `${pathPrefix}.source`,
          message: `Data source "${widget.source}" is not declared in data_sources.${suggestion ? ` Did you mean "${suggestion}"?` : ''} Declared sources: [${availableSources.join(', ')}]`,
          severity: 'error',
          line: loc.line,
          suggestion: suggestion || undefined,
          fixAction: suggestion ? { label: `Fix source to "${suggestion}"`, replacement: suggestion, targetString: widget.source } : undefined
        });
      }

      // Grid System Width check (1-12 columns)
      if (!widget.position || typeof widget.position.w !== 'number') {
        errors.push({ path: `${pathPrefix}.position.w`, message: 'Widget position width "w" (1-12) is required', severity: 'error' });
      } else if (widget.position.w < 1 || widget.position.w > 12) {
        const loc = findLineInYaml(rawYaml || '', 'w:', String(widget.position.w));
        errors.push({
          path: `${pathPrefix}.position.w`,
          message: `Widget width "w: ${widget.position.w}" exceeds 12-column grid system (must be between 1 and 12)`,
          severity: 'error',
          line: loc.line
        });
      }

      // Format String Validation
      if (widget.format && typeof widget.format === 'string') {
        const isValidFormat = STANDARD_FORMAT_PATTERNS.some(p => widget.format.includes(p) || widget.format === p);
        if (!isValidFormat && !widget.format.includes('$') && !widget.format.includes('%') && !widget.format.includes('0')) {
          const loc = findLineInYaml(rawYaml || '', 'format:', widget.format);
          errors.push({
            path: `${pathPrefix}.format`,
            message: `Unrecognized format pattern "${widget.format}". Standard formats: [${STANDARD_FORMAT_PATTERNS.join(', ')}]`,
            severity: 'warning',
            line: loc.line
          });
        }
      }

      // Interaction reference check
      if (widget.interaction?.on_click_filter?.filter_id) {
        const targetFilterId = widget.interaction.on_click_filter.filter_id;
        if (!declaredFilters.has(targetFilterId)) {
          const loc = findLineInYaml(rawYaml || '', 'filter_id:', targetFilterId);
          errors.push({
            path: `${pathPrefix}.interaction`,
            message: `Referenced filter_id "${targetFilterId}" is not defined in filters list: [${Array.from(declaredFilters).join(', ')}]`,
            severity: 'error',
            line: loc.line
          });
        }
      }
    });
  }

  return {
    valid: errors.filter(e => e.severity === 'error').length === 0,
    errors
  };
}
