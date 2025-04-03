import { NextResponse } from 'next/server';
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3001 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send initial data
  const sendInitialData = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum&order=market_cap_desc&per_page=100&page=1&sparkline=false',
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.statusText}`);
      }

      const data = await response.json();
      ws.send(JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  sendInitialData();

  // Set up interval for updates
  const interval = setInterval(sendInitialData, 10000);

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

export async function GET() {
  return NextResponse.json({ message: 'WebSocket server is running' });
} 