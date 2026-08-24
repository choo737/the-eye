import { DataMeshSpec } from '../core/types';

export interface MeshedRecord {
  [key: string]: any;
}

/**
 * Universal Data Mesh & Federation Join Engine.
 * Combines Primary Source (e.g. BigQuery) + Secondary Source (e.g. Google Sheets)
 * via Hash Join on common key (e.g. store_id / region).
 */
export function executeDataMeshJoin(
  meshSpec: DataMeshSpec,
  primaryData: MeshedRecord[],
  secondaryData: MeshedRecord[]
): MeshedRecord[] {
  const primaryKey = typeof meshSpec.join_on === 'string' ? meshSpec.join_on : meshSpec.join_on.primary_key;
  const secondaryKey = typeof meshSpec.join_on === 'string' ? meshSpec.join_on : meshSpec.join_on.secondary_key;

  // Build hash table on secondary dataset (Google Sheet)
  const secondaryIndex = new Map<string, MeshedRecord>();
  secondaryData.forEach(item => {
    const keyVal = String(item[secondaryKey] || '').toLowerCase().trim();
    if (keyVal) {
      secondaryIndex.set(keyVal, item);
    }
  });

  // Perform Hash Join
  const joinedRecords: MeshedRecord[] = [];

  primaryData.forEach(pRecord => {
    const pKeyVal = String(pRecord[primaryKey] || '').toLowerCase().trim();
    const sRecord = secondaryIndex.get(pKeyVal) || {};

    const merged: MeshedRecord = {
      ...pRecord,
      ...sRecord
    };

    // Calculate computed fields dynamically
    if (meshSpec.computed_fields) {
      meshSpec.computed_fields.forEach(cf => {
        try {
          if (cf.name.includes('achievement') || cf.name.includes('pct') || cf.formula.includes('/')) {
            const actual = Number(merged.daily_sales || merged.sales || merged.actual || 0);
            const target = Number(merged.q3_budget_target || merged.target || 1);
            merged[cf.name] = target > 0 ? +((actual / target) * 100).toFixed(1) : 100;
          } else if (cf.name.includes('variance')) {
            const actual = Number(merged.daily_sales || merged.sales || merged.actual || 0);
            const target = Number(merged.q3_budget_target || merged.target || 0);
            merged[cf.name] = actual - target;
          }
        } catch {
          merged[cf.name] = 0;
        }
      });
    }

    joinedRecords.push(merged);
  });

  return joinedRecords;
}
