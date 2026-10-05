import type { Insight, IntelligenceMonthlyPoint, SpendingIntelligence, WeeklyBriefing } from '@/types';

export type CategoryDelta = { pct: number } | 'new' | undefined;

export function formatCategoryDelta(delta: CategoryDelta): { label: string; tone: 'warn' | 'new' | 'good' } {
  if (delta === 'new') return { label: 'new', tone: 'new' };
  if (!delta || delta.pct === 0 || Math.abs(delta.pct) <= 8) return { label: 'on track', tone: 'good' };
  if (delta.pct > 0) return { label: `+${delta.pct}%`, tone: 'warn' };
  return { label: `${delta.pct}%`, tone: 'good' };
}

export type WeeklySpendBucket = { key: string; label: string; amount: number; highlight: boolean };

/** Last 4 spending buckets; overlays briefing week totals on the last two bars when available. */
export function buildWeeklySpendingBuckets(
  briefing: WeeklyBriefing | null | undefined,
  monthlySeries: IntelligenceMonthlyPoint[] | undefined
): WeeklySpendBucket[] {
  const base = lastFourMonthlyBuckets(monthlySeries);
  const buckets: WeeklySpendBucket[] =
    base.length > 0
      ? base.map((b, i) => ({
          key: b.key,
          label: b.label,
          amount: b.amount,
          highlight: i === base.length - 1,
        }))
      : [
          { key: 'w1', label: '—', amount: 0, highlight: false },
          { key: 'w2', label: '—', amount: 0, highlight: false },
          { key: 'w3', label: 'Last wk', amount: 0, highlight: false },
          { key: 'w4', label: 'This wk', amount: 0, highlight: true },
        ];

  while (buckets.length < 4) {
    buckets.unshift({ key: `pad-${buckets.length}`, label: '—', amount: 0, highlight: false });
  }
  const four = buckets.slice(-4);

  if (briefing?.metadata) {
    const { weekTotal, previousWeekTotal } = briefing.metadata;
    four[2] = { ...four[2], label: 'Last wk', amount: previousWeekTotal, highlight: false };
    four[3] = { ...four[3], label: 'This wk', amount: weekTotal, highlight: true };
  }

  return four;
}

/** White tick position on category bar (usual vs current). */
export function usualSpendMarkerPct(current: number, prev: number | undefined): number | null {
  if (!prev || prev <= 0 || current <= 0) return null;
  return Math.min(98, Math.max(2, (prev / current) * 100));
}

export function lastFourMonthlyBuckets(series: IntelligenceMonthlyPoint[] | undefined) {
  if (!series?.length) return [];
  return series.slice(-4).map((p) => ({
    key: p.month,
    label: new Date(`${p.month}-01T12:00:00`).toLocaleString('en-US', { month: 'short' }),
    amount: p.total,
  }));
}

export type PrimaryInsightCard = {
  title: string;
  body: string;
  actionLabel: string | null;
  updatedLabel: string;
};

export function buildPrimaryInsight(
  insights: Insight[],
  briefing: WeeklyBriefing | null,
  intelligence?: SpendingIntelligence | null
): PrimaryInsightCard | null {
  if (briefing?.metadata?.briefing) {
    const b = briefing.metadata.briefing;
    return {
      title: b.title,
      body: b.summary,
      actionLabel: b.recommendations[0] ?? null,
      updatedLabel: 'Updated this week',
    };
  }
  const top = insights[0];
  if (top) {
    const title = top.content.split(/[.!?]/)[0]?.trim() || top.content;
    return {
      title,
      body: top.content,
      actionLabel: null,
      updatedLabel: 'Updated today',
    };
  }
  const anomaly = intelligence?.anomalies?.[0];
  if (anomaly) {
    return {
      title: anomaly.type === 'category_spike' ? 'Unusual category spike' : 'Large transaction',
      body: anomaly.message,
      actionLabel: null,
      updatedLabel: 'Updated today',
    };
  }
  return null;
}
