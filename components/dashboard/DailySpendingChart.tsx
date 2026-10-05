'use client';

import { useMemo } from 'react';
import type { DailySpendBucket } from '@/lib/homeDashboard';

type Props = {
  buckets: DailySpendBucket[];
  dailyLimit: number;
};

const CHART_HEIGHT = 90;

export function DailySpendingChart({ buckets, dailyLimit }: Props) {
  const maxAmount = useMemo(
    () => Math.max(dailyLimit, ...buckets.map((b) => b.amount), 1),
    [buckets, dailyLimit]
  );
  const limitFromBottom = dailyLimit > 0 ? (dailyLimit / maxAmount) * CHART_HEIGHT : 0;

  return (
    <div className="dashboard-card px-3.5 pb-2.5 pt-3.5">
      <div className="relative" style={{ height: CHART_HEIGHT }}>
        {dailyLimit > 0 ? (
          <div
            className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-[var(--border-default)]"
            style={{ bottom: limitFromBottom }}
          />
        ) : null}
        <div className="flex h-full items-end justify-between gap-2">
          {buckets.map((bucket) => {
            const h = (bucket.amount / maxAmount) * CHART_HEIGHT;
            const over = dailyLimit > 0 && bucket.amount > dailyLimit;
            return (
              <div key={bucket.key} className="flex h-full flex-1 flex-col items-center justify-end">
                <div
                  className="w-full max-w-[36px] rounded-t-md transition-all"
                  style={{
                    height: Math.max(h, bucket.amount > 0 ? 4 : 2),
                    backgroundColor: over ? 'var(--status-warning)' : 'var(--accent-primary)',
                    opacity: bucket.amount > 0 ? 1 : 0.35,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex justify-between gap-1">
        {buckets.map((bucket) => (
          <span key={bucket.key} className="flex-1 truncate text-center text-[11px] text-token-muted">
            {bucket.label}
          </span>
        ))}
      </div>
    </div>
  );
}
