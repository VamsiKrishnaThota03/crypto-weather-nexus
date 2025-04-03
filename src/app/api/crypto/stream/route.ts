import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendData = async () => {
        try {
          const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true');
          const data = {
            bitcoin: {
              id: 'bitcoin',
              name: 'Bitcoin',
              current_price: response.data.bitcoin.usd,
              price_change_percentage_24h: response.data.bitcoin.usd_24h_change
            },
            ethereum: {
              id: 'ethereum',
              name: 'Ethereum',
              current_price: response.data.ethereum.usd,
              price_change_percentage_24h: response.data.ethereum.usd_24h_change
            }
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify([data.bitcoin, data.ethereum])}\n\n`));
        } catch (error) {
          console.error('Error fetching crypto data:', error);
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