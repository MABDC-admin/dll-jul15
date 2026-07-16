/**
 * Simple in-memory cache for slow-changing data (grade levels, departments, subjects).
 * No Redis needed for a small user base. TTL-based expiration.
 */

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<any>>();

const DEFAULT_TTL = 60 * 1000; // 60 seconds

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL
): Promise<T> {
  const cached = getCached<T>(key);
  if (cached !== null) return cached;

  const result = await queryFn();
  setCache(key, result, ttlMs);
  return result;
}

export function invalidateCache(key: string): void {
  cache.delete(key);
}

export function clearCache(): void {
  cache.clear();
}
