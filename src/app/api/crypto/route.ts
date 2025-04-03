import { NextResponse } from 'next/server';

// Cache the responses
const cache = new Map();
const CRYPTO_CACHE_DURATION = 30000; // 30 seconds for crypto data
const WEATHER_CACHE_DURATION = 300000; // 5 minutes for weather data
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(url, retries - 1);
      }
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');

    if (!ids) {
      return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 });
    }

    // Check cache
    const cacheKey = ids;
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CRYPTO_CACHE_DURATION) {
      return NextResponse.json(cachedData.data);
    }

    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await fetchWithRetry(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
    );

    const data = await response.json();
    
    // Update cache
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Crypto API error:', error);
    
    // Return cached data if available, even if expired
    const cacheKey = new URL(request.url).searchParams.get('ids');
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData.data);
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch cryptocurrency data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 