/**
 * Per-IP rate limiting for the upstream proxy routes.
 *
 * Why this exists: the OpenWeatherMap key is server-only (good), but that means
 * the deployed app *is* the key. Anyone who finds the URL can call
 * `/api/weather` in a loop and burn the owner's quota — 1,000 calls/day on the
 * free tier. CoinGecko's free endpoint has no key but is rate limited by IP, so
 * an unthrottled proxy gets the *server's* IP throttled and breaks the app for
 * everyone at once. Hiding a key stops it being stolen; it does not stop it
 * being spent.
 *
 * Deliberately dependency-free and in-process: this is a single Vercel
 * deployment, and a fixed-window counter in memory is the right size of
 * solution. The trade-off is real and worth stating — serverless instances do
 * not share state, so the effective limit is per instance, and a burst spread
 * across cold starts can exceed it. A hard global limit would need Redis or
 * Vercel KV.
 */

export interface RateLimitResult {
  allowed: boolean;
  /** Requests still available in the current window. */
  remaining: number;
  /** Seconds until the window resets. */
  retryAfter: number;
  limit: number;
}

interface Window {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 30;

// Module scope persists across requests within one warm instance.
const windows = new Map<string, Window>();

/**
 * Drop expired entries so the map cannot grow without bound from one-off IPs.
 * Called on each check; the map stays small enough that a full sweep is cheaper
 * than maintaining a second index.
 */
function evictExpired(now: number) {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

/**
 * Identify the caller.
 *
 * Vercel sets `x-forwarded-for` and strips any client-supplied value, so the
 * first entry is the real client. Taking the *first* entry matters: a caller
 * who sends their own `x-forwarded-for` would otherwise get to choose their own
 * bucket and reset the counter at will.
 */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return headers.get('x-real-ip')?.trim() || 'unknown';
}

export function checkRateLimit(
  key: string,
  { limit = DEFAULT_LIMIT, now = Date.now() }: { limit?: number; now?: number } = {}
): RateLimitResult {
  evictExpired(now);

  const existing = windows.get(key);
  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: limit - 1, retryAfter: 0, limit };
  }

  existing.count += 1;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  if (existing.count > limit) {
    return { allowed: false, remaining: 0, retryAfter, limit };
  }
  return { allowed: true, remaining: limit - existing.count, retryAfter, limit };
}

/** Headers describing the limit, in the RFC draft-7 shape. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'RateLimit-Limit': String(result.limit),
    'RateLimit-Remaining': String(result.remaining),
  };
  if (!result.allowed) headers['Retry-After'] = String(result.retryAfter);
  return headers;
}

/** Test-only: clear the in-memory windows between cases. */
export function resetRateLimitForTests() {
  windows.clear();
}

/**
 * Convenience guard for a route handler.
 *
 * Returns a ready-made 429 when the caller is over the limit, or `null` when
 * the request may proceed. Call it as the first statement in the handler so a
 * blocked request never reaches the upstream API — that is the whole point.
 *
 * Usage:
 *   const blocked = rateLimitGuard(request);
 *   if (blocked) return blocked;
 */
export function rateLimitGuard(
  request: Request,
  { limit }: { limit?: number } = {}
): Response | null {
  const result = checkRateLimit(clientKey(request.headers), { limit });
  if (result.allowed) return null;
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please slow down.' }),
    {
      status: 429,
      headers: { 'Content-Type': 'application/json', ...rateLimitHeaders(result) },
    }
  );
}
