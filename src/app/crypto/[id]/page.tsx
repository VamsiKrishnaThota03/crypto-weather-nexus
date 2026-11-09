'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCryptoData } from '@/store/slices/cryptoSlice';
import { toggleFavoriteCrypto } from '@/store/slices/favoritesSlice';
import PriceChart from '@/components/PriceChart';
import { ChangeBadge, compactUsd, ErrorState, FavoriteButton, usd } from '@/components/ui';

const formatNumber = (num: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num);

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums text-white">{value}</dd>
    </div>
  );
}

export default function CryptoDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.crypto);
  const { cryptos: favoriteCryptos } = useAppSelector((state) => state.favorites);

  const decodedId = decodeURIComponent(id);
  const crypto = data[decodedId];

  useEffect(() => {
    if (decodedId) dispatch(fetchCryptoData([decodedId]));
  }, [dispatch, decodedId]);

  const back = (
    <Link href="/crypto" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
      <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" /> All coins
    </Link>
  );

  if (!crypto) {
    return (
      <div className="mx-auto max-w-4xl">
        {back}
        {loading || !error ? (
          <div className="animate-pulse space-y-4" aria-label="Loading">
            <div className="h-10 w-1/3 rounded-lg bg-slate-800" />
            <div className="h-64 rounded-2xl bg-slate-800/60" />
          </div>
        ) : (
          <ErrorState message={error} hint={`Could not load data for "${decodedId}".`} />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {back}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {crypto.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={crypto.image} alt="" width={48} height={48} className="h-12 w-12 rounded-full" />
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {crypto.name} <span className="text-lg font-medium text-slate-400">{crypto.symbol}</span>
          </h1>
          <p className="text-sm text-slate-400">Rank #{crypto.market_cap_rank || '–'}</p>
        </div>
        <FavoriteButton
          size="lg"
          active={favoriteCryptos.includes(decodedId)}
          label={crypto.name}
          onToggle={() => dispatch(toggleFavoriteCrypto(decodedId))}
        />
      </div>

      <div className="card mb-6 p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-baseline gap-3">
          <p className="text-4xl font-bold tabular-nums text-white">{usd(crypto.current_price)}</p>
          <ChangeBadge value={crypto.price_change_percentage_24h} />
          <span className="text-xs text-slate-500">24h</span>
        </div>
        <h2 className="mb-2 text-sm font-medium text-slate-400">Last 7 days</h2>
        <PriceChart cryptoId={decodedId} />
      </div>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Market cap" value={compactUsd(crypto.market_cap)} />
        <Stat label="Circulating supply" value={`${formatNumber(crypto.circulating_supply)} ${crypto.symbol}`} />
        <Stat
          label="Total supply"
          value={crypto.total_supply ? `${formatNumber(crypto.total_supply)} ${crypto.symbol}` : 'Unlimited'}
        />
      </dl>
    </div>
  );
}
