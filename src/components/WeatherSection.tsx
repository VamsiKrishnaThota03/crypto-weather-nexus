'use client';

import { useAppSelector, useAppDispatch } from '@/store';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { toggleFavoriteCity } from '@/store/slices/favoritesSlice';
import Link from 'next/link';

interface WeatherSectionProps {
  showOnlyFavorites?: boolean;
}

export default function WeatherSection({ showOnlyFavorites = false }: WeatherSectionProps) {
  const dispatch = useAppDispatch();
  const { data: weatherData, loading, error } = useAppSelector((state) => state.weather);
  const { cities: favoriteCities } = useAppSelector((state) => state.favorites);

  // Filter weather data to show only favorite cities if showOnlyFavorites is true
  const filteredWeatherData = showOnlyFavorites
    ? Object.values(weatherData).filter(cityData => favoriteCities.includes(cityData.city))
    : Object.values(weatherData);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Weather</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Weather</h2>
        <p className="text-red-400">Error loading weather data</p>
      </div>
    );
  }

  if (showOnlyFavorites && filteredWeatherData.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Weather</h2>
        <p className="text-gray-400">No favorite cities selected</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Weather</h2>
      <div className="space-y-4">
        {filteredWeatherData.map((cityData) => (
          <Link
            key={cityData.city}
            href={`/weather/${encodeURIComponent(cityData.city)}`}
            className="block"
          >
            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800 hover:bg-gray-700 transition-colors">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-white">{cityData.city}</h3>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(toggleFavoriteCity(cityData.city));
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={favoriteCities.includes(cityData.city) ? "Remove from favorites" : "Add to favorites"}
                >
                  {favoriteCities.includes(cityData.city) ? (
                    <HeartIconSolid className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold text-white">{cityData.temperature}°C</p>
                <p className="text-gray-400">Humidity: {cityData.humidity}%</p>
                <p className="text-gray-400">Conditions: {cityData.conditions}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 