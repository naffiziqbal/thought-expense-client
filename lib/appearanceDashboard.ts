import type { ThemeMode } from '@/store/themeStore';

export const APPEARANCE_PAGE_HINT = 'Pick light, dark, or follow your device — applies across the app instantly.';

export const THEME_MODE_OPTIONS: {
  value: ThemeMode;
  label: string;
  description: string;
}[] = [
  { value: 'light', label: 'Light', description: 'Bright surfaces, best in daylight' },
  { value: 'dark', label: 'Dark', description: 'Dimmed UI for low light' },
  { value: 'system', label: 'System', description: 'Matches your device setting' },
];

export function themeModeLabel(mode: ThemeMode): string {
  return THEME_MODE_OPTIONS.find((o) => o.value === mode)?.label ?? 'System';
}

export function resolvedAppearanceLabel(mode: ThemeMode, isDark: boolean): string {
  if (mode === 'system') return isDark ? 'Dark (system)' : 'Light (system)';
  return mode === 'dark' ? 'Dark' : 'Light';
}
