'use client';

import { useAppSelector, useAppDispatch } from '@/store';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { toggleFavoriteCrypto } from '@/store/slices/favoritesSlice';
import Link from 'next/link';

interface CryptoSectionProps {
  showOnlyFavorites?: boolean;
}

export default function CryptoSection({ showOnlyFavorites = false }: CryptoSectionProps) {
  const dispatch = useAppDispatch();
  const { data: cryptoData, loading, error, lastUpdated } = useAppSelector((state) => state.crypto);
  const { cryptos: favoriteCryptos } = useAppSelector((state) => state.favorites);

  // Filter crypto data to show only favorite cryptos if showOnlyFavorites is true
  const filteredCryptoData = showOnlyFavorites
    ? Object.values(cryptoData).filter(crypto => favoriteCryptos.includes(crypto.id))
    : Object.values(cryptoData);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Cryptocurrency</h2>
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
        <h2 className="text-xl font-semibold mb-4 text-white">Cryptocurrency</h2>
        <div className="text-red-400">
          <p>{error}</p>
          {error.includes('Rate limit') && (
            <p className="mt-2 text-sm">Please wait a few minutes before trying again.</p>
          )}
        </div>
      </div>
    );
  }

  if (showOnlyFavorites && filteredCryptoData.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Cryptocurrency</h2>
        <p className="text-gray-400">No favorite cryptocurrencies selected</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Cryptocurrency</h2>
        {lastUpdated && (
          <span className="text-sm text-gray-400">
            Updated {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="space-y-4">
        {filteredCryptoData.map((crypto) => (
          <Link 
            key={crypto.id} 
            href={`/crypto/${crypto.id}`}
            className="block"
          >
            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800 hover:bg-gray-700 transition-colors">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <img src={crypto.image} alt={crypto.name} className="w-8 h-8" />
                  <div>
                    <h3 className="font-medium text-white">{crypto.name}</h3>
                    <p className="text-gray-400">{crypto.symbol}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(toggleFavoriteCrypto(crypto.id));
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={favoriteCryptos.includes(crypto.id) ? "Remove from favorites" : "Add to favorites"}
                >
                  {favoriteCryptos.includes(crypto.id) ? (
                    <HeartIconSolid className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold text-white">
                  ${crypto.current_price.toLocaleString()}
                </p>
                <p className={`${crypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  24h: {crypto.price_change_percentage_24h >= 0 ? '+' : ''}{crypto.price_change_percentage_24h.toFixed(2)}%
                </p>
                <p className="text-gray-400">
                  Market Cap: ${(crypto.market_cap / 1e9).toFixed(2)}B
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 