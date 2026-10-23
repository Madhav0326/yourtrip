import { CacheEntry, CacheProvider } from '@/lib/providers/types';
import { DataProvenance } from '@/types/trip';

/**
 * MemoryCacheProvider
 * High-performance in-memory cache supporting:
 * - Freshness TTL (time until data is stale)
 * - Retention window (time until data is completely evicted)
 * - Automatic eviction on read or periodic cleanup
 */
export class MemoryCacheProvider implements CacheProvider {
  private store = new Map<string, CacheEntry<unknown>>();

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const now = Date.now();
    // If beyond retention window, evict immediately
    if (now > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry;
  }

  async set<T>(
    key: string,
    data: T,
    freshnessTtlMs: number,
    retentionMs: number,
    provenance: DataProvenance,
    sourceNote?: string
  ): Promise<void> {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      cachedAt: now,
      freshUntil: now + freshnessTtlMs,
      expiresAt: now + retentionMs,
      provenance,
      sourceNote,
    };
    this.store.set(key, entry as CacheEntry<unknown>);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clearExpired(): Promise<void> {
    const now = Date.now();
    this.store.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    });
  }

  // Debug & Test inspection
  size(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }
}

// Global server-side singleton for Next.js route handlers
export const serverMemoryCache = new MemoryCacheProvider();
