export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
  key: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRatePct: number;
  totalEntries: number;
  bytesSavedMB: number;
}

class BiCacheEngine {
  private cache = new Map<string, CacheEntry<any>>();
  private hits = 0;
  private misses = 0;
  private defaultTtlMs = 15 * 60 * 1000; // 15 minutes default TTL

  /**
   * Generates a deterministic hash key from query params
   */
  generateKey(widgetId: string, sourceId: string, filters: Record<string, any>, grain?: string): string {
    const sortedFilterStr = Object.keys(filters || {})
      .sort()
      .map(k => `${k}=${JSON.stringify(filters[k])}`)
      .join('&');
    return `${sourceId}::${widgetId}::grain=${grain || 'auto'}::${sortedFilterStr}`;
  }

  /**
   * Converts human string TTL (e.g. "15m", "1h", "30s") to milliseconds
   */
  parseTtl(ttlStr?: string): number {
    if (!ttlStr) return this.defaultTtlMs;
    const match = ttlStr.match(/^(\d+)([smhd])$/);
    if (!match) return this.defaultTtlMs;
    const val = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's': return val * 1000;
      case 'm': return val * 60 * 1000;
      case 'h': return val * 60 * 60 * 1000;
      case 'd': return val * 24 * 60 * 60 * 1000;
      default: return this.defaultTtlMs;
    }
  }

  get<T>(key: string): { data: T; isHit: boolean; cachedAt?: string } | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttlMs) {
      // Expired
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return {
      data: entry.data,
      isHit: true,
      cachedAt: new Date(entry.timestamp).toLocaleTimeString()
    };
  }

  set<T>(key: string, data: T, ttlStr?: string): void {
    const ttlMs = this.parseTtl(ttlStr);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs,
      key
    });
  }

  purge(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses;
    const hitRatePct = total > 0 ? +((this.hits / total) * 100).toFixed(1) : 0;
    // Estimated ~12.5 MB per BigQuery scan saved per cache hit
    const bytesSavedMB = +(this.hits * 12.5).toFixed(1);

    return {
      hits: this.hits,
      misses: this.misses,
      hitRatePct,
      totalEntries: this.cache.size,
      bytesSavedMB
    };
  }
}

export const biCache = new BiCacheEngine();
