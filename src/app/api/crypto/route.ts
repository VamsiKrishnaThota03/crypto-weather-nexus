import { NextRequest, NextResponse } from 'next/server';

// Cache the responses
const cache = new Map();
const CRYPTO_CACHE_DURATION = 30000; // 30 seconds for crypto data
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

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
        // Wait before retrying with exponential backoff
        const delay = RETRY_DELAY * (MAX_RETRIES - retries + 1);
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, retries - 1);
      }
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      const delay = RETRY_DELAY * (MAX_RETRIES - retries + 1);
      console.log(`Error occurred, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const ids = request.nextUrl.searchParams.get('ids');

    if (!ids) {
      return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 });
    }

    // Validate ids parameter
    const idList = ids.split(',').filter(id => id.trim());
    if (idList.length === 0) {
      return NextResponse.json({ error: 'No valid cryptocurrency IDs provided' }, { status: 400 });
    }

    // Check cache
    const cacheKey = ids;
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CRYPTO_CACHE_DURATION) {
      console.log('Returning cached data');
      return NextResponse.json(cachedData.data);
    }

    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Fetching data from CoinGecko API...');
    const response = await fetchWithRetry(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
    );

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from CoinGecko API');
    }

    // Validate response data
    if (data.length === 0) {
      throw new Error('No cryptocurrency data received from CoinGecko API');
    }

    // Filter out any invalid entries
    const validData = data.filter(item => 
      item && 
      typeof item.id === 'string' && 
      typeof item.name === 'string' &&
      typeof item.symbol === 'string'
    );

    if (validData.length === 0) {
      throw new Error('No valid cryptocurrency data received');
    }

    // Update cache
    cache.set(cacheKey, {
      data: validData,
      timestamp: Date.now(),
    });

    return NextResponse.json(validData);
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch crypto data' },
      { status: 500 }
    );
  }
} 