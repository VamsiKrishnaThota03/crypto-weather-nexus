'use client';

import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { ReactNode } from 'react';

export function SectionCard({
  title,
  icon,
  aside,
  children,
}: {
  title: string;
  icon?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="card p-5 sm:p-6" aria-label={title}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          {icon}
          {title}
        </h2>
        {aside && <div className="text-xs text-slate-400">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

export function SkeletonRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-slate-800 p-4">
          <div className="mb-3 h-4 w-1/3 rounded bg-slate-800" />
          <div className="mb-2 h-6 w-1/2 rounded bg-slate-800" />
          <div className="h-3 w-2/3 rounded bg-slate-800" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function ErrorState({ message, hint, onRetry }: { message: string; hint?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-900/60 bg-rose-950/30 p-4 text-sm">
      <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-rose-400" aria-hidden="true" />
      <div className="flex-1">
        <p className="font-medium text-rose-200">{message}</p>
        {hint && <p className="mt-1 text-rose-300/80">{hint}</p>}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-lg bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/25"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">
      <p className="font-medium text-slate-200">{title}</p>
      {children && <div className="mt-2 text-sm text-slate-400">{children}</div>}
    </div>
  );
}

export function FavoriteButton({
  active,
  label,
  onToggle,
  size = 'md',
}: {
  active: boolean;
  label: string;
  onToggle: () => void;
  size?: 'md' | 'lg';
}) {
  const iconClass = size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={active ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
      title={active ? 'Remove from favorites' : 'Add to favorites'}
      className="relative z-10 rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-rose-400"
    >
      {active ? <HeartIconSolid className={`${iconClass} text-rose-500`} /> : <HeartIcon className={iconClass} />}
    </button>
  );
}

export function ChangeBadge({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
        up ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
      }`}
    >
      {up ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
    </span>
  );
}

export const usd = (value: number, maximumFractionDigits = value < 1 ? 6 : 2) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits }).format(value);

export const compactUsd = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(value);
