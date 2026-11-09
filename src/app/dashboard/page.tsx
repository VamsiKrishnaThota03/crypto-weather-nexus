'use client';

import { useAppDispatch } from '@/store';
import { fetchWeatherData } from '@/store/slices/weatherSlice';
import { fetchCryptoData } from '@/store/slices/cryptoSlice';
import { fetchNewsData } from '@/store/slices/newsSlice';
import { useRefresh } from '@/hooks/useRefresh';
import { DEFAULT_CITIES, DEFAULT_CRYPTOS } from '@/lib/constants';
import WeatherSection from '@/components/WeatherSection';
import CryptoSection from '@/components/CryptoSection';
import NewsSection from '@/components/NewsSection';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const reloadWeather = useRefresh(() => dispatch(fetchWeatherData(DEFAULT_CITIES)));
  const reloadCrypto = useRefresh(() => dispatch(fetchCryptoData(DEFAULT_CRYPTOS)));
  const reloadNews = useRefresh(() => dispatch(fetchNewsData()), 5 * 60_000);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-slate-400">Prices, weather and headlines, refreshed automatically.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <WeatherSection cities={DEFAULT_CITIES} onRetry={reloadWeather} />
        <CryptoSection ids={DEFAULT_CRYPTOS} onRetry={reloadCrypto} />
        <div className="md:col-span-2 lg:col-span-1">
          <NewsSection onRetry={reloadNews} />
        </div>
      </div>
    </div>
  );
}
