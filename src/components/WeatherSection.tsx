'use client';

import Link from 'next/link';
import { CloudIcon } from '@heroicons/react/24/outline';
import { useAppSelector, useAppDispatch } from '@/store';
import { toggleFavoriteCity } from '@/store/slices/favoritesSlice';
import { EmptyState, ErrorState, FavoriteButton, SectionCard, SkeletonRows } from './ui';

interface WeatherSectionProps {
  cities: string[];
  title?: string;
  onRetry?: () => void;
}

export default function WeatherSection({ cities, title = 'Weather', onRetry }: WeatherSectionProps) {
  const dispatch = useAppDispatch();
  const { data: weatherData, loading, error, cityErrors } = useAppSelector((state) => state.weather);
  const { cities: favoriteCities } = useAppSelector((state) => state.favorites);

  const rows = cities.map((city) => ({ city, data: weatherData[city], error: cityErrors[city] }));
  const hasAny = rows.some((r) => r.data);

  let body;
  if (!hasAny && loading) {
    body = <SkeletonRows rows={Math.min(Math.max(cities.length, 1), 3)} />;
  } else if (!hasAny && error) {
    body = (
      <ErrorState
        message={error}
        hint={error.includes('OPENWEATHER_API_KEY') ? 'Add OPENWEATHER_API_KEY to .env.local and restart the server.' : undefined}
        onRetry={onRetry}
      />
    );
  } else if (cities.length === 0) {
    body = <EmptyState title="No cities to show" />;
  } else {
    body = (
      <ul className="space-y-3">
        {rows.map(({ city, data, error: cityError }) => (
          <li key={city} className="card-hover relative flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            {data?.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
                alt=""
                width={48}
                height={48}
                className="-m-1 h-12 w-12"
              />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
                <CloudIcon className="h-5 w-5 text-sky-300" aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <Link
                href={`/weather/${encodeURIComponent(city)}`}
                className="font-semibold text-white after:absolute after:inset-0 after:rounded-xl"
              >
                {city}
              </Link>
              <p className="truncate text-xs text-slate-400">
                {data ? `${data.conditions} · Humidity ${data.humidity}%` : cityError || 'Loading…'}
              </p>
            </div>
            <p className="text-2xl font-semibold tabular-nums text-white">{data ? `${data.temperature}°` : '–'}</p>
            <FavoriteButton
              active={favoriteCities.includes(city)}
              label={city}
              onToggle={() => dispatch(toggleFavoriteCity(city))}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <SectionCard title={title} icon={<CloudIcon className="h-5 w-5 text-sky-400" aria-hidden="true" />}>
      {body}
    </SectionCard>
  );
}
