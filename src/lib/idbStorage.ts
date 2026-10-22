import { get, set, del } from 'idb-keyval';
import { StateStorage } from 'zustand/middleware';

/**
 * Local-First IndexedDB storage adapter for Zustand.
 * Provides high-capacity persistence for guest trips, photos, and timelines.
 * Falls back safely to localStorage or in-memory in SSR contexts.
 */
export const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;
    try {
      const val = await get(name);
      return val ?? null;
    } catch (err) {
      console.warn(`[TripOS Storage] Failed to read ${name} from IndexedDB:`, err);
      return window.localStorage.getItem(name);
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    try {
      await set(name, value);
    } catch (err) {
      console.warn(`[TripOS Storage] Failed to write ${name} to IndexedDB:`, err);
      try {
        window.localStorage.setItem(name, value);
      } catch (e) {
        console.error('[TripOS Storage] LocalStorage fallback also failed:', e);
      }
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    try {
      await del(name);
    } catch (err) {
      console.warn(`[TripOS Storage] Failed to delete ${name} from IndexedDB:`, err);
      window.localStorage.removeItem(name);
    }
  },
};
