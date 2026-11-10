/**
 * @jest-environment node
 *
 * The default jsdom environment does not provide the `Request` and `Response`
 * globals that `rateLimitGuard` builds on — those come from undici, which Node
 * exposes natively. Route-handler code runs on the server anyway, so the node
 * environment is also the more faithful one here.
 */
import {
  checkRateLimit,
  clientKey,
  rateLimitGuard,
  rateLimitHeaders,
  resetRateLimitForTests,
} from '../rateLimit';

beforeEach(() => {
  resetRateLimitForTests();
});

describe('clientKey', () => {
  it('takes the FIRST x-forwarded-for entry, not the last', () => {
    // The security-relevant part. The platform appends the real client as the
    // first entry; reading the last would let a caller send their own header
    // and pick a fresh bucket whenever they liked, making the limit decorative.
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.5, 10.0.0.1, 10.0.0.2' });
    expect(clientKey(headers)).toBe('203.0.113.5');
  });

  it('trims whitespace and falls back sensibly', () => {
    expect(clientKey(new Headers({ 'x-forwarded-for': '  203.0.113.5  ' }))).toBe('203.0.113.5');
    expect(clientKey(new Headers({ 'x-real-ip': '198.51.100.9' }))).toBe('198.51.100.9');
    expect(clientKey(new Headers())).toBe('unknown');
  });

  it('never returns an empty key', () => {
    // An empty key would merge every such caller into one bucket, which for
    // them is the same as having no limit at all.
    expect(clientKey(new Headers({ 'x-forwarded-for': '' }))).toBe('unknown');
    expect(clientKey(new Headers({ 'x-forwarded-for': ' , ' }))).toBe('unknown');
  });
});

describe('checkRateLimit', () => {
  it('allows up to the limit then refuses', () => {
    const now = 1_000_000;
    for (let i = 1; i <= 5; i += 1) {
      expect(checkRateLimit('a', { limit: 5, now }).allowed).toBe(true);
    }
    const blocked = checkRateLimit('a', { limit: 5, now });
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it('keeps counters separate per caller', () => {
    const now = 1_000_000;
    checkRateLimit('noisy', { limit: 1, now });
    expect(checkRateLimit('noisy', { limit: 1, now }).allowed).toBe(false);
    expect(checkRateLimit('quiet', { limit: 1, now }).allowed).toBe(true);
  });

  it('resets after the window', () => {
    const start = 1_000_000;
    checkRateLimit('b', { limit: 1, now: start });
    expect(checkRateLimit('b', { limit: 1, now: start + 30_000 }).allowed).toBe(false);
    expect(checkRateLimit('b', { limit: 1, now: start + 61_000 }).allowed).toBe(true);
  });

  it('never reports retryAfter as 0 while blocked', () => {
    const start = 1_000_000;
    checkRateLimit('c', { limit: 1, now: start });
    // 999ms left; ceil keeps this at 1 rather than telling the client to retry
    // immediately.
    expect(checkRateLimit('c', { limit: 1, now: start + 59_001 }).retryAfter).toBe(1);
  });
});

describe('rateLimitHeaders', () => {
  it('omits Retry-After when the request was allowed', () => {
    const headers = rateLimitHeaders({ allowed: true, remaining: 7, retryAfter: 0, limit: 30 });
    expect(headers['RateLimit-Limit']).toBe('30');
    expect(headers['Retry-After']).toBeUndefined();
  });

  it('includes Retry-After when blocked', () => {
    const headers = rateLimitHeaders({ allowed: false, remaining: 0, retryAfter: 42, limit: 30 });
    expect(headers['Retry-After']).toBe('42');
  });
});

describe('rateLimitGuard', () => {
  const req = (ip: string) =>
    new Request('http://localhost/api/weather?city=London', {
      headers: { 'x-forwarded-for': ip },
    });

  it('returns null while the caller is under the limit', () => {
    expect(rateLimitGuard(req('203.0.113.10'), { limit: 2 })).toBeNull();
  });

  it('returns a JSON 429 with Retry-After once over', async () => {
    const ip = '203.0.113.11';
    rateLimitGuard(req(ip), { limit: 1 });
    const blocked = rateLimitGuard(req(ip), { limit: 1 });

    expect(blocked).not.toBeNull();
    expect(blocked!.status).toBe(429);
    expect(blocked!.headers.get('Content-Type')).toBe('application/json');
    expect(blocked!.headers.get('Retry-After')).toBeTruthy();
    expect(await blocked!.json()).toEqual({ error: 'Too many requests. Please slow down.' });
  });

  it('blocks one caller without affecting another', () => {
    rateLimitGuard(req('203.0.113.12'), { limit: 1 });
    expect(rateLimitGuard(req('203.0.113.12'), { limit: 1 })).not.toBeNull();
    expect(rateLimitGuard(req('203.0.113.13'), { limit: 1 })).toBeNull();
  });
});
