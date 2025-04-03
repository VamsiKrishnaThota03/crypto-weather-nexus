'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store';
import { fetchWeatherData } from '@/store/slices/weatherSlice';
import WeatherSection from '@/components/WeatherSection';

const DEFAULT_CITIES = ['New York', 'London', 'Tokyo'];

export default function WeatherPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchWeatherData(DEFAULT_CITIES));
    const interval = setInterval(() => {
      dispatch(fetchWeatherData(DEFAULT_CITIES));
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Weather</h1>
      <WeatherSection />
    </div>
  );
} 