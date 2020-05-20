import { useState, useEffect, useCallback } from 'react';
export const useOnline = ({ onOffline, onOnline }) => {
  const [online, setOnline] = useState(navigator.onLine);

  const handleOnline = useCallback(() => {
    onOnline && onOnline();
    setOnline(true);
  }, [onOnline]);

  const handleOffline = useCallback(() => {
    onOffline && onOffline();
    setOnline(false);
  }, [onOffline]);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });
  return {
    online,
  };
};