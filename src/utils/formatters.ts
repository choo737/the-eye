import { CurrencySpec } from '../core/types';

const COMMON_CURRENCY_SYMBOLS = ['RM', 'MYR', 'SGD', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD', 'THB', 'IDR', 'PHP', 'VND', '$', '€', '£', '¥', '₹', '₩', '₺', '₽', 'R$'];

/**
 * Robust Declarative Formatter for Numbers, Currencies, Percentages, and Abbreviations.
 * Generically configurable across any global currency symbol (RM, $, €, £, ¥, etc.)
 */
export function formatValue(value: any, formatString?: string, defaultCurrency?: CurrencySpec): string {
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

  // Detect explicit currency prefix in format string (e.g. "RM 0,0", "$0,0", "EUR 0.0a")
  let customCurrency = '';
  let formatWithoutCurrency = fmt;

  for (const sym of COMMON_CURRENCY_SYMBOLS) {
    if (fmt.startsWith(sym)) {
      customCurrency = sym;
      formatWithoutCurrency = fmt.slice(sym.length).trim();
      break;
    }
  }

  // Override or apply dashboard-level currency if specified or if format contains generic '$'
  if (defaultCurrency?.symbol) {
    if (fmt.includes('$') || !customCurrency) {
      customCurrency = defaultCurrency.symbol;
      formatWithoutCurrency = fmt.replace('$', '').trim();
    }
  } else if (!customCurrency && fmt.includes('$')) {
    customCurrency = '$';
    formatWithoutCurrency = fmt.replace('$', '').trim();
  }

  const space = defaultCurrency?.space !== false && customCurrency.length > 1 ? ' ' : (customCurrency === 'RM' ? ' ' : '');
  const isSuffix = defaultCurrency?.position === 'suffix';

  // 2. Abbreviated metric formats (e.g. "0.0a", "0.00a", "$0.0a", "RM 0.0a")
  if (formatWithoutCurrency.endsWith('a')) {
    const decimalsMatch = formatWithoutCurrency.match(/\.(\d+)/);
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

    if (!customCurrency) return `${sign}${formattedNumber}`;
    return isSuffix
      ? `${sign}${formattedNumber}${space}${customCurrency}`
      : `${sign}${customCurrency}${space}${formattedNumber}`;
  }

  // 3. Thousand separator formats (e.g. "0,0", "0,0.00", "RM 0,0", "$0,0")
  if (formatWithoutCurrency.includes(',')) {
    const decimalsMatch = formatWithoutCurrency.match(/\.(\d+)/);
    const decimals = decimalsMatch ? decimalsMatch[1].length : 0;
    const parts = num.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formatted = parts.join('.');

    if (!customCurrency) return formatted;
    return isSuffix
      ? `${formatted}${space}${customCurrency}`
      : `${customCurrency}${space}${formatted}`;
  }

  // 4. Fallback with Currency
  if (customCurrency) {
    const parts = num.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${customCurrency}${space}${parts.join('.')}`;
  }

  // 5. Default fallback: Clean Thousand Separator
  return num.toLocaleString('en-US');
}
