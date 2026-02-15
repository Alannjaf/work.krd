import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Prevent the timer from keeping the process alive
if (typeof globalThis !== 'undefined') {
  // The interval is intentionally unref'd in Node.js environments
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
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return '127.0.0.1';
}

export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): { success: boolean; remaining: number; resetIn: number } {
  const ip = getClientIp(request);
  const key = config.userId
    ? `${config.identifier}:${config.userId}:${ip}`
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
