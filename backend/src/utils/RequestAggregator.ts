interface CacheItem<T> {
  promise: Promise<T>;
  timestamp: number;
}

export class RequestAggregator {
  private cache: Map<string, CacheItem<any>> = new Map();
  private readonly timeWindow: number;

  constructor(timeWindowMs: number = 1000) {
    this.timeWindow = timeWindowMs;
  }

  async execute<T>(key: string, executeFn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(key);

    // If we have a cached result within the time window, return it
    if (cached && now - cached.timestamp < this.timeWindow) {
      try {
        return await cached.promise;
      } catch (error) {
        // If the cached promise fails, remove it from cache and continue with a new execution
        this.cache.delete(key);
      }
    }

    // Execute the function and cache the result
    const promise = executeFn();
    this.cache.set(key, { promise, timestamp: now });

    // Clean up old cache entries
    for (const [k, v] of this.cache.entries()) {
      if (now - v.timestamp > this.timeWindow) {
        this.cache.delete(k);
      }
    }

    try {
      return await promise;
    } catch (error) {
      // If the promise fails, remove it from cache and rethrow
      this.cache.delete(key);
      throw error;
    }
  }
} 