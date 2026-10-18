'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DailySpendingChart } from '@/components/dashboard/DailySpendingChart';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { CategoryIconBubble } from '@/components/CategoryIconBubble';
import {
  budgetPaceLabel,
  buildLastFiveDayBuckets,
  daysInMonth,
  daysLeftInMonth,
  expectedPacePercent,
  expensesToday,
  isoDay,
  sumExpensesOnDay,
  timeOfDayGreeting,
} from '@/lib/homeDashboard';
import type { CategorySummary, Expense, Insight, BudgetSummary, SavingsGoal } from '@/types';
import { maybeNotifyBudgetStatus } from '@/lib/notifications';
import { DASHBOARD_REFRESH_EVENT } from '@/lib/events';
import { addPendingToTotals } from '@/lib/pendingExpenses';
import { usePendingExpenses } from '@/hooks/usePendingExpenses';
import { useTourTarget } from '@/hooks/useTourTarget';
import { TOUR_TARGETS } from '@/lib/tourSteps';

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export default function DashboardPage() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const { user } = useAuthStore();
  const pending = usePendingExpenses();
  const heroTarget = useTourTarget(TOUR_TARGETS.homeTotal);
  const [summary, setSummary] = useState<CategorySummary | null>(null);
  const [monthExpenses, setMonthExpenses] = useState<Expense[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  // Read once on the client. Notifications come from fetched data, so the first
  // render shows none and the server markup still matches.
  const [seenIds, setSeenIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('seen-notifications');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || isLoading) return;

    const { startDate, endDate } = getCurrentMonthRange();
    setLoading(true);
    try {
      const [summaryRes, expensesRes, insightsRes, budgetRes, goalsRes] = await Promise.all([
        api.getCategorySummary({ startDate, endDate }),
        api.getExpenses({ limit: 100, startDate, endDate }),
        api.getInsights({ limit: 10 }),
        api.getCurrentBudget(),
        api.getGoals().catch(() => null),
      ]);

      if (summaryRes.success) setSummary(summaryRes.data);
      if (expensesRes.success) setMonthExpenses(expensesRes.data.expenses);
      if (insightsRes.success) setInsights(insightsRes.data.insights);
      if (budgetRes.success) setBudget(budgetRes.data);
      if (goalsRes?.success) setGoals(goalsRes.data.goals.filter((g) => g.status === 'active'));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isAuthenticated || isLoading || pathname !== '/dashboard') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- shows the loading state, then fills in the results
    fetchData();
  }, [isAuthenticated, isLoading, pathname, fetchData]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && pathname === '/dashboard') {
        fetchData();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [isAuthenticated, pathname, fetchData]);

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

  const { startDate, endDate } = getCurrentMonthRange();
  const monthPending = useMemo(
    () => pending.filter((p) => p.date.slice(0, 10) >= startDate && p.date.slice(0, 10) <= endDate),
    [pending, startDate, endDate]
  );
  const merged = addPendingToTotals(summary?.totalSpent ?? 0, summary?.byCategory ?? {}, pending, startDate, endDate);

  const userId = user?.id || '';
  const pendingExpenses = useMemo<Expense[]>(
    () =>
      monthPending.map((p) => ({
        id: `pending:${p.localId}`,
        userId,
        description: p.description,
        amount: p.amount,
        currency: p.currency,
        category: p.category,
        confidence: 0.6,
        rawInput: p.rawInput,
        date: p.date,
        createdAt: p.createdAt,
        updatedAt: p.createdAt,
      })),
    [monthPending, userId]
  );

  const mergedExpenses = useMemo(() => {
    const ids = new Set(monthExpenses.map((e) => e.id));
    return [...pendingExpenses.filter((e) => !ids.has(e.id)), ...monthExpenses];
  }, [monthExpenses, pendingExpenses]);

  const displayBudget = budget
    ? {
        ...budget,
        total_spent: budget.total_spent + monthPending.reduce((s, p) => s + p.amount, 0),
        remaining: budget.total_limit - (budget.total_spent + monthPending.reduce((s, p) => s + p.amount, 0)),
        percentage:
          budget.total_limit > 0
            ? Math.round(((budget.total_spent + monthPending.reduce((s, p) => s + p.amount, 0)) / budget.total_limit) * 100)
            : 0,
      }
    : budget;

  useEffect(() => {
    if (!displayBudget || !summary) return;
    maybeNotifyBudgetStatus({
      year: displayBudget.year,
      month: displayBudget.month,
      percentage: displayBudget.percentage,
      spentLabel: formatCurrency(displayBudget.total_spent, summary.currency || user?.currency || 'USD'),
      limitLabel: formatCurrency(displayBudget.total_limit, summary.currency || user?.currency || 'USD'),
    });
  }, [displayBudget, summary, user]);

  type NotificationItem = {
    id: string;
    type: 'budget-exceeded' | 'budget-warning' | 'insight';
    content: string;
    meta?: string;
  };

  const notifications: NotificationItem[] = [];
  const currency = summary?.currency || user?.currency || 'USD';

  if (displayBudget && displayBudget.percentage >= 100) {
    notifications.push({
      id: `budget-exceeded-${displayBudget.year}-${displayBudget.month}`,
      type: 'budget-exceeded',
      content: 'You have exceeded your monthly budget',
      meta: `${formatCurrency(displayBudget.total_spent, currency)} of ${formatCurrency(displayBudget.total_limit, currency)} (${displayBudget.percentage}%)`,
    });
  } else if (displayBudget && displayBudget.percentage >= 90) {
    notifications.push({
      id: `budget-warning-${displayBudget.year}-${displayBudget.month}`,
      type: 'budget-warning',
      content: 'You are about to exceed your monthly budget',
      meta: `${formatCurrency(displayBudget.total_spent, currency)} of ${formatCurrency(displayBudget.total_limit, currency)} (${displayBudget.percentage}%)`,
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

  const notificationCount = notifications.filter((n) => !seenIds.includes(n.id)).length;

  const handleNotificationClick = () => {
    const willOpen = !notificationOpen;
    setNotificationOpen(willOpen);
    if (willOpen && insights.length === 0 && !insightsLoading) fetchInsights();
    if (willOpen) {
      const ids = notifications.map((n) => n.id);
      const merged = Array.from(new Set([...seenIds, ...ids])).slice(-100);
      setSeenIds(merged);
      try {
        localStorage.setItem('seen-notifications', JSON.stringify(merged));
      } catch {
        // ignore
      }
    }
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

  const budgetPct = displayBudget?.percentage ?? 0;
  const expectedPct = expectedPacePercent();
  const paceLabel = budgetPaceLabel(budgetPct, expectedPct);
  const daysLeft = daysLeftInMonth();
  const todayKey = isoDay(new Date());
  const spentToday = sumExpensesOnDay(mergedExpenses, todayKey);
  const dailyBuckets = buildLastFiveDayBuckets(mergedExpenses);
  const dailyLimit =
    displayBudget && displayBudget.total_limit > 0 ? displayBudget.total_limit / daysInMonth() : 0;
  const safePerDay = displayBudget && daysLeft > 0 ? Math.max(0, displayBudget.remaining) / daysLeft : 0;
  const todayExpenses = expensesToday(mergedExpenses);
  const featuredInsight = insights[0];
  const primaryGoal = goals[0];
  const firstName = user?.name?.split(/\s+/)[0] || 'User';

  const formatExpenseTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'h:mm a');
    } catch {
      return '';
    }
  };

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

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-token-surface pb-24">
        <div className="space-y-3 sm:space-y-4">
          {/* Greeting + notifications */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-token-muted">{timeOfDayGreeting()}</p>
              <h1 className="text-xl font-medium text-token-accent">{firstName}</h1>
            </div>
            <div className="relative" ref={popoverRef}>
              <button
                type="button"
                onClick={handleNotificationClick}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-token bg-token-card text-token-secondary shadow-sm transition-all hover:border-[var(--accent-primary)] hover:text-token-accent dark:border-transparent"
                aria-label="Notifications"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {notificationCount > 0 ? (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-token-error" />
                ) : null}
              </button>
              {notificationOpen ? (
                <div className="absolute right-0 top-full z-50 mt-2 w-[min(calc(100vw-2rem),384px)] overflow-hidden rounded-card border border-token bg-token-card shadow-xl">
                  <div className="border-b border-token px-4 py-3">
                    <h3 className="font-semibold text-token-primary">Notifications</h3>
                  </div>
                  <div className="max-h-[min(60vh,320px)] overflow-y-auto p-2">
                    {insightsLoading && notifications.length === 0 ? (
                      <div className="flex justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-r-transparent" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm text-token-secondary">No notifications yet</p>
                        <Link
                          href="/dashboard/insights"
                          onClick={() => setNotificationOpen(false)}
                          className="mt-3 inline-block text-sm font-semibold text-token-accent"
                        >
                          Go to Insights
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`rounded-icon p-3 ${
                              n.type === 'budget-exceeded'
                                ? 'border border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-950/30'
                                : n.type === 'budget-warning'
                                  ? 'border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/30'
                                  : 'bg-token-accent-soft'
                            }`}
                          >
                            <p className="text-sm font-medium text-token-primary">{n.content}</p>
                            {n.meta ? <p className="mt-1 text-xs text-token-muted">{n.meta}</p> : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Hero: left this month / spent this month */}
          <div ref={heroTarget} className="dashboard-card space-y-2 p-4 sm:p-5">
            {displayBudget ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-token-muted">Left this month</span>
                  <span className="rounded-full bg-token-accent-soft px-2.5 py-0.5 text-[11px] font-semibold text-token-accent">
                    {paceLabel}
                  </span>
                </div>
                <p className="text-[32px] font-medium leading-tight tracking-tight text-token-primary">
                  {loading ? '…' : formatCurrency(Math.max(0, displayBudget.remaining), currency)}
                </p>
                <p className="text-xs text-token-muted">
                  of {formatCurrency(displayBudget.total_limit, currency)} · {daysLeft} days left
                </p>
                <div className="relative mt-2 h-2 overflow-visible rounded bg-[var(--chart-track)]">
                  <div
                    className="h-2 rounded bg-token-accent transition-all"
                    style={{ width: `${Math.min(100, budgetPct)}%` }}
                  />
                  <div
                    className="absolute top-[-4px] h-4 w-0.5 bg-token-primary"
                    style={{ left: `${Math.min(98, Math.max(0, expectedPct))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-token-muted">
                  <span>
                    Spent {formatCurrency(displayBudget.total_spent, currency)} ({budgetPct}%)
                  </span>
                  <span>Expected pace {expectedPct}%</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2.5">
                  <div className="rounded-icon bg-[var(--background-primary)] px-3 py-2.5">
                    <p className="text-[11px] text-token-muted">Safe per day</p>
                    <p className="text-base font-medium text-token-primary">{formatCurrency(safePerDay, currency)}</p>
                  </div>
                  <div className="rounded-icon bg-[var(--background-primary)] px-3 py-2.5">
                    <p className="text-[11px] text-token-muted">Spent today</p>
                    <p className="text-base font-medium text-token-primary">{formatCurrency(spentToday, currency)}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="text-xs text-token-muted">Spent this month</span>
                <p className="text-[32px] font-medium leading-tight text-token-primary">
                  {loading ? '…' : formatCurrency(merged.totalSpent, currency)}
                </p>
                <Link href="/dashboard/budget" className="text-sm font-semibold text-token-accent">
                  Set a monthly budget →
                </Link>
              </>
            )}
          </div>

          {/* AI insight */}
          {featuredInsight ? (
            <Link
              href="/dashboard/assistant"
              className="flex gap-3 rounded-card bg-token-accent-soft p-3.5 transition-opacity hover:opacity-95"
            >
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-token-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold text-token-primary">
                  {featuredInsight.content.split(/[.!?]/)[0]?.trim() || featuredInsight.content}
                </p>
                <p className="mt-0.5 line-clamp-3 text-xs leading-relaxed text-token-secondary">{featuredInsight.content}</p>
                <span className="mt-2 inline-block text-xs font-semibold text-token-accent">Ask advisor →</span>
              </div>
            </Link>
          ) : null}

          {/* Daily spending */}
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-medium text-token-primary">Daily spending</h2>
            {dailyLimit > 0 ? (
              <span className="text-[11px] text-token-muted">Limit {formatCurrency(dailyLimit, currency)}</span>
            ) : null}
          </div>
          <DailySpendingChart buckets={dailyBuckets} dailyLimit={dailyLimit} />

          {/* Savings goal */}
          {primaryGoal ? (
            <>
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-medium text-token-primary">Savings goal</h2>
                <Link href="/dashboard/goals" className="text-sm font-semibold text-token-accent">
                  View all
                </Link>
              </div>
              <div className="dashboard-card space-y-3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-icon bg-[var(--chart-track)] text-token-accent">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-token-primary">{primaryGoal.name}</p>
                      <p className="text-sm text-token-muted">
                        {formatCurrency(primaryGoal.savedAmount, primaryGoal.currency)} of{' '}
                        {formatCurrency(primaryGoal.targetAmount, primaryGoal.currency)}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 font-medium text-token-primary">{Math.round(primaryGoal.progress * 100)}%</p>
                </div>
                <div className="h-2 overflow-hidden rounded bg-[var(--chart-track)]">
                  <div
                    className="h-full rounded bg-token-accent transition-all"
                    style={{ width: `${Math.min(100, primaryGoal.progress * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-token-muted">
                    {formatCurrency(Math.max(0, primaryGoal.targetAmount - primaryGoal.savedAmount), primaryGoal.currency)} to go
                  </p>
                  <Link
                    href="/dashboard/goals"
                    className="rounded-full bg-token-accent-soft px-3 py-1 text-xs font-semibold text-token-accent"
                  >
                    Add funds
                  </Link>
                </div>
              </div>
            </>
          ) : null}

          {/* Today */}
          {todayExpenses.length > 0 ? (
            <>
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-medium text-token-primary">
                  Today · {formatCurrency(spentToday, currency)}
                </h2>
                <Link href="/dashboard/expenses" className="text-sm font-semibold text-token-accent">
                  View all
                </Link>
              </div>
              <div className="dashboard-card divide-y divide-[var(--border-default)] overflow-hidden p-0">
                {todayExpenses.map((expense) => {
                  const time = formatExpenseTime(expense.date);
                  return (
                    <Link
                      key={expense.id}
                      href="/dashboard/expenses"
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-hover)]"
                    >
                      <CategoryIconBubble category={expense.category} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-token-primary">{expense.description}</p>
                        <p className="truncate text-xs text-token-muted">
                          {expense.category}
                          {time ? ` · ${time}` : ''}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-medium text-token-primary">-{expense.amount.toFixed(0)}</p>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : null}

          {!loading && merged.totalSpent === 0 ? (
            <div className="dashboard-card p-8 text-center sm:p-12">
              <div className="mb-4 text-5xl">📝</div>
              <h3 className="mb-2 text-xl font-semibold text-token-primary">No expenses yet</h3>
              <p className="mb-6 text-token-secondary">Start tracking your expenses by adding your first entry</p>
              <Link
                href="/dashboard/add"
                className="inline-flex rounded-lg bg-token-accent px-6 py-3 font-semibold text-white shadow-sm transition-all hover:opacity-90"
              >
                Add Your First Expense
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
