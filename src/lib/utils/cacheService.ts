// src/lib/utils/cacheService.ts

const CACHE_PREFIX = 'lol-app-cache-';
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export const cacheService = {
  /**
   * Store data in localStorage cache
   */
  set<T>(key: string, data: T, duration: number = DEFAULT_CACHE_DURATION): void {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const now = Date.now();
      const cacheEntry: CacheEntry<T> = {
        data,
        timestamp: now,
        expiry: now + duration
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  },

  /**
   * Retrieve data from localStorage cache if it exists and is not expired
   */
  get<T>(key: string): T | null {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (!cachedData) return null;
      
      const cacheEntry = JSON.parse(cachedData) as CacheEntry<T>;
      const now = Date.now();
      
      // Return null if cache is expired
      if (now > cacheEntry.expiry) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return cacheEntry.data;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  },

  /**
   * Remove a specific item from cache
   */
  remove(key: string): void {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`;
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  },

  /**
   * Clear all cached data for the application
   */
  clearAll(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(CACHE_PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
};

/**
 * Helper function to generate consistent cache keys
 */
export const generateCacheKey = (type: string, ...params: string[]): string => {
  return `${type}-${params.join('-')}`;
};