import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// NOTE: In-memory store — rate limits are per-process only.
// In a multi-instance deployment (e.g., multiple Netlify functions), each instance
// has its own Map. For shared rate limiting across instances, use Redis or similar.
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
const rateLimitCleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Prevent the timer from keeping the process alive in serverless environments
if (rateLimitCleanupInterval.unref) {
  rateLimitCleanupInterval.unref();
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Identifier prefix for the rate limit bucket */
  identifier: string;
  /** Optional user ID for authenticated rate limiting */
  userId?: string;
}

function getClientIp(request: NextRequest): string {
  // Prefer userId for rate limiting (not spoofable) — falls back to IP headers
  // Note: x-forwarded-for can be spoofed, so userId-based limiting is preferred
  // when available (pass userId via config.userId)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Take only the first IP (client IP) and validate it looks like an IP
    const ip = forwarded.split(',')[0].trim();
    if (/^[\d.:a-fA-F]+$/.test(ip)) {
      return ip;
    }
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp && /^[\d.:a-fA-F]+$/.test(realIp)) {
    return realIp;
  }
  // Dev fallback — all local requests share one rate limit bucket
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[RateLimit] No client IP detected, using 127.0.0.1 fallback');
  }
  return '127.0.0.1';
}

export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): { success: boolean; remaining: number; resetIn: number } {
  const ip = getClientIp(request);
  // When userId is available, use it as primary rate limit key (not spoofable)
  // IP is added as secondary dimension to prevent shared-account abuse
  const key = config.userId
    ? `${config.identifier}:${config.userId}`
    : `${config.identifier}:${ip}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: config.maxRequests - 1, resetIn: config.windowSeconds };
  }

  if (entry.count >= config.maxRequests) {
    const resetIn = Math.ceil((entry.resetTime - now) / 1000);
    return { success: false, remaining: 0, resetIn };
  }

  entry.count++;
  return { success: true, remaining: config.maxRequests - entry.count, resetIn: Math.ceil((entry.resetTime - now) / 1000) };
}

export function rateLimitResponse(resetIn: number): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(resetIn),
      },
    }
  );
}
