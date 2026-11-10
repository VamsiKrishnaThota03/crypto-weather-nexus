import { NextResponse } from 'next/server';
import { ALLOWED_HISTORY_DAYS, isValidCoinId } from '@/lib/validation';
import { rateLimitGuard } from '@/lib/server/rateLimit';

export const dynamic = 'force-dynamic';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: unknown; timestamp: number }>();

/** Returns CoinGecko's market_chart payload: { prices: [timestamp, price][], ... } */
export async function GET(request: Request) {
  // A blocked request must never reach the upstream API — that is what
  // protects the quota (and, for CoinGecko, the server's own IP reputation).
  const blocked = rateLimitGuard(request);
  if (blocked) return blocked;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') ?? searchParams.get('ids');
  const days = searchParams.get('days') || '7';

  if (!isValidCoinId(id)) {
    return NextResponse.json({ error: 'Missing or invalid id parameter' }, { status: 400 });
  }
  if (!ALLOWED_HISTORY_DAYS.includes(days)) {
    return NextResponse.json({ error: 'Invalid days parameter' }, { status: 400 });
  }

  const cacheKey = `${id}-${days}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data);
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${days}`,
      { headers: { Accept: 'application/json' }, cache: 'no-store' }
    );

    if (!response.ok) {
      if (cached) return NextResponse.json(cached.data);
      if (response.status === 429) {
        return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
      }
      if (response.status === 404) {
        return NextResponse.json({ error: 'Unknown coin' }, { status: 404 });
      }
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching crypto history:', error instanceof Error ? error.message : error);
    if (cached) return NextResponse.json(cached.data);
    return NextResponse.json({ error: 'Failed to fetch cryptocurrency history' }, { status: 502 });
  }
}
