'use client';

import { useAppDispatch } from '@/store';
import { fetchWeatherData } from '@/store/slices/weatherSlice';
import { useRefresh } from '@/hooks/useRefresh';
import { DEFAULT_CITIES } from '@/lib/constants';
import WeatherSection from '@/components/WeatherSection';

export default function WeatherPage() {
  const dispatch = useAppDispatch();
  const reload = useRefresh(() => dispatch(fetchWeatherData(DEFAULT_CITIES)));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">Weather</h1>
      <p className="mb-8 text-slate-400">Current conditions. Tap a city for wind, pressure and more.</p>
      <WeatherSection cities={DEFAULT_CITIES} title="Cities" onRetry={reload} />
    </div>
  );
}
