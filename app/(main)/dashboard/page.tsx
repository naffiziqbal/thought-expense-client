'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { useIsPremium } from '@/hooks/useIsPremium';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getCategoryBgColor, getCategoryChartColor } from '@/lib/utils';
import { getCategoryIcon } from '@/lib/categoryIcons';
import Link from 'next/link';
import type { CategorySummary, Expense, Insight, BudgetSummary } from '@/types';
import { AdPlaceholder } from '@/components/landing/AdPlaceholder';
import { maybeNotifyBudgetStatus } from '@/lib/notifications';
import { DASHBOARD_REFRESH_EVENT } from '@/lib/events';

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

/** SVG Donut chart: grey track, teal fill for percentage used */
function DonutChart({ percentage, size = 96 }: { percentage: number; size?: number }) {
  const r = (size - 12) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const stroke = 12;
  const circumference = 2 * Math.PI * r;
  const fillPct = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (fillPct / 100) * circumference;

  return (
    <svg width={size} height={size} className="shrink-0">
      {/* Grey track (background) */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--blueGray-200)"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      {/* Teal fill (spent) */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--accent-primary)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${cx} ${cy})`}
        className="transition-all duration-500"
      />
      {/* Center: percentage */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        className="text-base font-bold fill-[var(--text-primary)]"
      >
        {Math.round(fillPct)}%
      </text>
    </svg>
  );
}

export default function DashboardPage() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const { user } = useAuthStore();
  const isPremium = useIsPremium();

  const [summary, setSummary] = useState<CategorySummary | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || isLoading) return;

    const { startDate, endDate } = getCurrentMonthRange();
    setLoading(true);
    try {
      const [summaryRes, expensesRes, insightsRes, budgetRes] = await Promise.all([
        api.getCategorySummary({ startDate, endDate }),
        api.getExpenses({ limit: 5, startDate, endDate }),
        api.getInsights({ limit: 10 }),
        api.getCurrentBudget(),
      ]);

      if (summaryRes.success) setSummary(summaryRes.data);
      if (expensesRes.success) setRecentExpenses(expensesRes.data.expenses);
      if (insightsRes.success) setInsights(insightsRes.data.insights);
      if (budgetRes.success) setBudget(budgetRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isLoading]);

  // Fetch when on dashboard (mount + navigation)
  useEffect(() => {
    if (!isAuthenticated || isLoading || pathname !== '/dashboard') return;
    fetchData();
  }, [isAuthenticated, isLoading, pathname, fetchData]);

  // Refetch when tab becomes visible (user returns to app)
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && pathname === '/dashboard') {
        fetchData();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [isAuthenticated, pathname, fetchData]);

  // Refetch when expense is added/edited/deleted (from add or expenses pages)
  useEffect(() => {
    const onRefresh = () => {
      if (isAuthenticated) fetchData();
    };
    window.addEventListener(DASHBOARD_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(DASHBOARD_REFRESH_EVENT, onRefresh);
  }, [isAuthenticated, fetchData]);

  const fetchInsights = async () => {
    setInsightsLoading(true);
    try {
      const response = await api.getInsights({ limit: 10 });
      if (response.success) setInsights(response.data.insights);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleNotificationClick = () => {
    const willOpen = !notificationOpen;
    setNotificationOpen(willOpen);
    if (willOpen && insights.length === 0 && !insightsLoading) fetchInsights();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };
    if (notificationOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationOpen]);

  useEffect(() => {
    if (!budget || !summary) return;
    maybeNotifyBudgetStatus({
      year: budget.year,
      month: budget.month,
      percentage: budget.percentage,
      spentLabel: formatCurrency(budget.total_spent, summary.currency || user?.currency || 'USD'),
      limitLabel: formatCurrency(budget.total_limit, summary.currency || user?.currency || 'USD'),
    });
  }, [budget, summary, user]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent-primary)] border-r-transparent" />
          <p className="text-token-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  const currency = summary?.currency || user?.currency || 'USD';
  const budgetPct = budget ? budget.percentage : 0;
  const topCategory = summary?.topCategories?.[0];
  const topCategoryAmount = topCategory ? (summary?.byCategory?.[topCategory] ?? 0) : 0;

  // Build notifications: budget alerts first (urgent), then AI insights
  type NotificationItem = { id: string; type: 'budget-exceeded' | 'budget-warning' | 'insight'; content: string; meta?: string };
  const notifications: NotificationItem[] = [];

  if (budget && budget.percentage >= 100) {
    notifications.push({
      id: 'budget-exceeded',
      type: 'budget-exceeded',
      content: 'You have exceeded your monthly budget',
      meta: `${formatCurrency(budget.total_spent, currency)} of ${formatCurrency(budget.total_limit, currency)} (${budget.percentage}%)`,
    });
  } else if (budget && budget.percentage >= 90) {
    notifications.push({
      id: 'budget-warning',
      type: 'budget-warning',
      content: 'You are about to exceed your monthly budget',
      meta: `${formatCurrency(budget.total_spent, currency)} of ${formatCurrency(budget.total_limit, currency)} (${budget.percentage}%)`,
    });
  }

  insights.forEach((insight) => {
    notifications.push({
      id: insight.id,
      type: 'insight',
      content: insight.content,
      meta: new Date(insight.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  });

  const notificationCount = notifications.length;

  // Progress bar color: Teal (safe), Yellow (warning), Red (danger)
  const progressColor =
    budgetPct < 75 ? 'bg-[var(--accent-primary)]' : budgetPct < 95 ? 'bg-[var(--status-warning)]' : 'bg-[var(--status-error)]';

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-token-surface pb-24">
        <div className="space-y-4 sm:space-y-6">
          {/* Zone A: Personal Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-token-muted uppercase tracking-wide">Welcome back,</p>
              <h1 className="text-2xl font-bold text-token-accent">{user?.name || 'User'}</h1>
            </div>
            <div className="relative" ref={popoverRef}>
              <button
                onClick={handleNotificationClick}
                className="w-10 h-10 rounded-full bg-token-card border border-token flex items-center justify-center text-token-secondary shadow-sm hover:border-[var(--accent-primary)] hover:text-token-accent transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-token-error text-white text-[10px] font-bold flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
              {notificationOpen && (
                <div className="absolute right-0 top-full mt-2 w-[min(calc(100vw-2rem),384px)] rounded-2xl bg-token-card shadow-xl border border-token z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-token">
                    <h3 className="font-semibold text-token-primary">Notifications</h3>
                    <p className="text-xs text-token-secondary">Budget alerts and spending insights</p>
                  </div>
                  <div className="max-h-[min(60vh,320px)] overflow-y-auto">
                    {insightsLoading && notifications.length === 0 ? (
                      <div className="flex justify-center py-12">
                        <div className="w-8 h-8 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-r-transparent" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm text-token-secondary">No notifications yet</p>
                        <p className="text-xs text-token-muted mt-1">You&apos;ll see budget alerts and AI insights here</p>
                        <Link href="/dashboard/insights" onClick={() => setNotificationOpen(false)} className="mt-3 inline-block text-sm font-semibold text-token-accent">
                          Go to Insights
                        </Link>
                      </div>
                    ) : (
                      <div className="p-2 space-y-2">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 rounded-xl transition-colors ${
                              n.type === 'budget-exceeded'
                                ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50'
                                : n.type === 'budget-warning'
                                  ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50'
                                  : 'bg-teal-50/50 dark:bg-teal-950/20 hover:bg-teal-50 dark:hover:bg-teal-950/30'
                            }`}
                          >
                            <p className="text-sm font-medium text-token-primary">{n.content}</p>
                            {n.meta && <p className="text-xs text-token-muted mt-2">{n.meta}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-token bg-token-surface flex justify-between items-center gap-2">
                    <Link href="/dashboard/budget" onClick={() => setNotificationOpen(false)}>
                      <span className="text-sm font-semibold text-token-accent">View budget</span>
                    </Link>
                    <Link href="/dashboard/insights" onClick={() => setNotificationOpen(false)}>
                      <span className="text-sm font-semibold text-token-accent">View all insights</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Budget warning banner */}
          {budget && budget.percentage >= 90 && (
            <div className={`rounded-2xl border px-4 py-3 ${budget.percentage >= 100 ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
              <p className="text-sm font-semibold text-token-primary">
                {budget.percentage >= 100 ? 'You have exceeded your monthly budget' : 'You are about to exceed your monthly budget'}
              </p>
              <p className="text-xs text-token-secondary mt-1">
                {formatCurrency(budget.total_spent, currency)} of {formatCurrency(budget.total_limit, currency)} ({budget.percentage}%)
              </p>
            </div>
          )}

          {/* Zone B: Hero (Visual Summary) - White Card */}
          <div className="rounded-[24px] bg-token-card border border-token p-3 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between gap-3 sm:gap-6">
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-token-muted">Total Spent</span>
                  <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold bg-red-100 text-red-700">
                    +0%
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-token-primary tracking-tight truncate">
                  {loading ? '...' : formatCurrency(summary?.totalSpent ?? 0, currency)}
                </h2>
                <p className="text-xs sm:text-sm font-medium text-token-secondary mt-1.5 sm:mt-2">
                  {summary?.transactionCount ?? 0} transactions
                </p>
              </div>
              <DonutChart percentage={budgetPct} size={96} />
            </div>
          </div>

          {/* Zone C: Context Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            {/* Card 1: Safe to Spend */}
            <Link href="/dashboard/budget" className="block min-w-0">
              <div className="rounded-2xl bg-token-card border border-token p-2.5 sm:p-5 shadow-sm h-[130px] sm:h-[140px] flex flex-col justify-between hover:border-[var(--accent-primary)]/30 transition-colors">
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-token-muted">Safe to Spend</p>
                <p className="text-base sm:text-xl font-extrabold text-token-primary truncate" title={budget ? formatCurrency(Math.max(0, budget.remaining), currency) : undefined}>
                  {budget ? formatCurrency(Math.max(0, budget.remaining), currency) : '—'}
                </p>
                <div className="space-y-1">
                  <div className="h-2 rounded-full bg-[var(--blueGray-100)] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${progressColor} transition-all`}
                      style={{ width: `${Math.min(budgetPct, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-semibold text-token-accent">View budget</p>
                </div>
              </div>
            </Link>

            {/* Card 2: Top Category */}
            <div className="rounded-2xl bg-token-card border border-token p-2.5 sm:p-5 shadow-sm h-[130px] sm:h-[140px] flex flex-col justify-between min-w-0">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-token-muted">Top Category</p>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: topCategory ? getCategoryBgColor(topCategory) : 'var(--blueGray-100)' }}
                >
                  {topCategory ? (
                    (() => {
                      const Icon = getCategoryIcon(topCategory);
                      return <Icon className="w-6 h-6 text-purple-600" aria-hidden />;
                    })()
                  ) : (
                    <span className="text-lg">—</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-token-primary truncate">{topCategory || '—'}</p>
                  <p className="text-sm font-semibold text-token-secondary">
                    {loading ? '...' : formatCurrency(topCategoryAmount, currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Zone D: Transaction Stream */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-token-primary">Recent Transactions</h3>
              <Link href="/dashboard/expenses" className="text-sm font-semibold text-token-accent hover:opacity-80">
                View All
              </Link>
            </div>

            {recentExpenses.length > 0 ? (
              <div className="rounded-2xl bg-token-card border border-token divide-y divide-[var(--border-default)] overflow-hidden shadow-sm px-0">
                {recentExpenses.map((expense) => {
                  const CategoryIcon = getCategoryIcon(expense.category);
                  return (
                    <Link key={expense.id} href="/dashboard/expenses" className="flex items-center gap-2 sm:gap-4 px-2.5 sm:px-4 py-3 hover:bg-[var(--blueGray-50)] transition-colors">
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: getCategoryBgColor(expense.category) }}
                      >
                        <CategoryIcon className="w-6 h-6" style={{ color: getCategoryChartColor(expense.category) }} aria-hidden />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-token-primary truncate">{expense.description}</p>
                        <p className="text-sm text-token-secondary">{formatDate(expense.date)}</p>
                      </div>
                      <p className="font-bold text-token-primary shrink-0">-{formatCurrency(expense.amount, expense.currency)}</p>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* Empty State */}
          {!loading && (summary?.transactionCount ?? 0) === 0 && (
            <div className="rounded-2xl bg-token-card border border-token p-6 sm:p-12 text-center shadow-sm">
              <div className="mb-4 text-6xl">📝</div>
              <h3 className="mb-2 text-xl font-semibold text-token-primary">No expenses yet</h3>
              <p className="mb-6 text-token-secondary">Start tracking your expenses by adding your first entry</p>
              <Link href="/dashboard/add">
                <span className="inline-flex px-6 py-3 bg-token-accent hover:opacity-90 text-white rounded-lg font-semibold shadow-sm transition-all">
                  Add Your First Expense
                </span>
              </Link>
            </div>
          )}

          {!isPremium && !loading && <AdPlaceholder />}
        </div>

      </div>
    </DashboardLayout>
  );
}
