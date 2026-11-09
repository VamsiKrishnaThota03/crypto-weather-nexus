'use client';

import Link from 'next/link';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useAppSelector, useAppDispatch } from '@/store';
import { toggleFavoriteCrypto } from '@/store/slices/favoritesSlice';
import { ChangeBadge, compactUsd, EmptyState, ErrorState, FavoriteButton, SectionCard, SkeletonRows, usd } from './ui';

interface CryptoSectionProps {
  ids: string[];
  title?: string;
  onRetry?: () => void;
}

export default function CryptoSection({ ids, title = 'Cryptocurrency', onRetry }: CryptoSectionProps) {
  const dispatch = useAppDispatch();
  const { data: cryptoData, loading, error, lastUpdated } = useAppSelector((state) => state.crypto);
  const { cryptos: favoriteCryptos } = useAppSelector((state) => state.favorites);

  const coins = ids.map((id) => cryptoData[id]).filter(Boolean);

  let body;
  if (coins.length === 0 && loading) {
    body = <SkeletonRows rows={Math.min(Math.max(ids.length, 1), 3)} />;
  } else if (coins.length === 0 && error) {
    body = (
      <ErrorState
        message={error}
        hint={error.includes('Rate limit') ? 'CoinGecko limits free requests. Wait a minute and retry.' : undefined}
        onRetry={onRetry}
      />
    );
  } else if (coins.length === 0) {
    body = <EmptyState title="No coins to show" />;
  } else {
    body = (
      <ul className="space-y-3">
        {coins.map((crypto) => (
          <li key={crypto.id} className="card-hover relative flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            {crypto.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={crypto.image} alt="" className="h-10 w-10 rounded-full" width={40} height={40} />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-bold">
                {crypto.symbol.charAt(0)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <Link href={`/crypto/${crypto.id}`} className="font-semibold text-white after:absolute after:inset-0 after:rounded-xl">
                {crypto.name}
              </Link>
              <p className="truncate text-xs text-slate-400">
                <span className="uppercase tracking-wide">{crypto.symbol}</span>
                <span className="hidden sm:inline"> · {compactUsd(crypto.market_cap)} mcap</span>
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold tabular-nums text-white">{usd(crypto.current_price)}</p>
              <ChangeBadge value={crypto.price_change_percentage_24h} />
            </div>
            <FavoriteButton
              active={favoriteCryptos.includes(crypto.id)}
              label={crypto.name}
              onToggle={() => dispatch(toggleFavoriteCrypto(crypto.id))}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <SectionCard
      title={title}
      icon={<CurrencyDollarIcon className="h-5 w-5 text-amber-400" aria-hidden="true" />}
      aside={lastUpdated ? <span suppressHydrationWarning>Updated {new Date(lastUpdated).toLocaleTimeString()}</span> : null}
    >
      {body}
    </SectionCard>
  );
}
