'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-8">Welcome to CryptoWeather Nexus</h1>
      <p className="text-xl mb-8 text-center">
        Your one-stop dashboard for cryptocurrency prices and weather information
      </p>
      <div className="flex flex-col md:flex-row gap-4">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/crypto"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          View Cryptocurrencies
        </Link>
        <Link
          href="/weather"
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Check Weather
        </Link>
      </div>
    </div>
  );
}
