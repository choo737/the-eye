import { WidgetSpec } from '../core/types';

export interface FilterState {
  [filterId: string]: any;
}

export function executeWidgetQuery(widget: WidgetSpec, activeFilters: FilterState): any {
  const region = activeFilters['store_region'] || activeFilters['region'] || 'All Regions';
  const division = activeFilters['product_division'] || 'All Divisions';
  const tier = activeFilters['customer_tier'] || 'All Tiers';

  let multiplier = 1.0;
  if (Array.isArray(region) && !region.includes('All Regions')) {
    multiplier *= (region.length * 0.35);
  } else if (typeof region === 'string' && region !== 'All Regions') {
    multiplier *= 0.6;
  }
  
  if (division && division !== 'All Divisions') {
    multiplier *= 0.55;
  }

  switch (widget.id) {
    // 🏪 7-Eleven BigQuery KPIs
    case 'kpi_pos_sales':
      return {
        value: 78450000 * multiplier,
        target: '$85.0M',
        sparklineData: [58, 62, 65, 71, 74, 76.5, 78.45].map(v => v * multiplier)
      };
    case 'kpi_basket_size':
      return {
        value: 16.48,
        sparklineData: [13.2, 13.8, 14.5, 15.1, 15.8, 16.48]
      };
    case 'kpi_store_count':
      return {
        value: Math.round(2580 * (multiplier > 0.5 ? 1 : multiplier * 1.5)),
        sparklineData: [2350, 2410, 2460, 2510, 2550, 2580]
      };
    case 'kpi_rte_share':
      return {
        value: 28.6,
        sparklineData: [21.0, 22.8, 24.5, 26.0, 27.4, 28.6]
      };

    // 🏪 7-Eleven Charts
    case 'hourly_pos_velocity':
      return {
        categories: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'],
        series: [
          { name: 'Store Sales ($)', data: [42, 115, 168, 280, 210, 195, 310, 290, 185, 95].map(v => +(v * 1000 * multiplier).toFixed(0)) },
          { name: 'Customer Count', data: [320, 890, 1250, 2100, 1650, 1540, 2450, 2200, 1400, 750].map(v => Math.round(v * multiplier)) }
        ]
      };

    case 'division_share_donut':
      return {
        data: [
          { name: 'Fresh Food & RTE (Onigiri/Sandwiches)', value: Math.round(22400000 * multiplier) },
          { name: 'Beverages & Slurpee', value: Math.round(19800000 * multiplier) },
          { name: 'Snacks & Confectionery', value: Math.round(15600000 * multiplier) },
          { name: 'Tobacco & Core Services', value: Math.round(12800000 * multiplier) },
          { name: 'Personal Care & General', value: Math.round(7850000 * multiplier) }
        ]
      };

    case 'regional_sales_bar':
      return {
        categories: ['Klang Valley', 'Northern Cluster', 'Southern Cluster', 'East Coast', 'Sabah & Sarawak'],
        series: [
          { name: 'Actual Revenue', data: [32.5, 18.2, 14.6, 8.4, 4.75].map(v => +(v * 1000000 * multiplier).toFixed(0)) },
          { name: 'Target Revenue', data: [34.0, 19.0, 15.0, 9.0, 5.0].map(v => +(v * 1000000 * multiplier).toFixed(0)) }
        ]
      };

    case '7eleven_radar':
      return {
        indicators: [
          { name: 'On-Shelf Availability', max: 100 },
          { name: 'Fresh Food Wastage Control', max: 100 },
          { name: 'POS Transaction Speed', max: 100 },
          { name: 'Cold Chain Compliance', max: 100 },
          { name: 'Store Audit Score', max: 100 }
        ],
        series: [
          { name: '7-Eleven Benchmark', value: [94, 86, 96, 98, 92] }
        ]
      };

    case 'store_performance_table':
      return {
        rows: [
          { store_id: '7E-1082', store_name: 'KLCC Twin Towers Concourse', region: 'Klang Valley', daily_sales: 38400, avg_basket: 24.50, compliance: 'Healthy / Audited', pos_terminal_count: 4 },
          { store_id: '7E-2041', store_name: 'Mid Valley Megamall North Court', region: 'Klang Valley', daily_sales: 31200, avg_basket: 21.80, compliance: 'Healthy / Audited', pos_terminal_count: 3 },
          { store_id: '7E-0492', store_name: 'Gurney Plaza Waterfront', region: 'Northern Region', daily_sales: 24500, avg_basket: 19.20, compliance: 'Healthy / Audited', pos_terminal_count: 2 },
          { store_id: '7E-3118', store_name: 'JB City Square Customs Hub', region: 'Southern Region', daily_sales: 28900, avg_basket: 22.40, compliance: 'Healthy / Audited', pos_terminal_count: 3 },
          { store_id: '7E-0842', store_name: 'KLIA2 Departure Hall Terminal', region: 'Klang Valley', daily_sales: 42100, avg_basket: 29.80, compliance: 'Healthy / Audited', pos_terminal_count: 4 },
          { store_id: '7E-1934', store_name: 'Ipoh Old Town Heritage', region: 'Northern Region', daily_sales: 16800, avg_basket: 15.60, compliance: 'Low Stock Alert', pos_terminal_count: 2 }
        ]
      };

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
          { account_name: 'Apex Mobility', region: 'EMEA', tier: 'Mid-Market', arr: 320000, nrr: 112.0, health_score: 'Warning', renewal_date: '2026-09-30' }
        ]
      };

    default:
      return {
        value: 1250000 * multiplier,
        categories: ['Q1', 'Q2', 'Q3', 'Q4'],
        series: [{ name: 'Metric', data: [120, 150, 180, 220].map(v => v * multiplier) }]
      };
  }
}
