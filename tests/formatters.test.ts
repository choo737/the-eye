import { describe, it, expect } from 'vitest';
import { formatValue } from '../src/utils/formatters';

describe('Unified Declarative Formatter (YAML/JSON/XML)', () => {
  it('should format currencies with thousand separators ($0,0)', () => {
    expect(formatValue(1800000, '$0,0')).toBe('$1,800,000');
    expect(formatValue(38400, '$0,0')).toBe('$38,400');
    expect(formatValue(0, '$0,0')).toBe('$0');
  });

  it('should format numbers with thousand separators (0,0)', () => {
    expect(formatValue(1800000, '0,0')).toBe('1,800,000');
    expect(formatValue(9440, '0,0')).toBe('9,440');
  });

  it('should format abbreviated metrics ($0.0a, $0.00a)', () => {
    expect(formatValue(85000000, '$0.0a')).toBe('$85.0M');
    expect(formatValue(1850000, '$0.00a')).toBe('$1.85M');
    expect(formatValue(38400, '$0.0a')).toBe('$38.4k');
  });

  it('should format percentages (0.0%, 0%)', () => {
    expect(formatValue(14.2, '0.0%')).toBe('14.2%');
    expect(formatValue(0.142, '0.0%')).toBe('14.2%');
    expect(formatValue(100, '0%')).toBe('100%');
  });

  it('should fallback gracefully on empty/invalid inputs', () => {
    expect(formatValue(null, '$0,0')).toBe('-');
    expect(formatValue(undefined, '0,0')).toBe('-');
  });
});
