import Link from 'next/link';
import { ArrowRightIcon, CloudIcon, CurrencyDollarIcon, NewspaperIcon } from '@heroicons/react/24/outline';

const features = [
  {
    href: '/crypto',
    title: 'Crypto prices',
    text: 'Live prices, 24h change and market cap from CoinGecko, with 7-day charts.',
    icon: CurrencyDollarIcon,
    accent: 'text-amber-400 bg-amber-400/10',
  },
  {
    href: '/weather',
    title: 'City weather',
    text: 'Current temperature, humidity, wind and conditions from OpenWeatherMap.',
    icon: CloudIcon,
    accent: 'text-sky-400 bg-sky-400/10',
  },
  {
    href: '/dashboard',
    title: 'Crypto news',
    text: 'The latest headlines from CryptoCompare next to your prices.',
    icon: NewspaperIcon,
    accent: 'text-violet-400 bg-violet-400/10',
  },
];

export default function HomePage() {
  return (
    <div className="py-8 sm:py-16">
      <section className="mx-auto max-w-3xl text-center">
        <p className="mb-4 inline-flex rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
          Prices refresh every 30s · Alerts for big moves
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          Markets and weather,{' '}
          <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">at a glance</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
          One dashboard for cryptocurrency prices, city weather and crypto news. Save favorites and get a toast when
          something changes.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:bg-sky-400"
          >
            Open dashboard <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/favorites"
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
          >
            My favorites
          </Link>
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:mt-24 md:grid-cols-3">
        {features.map((f) => (
          <Link key={f.title} href={f.href} className="card card-hover group p-6">
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${f.accent}`}>
              <f.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-semibold text-white">{f.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.text}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-sky-400 group-hover:text-sky-300">
              Explore <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
