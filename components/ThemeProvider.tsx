'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (isDark: boolean) => {
      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    };

    if (mode === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(media.matches);
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      media.addEventListener('change', handler);
      return () => media.removeEventListener('change', handler);
    }

    applyTheme(mode === 'dark');
  }, [mode]);

  return <>{children}</>;
}
