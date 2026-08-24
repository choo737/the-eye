import crypto from 'crypto';

interface ServerCacheEntry {
  data: any;
  timestamp: number;
  ttlMs: number;
}

export class ServerQueryCache {
  private cache = new Map<string, ServerCacheEntry>();
  private defaultTtlMs = 10 * 60 * 1000; // 10 minutes

  hashQuery(sql: string, params?: any, project?: string): string {
    const payload = `${project || 'default'}::${sql.trim()}::${JSON.stringify(params || {})}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  get(hash: string): any | null {
    const entry = this.cache.get(hash);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttlMs) {
      this.cache.delete(hash);
      return null;
    }
    return entry.data;
  }

  set(hash: string, data: any, ttlMs: number = this.defaultTtlMs): void {
    this.cache.set(hash, {
      data,
      timestamp: Date.now(),
      ttlMs
    });
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

export const serverQueryCache = new ServerQueryCache();
