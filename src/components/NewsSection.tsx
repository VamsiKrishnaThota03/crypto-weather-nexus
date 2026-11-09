'use client';

import { NewspaperIcon } from '@heroicons/react/24/outline';
import { useAppSelector } from '@/store';
import { EmptyState, ErrorState, SectionCard, SkeletonRows } from './ui';

const truncate = (text: string, maxLength: number) =>
  text.length <= maxLength ? text : `${text.slice(0, maxLength).replace(/\s+\S*$/, '')}…`;

export default function NewsSection({ onRetry }: { onRetry?: () => void }) {
  const { items, loading, error } = useAppSelector((state) => state.news);

  let body;
  if (items.length === 0 && loading) {
    body = <SkeletonRows rows={3} />;
  } else if (items.length === 0 && error) {
    body = <ErrorState message={error} onRetry={onRetry} />;
  } else if (items.length === 0) {
    body = <EmptyState title="No headlines right now" />;
  } else {
    body = (
      <ul className="divide-y divide-slate-800">
        {items.map((item) => (
          <li key={item.url}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-lg px-2 py-3 transition hover:bg-slate-800/50"
            >
              <h3 className="line-clamp-2 font-medium text-sky-300 group-hover:text-sky-200">{item.title}</h3>
              {item.description && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-400">{truncate(item.description, 150)}</p>
              )}
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-400">{item.source}</span>
                <time dateTime={item.publishedAt} suppressHydrationWarning>
                  {new Date(item.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </time>
              </div>
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <SectionCard title="Latest News" icon={<NewspaperIcon className="h-5 w-5 text-violet-400" aria-hidden="true" />}>
      {body}
    </SectionCard>
  );
}
