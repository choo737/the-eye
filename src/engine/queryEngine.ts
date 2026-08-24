import { WidgetSpec, QueryResult } from '../core/types';

export interface FilterState {
  [filterId: string]: any;
}

export function executeWidgetQuery(widget: WidgetSpec, activeFilters: FilterState): any {
  // In-memory smart OLAP query processor for declarative widgets
  const region = activeFilters['region'] || 'All Regions';
  const tier = activeFilters['customer_tier'] || 'All Tiers';
  const channel = activeFilters['channel'] || 'All Channels';
  const category = activeFilters['category'] || 'All Categories';

  // Multipliers based on filters to simulate interactive cross-filtering
  let multiplier = 1.0;
  if (Array.isArray(region) && !region.includes('All Regions')) {
    multiplier *= (region.length * 0.35);
  } else if (typeof region === 'string' && region !== 'All Regions') {
    multiplier *= (region === 'North America' ? 0.55 : region === 'EMEA' ? 0.25 : 0.2);
  }
  
  if (tier && tier !== 'All Tiers') {
    multiplier *= (tier === 'Enterprise' ? 0.65 : tier === 'Mid-Market' ? 0.25 : 0.1);
  }

  if (category && category !== 'All Categories') {
    multiplier *= 0.45;
  }

  switch (widget.id) {
    // SaaS KPIs
    case 'kpi_arr':
      return {
        value: 48200000 * multiplier,
        target: 52000000 * multiplier,
        sparklineData: [32, 35, 38, 41, 44, 46.5, 48.2].map(v => v * multiplier)
      };
    case 'kpi_nrr':
      return {
        value: 124.5,
        target: 120.0,
        sparklineData: [118, 119.5, 121, 122, 123.8, 124.5]
      };
    case 'kpi_cac_payback':
      return {
        value: 11.4,
        target: 12.0,
        sparklineData: [15.2, 14.1, 13.5, 12.8, 12.0, 11.4]
      };
    case 'kpi_active_accounts':
      return {
        value: Math.round(1480 * multiplier),
        sparklineData: [920, 1040, 1180, 1290, 1390, 1480].map(v => Math.round(v * multiplier))
      };

    // E-Commerce KPIs
    case 'kpi_gmv':
      return {
        value: 14250000 * multiplier,
        target: 15000000 * multiplier,
        sparklineData: [1.8, 2.1, 2.0, 2.3, 2.6, 2.8, 3.1].map(v => v * 4.5 * multiplier)
      };
    case 'kpi_orders':
      return {
        value: Math.round(184200 * multiplier),
        sparklineData: [22, 24, 26, 27, 29, 31, 33].map(v => Math.round(v * 5000 * multiplier))
      };
    case 'kpi_aov':
      return {
        value: 77.36,
        sparklineData: [71, 72.5, 73.8, 74.2, 75.6, 77.36]
      };
    case 'kpi_conversion':
      return {
        value: 3.84,
        sparklineData: [3.2, 3.35, 3.4, 3.6, 3.72, 3.84]
      };

    // SaaS Charts
    case 'arr_trend_chart':
      return {
        categories: ['Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26 (F)', 'Sep 26 (F)'],
        series: [
          { name: 'Actual ARR', data: [34, 36, 38.5, 41.2, 44.0, 46.8, 48.2, null, null].map(v => v ? +(v * multiplier).toFixed(1) : null) },
          { name: 'Forecast ARR', data: [null, null, null, null, null, null, 48.2, 50.8, 53.5].map(v => v ? +(v * multiplier).toFixed(1) : null) },
          { name: 'Target', data: [35, 37, 39, 41.5, 44, 46.5, 49, 51.5, 54].map(v => +(v * multiplier).toFixed(1)) }
        ]
      };

    case 'tier_donut':
      return {
        data: [
          { name: 'Enterprise ($100k+)', value: Math.round(28400000 * multiplier) },
          { name: 'Mid-Market ($25k-$100k)', value: Math.round(14600000 * multiplier) },
          { name: 'Growth / Pro ($5k-$25k)', value: Math.round(5200000 * multiplier) }
        ]
      };

    case 'regional_bar':
      return {
        categories: ['North America', 'EMEA', 'APAC', 'LATAM'],
        series: [
          { name: 'New ARR', data: [14.2, 7.8, 4.5, 2.1].map(v => +(v * multiplier).toFixed(1)) },
          { name: 'Expansion ARR', data: [11.8, 5.2, 2.1, 0.5].map(v => +(v * multiplier).toFixed(1)) }
        ]
      };

    case 'acquisition_funnel':
      return {
        data: [
          { name: 'Website Visitors (MQL)', value: Math.round(450000 * multiplier) },
          { name: 'Product Signups (PQL)', value: Math.round(48000 * multiplier) },
          { name: 'Sales Qualified (SQL)', value: Math.round(8400 * multiplier) },
          { name: 'Executive Demo Done', value: Math.round(3200 * multiplier) },
          { name: 'Proposal Sent', value: Math.round(1450 * multiplier) },
          { name: 'Closed Won Contract', value: Math.round(620 * multiplier) }
        ]
      };

    case 'top_accounts_table':
      return {
        rows: [
          { account_name: 'Acme Global Corp', region: 'North America', tier: 'Enterprise', arr: 1250000, nrr: 135.2, health_score: 'Excellent', renewal_date: '2026-11-15' },
          { account_name: 'Nexis Financial Group', region: 'EMEA', tier: 'Enterprise', arr: 980000, nrr: 128.0, health_score: 'Good', renewal_date: '2026-12-01' },
          { account_name: 'Starlight Retail Inc', region: 'North America', tier: 'Enterprise', arr: 840000, nrr: 142.5, health_score: 'Excellent', renewal_date: '2027-01-20' },
          { account_name: 'Vertex Cloud Tech', region: 'APAC', tier: 'Enterprise', arr: 650000, nrr: 118.4, health_score: 'Good', renewal_date: '2026-10-10' },
          { account_name: 'Apex Mobility', region: 'EMEA', tier: 'Mid-Market', arr: 320000, nrr: 112.0, health_score: 'Warning', renewal_date: '2026-09-30' },
          { account_name: 'Zenith Logistics', region: 'LATAM', tier: 'Mid-Market', arr: 290000, nrr: 122.8, health_score: 'Good', renewal_date: '2027-02-14' }
        ]
      };

    // E-Commerce Intraday & Breakdown
    case 'hourly_sales_trend':
      return {
        categories: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
        series: [
          { name: 'Online Revenue', data: [12, 8, 22, 68, 145, 180, 210, 160].map(v => +(v * 1000 * multiplier).toFixed(0)) },
          { name: 'In-Store Revenue', data: [0, 0, 5, 45, 110, 135, 175, 80].map(v => +(v * 1000 * multiplier).toFixed(0)) }
        ]
      };

    case 'channel_share_pie':
      return {
        data: [
          { name: 'Direct Web Store', value: Math.round(6800000 * multiplier) },
          { name: 'Amazon Marketplace', value: Math.round(4100000 * multiplier) },
          { name: 'TikTok Shop & Social', value: Math.round(2100000 * multiplier) },
          { name: 'Physical Retail', value: Math.round(1250000 * multiplier) }
        ]
      };

    case 'category_performance_bar':
      return {
        categories: ['Electronics', 'Apparel', 'Home & Kitchen', 'Beauty', 'Sports & Outdoors'],
        series: [
          { name: 'GMV', data: [5.8, 3.9, 2.4, 1.4, 0.75].map(v => +(v * 1000000 * multiplier).toFixed(0)) },
          { name: 'Gross Profit', data: [2.1, 1.8, 1.1, 0.78, 0.35].map(v => +(v * 1000000 * multiplier).toFixed(0)) }
        ]
      };

    case 'inventory_radar':
      return {
        indicators: [
          { name: 'Fulfillment Speed', max: 100 },
          { name: 'In-Stock Rate', max: 100 },
          { name: 'On-Time Delivery', max: 100 },
          { name: 'Low Return Rate', max: 100 },
          { name: 'Warehouse Turn', max: 100 }
        ],
        series: [
          { name: 'Performance Metric', value: [92, 88, 95, 84, 90] }
        ]
      };

    case 'top_products_table':
      return {
        rows: [
          { product_name: 'Pro Wireless ANC Headphones v3', sku: 'AUDIO-882-BLK', units_sold: 14200, revenue: 2840000, stock_status: 'Healthy', margin: 48.5 },
          { product_name: 'Ultra Ergonomic Standing Desk', sku: 'FURN-102-OAK', units_sold: 6800, revenue: 2040000, stock_status: 'Healthy', margin: 54.0 },
          { product_name: 'Smart 4K Laser Projector', sku: 'OPT-550-WHT', units_sold: 3200, revenue: 1920000, stock_status: 'Low Stock Alert', margin: 38.2 },
          { product_name: 'Titanium Mechanical Keyboard', sku: 'KEY-900-RGB', units_sold: 9400, revenue: 1410000, stock_status: 'Healthy', margin: 62.0 },
          { product_name: 'MagSafe Multi-Device Fast Hub', sku: 'CHG-331-ALU', units_sold: 18900, revenue: 1134000, stock_status: 'Critical Stock', margin: 41.5 }
        ]
      };

    default:
      // Generic fallback data generator
      return {
        value: 1250000 * multiplier,
        categories: ['Q1', 'Q2', 'Q3', 'Q4'],
        series: [{ name: 'Metric', data: [120, 150, 180, 220].map(v => v * multiplier) }]
      };
  }
}
