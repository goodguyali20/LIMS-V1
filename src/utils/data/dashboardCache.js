// Dashboard Cache Management Utility
import { startOfDay, isToday, isYesterday } from 'date-fns';

const CACHE_PREFIX = 'dashboard_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_CACHE_SIZE = 50; // Maximum number of cached items

class DashboardCache {
  constructor() {
    this.initializeCache();
  }

  // Initialize cache and cleanup old entries
  initializeCache() {
    try {
      this.cleanupExpiredCache();
      this.enforceCacheSizeLimit();
    } catch (error) {
      console.warn('Failed to initialize dashboard cache:', error);
    }
  }

  // Generate cache key for a specific time range and date
  getCacheKey(timeRange, date = new Date()) {
    const dayStart = startOfDay(date).getTime();
    return `${CACHE_PREFIX}${timeRange}_${dayStart}`;
  }

  // Get cached data for a time range
  getCachedData(timeRange) {
    try {
      const cacheKey = this.getCacheKey(timeRange);
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const { data, timestamp, version } = JSON.parse(cached);
        const now = Date.now();
        
        // Check if cache is still valid
        if (now - timestamp < CACHE_DURATION) {
          console.log('📊 Using cached dashboard data for', timeRange);
          return {
            data,
            timestamp,
            version,
            isCached: true
          };
        } else {
          // Remove expired cache
          localStorage.removeItem(cacheKey);
          console.log('🗑️ Removed expired cache for', timeRange);
        }
      }
    } catch (error) {
      console.warn('Failed to read cached dashboard data:', error);
    }
    
    return null;
  }

  // Set cached data for a time range
  setCachedData(timeRange, data, version = '1.0') {
    try {
      const cacheKey = this.getCacheKey(timeRange);
      const cacheData = {
        data,
        timestamp: Date.now(),
        version,
        timeRange
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log('💾 Cached dashboard data for', timeRange);
      
      // Enforce cache size limit after adding new data
      this.enforceCacheSizeLimit();
      
      return true;
    } catch (error) {
      console.warn('Failed to cache dashboard data:', error);
      return false;
    }
  }

  // Clear cache for a specific time range
  clearCache(timeRange) {
    try {
      const cacheKey = this.getCacheKey(timeRange);
      localStorage.removeItem(cacheKey);
      console.log('🗑️ Cleared cache for', timeRange);
      return true;
    } catch (error) {
      console.warn('Failed to clear cache for', timeRange, error);
      return false;
    }
  }

  // Clear all dashboard cache
  clearAllCache() {
    try {
      const keys = Object.keys(localStorage);
      const dashboardKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      
      dashboardKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('🗑️ Cleared all dashboard cache');
      return dashboardKeys.length;
    } catch (error) {
      console.warn('Failed to clear all dashboard cache:', error);
      return 0;
    }
  }

  // Cleanup expired cache entries
  cleanupExpiredCache() {
    try {
      const keys = Object.keys(localStorage);
      const dashboardKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      const now = Date.now();
      let cleanedCount = 0;
      
      dashboardKeys.forEach(key => {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const { timestamp } = JSON.parse(cached);
            if (now - timestamp > CACHE_DURATION) {
              localStorage.removeItem(key);
              cleanedCount++;
            }
          }
        } catch (error) {
          // Remove corrupted cache entries
          localStorage.removeItem(key);
          cleanedCount++;
        }
      });
      
      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} expired cache entries`);
      }
      
      return cleanedCount;
    } catch (error) {
      console.warn('Failed to cleanup expired cache:', error);
      return 0;
    }
  }

  // Enforce cache size limit by removing oldest entries
  enforceCacheSizeLimit() {
    try {
      const keys = Object.keys(localStorage);
      const dashboardKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      
      if (dashboardKeys.length > MAX_CACHE_SIZE) {
        // Get cache entries with timestamps
        const cacheEntries = dashboardKeys
          .map(key => {
            try {
              const cached = localStorage.getItem(key);
              if (cached) {
                const { timestamp } = JSON.parse(cached);
                return { key, timestamp };
              }
            } catch (error) {
              return { key, timestamp: 0 };
            }
          })
          .filter(entry => entry.timestamp > 0)
          .sort((a, b) => a.timestamp - b.timestamp);
        
        // Remove oldest entries
        const entriesToRemove = cacheEntries.slice(0, dashboardKeys.length - MAX_CACHE_SIZE);
        entriesToRemove.forEach(entry => {
          localStorage.removeItem(entry.key);
        });
        
        console.log(`📦 Removed ${entriesToRemove.length} old cache entries to maintain size limit`);
        return entriesToRemove.length;
      }
      
      return 0;
    } catch (error) {
      console.warn('Failed to enforce cache size limit:', error);
      return 0;
    }
  }

  // Get cache statistics
  getCacheStats() {
    try {
      const keys = Object.keys(localStorage);
      const dashboardKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      const now = Date.now();
      
      const stats = {
        totalEntries: dashboardKeys.length,
        validEntries: 0,
        expiredEntries: 0,
        totalSize: 0,
        timeRanges: new Set(),
        oldestEntry: null,
        newestEntry: null
      };
      
      dashboardKeys.forEach(key => {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const { timestamp, timeRange } = JSON.parse(cached);
            stats.totalSize += cached.length;
            stats.timeRanges.add(timeRange);
            
            if (now - timestamp < CACHE_DURATION) {
              stats.validEntries++;
            } else {
              stats.expiredEntries++;
            }
            
            if (!stats.oldestEntry || timestamp < stats.oldestEntry.timestamp) {
              stats.oldestEntry = { key, timestamp };
            }
            
            if (!stats.newestEntry || timestamp > stats.newestEntry.timestamp) {
              stats.newestEntry = { key, timestamp };
            }
          }
        } catch (error) {
          stats.expiredEntries++;
        }
      });
      
      return stats;
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
      return null;
    }
  }

  // Check if data should be refreshed based on various conditions
  shouldRefreshData(timeRange, lastUpdateTime) {
    try {
      // Check if we have cached data
      const cached = this.getCachedData(timeRange);
      if (!cached) {
        return true; // No cache, should fetch
      }
      
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateTime;
      
      // Refresh conditions:
      // 1. Cache is expired
      if (now - cached.timestamp > CACHE_DURATION) {
        return true;
      }
      
      // 2. It's a new day and we don't have today's data
      if (!isToday(new Date(cached.timestamp))) {
        return true;
      }
      
      // 3. Force refresh if last update was more than 1 hour ago
      if (timeSinceLastUpdate > 60 * 60 * 1000) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn('Failed to check if data should be refreshed:', error);
      return true; // Default to refresh on error
    }
  }

  // Get cache key for today
  getTodayCacheKey(timeRange) {
    return this.getCacheKey(timeRange, new Date());
  }

  // Get cache key for yesterday
  getYesterdayCacheKey(timeRange) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.getCacheKey(timeRange, yesterday);
  }

  // Check if we have data for today
  hasTodayData(timeRange) {
    const todayKey = this.getTodayCacheKey(timeRange);
    try {
      const cached = localStorage.getItem(todayKey);
      if (cached) {
        const { timestamp } = JSON.parse(cached);
        return isToday(new Date(timestamp));
      }
    } catch (error) {
      console.warn('Failed to check today data:', error);
    }
    return false;
  }

  // Get all cached time ranges
  getCachedTimeRanges() {
    try {
      const keys = Object.keys(localStorage);
      const dashboardKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      const timeRanges = new Set();
      
      dashboardKeys.forEach(key => {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const { timeRange } = JSON.parse(cached);
            timeRanges.add(timeRange);
          }
        } catch (error) {
          // Skip corrupted entries
        }
      });
      
      return Array.from(timeRanges);
    } catch (error) {
      console.warn('Failed to get cached time ranges:', error);
      return [];
    }
  }
}

// Create singleton instance
const dashboardCache = new DashboardCache();

// Export utility functions
export const getCachedData = (timeRange) => dashboardCache.getCachedData(timeRange);
export const setCachedData = (timeRange, data, version) => dashboardCache.setCachedData(timeRange, data, version);
export const clearCache = (timeRange) => dashboardCache.clearCache(timeRange);
export const clearAllCache = () => dashboardCache.clearAllCache();
export const getCacheStats = () => dashboardCache.getCacheStats();
export const shouldRefreshData = (timeRange, lastUpdateTime) => dashboardCache.shouldRefreshData(timeRange, lastUpdateTime);
export const hasTodayData = (timeRange) => dashboardCache.hasTodayData(timeRange);
export const getCachedTimeRanges = () => dashboardCache.getCachedTimeRanges();

// Export the cache instance for advanced usage
export default dashboardCache; 