/**
 * In-Memory Token Bucket Rate Limiter
 * Provides per-route, per-IP rate limiting to protect upstream services
 * and comply with OpenStreetMap Nominatim 1 req/sec policy.
 */

interface Bucket {
  tokens: number;
  lastRefillMs: number;
}

export interface RateLimitPolicy {
  tokensPerInterval: number;
  intervalMs: number;
  maxTokens: number;
}

export const ROUTE_POLICIES: Record<string, RateLimitPolicy> = {
  // Nominatim requires max 1 req/sec
  geocoding: {
    tokensPerInterval: 1,
    intervalMs: 1000,
    maxTokens: 2,
  },
  // Open-Meteo has high allowance (10k/day), allow 30/min
  weather: {
    tokensPerInterval: 30,
    intervalMs: 60 * 1000,
    maxTokens: 35,
  },
  // Places & POIs
  places: {
    tokensPerInterval: 20,
    intervalMs: 60 * 1000,
    maxTokens: 25,
  },
  // Routing
  routes: {
    tokensPerInterval: 15,
    intervalMs: 60 * 1000,
    maxTokens: 20,
  },
};

export class TokenBucketRateLimiter {
  private buckets = new Map<string, Bucket>();

  consume(key: string, policy: RateLimitPolicy): { allowed: boolean; retryAfterSeconds: number } {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = {
        tokens: policy.maxTokens,
        lastRefillMs: now,
      };
      this.buckets.set(key, bucket);
    } else {
      // Calculate refill
      const elapsedMs = now - bucket.lastRefillMs;
      const tokensToAdd = Math.floor(elapsedMs / policy.intervalMs) * policy.tokensPerInterval;
      if (tokensToAdd > 0) {
        bucket.tokens = Math.min(policy.maxTokens, bucket.tokens + tokensToAdd);
        bucket.lastRefillMs = now;
      }
    }

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return { allowed: true, retryAfterSeconds: 0 };
    }

    // Rate limited
    const waitMs = policy.intervalMs - (now - bucket.lastRefillMs);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(waitMs / 1000)),
    };
  }

  // Cleanup old inactive buckets
  cleanup(maxAgeMs = 10 * 60 * 1000): void {
    const now = Date.now();
    this.buckets.forEach((bucket, key) => {
      if (now - bucket.lastRefillMs > maxAgeMs) {
        this.buckets.delete(key);
      }
    });
  }

  reset(): void {
    this.buckets.clear();
  }
}

export const globalRateLimiter = new TokenBucketRateLimiter();
