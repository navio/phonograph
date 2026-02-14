import { useState, useEffect, useCallback } from "react";

interface UseOnlineOptions {
  onOffline?: () => void;
  onOnline?: () => void;
}

export const useOnline = ({ onOffline, onOnline }: UseOnlineOptions = {}) => {
  const [online, setOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);

  const handleOnline = useCallback(() => {
    onOnline && onOnline();
    setOnline(true);
  }, [onOnline]);

  const handleOffline = useCallback(() => {
    onOffline && onOffline();
    setOnline(false);
  }, [onOffline]);

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  });
  return {
    online,
  };
};

export default useOnline;
