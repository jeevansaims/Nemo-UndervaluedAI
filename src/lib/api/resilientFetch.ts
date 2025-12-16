type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

// Simple in-memory cache - only stores successful responses
const cache = new Map<string, CacheEntry<any>>();

export async function resilientFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<{ data: T; isStale: boolean }> {
  const now = Date.now();
  const cached = cache.get(key);

  // If we have fresh data, return it
  if (cached && (now - cached.timestamp) < ttlSeconds * 1000) {
    return { data: cached.data, isStale: false };
  }

  try {
    const data = await fetcher();
    // Only cache successful responses
    cache.set(key, { data, timestamp: now });
    return { data, isStale: false };
  } catch (error) {
    console.error(`Fetch failed for ${key}, attempting fallback`, error);
    
    // If fetch fails but we have stale data, return it
    if (cached) {
      return { data: cached.data, isStale: true };
    }
    
    // If no cache, rethrow (DO NOT cache the error)
    throw error;
  }
}

export function flushResilientCache() {
  cache.clear();
}
