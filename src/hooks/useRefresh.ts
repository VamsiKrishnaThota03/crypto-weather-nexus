import { useCallback, useEffect, useRef } from 'react';
import { REFRESH_MS } from '@/lib/constants';

/** Run `load` now and every `intervalMs`; returns a function to trigger a manual reload. */
export function useRefresh(load: () => void, intervalMs = REFRESH_MS) {
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    loadRef.current();
    const id = setInterval(() => loadRef.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return useCallback(() => loadRef.current(), []);
}
