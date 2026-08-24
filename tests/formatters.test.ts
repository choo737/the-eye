import { describe, it, expect } from 'vitest';
import { formatValue } from '../src/utils/formatters';

describe('Unified Declarative Formatter (YAML/JSON/XML)', () => {
  it('should format Malaysian Ringgit (RM) with thousand separators and abbreviations', () => {
    expect(formatValue(1800000, 'RM 0,0')).toBe('RM 1,800,000');
    expect(formatValue(38400, 'RM 0,0')).toBe('RM 38,400');
    expect(formatValue(85000000, 'RM 0.0a')).toBe('RM 85.0M');
    expect(formatValue(15600000, 'RM 0.0a')).toBe('RM 15.6M');
    expect(formatValue(38400, 'RM 0.0a')).toBe('RM 38.4k');
  });

  it('should format other global currencies (USD, EUR, SGD, JPY)', () => {
    expect(formatValue(1800000, '$0,0')).toBe('$1,800,000');
    expect(formatValue(1800000, 'EUR 0,0')).toBe('EUR 1,800,000');
    expect(formatValue(1800000, 'SGD 0,0')).toBe('SGD 1,800,000');
    expect(formatValue(1800000, '¥0,0')).toBe('¥1,800,000');
  });

  it('should format pure numbers with thousand separators (0,0)', () => {
    expect(formatValue(1800000, '0,0')).toBe('1,800,000');
    expect(formatValue(9440, '0,0')).toBe('9,440');
  });

  it('should format percentages (0.0%, 0%)', () => {
    expect(formatValue(14.2, '0.0%')).toBe('14.2%');
    expect(formatValue(0.142, '0.0%')).toBe('14.2%');
    expect(formatValue(100, '0%')).toBe('100%');
  });

  it('should format with dashboard-level currency configuration', () => {
    const rmCurrency = { symbol: 'RM', code: 'MYR', position: 'prefix' as const, space: true };
    expect(formatValue(1800000, '$0,0', rmCurrency)).toBe('RM 1,800,000');
    expect(formatValue(85000000, '$0.0a', rmCurrency)).toBe('RM 85.0M');
  });

  it('should format donut chart category values correctly', () => {
    // Specifically test the user report where Snacks & Confectionery was unformatted 15600000
    const rawVal = 15600000;
    const formattedWithAbbr = formatValue(rawVal, 'RM 0.0a');
    expect(formattedWithAbbr).toBe('RM 15.6M');

    const formattedWithCommas = formatValue(rawVal, 'RM 0,0');
    expect(formattedWithCommas).toBe('RM 15,600,000');
  });
});
