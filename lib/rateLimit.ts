type RateLimitOptions = {
  keyPrefix: string;
  subject?: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  success: boolean;
  remaining: number;
  retryAfter: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const globalStore = globalThis as typeof globalThis & {
  __prepwiseRateLimitBuckets?: Map<string, Bucket>;
};

const buckets =
  globalStore.__prepwiseRateLimitBuckets ??
  (globalStore.__prepwiseRateLimitBuckets = new Map<string, Bucket>());

export function rateLimit(
  req: Request,
  { keyPrefix, subject, limit, windowMs }: RateLimitOptions
): RateLimitResult {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwardedFor || req.headers.get("x-real-ip") || "unknown";
  const key = `${keyPrefix}:${subject || ip}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (current.count >= limit) {
    return {
      success: false,
      remaining: 0,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  return {
    success: true,
    remaining: Math.max(0, limit - current.count),
    retryAfter: 0,
  };
}
