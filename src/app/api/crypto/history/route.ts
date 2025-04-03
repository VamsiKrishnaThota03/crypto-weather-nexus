import { NextResponse } from 'next/server';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');
  const days = searchParams.get('days') || '7';

  if (!ids) {
    return NextResponse.json({ error: 'Missing required parameter: ids' }, { status: 400 });
  }

  // Check cache
  const cacheKey = `${ids}-${days}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data);
  }

  try {
    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${ids}/market_chart?vs_currency=usd&days=${days}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        // If rate limited, try to return cached data even if expired
        if (cached) {
          return NextResponse.json(cached.data);
        }
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the response
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching crypto history:', error);
    // If we have cached data, return it even if expired
    if (cached) {
      return NextResponse.json(cached.data);
    }
    return NextResponse.json(
      { error: 'Failed to fetch cryptocurrency history' },
      { status: 500 }
    );
  }
} 