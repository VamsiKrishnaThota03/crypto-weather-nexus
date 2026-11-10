import { NextResponse } from 'next/server';
import { rateLimitGuard } from '@/lib/server/rateLimit';

export const dynamic = 'force-dynamic';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cache: { data: unknown; timestamp: number } | null = null;

interface CryptoCompareItem {
  title: string;
  body?: string;
  url: string;
  source: string;
  source_info?: { name?: string };
  published_on: number;
}

/** Latest crypto headlines from the CryptoCompare news API (no key required). */
export async function GET(request: Request) {
  // A blocked request must never reach CryptoCompare — that is what protects
  // the quota (and the server's own IP reputation on a keyless endpoint).
  const blocked = rateLimitGuard(request);
  if (blocked) return blocked;

  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return NextResponse.json(cache.data);
  }

  try {
    const response = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN', {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`CryptoCompare error ${response.status}`);
    const json = await response.json();
    if (!Array.isArray(json.Data)) throw new Error('No news data available');

    const data = (json.Data as CryptoCompareItem[]).slice(0, 6).map((item) => ({
      title: item.title,
      description: item.body || '',
      url: item.url,
      source: item.source_info?.name || item.source,
      publishedAt: new Date(item.published_on * 1000).toISOString(),
    }));
    cache = { data, timestamp: Date.now() };
    return NextResponse.json(data);
  } catch (error) {
    console.error('News API error:', error instanceof Error ? error.message : error);
    if (cache) return NextResponse.json(cache.data);
    return NextResponse.json({ error: 'Failed to fetch news. Please try again later.' }, { status: 502 });
  }
}
