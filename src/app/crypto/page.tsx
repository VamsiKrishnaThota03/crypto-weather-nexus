'use client';

import { useAppDispatch } from '@/store';
import { fetchCryptoData } from '@/store/slices/cryptoSlice';
import { useRefresh } from '@/hooks/useRefresh';
import { DEFAULT_CRYPTOS } from '@/lib/constants';
import CryptoSection from '@/components/CryptoSection';

export default function CryptoPage() {
  const dispatch = useAppDispatch();
  const reload = useRefresh(() => dispatch(fetchCryptoData(DEFAULT_CRYPTOS)));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">Cryptocurrency</h1>
      <p className="mb-8 text-slate-400">Tap a coin for its 7-day chart and supply details.</p>
      <CryptoSection ids={DEFAULT_CRYPTOS} title="Top coins" onRetry={reload} />
    </div>
  );
}
