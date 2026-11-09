import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'CryptoWeather Nexus',
    template: '%s · CryptoWeather Nexus',
  },
  description: 'Live cryptocurrency prices, city weather and crypto news in one dashboard.',
};

export const viewport: Viewport = {
  themeColor: '#020617',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
          <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
            Data from CoinGecko, OpenWeatherMap and CryptoCompare. Prices refresh every 30 seconds.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
