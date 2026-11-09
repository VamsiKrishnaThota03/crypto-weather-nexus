'use client';

import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { ReactNode, useEffect } from 'react';
import { store } from '@/store';
import { hydrateFavorites, loadFavorites } from '@/store/slices/favoritesSlice';
import { useLiveUpdates } from '@/hooks/useLiveUpdates';

function ClientEffects() {
  useEffect(() => {
    store.dispatch(hydrateFavorites(loadFavorites()));
  }, []);
  useLiveUpdates();
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ClientEffects />
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
        }}
      />
    </Provider>
  );
}
