import { NextResponse } from 'next/server';
import axios from 'axios';

// Cache the responses
const cache = new Map();
const CRYPTO_CACHE_DURATION = 30000; // 30 seconds for crypto data
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Disable static generation for this route
export const dynamic = 'force-dynamic';

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<any> {
  try {
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 429 && retries > 0) {
      // Wait before retrying with exponential backoff
      const delay = RETRY_DELAY * (MAX_RETRIES - retries + 1);
      console.log(`Rate limited, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendData = async () => {
        try {
          // Check cache first
          const cacheKey = 'bitcoin,ethereum';
          const cachedData = cache.get(cacheKey);
          if (cachedData && Date.now() - cachedData.timestamp < CRYPTO_CACHE_DURATION) {
            console.log('Returning cached data');
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(cachedData.data)}\n\n`));
            return;
          }

          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));

          const response = await fetchWithRetry(
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true'
          );

          const data = [
            {
              id: 'bitcoin',
              name: 'Bitcoin',
              current_price: response.bitcoin?.usd || 0,
              price_change_percentage_24h: response.bitcoin?.usd_24h_change || 0
            },
            {
              id: 'ethereum',
              name: 'Ethereum',
              current_price: response.ethereum?.usd || 0,
              price_change_percentage_24h: response.ethereum?.usd_24h_change || 0
            }
          ];

          // Update cache
          cache.set(cacheKey, {
            data,
            timestamp: Date.now(),
          });

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (error) {
          console.error('Error fetching crypto data:', error);
          // Return cached data if available, even if expired
          const cacheKey = 'bitcoin,ethereum';
          const cachedData = cache.get(cacheKey);
          if (cachedData) {
            console.log('Returning expired cached data due to error');
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(cachedData.data)}\n\n`));
          }
        }
      };

      // Send initial data
      await sendData();

      // Set up interval for updates
      const interval = setInterval(sendData, 10000);

      // Clean up on stream close
      return () => {
        clearInterval(interval);
      };
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 