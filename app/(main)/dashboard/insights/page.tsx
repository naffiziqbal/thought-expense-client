'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useIsPremium } from '@/hooks/useIsPremium';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { InsightsWeeklyChart } from '@/components/dashboard/InsightsWeeklyChart';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Insight, CategorySummary, SpendingIntelligence, WeeklyBriefing } from '@/types';
import { formatCurrency, getCategoryChartColor } from '@/lib/utils';
import {
  buildPrimaryInsight,
  buildWeeklySpendingBuckets,
  formatCategoryDelta,
  usualSpendMarkerPct,
  type CategoryDelta,
} from '@/lib/insightsDashboard';

const TOP_CATEGORIES = 4;

function deltaBadgeClass(tone: 'warn' | 'new' | 'good'): string {
  if (tone === 'warn') return 'text-amber-500';
  if (tone === 'new') return 'text-violet-400';
  return 'text-teal-500';
}

export default function InsightsPage() {
  const { isAuthenticated, isLoading: authLoading } = useProtectedRoute();
  const isPremium = useIsPremium();

  const [insights, setInsights] = useState<Insight[]>([]);
  const [summary, setSummary] = useState<CategorySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [insightDismissed, setInsightDismissed] = useState(false);
  const [period, setPeriod] = useState<'month' | 'all'>('month');
  const now = new Date();
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [selMonth, setSelMonth] = useState(now.getMonth() + 1);
  const [prevSummary, setPrevSummary] = useState<CategorySummary | null>(null);
  const [recurring, setRecurring] = useState<
    { description: string; category: string; averageAmount: number; currency: string; monthsSeen: number }[]
  >([]);
  const [intelligence, setIntelligence] = useState<SpendingIntelligence | null>(null);
  const [briefing, setBriefing] = useState<WeeklyBriefing | null>(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const response = await api.getInsights({ limit: 10 });
      if (response.success) {
        setInsights(response.data.insights);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const iso = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const range = (y: number, m: number) => ({
        startDate: iso(new Date(y, m - 1, 1)),
        endDate: iso(new Date(y, m, 0)),
      });
      const filters = period === 'month' ? range(selYear, selMonth) : undefined;
      const prevDate = new Date(selYear, selMonth - 2, 1);
      const [response, prevRes, recurringRes] = await Promise.all([
        api.getCategorySummary(filters),
        period === 'month'
          ? api.getCategorySummary(range(prevDate.getFullYear(), prevDate.getMonth() + 1))
          : Promise.resolve(null),
        api.getRecurringExpenses().catch(() => null),
      ]);
      if (response.success) setSummary(response.data);
      setPrevSummary(prevRes?.success ? prevRes.data : null);
      if (recurringRes?.success) setRecurring(recurringRes.data.recurring);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  const fetchIntelligence = async () => {
    try {
      const [intelligenceRes, briefingRes] = await Promise.all([
        api.getSpendingIntelligence().catch(() => null),
        api.getLatestBriefing().catch(() => null),
      ]);
      if (intelligenceRes?.success) setIntelligence(intelligenceRes.data);
      if (briefingRes?.success) setBriefing(briefingRes.data.briefing);
    } catch (error) {
      console.error('Failed to fetch spending intelligence:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    fetchInsights();
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, period, selYear, selMonth]);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    fetchIntelligence();
  }, [isAuthenticated, authLoading]);

  const handleRegenerateInsight = async () => {
    setIsGenerating(true);
    try {
      const [insightsRes, briefingRes] = await Promise.all([
        api.generateInsights(),
        api.generateBriefing().catch(() => null),
      ]);
      if (insightsRes.success) {
        setInsights(insightsRes.data.insights);
        setSummary(insightsRes.data.summary);
      }
      if (briefingRes?.success && briefingRes.data.briefing) {
        setBriefing(briefingRes.data.briefing);
      }
      setInsightDismissed(false);
      if (insightsRes.success) {
        toast.success('Insight refreshed');
      }
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
            'Failed to regenerate insight'
          : 'Failed to regenerate insight';
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const barData = useMemo(() => {
    if (!summary || summary.transactionCount === 0) return [];
    return Object.entries(summary.byCategory)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [summary]);

  const categoryDeltas = useMemo(() => {
    if (period !== 'month' || !prevSummary) return {} as Record<string, CategoryDelta>;
    const map: Record<string, CategoryDelta> = {};
    for (const { category, amount } of barData) {
      const prev = prevSummary.byCategory[category];
      if (!prev || prev <= 0) {
        map[category] = amount > 0 ? 'new' : undefined;
      } else {
        map[category] = { pct: Math.round(((amount - prev) / prev) * 100) };
      }
    }
    return map;
  }, [period, prevSummary, barData]);

  const maxAmount = barData.length > 0 ? Math.max(...barData.map((d) => d.amount)) : 0;
  const visibleBarData = categoriesExpanded ? barData : barData.slice(0, TOP_CATEGORIES);
  const hasMoreCategories = barData.length > TOP_CATEGORIES;

  const primaryInsight = useMemo(
    () => buildPrimaryInsight(insights, briefing, intelligence),
    [insights, briefing, intelligence]
  );

  const weeklyBuckets = useMemo(
    () => buildWeeklySpendingBuckets(briefing, intelligence?.monthlySeries),
    [briefing, intelligence?.monthlySeries]
  );

  const topRecurring = recurring[0];

  const monthPickerLabel =
    period === 'month'
      ? new Date(selYear, selMonth - 1, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' })
      : isPremium
        ? 'All time'
        : 'Last 3 months';

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-token-surface">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent-primary)] border-r-transparent" />
          <p className="text-token-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg space-y-3 pb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-base font-semibold leading-tight text-token-primary">Insights</h1>
            <p className="mt-0.5 text-xs text-token-muted">Charts, trends, and AI tips</p>
          </div>
          <Link
            href="/dashboard/assistant"
            className="inline-flex shrink-0 items-center gap-1 pt-0.5 text-sm font-semibold text-token-accent transition-opacity hover:opacity-90"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            AI advisor
            <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Period row */}
        <div className="flex min-w-0 max-w-full items-center gap-2">
          <div className="inline-flex min-w-0 max-w-[58%] shrink rounded-control border border-token bg-token-card p-1">
            {(['month', 'all'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3.5 ${
                  period === p ? 'bg-token-accent text-white' : 'text-token-secondary hover:text-token-primary'
                }`}
              >
                {p === 'month' ? 'Month' : 'All time'}
              </button>
            ))}
          </div>
          {period === 'month' ? (
            <select
              value={`${selYear}-${selMonth}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split('-').map(Number);
                setSelYear(y);
                setSelMonth(m);
              }}
              className="ml-auto max-w-[42%] shrink-0 truncate appearance-none rounded-lg border-0 bg-transparent py-1 pl-1 pr-6 text-right text-sm text-token-secondary focus:outline-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238d99b3' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right center',
              }}
            >
              {Array.from({ length: 24 }, (_, i) => {
                const d = new Date();
                d.setDate(1);
                d.setMonth(d.getMonth() - i);
                const y = d.getFullYear();
                const m = d.getMonth() + 1;
                return (
                  <option key={`${y}-${m}`} value={`${y}-${m}`}>
                    {d.toLocaleString('en-US', { month: 'short', year: 'numeric' })}
                  </option>
                );
              })}
            </select>
          ) : (
            <span className="ml-auto max-w-[42%] shrink-0 truncate text-right text-sm text-token-secondary">
              {monthPickerLabel}
            </span>
          )}
        </div>

        {/* Single AI insight */}
        {!insightDismissed && primaryInsight ? (
          <div className="rounded-card border border-[var(--accent-primary)]/40 bg-token-card p-4 shadow-sm">
            <div className="mb-2.5 flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-token-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              <span className="text-xs font-medium text-token-accent">AI insight</span>
              <span className="ml-auto text-xs text-token-muted">{primaryInsight.updatedLabel}</span>
            </div>
            <p className="text-base font-medium leading-snug text-token-primary">{primaryInsight.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-token-secondary">{primaryInsight.body}</p>
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              {primaryInsight.actionLabel ? (
                <Link
                  href="/dashboard/assistant"
                  className="rounded-lg bg-token-accent px-3.5 py-2 text-sm font-medium text-white"
                >
                  {primaryInsight.actionLabel.length > 28
                    ? `${primaryInsight.actionLabel.slice(0, 28)}…`
                    : primaryInsight.actionLabel}
                </Link>
              ) : (
                <Link
                  href="/dashboard/assistant"
                  className="rounded-lg bg-token-accent px-3.5 py-2 text-sm font-medium text-white"
                >
                  Ask advisor
                </Link>
              )}
              <button
                type="button"
                aria-label="Regenerate insight"
                disabled={isGenerating}
                onClick={handleRegenerateInsight}
                className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg border border-token text-token-secondary transition-colors hover:bg-[var(--surface-hover)] hover:text-token-primary disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Hide insight"
                onClick={() => setInsightDismissed(true)}
                className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg border border-token text-token-secondary transition-colors hover:bg-[var(--surface-hover)] hover:text-token-primary"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : insightDismissed && primaryInsight ? (
          <div className="rounded-card border border-token bg-token-card px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-token-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              <p className="min-w-0 flex-1 text-sm text-token-secondary">AI insight hidden</p>
              <button
                type="button"
                aria-label="Regenerate insight"
                disabled={isGenerating}
                onClick={handleRegenerateInsight}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-token-secondary hover:bg-[var(--surface-hover)] hover:text-token-primary disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setInsightDismissed(false)}
                className="ml-auto shrink-0 rounded-lg border border-token px-3.5 py-1.5 text-sm font-medium text-token-primary hover:bg-[var(--surface-hover)]"
              >
                Show insight
              </button>
            </div>
          </div>
        ) : !primaryInsight && !isLoading ? (
          <div className="rounded-card border border-token bg-token-card p-5 text-center">
            <p className="text-sm text-token-secondary">No AI insight yet for this period.</p>
            <Button onClick={handleRegenerateInsight} isLoading={isGenerating} size="sm" className="mt-3">
              Generate insights
            </Button>
          </div>
        ) : null}

        {/* Weekly spending */}
        <div className="rounded-card bg-token-card border border-token p-4 shadow-sm">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-sm font-medium text-token-primary">Weekly spending</h3>
            <span className="text-xs text-token-muted">Last 4 weeks</span>
          </div>
          <InsightsWeeklyChart buckets={weeklyBuckets} />
        </div>

        {/* Categories vs usual */}
        {summary && summary.transactionCount > 0 && barData.length > 0 ? (
          <div className="rounded-card bg-token-card border border-token p-4 shadow-sm">
            <h3 className="mb-3.5 text-sm font-medium text-token-primary">Categories vs usual</h3>
            <div className="space-y-3.5">
              {visibleBarData.map((item) => {
                const delta = period === 'month' ? categoryDeltas[item.category] : undefined;
                const badge = formatCategoryDelta(delta);
                const prev = period === 'month' && prevSummary ? prevSummary.byCategory[item.category] : undefined;
                const marker = usualSpendMarkerPct(item.amount, prev);
                const barColor =
                  badge.tone === 'warn'
                    ? '#f59e0b'
                    : badge.tone === 'new'
                      ? '#8b5cf6'
                      : getCategoryChartColor(item.category);

                return (
                  <div key={item.category}>
                    <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-token-primary">{item.category}</span>
                      <span className="shrink-0 font-medium text-token-primary">
                        {formatCurrency(item.amount, summary.currency)}{' '}
                        {period === 'month' && delta !== undefined ? (
                          <span className={`text-xs font-normal ${deltaBadgeClass(badge.tone)}`}>{badge.label}</span>
                        ) : null}
                      </span>
                    </div>
                    <div className="relative h-1.5 overflow-visible rounded-full bg-[var(--blueGray-100)]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${maxAmount ? (item.amount / maxAmount) * 100 : 0}%`,
                          backgroundColor: barColor,
                        }}
                      />
                      {marker !== null && period === 'month' ? (
                        <div
                          className="absolute top-[-3px] h-3 w-0.5 rounded-full bg-token-primary"
                          style={{ left: `${marker}%` }}
                          title={prev ? `Usual: ${formatCurrency(prev, summary.currency)}` : undefined}
                        />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
            {hasMoreCategories ? (
              <button
                type="button"
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                className="mt-3 w-full text-center text-sm font-semibold text-token-accent"
              >
                {categoriesExpanded ? 'Show less' : 'View all'}
              </button>
            ) : null}
            {period === 'month' ? (
              <p className="mt-3 text-xs text-token-muted">White tick marks your usual monthly amount.</p>
            ) : null}
          </div>
        ) : summary && summary.transactionCount === 0 ? (
          <div className="rounded-card bg-token-card border border-token p-8 text-center">
            <p className="text-sm font-medium text-token-primary">No spending this period</p>
            <p className="mt-1 text-sm text-token-secondary">Pick another month or add expenses.</p>
          </div>
        ) : null}

        {/* One recurring row */}
        {topRecurring ? (
          <div className="flex items-center gap-3 rounded-card bg-token-card border border-token p-4 shadow-sm">
            <svg className="h-5 w-5 shrink-0 text-token-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-token-primary">{topRecurring.description}</p>
              <p className="text-xs text-token-muted">
                Seen {topRecurring.monthsSeen} months, about{' '}
                {formatCurrency(topRecurring.averageAmount, topRecurring.currency)}/mo
              </p>
            </div>
            <Link
              href="/dashboard/recurring"
              className="shrink-0 rounded-lg border border-token px-3 py-1.5 text-xs font-medium text-token-primary hover:bg-[var(--surface-hover)]"
            >
              Log automatically
            </Link>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
