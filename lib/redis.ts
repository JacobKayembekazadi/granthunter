import { Redis } from '@upstash/redis';

// Lazy initialization - only create Redis client when actually used
let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error('Missing Upstash Redis environment variables: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required');
    }

    _redis = new Redis({ url, token });
  }
  return _redis;
}

export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    const redis = getRedis();
    const value = (redis as any)[prop];
    if (typeof value === 'function') {
      return value.bind(redis);
    }
    return value;
  }
}) as Redis;

// Rate limiting helper
export async function rateLimit(
  key: string,
  limit: number,
  window: number // in seconds
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }

  const ttl = await redis.ttl(key);
  const remaining = Math.max(0, limit - current);
  const reset = Date.now() + (ttl * 1000);

  return {
    allowed: current <= limit,
    remaining,
    reset,
  };
}

// Cache helper
export async function getCached<T>(key: string): Promise<T | null> {
  const value = await redis.get<T>(key);
  return value;
}

export async function setCached<T>(
  key: string,
  value: T,
  ttl: number // in seconds
): Promise<void> {
  await redis.setex(key, ttl, value);
}

