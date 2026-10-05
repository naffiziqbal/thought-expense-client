'use client';

import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import {
  APPEARANCE_PAGE_HINT,
  THEME_MODE_OPTIONS,
  resolvedAppearanceLabel,
  themeModeLabel,
} from '@/lib/appearanceDashboard';
import { cn } from '@/lib/utils';
import { useThemeStore, type ThemeMode } from '@/store/themeStore';
import { useTheme } from '@/hooks/useTheme';

const SunIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

const DeviceIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

function ModeIcon({ mode, className }: { mode: ThemeMode; className?: string }) {
  if (mode === 'light') return <SunIcon className={className} />;
  if (mode === 'dark') return <MoonIcon className={className} />;
  return <DeviceIcon className={className} />;
}

export default function DeviceSettingsPage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const { mode, setMode } = useThemeStore();
  const { isDark } = useTheme();

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-token-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent-primary)] border-r-transparent" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg space-y-3 pb-8 pt-1">
        <div className="min-w-0">
          <h1 className="text-base font-semibold leading-tight text-token-primary">Appearance</h1>
          <p className="mt-0.5 text-xs leading-relaxed text-token-muted">{APPEARANCE_PAGE_HINT}</p>
        </div>

        <div className="rounded-2xl border border-[var(--accent-primary)]/35 bg-[var(--accent-primary)]/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-token-card text-token-accent">
              {isDark ? <MoonIcon className="h-7 w-7" /> : <SunIcon className="h-7 w-7" />}
            </div>
            <div>
              <p className="text-xs font-medium text-token-muted">Currently showing</p>
              <p className="text-lg font-semibold text-token-primary">{resolvedAppearanceLabel(mode, isDark)}</p>
              <p className="text-xs text-token-secondary">Preference: {themeModeLabel(mode)}</p>
            </div>
          </div>
        </div>

        <p className="ml-1 text-xs font-medium text-token-muted">Theme</p>
        <div className="overflow-hidden rounded-2xl border border-token bg-token-card">
          {THEME_MODE_OPTIONS.map((opt, i) => {
            const active = mode === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMode(opt.value)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-3 text-left transition-colors',
                  active && 'bg-token-accent-soft',
                  i < THEME_MODE_OPTIONS.length - 1 && 'border-b border-token'
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--background-primary)]">
                  <ModeIcon
                    mode={opt.value}
                    className={cn('h-5 w-5', active ? 'text-token-accent' : 'text-token-muted')}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-token-primary">{opt.label}</p>
                  <p className="mt-0.5 text-xs text-token-muted">{opt.description}</p>
                </div>
                <span
                  className={cn(
                    'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2',
                    active ? 'border-token-accent bg-token-accent text-on-accent' : 'border-token'
                  )}
                >
                  {active ? (
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
