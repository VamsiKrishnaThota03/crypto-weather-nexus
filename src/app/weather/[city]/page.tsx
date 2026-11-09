'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchWeatherData } from '@/store/slices/weatherSlice';
import { toggleFavoriteCity } from '@/store/slices/favoritesSlice';
import { ErrorState, FavoriteButton } from '@/components/ui';

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums text-white">{value}</dd>
    </div>
  );
}

export default function WeatherDetail() {
  const { city } = useParams<{ city: string }>();
  const dispatch = useAppDispatch();
  const { data, loading, error, cityErrors } = useAppSelector((state) => state.weather);
  const { cities: favoriteCities } = useAppSelector((state) => state.favorites);

  const decodedCity = decodeURIComponent(city);
  const weather = data[decodedCity];

  useEffect(() => {
    if (decodedCity) dispatch(fetchWeatherData([decodedCity]));
  }, [dispatch, decodedCity]);

  const back = (
    <Link href="/weather" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
      <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" /> All cities
    </Link>
  );

  if (!weather) {
    const message = cityErrors[decodedCity] || error;
    return (
      <div className="mx-auto max-w-4xl">
        {back}
        {loading || !message ? (
          <div className="animate-pulse space-y-4" aria-label="Loading">
            <div className="h-10 w-1/3 rounded-lg bg-slate-800" />
            <div className="h-40 rounded-2xl bg-slate-800/60" />
          </div>
        ) : (
          <ErrorState message={message} />
        )}
      </div>
    );
  }

  const description = weather.weather?.[0]?.description ?? weather.conditions;

  return (
    <div className="mx-auto max-w-4xl">
      {back}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">{decodedCity}</h1>
          <p className="text-sm text-slate-400" suppressHydrationWarning>
            Observed {new Date(weather.dt * 1000).toLocaleString()}
          </p>
        </div>
        <FavoriteButton
          size="lg"
          active={favoriteCities.includes(decodedCity)}
          label={decodedCity}
          onToggle={() => dispatch(toggleFavoriteCity(decodedCity))}
        />
      </div>

      <div className="card mb-6 flex items-center gap-6 p-6">
        {weather.icon && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`} alt="" width={112} height={112} className="-m-4 h-28 w-28" />
        )}
        <div>
          <p className="text-6xl font-bold tabular-nums text-white">{Math.round(weather.main.temp)}°C</p>
          <p className="mt-1 capitalize text-slate-300">{description}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Feels like" value={`${Math.round(weather.main.feels_like)}°C`} />
        <Stat label="Humidity" value={`${weather.main.humidity}%`} />
        <Stat label="Wind" value={`${weather.wind.speed} m/s`} />
        <Stat label="Pressure" value={`${weather.main.pressure} hPa`} />
      </dl>
    </div>
  );
}
