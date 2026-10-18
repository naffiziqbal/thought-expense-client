'use client';

import { useSyncExternalStore } from 'react';
import { useThemeStore } from '@/store/themeStore';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribeToSystemTheme(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

const noopSubscribe = () => () => {};

export function useTheme() {
  const mode = useThemeStore((s) => s.mode);
  const systemDark = useSyncExternalStore(
    subscribeToSystemTheme,
    () => window.matchMedia(DARK_QUERY).matches,
    () => false
  );
  // The persisted mode is only known on the client; render light on the server and
  // during hydration (as before) so the markup matches.
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const isDark = hydrated && (mode === 'dark' || (mode === 'system' && systemDark));

  return { isDark, mode };
}
