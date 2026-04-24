import { NextRequest, NextResponse } from "next/server";

/**
 * Per-route rate limit configuration.
 * Key: exact pathname matched by this proxy.
 */
const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  "/api/webhook": { limit: 10, windowMs: 60_000 },
  "/api/notifications/send": { limit: 20, windowMs: 60_000 },
};

/**
 * Sliding window store: composite key (pathname:ip) -> array of request timestamps (ms).
 *
 * Module-level state in Next.js Edge Runtime persists across requests on the same
 * instance but is NOT shared across replicas. This is acceptable for abuse protection;
 * worst case an attacker on a different replica gets extra headroom, not a safety gap.
 * Each key holds at most `limit` timestamps, so memory is bounded.
 */
const rateLimitStore = new Map<string, number[]>();

/**
 * Resolves the client IP address from the request headers.
 *
 * request.ip was removed in Next.js 16 (was available in Edge Runtime middleware).
 * The official replacement is ipAddress() from @vercel/functions, but that package
 * is not in this project's dependencies. x-forwarded-for is the correct no-dep
 * approach and is already used by the webhook route handler (route.ts line 49).
 *
 * On Vercel, the first entry in x-forwarded-for is the original client IP.
 * Locally, falls back to "unknown" (rate limiter still works, all local reqs share key).
 */
function resolveIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0].trim();
  }
  return "unknown";
}

/**
 * Sliding window rate limiter.
 * Returns true when the request should be rejected (limit exceeded).
 */
function isRateLimited(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const prev = rateLimitStore.get(key) ?? [];
  const recent = prev.filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    rateLimitStore.set(key, recent);
    return true;
  }

  recent.push(now);
  rateLimitStore.set(key, recent);
  return false;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const rateConfig = RATE_LIMITS[pathname];

  if (!rateConfig) {
    return NextResponse.next();
  }

  const ip = resolveIp(request);
  const key = `${pathname}:${ip}`;

  if (isRateLimited(key, rateConfig.limit, rateConfig.windowMs)) {
    return NextResponse.json({ error: "rate_limit_exceeded" }, { status: 429 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/webhook", "/api/notifications/send"],
};
