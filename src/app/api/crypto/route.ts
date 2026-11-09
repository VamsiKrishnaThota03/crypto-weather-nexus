import { NextRequest, NextResponse } from 'next/server';
import { parseCoinIds } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const cache = new Map<string, { data: unknown[]; timestamp: number }>();
const CRYPTO_CACHE_DURATION = 30_000; // 30 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1500;

class UpstreamError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  const response = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  if (response.ok) return response;
  if (response.status === 429 && retries > 0) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)));
    return fetchWithRetry(url, retries - 1);
  }
  throw new UpstreamError(
    response.status === 429 ? 'Rate limit exceeded. Please try again in a minute.' : `CoinGecko API error (${response.status})`,
    response.status === 429 ? 429 : 502
  );
}

export async function GET(request: NextRequest) {
  const ids = parseCoinIds(request.nextUrl.searchParams.get('ids'));
  if (!ids) {
    return NextResponse.json({ error: 'Missing or invalid ids parameter' }, { status: 400 });
  }

  const cacheKey = [...ids].sort().join(',');
  const cachedData = cache.get(cacheKey);
  if (cachedData && Date.now() - cachedData.timestamp < CRYPTO_CACHE_DURATION) {
    return NextResponse.json(cachedData.data);
  }

  try {
    const response = await fetchWithRetry(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(ids.join(','))}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
    );
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new UpstreamError('Invalid response format from CoinGecko API', 502);
    }

    const validData = data.filter(
      (item) => item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.symbol === 'string'
    );
    if (validData.length === 0) {
      return NextResponse.json({ error: 'No data found for the requested coins' }, { status: 404 });
    }

    cache.set(cacheKey, { data: validData, timestamp: Date.now() });
    return NextResponse.json(validData);
  } catch (error) {
    console.error('Error fetching crypto data:', error instanceof Error ? error.message : error);
    // Serve stale data rather than nothing
    if (cachedData) return NextResponse.json(cachedData.data);
    const status = error instanceof UpstreamError ? error.status : 502;
    const message = error instanceof UpstreamError ? error.message : 'Failed to fetch crypto data';
    return NextResponse.json({ error: message }, { status });
  }
}
