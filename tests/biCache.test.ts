import { describe, it, expect, beforeEach } from 'vitest';
import { biCache } from '../src/engine/biCache';
import { serverQueryCache } from '../server/cache/queryCache';

describe('Two-Tier BI Layer Caching Engine', () => {
  beforeEach(() => {
    biCache.purge();
    serverQueryCache.clear();
  });

  it('should generate deterministic query hash keys for identical filter states', () => {
    const key1 = biCache.generateKey('kpi_sales', 'bq_seven_eleven', { region: 'North', year: 2026 }, 'day');
    const key2 = biCache.generateKey('kpi_sales', 'bq_seven_eleven', { year: 2026, region: 'North' }, 'day');
    expect(key1).toBe(key2);
  });

  it('should cache and return cached query results with hit telemetry', () => {
    const key = biCache.generateKey('kpi_sales', 'bq_seven_eleven', { region: 'North' });
    const mockData = { gross_sales: 78450000 };

    // Miss on first request
    const cold = biCache.get(key);
    expect(cold).toBeNull();

    // Cache the result
    biCache.set(key, mockData, '15m');

    // Hit on second request
    const warm = biCache.get(key);
    expect(warm).not.toBeNull();
    expect(warm?.isHit).toBe(true);
    expect(warm?.data).toEqual(mockData);

    const stats = biCache.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.hitRatePct).toBe(50.0);
    expect(stats.bytesSavedMB).toBe(12.5);
  });

  it('should invalidate cache when purged', () => {
    const key = biCache.generateKey('kpi_sales', 'bq_seven_eleven', {});
    biCache.set(key, { data: 123 });
    expect(biCache.get(key)).not.toBeNull();

    biCache.purge();
    expect(biCache.get(key)).toBeNull();
  });

  it('should hash SQL queries on server-side query cache', () => {
    const sql = 'SELECT * FROM retail_analytics.daily_store_pos WHERE region = @region';
    const hash1 = serverQueryCache.hashQuery(sql, { region: 'North' }, 'the-eye-bi-platform');
    const hash2 = serverQueryCache.hashQuery(sql, { region: 'North' }, 'the-eye-bi-platform');
    const hash3 = serverQueryCache.hashQuery(sql, { region: 'South' }, 'the-eye-bi-platform');

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);

    serverQueryCache.set(hash1, { rows: [{ id: 1 }] });
    expect(serverQueryCache.get(hash1)).toEqual({ rows: [{ id: 1 }] });
  });
});
