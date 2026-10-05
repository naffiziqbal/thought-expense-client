'use client';

import type { WeeklySpendBucket } from '@/lib/insightsDashboard';

type Props = {
  buckets: WeeklySpendBucket[];
};

const CHART_HEIGHT = 84;

export function InsightsWeeklyChart({ buckets }: Props) {
  const maxAmount = Math.max(...buckets.map((b) => b.amount), 1);

  return (
    <div>
      <div className="flex items-end gap-3" style={{ height: CHART_HEIGHT }}>
        {buckets.map((bucket) => {
          const h = (bucket.amount / maxAmount) * CHART_HEIGHT;
          return (
            <div key={bucket.key} className="flex h-full flex-1 flex-col items-center justify-end">
              <div
                className="w-full rounded-t transition-all"
                style={{
                  height: Math.max(h, bucket.amount > 0 ? 4 : 3),
                  backgroundColor: bucket.highlight ? 'var(--accent-primary)' : 'var(--blueGray-300)',
                  opacity: bucket.amount > 0 ? 1 : 0.5,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-3">
        {buckets.map((bucket) => (
          <span
            key={`${bucket.key}-amt`}
            className={`flex-1 truncate text-center text-[11px] ${
              bucket.highlight ? 'font-semibold text-token-accent' : 'text-token-muted'
            }`}
          >
            {bucket.amount > 0
              ? bucket.amount >= 1000
                ? `${(bucket.amount / 1000).toFixed(1).replace(/\.0$/, '')}k`
                : Math.round(bucket.amount).toLocaleString()
              : '0'}
          </span>
        ))}
      </div>
      <div className="mt-0.5 flex gap-3">
        {buckets.map((bucket) => (
          <span key={`${bucket.key}-lbl`} className="flex-1 truncate text-center text-[10px] text-token-muted">
            {bucket.label}
          </span>
        ))}
      </div>
    </div>
  );
}
