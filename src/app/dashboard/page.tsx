'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store';
import { fetchWeatherData } from '@/store/slices/weatherSlice';
import { fetchCryptoData } from '@/store/slices/cryptoSlice';
import { fetchNewsData } from '@/store/slices/newsSlice';
import { useWebSocket } from '@/hooks/useWebSocket';
import WeatherSection from '@/components/WeatherSection';
import CryptoSection from '@/components/CryptoSection';
import NewsSection from '@/components/NewsSection';

const DEFAULT_CITIES = ['New York', 'London', 'Tokyo'];
const DEFAULT_CRYPTOS = ['bitcoin', 'ethereum', 'cardano'];

export default function Dashboard() {
  const dispatch = useAppDispatch();
  useWebSocket();

  useEffect(() => {
    dispatch(fetchWeatherData(DEFAULT_CITIES));
    dispatch(fetchCryptoData(DEFAULT_CRYPTOS));
    dispatch(fetchNewsData());

    const interval = setInterval(() => {
      dispatch(fetchWeatherData(DEFAULT_CITIES));
      dispatch(fetchCryptoData(DEFAULT_CRYPTOS));
      dispatch(fetchNewsData());
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">CryptoWeather Nexus</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          <WeatherSection />
        </div>
        
        <div className="col-span-1">
          <CryptoSection />
        </div>
        
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <NewsSection />
        </div>
      </div>
    </div>
  );
} 