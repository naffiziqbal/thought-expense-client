'use client';

import { useEffect } from 'react';
import { APP_SCHEME, PLAY_STORE_URL } from '@/lib/appLinks';

/**
 * On Android: try custom scheme (app installed) then fall back to Play Store.
 * Else: go straight to Play Store.
 */
export function GetAppRedirect() {
  useEffect(() => {
    const ua = navigator.userAgent;
    const isAndroid = /Android/i.test(ua);

    if (!isAndroid) {
      window.location.replace(PLAY_STORE_URL);
      return;
    }

    const fallback = window.setTimeout(() => {
      window.location.replace(PLAY_STORE_URL);
    }, 1600);

    const onHidden = () => {
      if (document.visibilityState === 'hidden') {
        window.clearTimeout(fallback);
      }
    };
    document.addEventListener('visibilitychange', onHidden);

    window.location.href = `${APP_SCHEME}://`;

    return () => {
      window.clearTimeout(fallback);
      document.removeEventListener('visibilitychange', onHidden);
    };
  }, []);

  return null;
}
