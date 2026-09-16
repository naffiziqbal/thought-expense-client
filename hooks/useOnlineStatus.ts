'use client';

import { useEffect, useState } from 'react';

/**
 * Browser connectivity. Starts optimistic so server-rendered markup and the
 * first client paint agree (navigator is unavailable during SSR).
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return isOnline;
}
