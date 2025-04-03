'use client';

import { useAppSelector } from '@/store';
import { useEffect } from 'react';
import { useAppDispatch } from '@/store';
import { fetchWeatherData } from '@/store/slices/weatherSlice';
import { fetchCryptoData } from '@/store/slices/cryptoSlice';
import WeatherSection from '@/components/WeatherSection';
import CryptoSection from '@/components/CryptoSection';

export default function FavoritesPage() {
  const dispatch = useAppDispatch();
  const { cities: favoriteCities, cryptos: favoriteCryptos } = useAppSelector((state) => state.favorites);

  useEffect(() => {
    if (favoriteCities.length > 0) {
      dispatch(fetchWeatherData(favoriteCities));
    }
    if (favoriteCryptos.length > 0) {
      dispatch(fetchCryptoData(favoriteCryptos));
    }
  }, [dispatch, favoriteCities, favoriteCryptos]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
      
      {favoriteCities.length === 0 && favoriteCryptos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">You haven't added any favorites yet.</p>
          <p className="text-gray-500 mt-2">Add cities and cryptocurrencies to your favorites to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favoriteCities.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Favorite Cities</h2>
              <WeatherSection showOnlyFavorites={true} />
            </div>
          )}
          
          {favoriteCryptos.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Favorite Cryptocurrencies</h2>
              <CryptoSection showOnlyFavorites={true} />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 