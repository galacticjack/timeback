// Simple in-memory cache with TTL for AI analysis results
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class AnalysisCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly DEFAULT_TTL = 1000 * 60 * 60 * 24; // 24 hours

  generateKey(url: string, date1: string, date2: string): string {
    // Sort dates to ensure same key regardless of order
    const sortedDates = [date1, date2].sort();
    return `${url}:${sortedDates[0]}:${sortedDates[1]}`;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  // Clean up expired entries (call periodically)
  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const analysisCache = new AnalysisCache();
