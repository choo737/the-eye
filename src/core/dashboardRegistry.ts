import { 
  SEVEN_ELEVEN_QLIK_BQ_YAML, 
  CIMB_BANK_BQ_YAML,
  SAAS_GROWTH_BQ_YAML,
  HEALTHCARE_OPERATIONS_BQ_YAML,
  SUPPLY_CHAIN_LOGISTICS_BQ_YAML
} from './sampleDashboards';

export interface DashboardMetadata {
  id: string;
  title: string;
  description: string;
  dataSource: string;
  dataSourceType: string;
  ownerEmail: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  yaml: string;
  permissions: Record<string, 'owner' | 'editor' | 'viewer'>;
  tags: string[];
}

export const INITIAL_DASHBOARDS: DashboardMetadata[] = [
  {
    id: 'cimb-bank-branch-intelligence',
    title: 'CIMB Bank Malaysia — Omnichannel Branch & Wealth Intelligence',
    description: 'Live BigQuery warehouse for CIMB Bank physical branches across Malaysia, CASA deposits, mortgage disbursements, and OTC transaction velocity',
    dataSource: 'the-eye-bi-platform.cimb_bank_warehouse',
    dataSourceType: 'bigquery',
    ownerEmail: 'admin@jackychoo.altostrat.com',
    ownerName: 'Jacky Choo',
    createdAt: '2026-08-24',
    updatedAt: 'Just now',
    yaml: CIMB_BANK_BQ_YAML,
    permissions: {
      'admin@jackychoo.altostrat.com': 'owner',
      'branch-banking-director@cimb.com': 'editor',
      'branch-manager@cimb.com': 'viewer'
    },
    tags: ['Banking', 'CIMB', 'BigQuery', 'ADC', 'Production']
  },
  {
    id: 'seven-eleven-retail-intelligence',
    title: '7-Eleven Store & POS Analytics (the-eye-bi-platform)',
    description: 'Live BigQuery production analytics for 7-Eleven omnichannel stores, POS transactions, basket size, and inventory velocity',
    dataSource: 'the-eye-bi-platform.retail_analytics',
    dataSourceType: 'bigquery',
    ownerEmail: 'admin@jackychoo.altostrat.com',
    ownerName: 'Jacky Choo',
    createdAt: '2026-08-20',
    updatedAt: 'Just now',
    yaml: SEVEN_ELEVEN_QLIK_BQ_YAML,
    permissions: {
      'admin@jackychoo.altostrat.com': 'owner',
      'executive-lead@7-eleven.com.my': 'editor',
      'store-manager@7-eleven.com.my': 'viewer'
    },
    tags: ['Production', 'BigQuery', 'Retail POS', 'ADC']
  },
  {
    id: 'saas-subscription-growth-intelligence',
    title: 'Cloud SaaS Platform — Subscription Growth & NRR Intelligence',
    description: 'Live BigQuery warehouse for SaaS multi-tenant telemetry, MRR expansion, plan tiers, and retention risk',
    dataSource: 'the-eye-bi-platform.saas_analytics',
    dataSourceType: 'bigquery',
    ownerEmail: 'admin@jackychoo.altostrat.com',
    ownerName: 'Jacky Choo',
    createdAt: '2026-08-24',
    updatedAt: 'Just now',
    yaml: SAAS_GROWTH_BQ_YAML,
    permissions: {
      'admin@jackychoo.altostrat.com': 'owner',
      'cro@saascloud.io': 'editor',
      'finance-lead@saascloud.io': 'viewer'
    },
    tags: ['SaaS', 'MRR / ARR', 'BigQuery', 'Subscription', 'FinTech']
  },
  {
    id: 'healthcare-hospital-clinical-operations',
    title: 'National Hospital Network — Clinical Census & Bed Occupancy',
    description: 'Live BigQuery analytics for hospital census, emergency department triage wait times, and clinical quality ratings',
    dataSource: 'the-eye-bi-platform.healthcare_operations',
    dataSourceType: 'bigquery',
    ownerEmail: 'admin@jackychoo.altostrat.com',
    ownerName: 'Jacky Choo',
    createdAt: '2026-08-24',
    updatedAt: 'Just now',
    yaml: HEALTHCARE_OPERATIONS_BQ_YAML,
    permissions: {
      'admin@jackychoo.altostrat.com': 'owner',
      'chief-medical-officer@hospital.gov.my': 'editor',
      'ward-lead@hospital.gov.my': 'viewer'
    },
    tags: ['Healthcare', 'Hospitals', 'Clinical Census', 'BigQuery', 'Operations']
  },
  {
    id: 'supply-chain-logistics-fleet-telemetry',
    title: 'Asia-Pacific Logistics & Freight Fleet Telemetry',
    description: 'Live BigQuery analytics for freight terminals, on-time delivery SLA compliance, transit velocity, and fuel costs',
    dataSource: 'the-eye-bi-platform.supply_chain_logistics',
    dataSourceType: 'bigquery',
    ownerEmail: 'admin@jackychoo.altostrat.com',
    ownerName: 'Jacky Choo',
    createdAt: '2026-08-24',
    updatedAt: 'Just now',
    yaml: SUPPLY_CHAIN_LOGISTICS_BQ_YAML,
    permissions: {
      'admin@jackychoo.altostrat.com': 'owner',
      'fleet-director@apaclogistics.com': 'editor',
      'dispatch-manager@apaclogistics.com': 'viewer'
    },
    tags: ['Supply Chain', 'Logistics', 'Fleet Telemetry', 'BigQuery', 'GIS']
  }
];
