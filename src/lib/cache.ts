import { CacheEntry } from '@/types';

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 60 * 1000; // 1 minute in milliseconds

export function getCachedData<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;

  if (!entry) {
    return null;
  }

  const isExpired = Date.now() - entry.timestamp > CACHE_TTL;

  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCachedData<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function invalidateCache(keyPattern?: string): void {
  if (!keyPattern) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.includes(keyPattern)) {
      cache.delete(key);
    }
  }
}

export function generateCacheKey(...parts: string[]): string {
  return parts.join(':');
}
