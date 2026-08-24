import { describe, it, expect } from 'vitest';
import { executeDataMeshJoin } from '../src/engine/dataMeshEngine';
import { DataMeshSpec } from '../src/core/types';

describe('Federated Data Mesh & Multi-Source Join Engine', () => {
  it('should successfully mesh BigQuery records with Google Sheet records on store_id', () => {
    const meshSpec: DataMeshSpec = {
      id: 'store_mesh',
      name: 'BigQuery × Google Sheet',
      primary_source: 'bq_seven_eleven',
      secondary_source: 'gsheet_targets',
      join_type: 'left',
      join_on: 'store_id',
      computed_fields: [
        { name: 'target_achievement_pct', formula: '(daily_sales / q3_budget_target) * 100' }
      ]
    };

    const bqPrimary = [
      { store_id: '7E-1082', store_name: 'KLCC Twin Towers', daily_sales: 38400 },
      { store_id: '7E-2041', store_name: 'Mid Valley', daily_sales: 31200 }
    ];

    const gsheetSecondary = [
      { store_id: '7E-1082', store_manager: 'Ahmad Zaki', q3_budget_target: 36000, audit_grade: 'A+' },
      { store_id: '7E-2041', store_manager: 'Michelle Tan', q3_budget_target: 30000, audit_grade: 'A' }
    ];

    const meshed = executeDataMeshJoin(meshSpec, bqPrimary, gsheetSecondary);

    expect(meshed).toHaveLength(2);
    // Verified BigQuery field present
    expect(meshed[0].store_name).toBe('KLCC Twin Towers');
    // Verified Google Sheet field present
    expect(meshed[0].store_manager).toBe('Ahmad Zaki');
    expect(meshed[0].q3_budget_target).toBe(36000);
    // Verified Computed field attainment % calculated correctly (38400 / 36000 * 100 = 106.7%)
    expect(meshed[0].target_achievement_pct).toBe(106.7);
  });
});
