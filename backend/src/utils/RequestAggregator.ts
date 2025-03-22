interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

interface CacheEntry {
  requests: PendingRequest[];
  executing: boolean;
  lastExecuted?: number;
}

export class RequestAggregator {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly timeWindow: number;

  constructor(timeWindowMs: number = 1000) {
    this.timeWindow = timeWindowMs;
  }

  private cleanOldEntries() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      // Remove entries that haven't been executed in the time window and have no pending requests
      if (entry.lastExecuted && now - entry.lastExecuted > this.timeWindow && entry.requests.length === 0) {
        this.cache.delete(key);
      }
    }
  }

  async execute<T>(
    key: string,
    executeFn: () => Promise<T>
  ): Promise<T> {
    this.cleanOldEntries();

    // Get or create cache entry
    if (!this.cache.has(key)) {
      this.cache.set(key, {
        requests: [],
        executing: false
      });
    }

    const entry = this.cache.get(key)!;
    const now = Date.now();

    // Create a new promise for this request
    const requestPromise = new Promise<T>((resolve, reject) => {
      entry.requests.push({ resolve, reject, timestamp: now });
    });

    // If we're not currently executing and either:
    // 1. There's no last execution time, or
    // 2. The time window has passed since last execution
    if (!entry.executing && (!entry.lastExecuted || now - entry.lastExecuted > this.timeWindow)) {
      entry.executing = true;
      
      try {
        const result = await executeFn();
        // Resolve all pending requests
        entry.requests.forEach(req => req.resolve(result));
        entry.requests = [];
        entry.lastExecuted = now;
        return result;
      } catch (error) {
        // Reject all pending requests
        entry.requests.forEach(req => req.reject(error));
        entry.requests = [];
        throw error;
      } finally {
        entry.executing = false;
      }
    }

    // If we're here, either:
    // 1. We're currently executing another request, or
    // 2. We're within the time window of the last execution
    // So we just return the promise that will be resolved when ready
    return requestPromise;
  }
} 