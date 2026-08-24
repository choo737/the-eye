import { SEVEN_ELEVEN_QLIK_BQ_YAML } from './sampleDashboards';

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
    id: 'store-supply-chain-telemetry',
    title: '7-Eleven Supply Chain & Cold Chain Telemetry',
    description: 'Real-time cold-room sensors, distribution center turnaround times, and fresh food wastage audits',
    dataSource: 'the-eye-bi-platform.supply_chain',
    dataSourceType: 'bigquery',
    ownerEmail: 'admin@jackychoo.altostrat.com',
    ownerName: 'Jacky Choo',
    createdAt: '2026-08-22',
    updatedAt: '2h ago',
    yaml: SEVEN_ELEVEN_QLIK_BQ_YAML.replace('7-Eleven Store & POS Analytics', '7-Eleven Supply Chain & Cold Chain Telemetry'),
    permissions: {
      'admin@jackychoo.altostrat.com': 'owner',
      'logistics-director@7-eleven.com.my': 'editor'
    },
    tags: ['Supply Chain', 'BigQuery', 'IoT Telemetry']
  }
];
