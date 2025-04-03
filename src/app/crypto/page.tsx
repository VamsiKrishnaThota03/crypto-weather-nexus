'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store';
import { fetchCryptoData } from '@/store/slices/cryptoSlice';
import CryptoSection from '@/components/CryptoSection';

const DEFAULT_CRYPTOS = ['bitcoin', 'ethereum', 'cardano'];

export default function CryptoPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchCryptoData(DEFAULT_CRYPTOS));
    const interval = setInterval(() => {
      dispatch(fetchCryptoData(DEFAULT_CRYPTOS));
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Cryptocurrency</h1>
      <CryptoSection />
    </div>
  );
} 