'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchWeatherData } from '@/store/slices/weatherSlice';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { toggleFavoriteCity } from '@/store/slices/favoritesSlice';

export default function WeatherDetail() {
  const { city } = useParams();
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.weather);
  const { cities: favoriteCities } = useAppSelector((state) => state.favorites);
  const weather = data[city as string];

  useEffect(() => {
    if (city) {
      dispatch(fetchWeatherData([decodeURIComponent(city as string)]));
    }
  }, [dispatch, city]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 bg-gray-800 rounded"></div>
              <div className="h-32 bg-gray-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-red-400">
            {error || 'Weather data not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">{weather.name}</h1>
            <p className="text-gray-400">
              {new Date(weather.dt * 1000).toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => dispatch(toggleFavoriteCity(weather.name))}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label={favoriteCities.includes(weather.name) ? "Remove from favorites" : "Add to favorites"}
          >
            {favoriteCities.includes(weather.name) ? (
              <HeartIconSolid className="h-8 w-8 text-red-500" />
            ) : (
              <HeartIcon className="h-8 w-8" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Current Weather</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400">Temperature</p>
                <p className="text-2xl font-bold text-white">{Math.round(weather.main.temp)}°C</p>
              </div>
              <div>
                <p className="text-gray-400">Feels Like</p>
                <p className="text-xl text-white">{Math.round(weather.main.feels_like)}°C</p>
              </div>
              <div>
                <p className="text-gray-400">Humidity</p>
                <p className="text-xl text-white">{weather.main.humidity}%</p>
              </div>
              <div>
                <p className="text-gray-400">Wind Speed</p>
                <p className="text-xl text-white">{weather.wind.speed} m/s</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400">Pressure</p>
                <p className="text-white">{weather.main.pressure} hPa</p>
              </div>
              <div>
                <p className="text-gray-400">Visibility</p>
                <p className="text-white">{weather.visibility / 1000} km</p>
              </div>
              <div>
                <p className="text-gray-400">Cloud Cover</p>
                <p className="text-white">{weather.clouds.all}%</p>
              </div>
              <div>
                <p className="text-gray-400">Conditions</p>
                <p className="text-white capitalize">{weather.weather[0].description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 