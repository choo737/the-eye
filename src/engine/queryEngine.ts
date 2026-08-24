import { WidgetSpec } from '../core/types';

export interface FilterState {
  [filterId: string]: any;
}

export function executeWidgetQuery(widget: WidgetSpec, activeFilters: FilterState): any {
  // Normalize filter inputs
  const rawRegion = activeFilters['store_region'] || activeFilters['region'] || 'All Regions';
  const selectedRegions = Array.isArray(rawRegion) ? rawRegion : [rawRegion];
  const isAllRegions = selectedRegions.includes('All Regions') || selectedRegions.length === 0;

  const rawDivision = activeFilters['product_division'] || activeFilters['division'] || 'All Divisions';
  const isAllDivisions = rawDivision === 'All Divisions';

  const rawTier = activeFilters['customer_tier'] || 'All Tiers';
  const isAllTiers = rawTier === 'All Tiers';

  const rawChannel = activeFilters['channel'] || 'All Channels';
  const selectedChannels = Array.isArray(rawChannel) ? rawChannel : [rawChannel];
  const isAllChannels = selectedChannels.includes('All Channels') || selectedChannels.length === 0;

  const rawCategory = activeFilters['category'] || 'All Categories';
  const isAllCategories = rawCategory === 'All Categories';

  const timeRange = activeFilters['time_range'] || '2026-YTD';
  let timeMultiplier = 1.0;
  if (timeRange === 'last_30_days') timeMultiplier = 0.28;
  else if (timeRange === 'last_90_days') timeMultiplier = 0.65;
  else if (timeRange === 'all_time') timeMultiplier = 1.45;

  // Region multiplier
  let regionMultiplier = 1.0;
  if (!isAllRegions) {
    let sum = 0;
    selectedRegions.forEach(r => {
      const regStr = String(r).toLowerCase();
      if (regStr.includes('klang') || regStr.includes('north america')) sum += 0.48;
      else if (regStr.includes('northern') || regStr.includes('emea')) sum += 0.26;
      else if (regStr.includes('southern') || regStr.includes('apac')) sum += 0.18;
      else if (regStr.includes('east') || regStr.includes('latam')) sum += 0.08;
      else sum += 0.25;
    });
    regionMultiplier = Math.min(1.0, Math.max(0.1, sum));
  }

  // Division multiplier
  let divisionMultiplier = 1.0;
  if (!isAllDivisions) {
    const divStr = String(rawDivision).toLowerCase();
    if (divStr.includes('fresh') || divStr.includes('rte')) divisionMultiplier = 0.32;
    else if (divStr.includes('beverage') || divStr.includes('slurpee')) divisionMultiplier = 0.28;
    else if (divStr.includes('snack')) divisionMultiplier = 0.22;
    else if (divStr.includes('tobacco')) divisionMultiplier = 0.18;
    else divisionMultiplier = 0.4;
  }

  // Tier multiplier
  let tierMultiplier = 1.0;
  if (!isAllTiers) {
    if (rawTier === 'Enterprise') tierMultiplier = 0.65;
    else if (rawTier === 'Mid-Market') tierMultiplier = 0.25;
    else if (rawTier === 'Startup / Pro') tierMultiplier = 0.10;
  }

  // Channel multiplier
  let channelMultiplier = 1.0;
  if (!isAllChannels) {
    channelMultiplier = Math.max(0.2, selectedChannels.length * 0.25);
  }

  const compositeMultiplier = regionMultiplier * divisionMultiplier * tierMultiplier * channelMultiplier * timeMultiplier;

  // -------------------------------------------------------------
  // 🏪 7-ELEVEN BIGQUERY WIDGETS
  // -------------------------------------------------------------
  if (widget.id === 'kpi_pos_sales') {
    return {
      value: 78450000 * compositeMultiplier,
      target: `$${(85.0 * compositeMultiplier).toFixed(1)}M`,
      sparklineData: [58, 62, 65, 71, 74, 76.5, 78.45].map(v => +(v * compositeMultiplier).toFixed(2))
    };
  }

  if (widget.id === 'kpi_basket_size') {
    const abv = 16.48 * (divisionMultiplier > 0.8 ? 1 : 1.15) * (isAllRegions ? 1 : 1.05);
    return {
      value: abv,
      sparklineData: [13.2, 13.8, 14.5, 15.1, 15.8, +(abv).toFixed(2)]
    };
  }

  if (widget.id === 'kpi_store_count') {
    let count = 2580;
    if (!isAllRegions) {
      count = Math.round(2580 * regionMultiplier);
    }
    return {
      value: count,
      sparklineData: [Math.round(count * 0.9), Math.round(count * 0.94), Math.round(count * 0.97), count]
    };
  }

  if (widget.id === 'kpi_rte_share') {
    const rtePct = isAllDivisions ? 28.6 : (rawDivision.includes('Fresh') ? 100 : 8.4);
    return {
      value: rtePct,
      sparklineData: [21.0, 22.8, 24.5, 26.0, 27.4, rtePct]
    };
  }

  if (widget.id === 'hourly_pos_velocity') {
    return {
      categories: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'],
      series: [
        { name: 'Store Sales ($)', data: [42, 115, 168, 280, 210, 195, 310, 290, 185, 95].map(v => +(v * 1000 * compositeMultiplier).toFixed(0)) },
        { name: 'Customer Count', data: [320, 890, 1250, 2100, 1650, 1540, 2450, 2200, 1400, 750].map(v => Math.round(v * compositeMultiplier)) }
      ]
    };
  }

  if (widget.id === 'division_share_donut') {
    let slices = [
      { name: 'Fresh Food & RTE (Onigiri/Sandwiches)', value: Math.round(22400000 * regionMultiplier * timeMultiplier) },
      { name: 'Beverages & Slurpee', value: Math.round(19800000 * regionMultiplier * timeMultiplier) },
      { name: 'Snacks & Confectionery', value: Math.round(15600000 * regionMultiplier * timeMultiplier) },
      { name: 'Tobacco & Core Services', value: Math.round(12800000 * regionMultiplier * timeMultiplier) },
      { name: 'Personal Care & General', value: Math.round(7850000 * regionMultiplier * timeMultiplier) }
    ];
    if (!isAllDivisions) {
      slices = slices.filter(s => s.name.toLowerCase().includes(rawDivision.toLowerCase().slice(0, 5)));
      if (slices.length === 0) {
        slices = [{ name: rawDivision, value: Math.round(25000000 * compositeMultiplier) }];
      }
    }
    return { data: slices };
  }

  if (widget.id === 'regional_sales_bar') {
    let clusters = [
      { name: 'Klang Valley / Central', actual: 32.5, target: 34.0 },
      { name: 'Northern Region', actual: 18.2, target: 19.0 },
      { name: 'Southern Region', actual: 14.6, target: 15.0 },
      { name: 'East Coast & Islands', actual: 8.4, target: 9.0 },
      { name: 'Sabah & Sarawak', actual: 4.75, target: 5.0 }
    ];

    if (!isAllRegions) {
      clusters = clusters.filter(c => selectedRegions.some(sr => c.name.toLowerCase().includes(String(sr).toLowerCase().slice(0, 5))));
      if (clusters.length === 0) clusters = [{ name: selectedRegions[0], actual: 20 * compositeMultiplier, target: 22 * compositeMultiplier }];
    }

    return {
      categories: clusters.map(c => c.name),
      series: [
        { name: 'Actual Revenue', data: clusters.map(c => +(c.actual * 1000000 * divisionMultiplier * timeMultiplier).toFixed(0)) },
        { name: 'Target Revenue', data: clusters.map(c => +(c.target * 1000000 * divisionMultiplier * timeMultiplier).toFixed(0)) }
      ]
    };
  }

  if (widget.id === '7eleven_radar') {
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
  }

  if (widget.id === 'store_performance_table') {
    const allStoreRows = [
      { store_id: '7E-1082', store_name: 'KLCC Twin Towers Concourse', region: 'Klang Valley / Central', daily_sales: Math.round(38400 * divisionMultiplier * timeMultiplier), avg_basket: 24.50, compliance: 'Healthy / Audited', pos_terminal_count: 4 },
      { store_id: '7E-2041', store_name: 'Mid Valley Megamall North Court', region: 'Klang Valley / Central', daily_sales: Math.round(31200 * divisionMultiplier * timeMultiplier), avg_basket: 21.80, compliance: 'Healthy / Audited', pos_terminal_count: 3 },
      { store_id: '7E-0492', store_name: 'Gurney Plaza Waterfront', region: 'Northern Region', daily_sales: Math.round(24500 * divisionMultiplier * timeMultiplier), avg_basket: 19.20, compliance: 'Healthy / Audited', pos_terminal_count: 2 },
      { store_id: '7E-3118', store_name: 'JB City Square Customs Hub', region: 'Southern Region', daily_sales: Math.round(28900 * divisionMultiplier * timeMultiplier), avg_basket: 22.40, compliance: 'Healthy / Audited', pos_terminal_count: 3 },
      { store_id: '7E-0842', store_name: 'KLIA2 Departure Hall Terminal', region: 'Klang Valley / Central', daily_sales: Math.round(42100 * divisionMultiplier * timeMultiplier), avg_basket: 29.80, compliance: 'Healthy / Audited', pos_terminal_count: 4 },
      { store_id: '7E-1934', store_name: 'Ipoh Old Town Heritage', region: 'Northern Region', daily_sales: Math.round(16800 * divisionMultiplier * timeMultiplier), avg_basket: 15.60, compliance: 'Low Stock Alert', pos_terminal_count: 2 },
      { store_id: '7E-4421', store_name: 'Kuantan Teluk Cempedak Beach', region: 'East Coast & Islands', daily_sales: Math.round(19500 * divisionMultiplier * timeMultiplier), avg_basket: 18.20, compliance: 'Healthy / Audited', pos_terminal_count: 2 },
      { store_id: '7E-5512', store_name: 'Kuching Waterfront Heritage', region: 'East Coast & Islands', daily_sales: Math.round(21400 * divisionMultiplier * timeMultiplier), avg_basket: 20.10, compliance: 'Healthy / Audited', pos_terminal_count: 3 }
    ];

    let filteredRows = allStoreRows;
    if (!isAllRegions) {
      filteredRows = filteredRows.filter(row => 
        selectedRegions.some(sr => row.region.toLowerCase().includes(String(sr).toLowerCase().slice(0, 5)))
      );
    }

    return { rows: filteredRows };
  }

  // -------------------------------------------------------------
  // 📈 SAAS EXECUTIVE DASHBOARD WIDGETS
  // -------------------------------------------------------------
  if (widget.id === 'kpi_arr') {
    return {
      value: 48200000 * compositeMultiplier,
      target: `$${(52.0 * compositeMultiplier).toFixed(1)}M`,
      sparklineData: [32, 35, 38, 41, 44, 46.5, 48.2].map(v => +(v * compositeMultiplier).toFixed(1))
    };
  }

  if (widget.id === 'kpi_nrr') {
    return {
      value: +(124.5 * (tierMultiplier > 0.8 ? 1 : 0.95)).toFixed(1),
      target: '120.0%',
      sparklineData: [118, 119.5, 121, 122, 123.8, 124.5]
    };
  }

  if (widget.id === 'kpi_cac_payback') {
    return {
      value: 11.4,
      target: '12.0 mos',
      sparklineData: [15.2, 14.1, 13.5, 12.8, 12.0, 11.4]
    };
  }

  if (widget.id === 'kpi_active_accounts') {
    return {
      value: Math.round(1480 * compositeMultiplier),
      sparklineData: [920, 1040, 1180, 1290, 1390, 1480].map(v => Math.round(v * compositeMultiplier))
    };
  }

  if (widget.id === 'arr_trend_chart') {
    return {
      categories: ['Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26 (F)', 'Sep 26 (F)'],
      series: [
        { name: 'Actual ARR', data: [34, 36, 38.5, 41.2, 44.0, 46.8, 48.2, null, null].map(v => v ? +(v * compositeMultiplier).toFixed(1) : null) },
        { name: 'Forecast ARR', data: [null, null, null, null, null, null, 48.2, 50.8, 53.5].map(v => v ? +(v * compositeMultiplier).toFixed(1) : null) },
        { name: 'Target', data: [35, 37, 39, 41.5, 44, 46.5, 49, 51.5, 54].map(v => +(v * compositeMultiplier).toFixed(1)) }
      ]
    };
  }

  if (widget.id === 'tier_donut') {
    let tiers = [
      { name: 'Enterprise ($100k+)', value: Math.round(28400000 * regionMultiplier * timeMultiplier) },
      { name: 'Mid-Market ($25k-$100k)', value: Math.round(14600000 * regionMultiplier * timeMultiplier) },
      { name: 'Startup / Pro ($5k-$25k)', value: Math.round(5200000 * regionMultiplier * timeMultiplier) }
    ];
    if (!isAllTiers) {
      tiers = tiers.filter(t => t.name.toLowerCase().includes(rawTier.toLowerCase().slice(0, 5)));
    }
    return { data: tiers };
  }

  if (widget.id === 'regional_bar') {
    let regions = [
      { name: 'North America', newArr: 14.2, expArr: 11.8 },
      { name: 'EMEA', newArr: 7.8, expArr: 5.2 },
      { name: 'APAC', newArr: 4.5, expArr: 2.1 },
      { name: 'LATAM', newArr: 2.1, expArr: 0.5 }
    ];
    if (!isAllRegions) {
      regions = regions.filter(r => selectedRegions.some(sr => r.name.toLowerCase().includes(String(sr).toLowerCase().slice(0, 4))));
    }
    return {
      categories: regions.map(r => r.name),
      series: [
        { name: 'New ARR', data: regions.map(r => +(r.newArr * tierMultiplier * timeMultiplier).toFixed(1)) },
        { name: 'Expansion ARR', data: regions.map(r => +(r.expArr * tierMultiplier * timeMultiplier).toFixed(1)) }
      ]
    };
  }

  if (widget.id === 'acquisition_funnel') {
    return {
      data: [
        { name: 'Website Visitors (MQL)', value: Math.round(450000 * compositeMultiplier) },
        { name: 'Product Signups (PQL)', value: Math.round(48000 * compositeMultiplier) },
        { name: 'Sales Qualified (SQL)', value: Math.round(8400 * compositeMultiplier) },
        { name: 'Executive Demo Done', value: Math.round(3200 * compositeMultiplier) },
        { name: 'Proposal Sent', value: Math.round(1450 * compositeMultiplier) },
        { name: 'Closed Won Contract', value: Math.round(620 * compositeMultiplier) }
      ]
    };
  }

  if (widget.id === 'top_accounts_table') {
    const allAccounts = [
      { account_name: 'Acme Global Corp', region: 'North America', tier: 'Enterprise', arr: Math.round(1250000 * timeMultiplier), nrr: 135.2, health_score: 'Excellent', renewal_date: '2026-11-15' },
      { account_name: 'Nexis Financial Group', region: 'EMEA', tier: 'Enterprise', arr: Math.round(980000 * timeMultiplier), nrr: 128.0, health_score: 'Good', renewal_date: '2026-12-01' },
      { account_name: 'Starlight Retail Inc', region: 'North America', tier: 'Enterprise', arr: Math.round(840000 * timeMultiplier), nrr: 142.5, health_score: 'Excellent', renewal_date: '2027-01-20' },
      { account_name: 'Vertex Cloud Tech', region: 'APAC', tier: 'Enterprise', arr: Math.round(650000 * timeMultiplier), nrr: 118.4, health_score: 'Good', renewal_date: '2026-10-10' },
      { account_name: 'Apex Mobility', region: 'EMEA', tier: 'Mid-Market', arr: Math.round(320000 * timeMultiplier), nrr: 112.0, health_score: 'Warning', renewal_date: '2026-09-30' },
      { account_name: 'Zenith Logistics', region: 'LATAM', tier: 'Mid-Market', arr: Math.round(290000 * timeMultiplier), nrr: 122.8, health_score: 'Good', renewal_date: '2027-02-14' }
    ];

    let filtered = allAccounts;
    if (!isAllRegions) {
      filtered = filtered.filter(a => selectedRegions.some(sr => a.region.toLowerCase().includes(String(sr).toLowerCase().slice(0, 4))));
    }
    if (!isAllTiers) {
      filtered = filtered.filter(a => a.tier.toLowerCase() === rawTier.toLowerCase());
    }

    return { rows: filtered };
  }

  // Fallback
  return {
    value: 1250000 * compositeMultiplier,
    categories: ['Q1', 'Q2', 'Q3', 'Q4'],
    series: [{ name: 'Metric', data: [120, 150, 180, 220].map(v => v * compositeMultiplier) }]
  };
}
