'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useIsPremium } from '@/hooks/useIsPremium';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Insight, CategorySummary, SpendingIntelligence, WeeklyBriefing } from '@/types';
import { formatCurrency, formatDate, getCategoryChartColor } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const TOP_N = 4; // Top 3 categories + "Others"
const DEFAULT_CATEGORIES_VISIBLE = 5;

function getInsightCardStyle(type: string): { bg: string; border: string; tag: string; iconColor: string } {
  const lower = type.toLowerCase();
  if (lower.includes('warning') || lower.includes('attention') || lower.includes('high')) {
    return {
      bg: 'bg-token-card',
      border: 'border-orange-400/60',
      tag: 'bg-orange-500/20 text-orange-500',
      iconColor: 'text-orange-500',
    };
  }
  return {
    bg: 'bg-token-card',
    border: 'border-blue-400/60',
    tag: 'bg-blue-500/20 text-blue-500',
    iconColor: 'text-blue-500',
  };
}

export default function InsightsPage() {
  const { isAuthenticated, isLoading: authLoading } = useProtectedRoute();
  const isPremium = useIsPremium();

  const [insights, setInsights] = useState<Insight[]>([]);
  const [summary, setSummary] = useState<CategorySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [othersSheetOpen, setOthersSheetOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
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
  const [isRefreshingBriefing, setIsRefreshingBriefing] = useState(false);

  const dateRange = useMemo(() => {
    if (period === 'all') return isPremium ? 'All time' : 'Last 3 months (free plan)';
    return new Date(selYear, selMonth - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }, [period, isPremium, selYear, selMonth]);

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

  const handleRefreshBriefing = async () => {
    setIsRefreshingBriefing(true);
    try {
      const res = await api.generateBriefing();
      if (res.success) {
        setBriefing(res.data.briefing);
        toast.success(res.message || 'Briefing refreshed');
      }
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
            'Failed to refresh briefing'
          : 'Failed to refresh briefing';
      toast.error(message);
    } finally {
      setIsRefreshingBriefing(false);
    }
  };

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    try {
      const response = await api.generateInsights();
      if (response.success) {
        toast.success('Insights generated successfully');
        setInsights(response.data.insights);
        setSummary(response.data.summary);
      }
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
            'Failed to generate insights'
          : 'Failed to generate insights';
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Donut data: Top 3 + Others
  const donutData = useMemo(() => {
    if (!summary || summary.transactionCount === 0) return [];

    const sorted = Object.entries(summary.byCategory)
      .map(([name, value]) => ({ name, value, percentage: summary.percentages[name] }))
      .sort((a, b) => b.value - a.value);

    const top3 = sorted.slice(0, 3);
    const others = sorted.slice(3);
    const othersValue = others.reduce((sum, x) => sum + x.value, 0);

    const result = top3.map((s) => ({
      name: s.name,
      value: s.value,
      percentage: s.percentage,
    }));
    if (othersValue > 0) {
      const othersPct = others.reduce((sum, x) => sum + (parseFloat(x.percentage) || 0), 0);
      result.push({
        name: 'Others',
        value: othersValue,
        percentage: othersPct.toFixed(1),
      });
    }
    return result;
  }, [summary]);

  // Horizontal bar data (all categories, sorted)
  const barData = useMemo(() => {
    if (!summary || summary.transactionCount === 0) return [];
    return Object.entries(summary.byCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: parseFloat(summary.percentages[category] || '0'),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [summary]);

  const maxAmount = barData.length > 0 ? Math.max(...barData.map((d) => d.amount)) : 0;

  const visibleBarData = categoriesExpanded ? barData : barData.slice(0, DEFAULT_CATEGORIES_VISIBLE);
  const hasMoreCategories = barData.length > DEFAULT_CATEGORIES_VISIBLE;

  // "Others" breakdown for bottom sheet
  const othersBreakdown = useMemo(() => {
    if (!summary) return [];
    const sorted = Object.entries(summary.byCategory)
      .map(([name, value]) => ({ name, value, percentage: summary.percentages[name] }))
      .sort((a, b) => b.value - a.value);
    return sorted.slice(3);
  }, [summary]);

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
      <div className="space-y-6 pb-4">
        {/* A. Header Section */}
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-token-primary">Spending Analysis</h1>
              <p className="mt-1 text-sm text-token-secondary">{dateRange}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerateInsights}
              isLoading={isGenerating}
              className="text-token-accent"
            >
              Refresh
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-xl border border-token bg-token-card p-1">
              {(['month', 'all'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                    period === p ? 'bg-token-accent text-white' : 'text-token-secondary hover:text-token-primary'
                  }`}
                >
                  {p === 'month' ? 'Monthly' : 'All time'}
                </button>
              ))}
            </div>
            {period === 'month' && (
              <select
                value={`${selYear}-${selMonth}`}
                onChange={(e) => {
                  const [y, m] = e.target.value.split('-').map(Number);
                  setSelYear(y);
                  setSelMonth(m);
                }}
                className="rounded-xl border border-token bg-token-card px-3 py-2 text-sm font-medium text-token-primary focus:border-[var(--accent-primary)] focus:outline-none"
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const d = new Date();
                  d.setDate(1);
                  d.setMonth(d.getMonth() - i);
                  const y = d.getFullYear();
                  const m = d.getMonth() + 1;
                  return (
                    <option key={`${y}-${m}`} value={`${y}-${m}`}>
                      {d.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
        </div>

        {/* Weekly Briefing */}
        <div className="rounded-3xl bg-token-card border border-token p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-token-primary">
                {briefing?.metadata?.briefing?.title || 'Weekly briefing'}
              </h3>
              <p className="mt-0.5 text-xs text-token-muted">
                Your week in money, summarized by AI
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshBriefing}
              isLoading={isRefreshingBriefing}
              className="shrink-0 text-token-accent"
            >
              Refresh briefing
            </Button>
          </div>

          {briefing ? (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-token-primary">{briefing.metadata.briefing.summary}</p>

              {/* Week vs previous week */}
              <div className="flex items-center gap-3 rounded-2xl bg-[var(--background-tag)] px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-token-muted">This week</p>
                  <p className="text-base font-bold text-token-primary truncate">
                    {formatCurrency(briefing.metadata.weekTotal, briefing.metadata.currency)}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-token-muted">Last week</p>
                  <p className="text-base font-bold text-token-secondary truncate">
                    {formatCurrency(briefing.metadata.previousWeekTotal, briefing.metadata.currency)}
                  </p>
                </div>
                {briefing.metadata.previousWeekTotal > 0 && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      briefing.metadata.weekTotal > briefing.metadata.previousWeekTotal
                        ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300'
                    }`}
                  >
                    {briefing.metadata.weekTotal > briefing.metadata.previousWeekTotal ? '↑' : '↓'}
                    {Math.abs(
                      Math.round(
                        ((briefing.metadata.weekTotal - briefing.metadata.previousWeekTotal) /
                          briefing.metadata.previousWeekTotal) *
                          100
                      )
                    )}
                    %
                  </span>
                )}
              </div>

              {briefing.metadata.briefing.highlights.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-token-muted">Highlights</p>
                  <ul className="space-y-1.5">
                    {briefing.metadata.briefing.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-token-primary">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-token-accent" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {briefing.metadata.briefing.recommendations.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-token-muted">
                    Recommendations
                  </p>
                  <ul className="space-y-1.5">
                    {briefing.metadata.briefing.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-token-primary">
                        <span className="mt-0.5 shrink-0 text-token-accent">✓</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-token-secondary">
              No briefing yet. Tap &quot;Refresh briefing&quot; to generate your weekly summary.
            </p>
          )}
        </div>

        {/* B. Big Picture Card - Donut Chart */}
        {summary && summary.transactionCount > 0 && (
          <div className="rounded-3xl bg-token-card border border-token p-5 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex items-stretch gap-4">
                {/* Donut */}
                <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={56}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {donutData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.name === 'Others'
                                ? '#9CA3AF'
                                : getCategoryChartColor(entry.name)
                            }
                            className={entry.name === 'Others' ? 'cursor-pointer' : ''}
                            onClick={() => entry.name === 'Others' && setOthersSheetOpen(true)}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-token-primary">
                      {summary.totalSpent >= 1000
                        ? `${(summary.totalSpent / 1000).toFixed(0)}k`
                        : Math.round(summary.totalSpent)}
                    </span>
                  </div>
                </div>

                {/* Legend - Right side */}
                <div className="flex-1 flex flex-col justify-center gap-2">
                  {donutData.map((entry) => {
                    const isOthers = entry.name === 'Others' && othersBreakdown.length > 0;
                    return (
                      <div
                        key={entry.name}
                        role={isOthers ? 'button' : undefined}
                        tabIndex={isOthers ? 0 : undefined}
                        onKeyDown={
                          isOthers
                            ? (e) => e.key === 'Enter' && setOthersSheetOpen(true)
                            : undefined
                        }
                        onClick={isOthers ? () => setOthersSheetOpen(true) : undefined}
                        className={`flex items-center gap-2 text-sm ${
                          isOthers ? 'cursor-pointer active:opacity-80' : ''
                        }`}
                      >
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              entry.name === 'Others' ? '#9CA3AF' : getCategoryChartColor(entry.name),
                          }}
                        />
                        <span className="truncate text-token-primary">{entry.name}</span>
                        <span className="ml-auto shrink-0 text-token-secondary">{entry.percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* C. Top Spending Categories - Horizontal Bar List */}
        {summary && summary.transactionCount > 0 && barData.length > 0 && (
          <div className="rounded-3xl bg-token-card border border-token p-5 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-token-primary">Top Spending Categories</h3>
            <div className="space-y-4">
              {visibleBarData.map((item) => {
                const prev = period === 'month' && prevSummary ? prevSummary.byCategory[item.category] : undefined;
                const deltaPct = prev && prev > 0 ? Math.round(((item.amount - prev) / prev) * 100) : null;
                const isNew = period === 'month' && prevSummary && (!prev || prev <= 0);
                return (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-token-primary">{item.category}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      {isNew ? (
                        <span className="rounded-full bg-[var(--accent-primary)]/10 px-2 py-0.5 text-[11px] font-semibold text-token-accent">new</span>
                      ) : deltaPct !== null && deltaPct !== 0 ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            deltaPct > 0
                              ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
                              : 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300'
                          }`}
                        >
                          {deltaPct > 0 ? '\u2191' : '\u2193'}{Math.abs(deltaPct)}% vs prev
                        </span>
                      ) : null}
                      <span className="text-sm font-semibold text-token-primary">
                        {formatCurrency(item.amount, summary.currency)}
                      </span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--blueGray-100)]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${maxAmount ? (item.amount / maxAmount) * 100 : 0}%`,
                        backgroundColor: getCategoryChartColor(item.category),
                      }}
                    />
                  </div>
                </div>
                );
              })}
            </div>
            {hasMoreCategories && (
              <button
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                className="mt-4 w-full text-center text-sm font-semibold text-teal-600 hover:text-teal-700"
              >
                {categoriesExpanded ? 'View Less' : 'View All'}
              </button>
            )}
          </div>
        )}

        {/* Smart alerts - anomalies from spending intelligence */}
        {intelligence && intelligence.anomalies.length > 0 && (
          <div className="rounded-3xl bg-token-card border border-token p-5 shadow-sm">
            <h3 className="text-base font-semibold text-token-primary">Smart alerts</h3>
            <p className="mt-0.5 text-xs text-token-muted">Unusual activity spotted in your spending</p>
            <div className="mt-4 space-y-3">
              {intelligence.anomalies.map((anomaly, i) => (
                <div
                  key={`${anomaly.type}-${i}`}
                  className="flex items-start gap-3 rounded-2xl border border-orange-400/60 bg-token-card p-4"
                >
                  <svg
                    className="h-5 w-5 shrink-0 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div className="min-w-0">
                    <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-semibold text-orange-500">
                      {anomaly.type === 'category_spike' ? 'CATEGORY SPIKE' : 'LARGE TRANSACTION'}
                    </span>
                    <p className="mt-1.5 text-sm font-medium text-token-primary">{anomaly.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trends - rising categories */}
        {intelligence && intelligence.trends.length > 0 && (
          <div className="rounded-3xl bg-token-card border border-token p-5 shadow-sm">
            <h3 className="text-base font-semibold text-token-primary">Trends</h3>
            <p className="mt-0.5 text-xs text-token-muted">
              Categories moving over the last {intelligence.windowMonths} months
            </p>
            <div className="mt-4 space-y-3">
              {intelligence.trends.map((trend) => (
                <div key={trend.category} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-token-primary">{trend.category}</p>
                    <p className="text-xs text-token-secondary">{trend.message}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      trend.changePercent > 0
                        ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300'
                    }`}
                  >
                    {trend.changePercent > 0 ? '↑' : '↓'}{Math.abs(Math.round(trend.changePercent))}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Potential waste */}
        {intelligence && intelligence.waste.length > 0 && (
          <div className="rounded-3xl bg-token-card border border-token p-5 shadow-sm">
            <h3 className="text-base font-semibold text-token-primary">Potential waste</h3>
            <p className="mt-0.5 text-xs text-token-muted">Places your money might be leaking</p>
            <div className="mt-4 space-y-3">
              {intelligence.waste.map((waste, i) => (
                <div
                  key={`${waste.type}-${waste.category}-${i}`}
                  className="rounded-2xl bg-[var(--background-tag)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="rounded-full bg-amber-100 dark:bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                        {waste.type === 'price_creep'
                          ? 'PRICE CREEP'
                          : waste.type === 'overlapping_subscriptions'
                            ? 'OVERLAPPING SUBSCRIPTIONS'
                            : 'SMALL LEAK'}
                      </span>
                      <p className="mt-1.5 text-sm font-medium text-token-primary">{waste.message}</p>
                      {waste.items && waste.items.length > 0 && (
                        <p className="mt-1 text-xs text-token-muted truncate">{waste.items.join(' · ')}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-token-primary">
                      ~{formatCurrency(waste.amount, waste.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* D. Daily & Weekly Insights - Premium Locked (Free users only) */}
        {!isPremium && (
          <div className="rounded-3xl border-2 border-dashed border-token bg-[var(--background-tag)] p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--blueGray-200)] flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-token-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-token-primary mb-1">Daily & Weekly Insights</h3>
            <p className="text-sm text-token-secondary mb-4">Get granular spending patterns with daily and weekly AI analysis on Premium.</p>
            <Link
              href="/dashboard/premium"
              className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-500 transition-colors"
            >
              Upgrade to Premium
            </Link>
          </div>
        )}

        {recurring.length > 0 && (
          <div className="rounded-3xl bg-token-card border border-token p-5 shadow-sm">
            <h3 className="text-base font-semibold text-token-primary">Recurring</h3>
            <p className="mt-0.5 text-xs text-token-muted">Detected from your history — likely subscriptions &amp; bills</p>
            <div className="mt-4 space-y-3">
              {recurring.map((item) => (
                <div key={item.description} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-token-primary">{item.description}</p>
                    <p className="text-xs text-token-muted">{item.category} &middot; seen {item.monthsSeen} months</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-token-primary">
                    ~{formatCurrency(item.averageAmount, item.currency)}/mo
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/recurring"
              className="mt-4 flex h-11 w-full items-center justify-center rounded-lg border-2 border-token text-sm font-medium text-token-primary hover:bg-[var(--surface-hover)]"
            >
              Log these automatically
            </Link>
          </div>
        )}

        {/* E. AI Observations - Smart Cards */}
        <div className="rounded-3xl bg-token-card border border-token p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-token-primary">AI Observations</h3>
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent" />
              <p className="text-token-secondary">Loading insights...</p>
            </div>
          ) : insights.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-4 text-5xl">💡</div>
              <h3 className="mb-2 text-lg font-semibold text-token-primary">No insights yet</h3>
              <p className="mb-6 text-sm text-token-secondary">
                Generate insights to get AI-powered analysis of your spending
              </p>
              <Button onClick={handleGenerateInsights} isLoading={isGenerating}>
                Generate Insights
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => {
                const style = getInsightCardStyle(insight.type);
                const tag =
                  insight.type === 'warning' || insight.type.toLowerCase().includes('attention')
                    ? 'ATTENTION'
                    : 'INSIGHT';
                return (
                  <div
                    key={insight.id}
                    className={`rounded-2xl border p-4 ${style.bg} ${style.border}`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <svg
                        className={`h-5 w-5 ${style.iconColor}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            tag === 'ATTENTION'
                              ? 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                              : 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                          }
                        />
                      </svg>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${style.tag}`}>
                        {tag}
                      </span>
                    </div>
                    <p className="line-clamp-3 text-sm font-medium text-token-primary">{insight.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Others Bottom Sheet */}
      <BottomSheet
        isOpen={othersSheetOpen}
        onClose={() => setOthersSheetOpen(false)}
        title="Other Categories"
      >
        {summary && othersBreakdown.length > 0 ? (
          <div className="space-y-3">
            {othersBreakdown.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-xl bg-[var(--background-tag)] px-4 py-3"
              >
                <span className="font-medium text-token-primary">{item.name}</span>
                <span className="text-sm text-token-secondary">
                  {formatCurrency(item.value, summary.currency)} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-token-muted">No other categories</p>
        )}
      </BottomSheet>
    </DashboardLayout>
  );
}
