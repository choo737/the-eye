import { SEVEN_ELEVEN_QLIK_BQ_YAML, CIMB_BANK_BQ_YAML } from './sampleDashboards';

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
  }
];
