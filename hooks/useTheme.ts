'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/themeStore';

export function useTheme() {
  const mode = useThemeStore((s) => s.mode);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (mode === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const update = () => setIsDark(media.matches);
      update();
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }
    setIsDark(mode === 'dark');
  }, [mode]);

  return { isDark, mode };
}
