import { RATE_LIMIT_CONFIG, FEATURE_FLAGS } from './config';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  retryAfterMs?: number;
}

interface RequestRecord {
  timestamp: number;
  count: number;
}

class RateLimiter {
  private requests: Map<string, RequestRecord> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      retryAfterMs: 1000,
      ...config
    };
    
    // Log rate limiter initialization in debug mode
    if (FEATURE_FLAGS.ENABLE_DEBUG_LOGGING) {
      console.log(`🚦 Rate Limiter initialized:`, {
        maxRequests: this.config.maxRequests,
        windowMs: this.config.windowMs,
        retryAfterMs: this.config.retryAfterMs
      });
    }
  }

  async checkLimit(key: string = 'default'): Promise<boolean> {
    const now = Date.now();
    const record = this.requests.get(key);

    // Clean up old records
    if (record && now - record.timestamp > this.config.windowMs) {
      this.requests.delete(key);
    }

    const currentRecord = this.requests.get(key);
    
    if (!currentRecord) {
      this.requests.set(key, { timestamp: now, count: 1 });
      if (FEATURE_FLAGS.ENABLE_DEBUG_LOGGING) {
        console.log(`🚦 Rate limit initialized for key: ${key}`);
      }
      return true;
    }

    if (currentRecord.count >= this.config.maxRequests) {
      if (FEATURE_FLAGS.ENABLE_DEBUG_LOGGING) {
        console.warn(`🚫 Rate limit exceeded for key: ${key} (${currentRecord.count}/${this.config.maxRequests})`);
      }
      return false;
    }

    currentRecord.count++;
    if (FEATURE_FLAGS.ENABLE_DEBUG_LOGGING) {
      console.log(`✅ Rate limit check passed for key: ${key} (${currentRecord.count}/${this.config.maxRequests})`);
    }
    return true;
  }

  async waitForSlot(key: string = 'default'): Promise<void> {
    while (!(await this.checkLimit(key))) {
      await new Promise(resolve => setTimeout(resolve, this.config.retryAfterMs));
    }
  }

  reset(key?: string): void {
    if (key) {
      this.requests.delete(key);
    } else {
      this.requests.clear();
    }
  }
}

// Global rate limiters for different types of requests - now using dynamic configuration
export const apiRateLimiter = new RateLimiter({
  maxRequests: RATE_LIMIT_CONFIG.API_MAX_REQUESTS,
  windowMs: RATE_LIMIT_CONFIG.API_WINDOW_MS,
  retryAfterMs: RATE_LIMIT_CONFIG.API_RETRY_AFTER_MS
});

export const searchRateLimiter = new RateLimiter({
  maxRequests: RATE_LIMIT_CONFIG.SEARCH_MAX_REQUESTS,
  windowMs: RATE_LIMIT_CONFIG.SEARCH_WINDOW_MS,
  retryAfterMs: RATE_LIMIT_CONFIG.SEARCH_RETRY_AFTER_MS
});

// Bulk operations rate limiter for heavy operations
export const bulkRateLimiter = new RateLimiter({
  maxRequests: RATE_LIMIT_CONFIG.BULK_MAX_REQUESTS,
  windowMs: RATE_LIMIT_CONFIG.BULK_WINDOW_MS,
  retryAfterMs: RATE_LIMIT_CONFIG.BULK_RETRY_AFTER_MS
});

// Utility function to get rate limiter by type
export const getRateLimiter = (type: 'api' | 'search' | 'bulk' = 'api') => {
  switch (type) {
    case 'search':
      return searchRateLimiter;
    case 'bulk':
      return bulkRateLimiter;
    case 'api':
    default:
      return apiRateLimiter;
  }
};

export default RateLimiter;