'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCryptoData } from '@/store/slices/cryptoSlice';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { toggleFavoriteCrypto } from '@/store/slices/favoritesSlice';
import PriceChart from '@/components/PriceChart';

export default function CryptoDetail() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.crypto);
  const { cryptos: favoriteCryptos } = useAppSelector((state) => state.favorites);
  const crypto = data[id as string];

  useEffect(() => {
    if (id) {
      dispatch(fetchCryptoData([id as string]));
    }
  }, [dispatch, id]);

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

  if (error || !crypto) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-red-400">
            {error || 'Cryptocurrency not found'}
          </div>
        </div>
      </div>
    );
  }

  const formatNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null) return 'N/A';
    return value.toLocaleString();
  };

  const formatPrice = (value: number | undefined | null) => {
    if (value === undefined || value === null) return 'N/A';
    return `$${value.toLocaleString()}`;
  };

  const formatPercentage = (value: number | undefined | null) => {
    if (value === undefined || value === null) return 'N/A';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <img src={crypto.image} alt={crypto.name} className="w-12 h-12" />
          <div>
            <h1 className="text-3xl font-bold text-white">{crypto.name}</h1>
            <p className="text-gray-400">{crypto.symbol?.toUpperCase() || 'N/A'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Current Price</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400">Price</p>
                <p className="text-2xl font-bold text-white">{formatPrice(crypto.current_price)}</p>
              </div>
              <div>
                <p className="text-gray-400">24h Change</p>
                <p className={`text-xl font-semibold ${crypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercentage(crypto.price_change_percentage_24h)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400">Market Cap</p>
                <p className="text-white">{formatPrice(crypto.market_cap)}</p>
              </div>
              <div>
                <p className="text-gray-400">Rank</p>
                <p className="text-white">#{formatNumber(crypto.market_cap_rank)}</p>
              </div>
              <div>
                <p className="text-gray-400">Circulating Supply</p>
                <p className="text-white">
                  {formatNumber(crypto.circulating_supply)} {crypto.symbol?.toUpperCase() || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Total Supply</p>
                <p className="text-white">
                  {crypto.total_supply ? formatNumber(crypto.total_supply) : '∞'} {crypto.symbol?.toUpperCase() || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 