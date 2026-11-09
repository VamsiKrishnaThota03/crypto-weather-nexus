import { useEffect } from 'react';
import { useStore } from 'react-redux';
import type { AppStore } from '@/store';
import { LiveUpdatesService } from '@/services/liveUpdates';

let service: LiveUpdatesService | null = null;

/** Start the shared price/weather alert poller. It keeps running across page navigation. */
export const useLiveUpdates = () => {
  const store = useStore() as AppStore;
  useEffect(() => {
    if (!service) service = new LiveUpdatesService(() => store);
    service.start();
  }, [store]);
};
