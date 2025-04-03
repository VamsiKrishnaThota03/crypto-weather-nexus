import { useEffect } from 'react';
import { cryptoService } from '@/services/websocket';

export const useWebSocket = () => {
  useEffect(() => {
    // Connect when the component mounts
    cryptoService.connect();

    // Don't disconnect when the component unmounts
    // This allows the connection to persist across page navigation
    return () => {
      // Only disconnect if we're leaving the app entirely
      if (typeof window !== 'undefined' && !window.location.href.includes(window.location.origin)) {
        cryptoService.disconnect();
      }
    };
  }, []);
}; 