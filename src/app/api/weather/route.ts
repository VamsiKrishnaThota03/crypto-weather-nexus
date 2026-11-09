import { NextResponse } from 'next/server';
import { isValidCity } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const cache = new Map<string, { data: unknown; timestamp: number }>();
const WEATHER_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  if (!isValidCity(city)) {
    return NextResponse.json({ error: 'Missing or invalid city parameter' }, { status: 400 });
  }

  const cacheKey = city.trim().toLowerCase();
  const cachedData = cache.get(cacheKey);
  if (cachedData && Date.now() - cachedData.timestamp < WEATHER_CACHE_DURATION) {
    return NextResponse.json(cachedData.data);
  }

  // Server-side only key; never exposed to the browser bundle.
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Weather is unavailable: OPENWEATHER_API_KEY is not configured on the server.' },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.trim())}&units=metric&appid=${apiKey}`,
      { headers: { Accept: 'application/json' }, cache: 'no-store' }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: `City "${city}" not found` }, { status: 404 });
      }
      if (response.status === 429) {
        if (cachedData) return NextResponse.json(cachedData.data);
        return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
      }
      if (response.status === 401) {
        return NextResponse.json({ error: 'Weather API key was rejected.' }, { status: 502 });
      }
      throw new Error(`OpenWeather API error: ${response.status}`);
    }

    const data = await response.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Weather API error:', error instanceof Error ? error.message : error);
    if (cachedData) return NextResponse.json(cachedData.data);
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 502 });
  }
}
