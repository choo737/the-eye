/**
 * Unified Declarative Formatter for Numbers, Currencies, Percentages, and Abbreviations.
 * Configurable directly in YAML, JSON, or XML.
 */
export function formatValue(value: any, formatString?: string): string {
  if (value === null || value === undefined || value === '') return '-';

  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]+/g, ''));
  if (isNaN(num)) return String(value);

  const fmt = (formatString || '').trim();

  // 1. Percentage formats (e.g. "0.0%", "0%", "0.00%")
  if (fmt.endsWith('%')) {
    const decimalsMatch = fmt.match(/\.(\d+)/);
    const decimals = decimalsMatch ? decimalsMatch[1].length : 0;
    const scaled = num > 1.5 ? num : num * 100;
    return `${scaled.toFixed(decimals)}%`;
  }

  // 2. Abbreviated metric formats (e.g. "$0.0a", "$0.00a", "0.0a", "$0a")
  if (fmt.endsWith('a')) {
    const hasDollar = fmt.startsWith('$');
    const decimalsMatch = fmt.match(/\.(\d+)/);
    const decimals = decimalsMatch ? decimalsMatch[1].length : 1;
    const abs = Math.abs(num);
    const sign = num < 0 ? '-' : '';

    let formattedNumber = '';
    if (abs >= 1_000_000_000) {
      formattedNumber = `${(abs / 1_000_000_000).toFixed(decimals)}B`;
    } else if (abs >= 1_000_000) {
      formattedNumber = `${(abs / 1_000_000).toFixed(decimals)}M`;
    } else if (abs >= 1_000) {
      formattedNumber = `${(abs / 1_000).toFixed(decimals)}k`;
    } else {
      formattedNumber = abs.toFixed(decimals);
    }

    return `${sign}${hasDollar ? '$' : ''}${formattedNumber}`;
  }

  // 3. Thousand separator formats (e.g. "$0,0", "$0,0.00", "0,0", "0,0.0")
  if (fmt.includes(',')) {
    const hasDollar = fmt.startsWith('$');
    const decimalsMatch = fmt.match(/\.(\d+)/);
    const decimals = decimalsMatch ? decimalsMatch[1].length : 0;
    const parts = num.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formatted = parts.join('.');
    return `${hasDollar ? '$' : ''}${formatted}`;
  }

  // 4. Basic currency format (e.g. "$0.00", "$0")
  if (fmt.startsWith('$')) {
    const decimalsMatch = fmt.match(/\.(\d+)/);
    const decimals = decimalsMatch ? decimalsMatch[1].length : 2;
    const parts = num.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `$${parts.join('.')}`;
  }

  // 5. Default fallback: Clean Thousand Separator
  return num.toLocaleString('en-US');
}
