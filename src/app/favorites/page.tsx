'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchWeatherData } from '@/store/slices/weatherSlice';
import { fetchCryptoData } from '@/store/slices/cryptoSlice';
import WeatherSection from '@/components/WeatherSection';
import CryptoSection from '@/components/CryptoSection';
import { EmptyState } from '@/components/ui';

export default function FavoritesPage() {
  const dispatch = useAppDispatch();
  const { cities: favoriteCities, cryptos: favoriteCryptos } = useAppSelector((state) => state.favorites);
  const citiesKey = favoriteCities.join('|');
  const cryptosKey = favoriteCryptos.join(',');

  useEffect(() => {
    if (citiesKey) dispatch(fetchWeatherData(citiesKey.split('|')));
  }, [dispatch, citiesKey]);

  useEffect(() => {
    if (cryptosKey) dispatch(fetchCryptoData(cryptosKey.split(',')));
  }, [dispatch, cryptosKey]);

  const none = favoriteCities.length === 0 && favoriteCryptos.length === 0;

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">My Favorites</h1>
      <p className="mb-8 text-slate-400">Saved in this browser. Favorite cities also get weather-change alerts.</p>

      {none ? (
        <div className="mx-auto max-w-lg">
          <EmptyState title="You haven't added any favorites yet">
            Tap the heart next to a city or coin on the{' '}
            <Link href="/dashboard" className="font-medium text-sky-400 hover:text-sky-300">
              dashboard
            </Link>{' '}
            to pin it here.
          </EmptyState>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {favoriteCities.length > 0 && <WeatherSection cities={favoriteCities} title="Favorite cities" />}
          {favoriteCryptos.length > 0 && <CryptoSection ids={favoriteCryptos} title="Favorite coins" />}
        </div>
      )}
    </div>
  );
}
