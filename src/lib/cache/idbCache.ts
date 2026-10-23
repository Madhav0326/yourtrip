import { CacheEntry, CacheProvider } from '@/lib/providers/types';
import { DataProvenance } from '@/types/trip';
import { get, set, del } from 'idb-keyval';

/**
 * IndexedDBCacheProvider
 * Client-side persistent cache for guest mode trips, weather, and geocoded places.
 * Stores records with metadata for freshness vs retention.
 */
export class IndexedDBCacheProvider implements CacheProvider {
  private keyPrefix: string;

  constructor(prefix = 'yourtrip_cache_') {
    this.keyPrefix = prefix;
  }

  private fullKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    if (typeof window === 'undefined') return null;

    try {
      const entry = (await get(this.fullKey(key))) as CacheEntry<T> | undefined;
      if (!entry) return null;

      const now = Date.now();
      // If beyond retention window, evict from IndexedDB
      if (now > entry.expiresAt) {
        await del(this.fullKey(key));
        return null;
      }

      return entry;
    } catch (err) {
      console.warn(`[IDBCache] Error reading key ${key}:`, err);
      return null;
    }
  }

  async set<T>(
    key: string,
    data: T,
    freshnessTtlMs: number,
    retentionMs: number,
    provenance: DataProvenance,
    sourceNote?: string
  ): Promise<void> {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      cachedAt: now,
      freshUntil: now + freshnessTtlMs,
      expiresAt: now + retentionMs,
      provenance,
      sourceNote,
    };

    try {
      await set(this.fullKey(key), entry);
    } catch (err) {
      console.warn(`[IDBCache] Error setting key ${key}:`, err);
    }
  }

  async delete(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      await del(this.fullKey(key));
    } catch (err) {
      console.warn(`[IDBCache] Error deleting key ${key}:`, err);
    }
  }

  async clearExpired(): Promise<void> {
    // Handled lazily on read
  }
}

export const clientIdbCache = new IndexedDBCacheProvider();
