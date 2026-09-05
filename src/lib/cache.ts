interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class SimpleCache<T> {
  private store: Map<string, CacheEntry<T>> = new Map();
  private ttl: number;

  constructor(ttlSeconds: number = 90) {
    this.ttl = ttlSeconds * 1000;
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: T): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.store.clear();
  }
}

// Global cache instance
const getTTL = (): number => {
  const ttlEnv = process.env.CACHE_TTL_SECONDS;
  return ttlEnv ? parseInt(ttlEnv, 10) : 90;
};

const globalCache = new SimpleCache<unknown>(getTTL());

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = globalCache.get(key);
  if (cached !== null) {
    return cached as T;
  }

  const data = await fetcher();
  globalCache.set(key, data);
  return data;
}

export function clearCache(): void {
  globalCache.clear();
}
