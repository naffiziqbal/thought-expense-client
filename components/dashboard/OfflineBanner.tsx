'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useOutboxStore } from '@/store/outboxStore';

/** Thin strip under the status bar. Reassures rather than warns — saves still work. */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const queuedCount = useOutboxStore((s) => s.batches.length);

  if (isOnline) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-[60] flex justify-center pt-[env(safe-area-inset-top,0px)]">
      <div className="flex w-full max-w-[768px] items-center justify-center gap-2 bg-amber-100 px-4 py-1.5 dark:bg-amber-500/20">
        <svg
          className="h-3.5 w-3.5 shrink-0 text-[var(--status-warning)]"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 5.636a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728M3 3l18 18"
          />
        </svg>
        <span className="text-xs font-medium text-token-primary">
          {queuedCount > 0
            ? `Offline — ${queuedCount} save${queuedCount > 1 ? 's' : ''} will sync automatically`
            : 'Offline — your saves will sync automatically'}
        </span>
      </div>
    </div>
  );
}
