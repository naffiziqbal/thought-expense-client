'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { api } from '@/lib/api';
import {
  budgetContextForMonth,
  budgetPaceLabel,
  budgetSpendTier,
  CATEGORY_BUDGET_INPUT_HINT,
  CATEGORY_BUDGET_INPUT_PLACEHOLDER,
  getCategoryEmoji,
  monthLabel,
} from '@/lib/budgetDashboard';
import { DASHBOARD_REFRESH_EVENT } from '@/lib/events';
import toast from 'react-hot-toast';
import type { BudgetSummary, CategoryBudgetProgress, Expense } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

function progressBarClass(tier: ReturnType<typeof budgetSpendTier>): string {
  if (tier === 'safe') return 'bg-token-accent';
  if (tier === 'warn') return 'bg-token-warning';
  return 'bg-token-error';
}

export default function BudgetPage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const { user } = useAuthStore();

  const initialNow = new Date();
  const [month, setMonth] = useState(initialNow.getMonth() + 1);
  const [year, setYear] = useState(initialNow.getFullYear());

  const [loadingBudgets, setLoadingBudgets] = useState(true);
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudgetProgress[]>([]);
  const [history, setHistory] = useState<BudgetSummary[]>([]);
  const [showPastMonths, setShowPastMonths] = useState(false);

  const [categoryText, setCategoryText] = useState('');
  const [parsedCategories, setParsedCategories] = useState<{ category: string; limit: number }[]>([]);
  const [parsing, setParsing] = useState(false);

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [editLimitOpen, setEditLimitOpen] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categoryExpenses, setCategoryExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  const currency = user?.currency || 'USD';

  const loadBudgets = async () => {
    try {
      const [currentRes, historyRes, categoriesRes] = await Promise.all([
        api.getCurrentBudget({ month, year }),
        api.getBudgetHistory(12),
        api.getCurrentCategoryBudgets({ month, year }),
      ]);

      if (currentRes.success) setBudget(currentRes.data);
      if (historyRes.success) setHistory(historyRes.data || []);
      if (categoriesRes.success) setCategoryBudgets(categoriesRes.data || []);
    } catch (err) {
      console.error('Failed to load budgets', err);
    } finally {
      setLoadingBudgets(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    loadBudgets();
  }, [isAuthenticated, isLoading, month, year]);

  useEffect(() => {
    if (editLimitOpen && budget) setEditAmount(String(budget.total_limit));
    if (editLimitOpen && !budget) setEditAmount('');
  }, [editLimitOpen, budget]);

  const handleSaveLimit = async () => {
    const value = parseFloat(editAmount);
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setIsSaving(true);
    try {
      const res = await api.setBudget({ month, year, total_limit: value });
      if (res.success) {
        toast.success('Budget updated');
        setEditLimitOpen(false);
        await loadBudgets();
        window.dispatchEvent(new CustomEvent(DASHBOARD_REFRESH_EVENT));
      } else {
        toast.error(res.message || 'Failed to save');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!categoryText.trim()) {
      toast.error('Enter category budgets first');
      return;
    }
    setParsing(true);
    try {
      const res = await api.parseCategoryBudgets(categoryText, month, year);
      if (res.success && res.data?.items?.length) {
        setParsedCategories(res.data.items);
        const total = res.data.items.reduce((s, i) => s + i.limit, 0);
        toast.success(`Parsed ${res.data.items.length} categories (${formatCurrency(total, currency)})`);
      } else {
        toast.error('Could not parse any categories');
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to parse');
    } finally {
      setParsing(false);
    }
  };

  const handleSaveCategoryBudgets = async () => {
    const cleaned = parsedCategories
      .map((i) => ({ ...i, limit: Number(i.limit) }))
      .filter((i) => i.category && i.limit > 0);
    if (!cleaned.length) {
      toast.error('No valid budgets to save');
      return;
    }
    try {
      const res = await api.upsertCategoryBudgets({ month, year, items: cleaned });
      if (res.success) {
        toast.success('Category budgets saved');
        setCategoryText('');
        setParsedCategories([]);
        await loadBudgets();
        window.dispatchEvent(new CustomEvent(DASHBOARD_REFRESH_EVENT));
      } else {
        toast.error(res.message || 'Failed to save');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Failed to save');
    }
  };

  const handleSetAsMonthlyLimit = async () => {
    const total = parsedCategories.reduce((s, i) => s + Number(i.limit), 0);
    if (total <= 0) return;
    try {
      await api.setBudget({ month, year, total_limit: total });
      toast.success('Monthly limit set from categories');
      await loadBudgets();
      window.dispatchEvent(new CustomEvent(DASHBOARD_REFRESH_EVENT));
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleCategoryClick = async (cat: string) => {
    if (expandedCategory === cat) {
      setExpandedCategory(null);
      setCategoryExpenses([]);
      return;
    }
    setExpandedCategory(cat);
    setLoadingExpenses(true);
    try {
      const monthStart = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const monthEnd = new Date(year, month, 0).toISOString().split('T')[0];
      const res = await api.getExpenses({
        startDate: monthStart,
        endDate: monthEnd,
        category: cat,
        limit: 50,
      });
      if (res.success) setCategoryExpenses(res.data.expenses);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingExpenses(false);
    }
  };

  const monthYearOptions = Array.from({ length: 24 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return { month: d.getMonth() + 1, year: d.getFullYear() };
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent-primary)] border-r-transparent" />
      </div>
    );
  }

  const budgetPct = budget?.percentage ?? 0;
  const tier = budgetSpendTier(budgetPct);
  const { isCurrentMonth, expectedPct, daysLeft } = budgetContextForMonth(month, year);
  const paceLabel = budgetPaceLabel(budgetPct, expectedPct);
  const safePerDay = budget && daysLeft > 0 ? Math.max(0, budget.remaining) / daysLeft : 0;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg space-y-3 pb-8 pt-1">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-base font-semibold leading-tight text-token-primary">Budget</h1>
            <button
              type="button"
              onClick={() => setDatePickerOpen(true)}
              className="mt-0.5 flex items-center gap-1 text-xs text-token-muted hover:text-token-accent"
            >
              {monthLabel(year, month)}
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            onClick={() => setEditLimitOpen(true)}
            aria-label="Edit monthly limit"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-token bg-token-card text-token-secondary shadow-sm hover:border-[var(--accent-primary)] hover:text-token-accent"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>

        <div className={`rounded-card border p-4 ${tier === 'safe' ? 'border-[var(--accent-primary)]/35 bg-[var(--accent-primary)]/5' : 'border-token bg-token-card'}`}>
          {budget ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-token-muted">Left this month</p>
                {isCurrentMonth ? (
                  <span className="rounded-full bg-token-card px-2.5 py-0.5 text-[10px] font-semibold text-token-accent">{paceLabel}</span>
                ) : null}
              </div>
              <p className={`mt-1 text-3xl font-semibold tabular-nums text-token-primary ${loadingBudgets ? 'opacity-50' : ''}`}>
                {loadingBudgets ? '…' : formatCurrency(Math.max(0, budget.remaining), currency)}
              </p>
              <p className="text-xs text-token-secondary">
                of {formatCurrency(budget.total_limit, currency)}
                {isCurrentMonth && daysLeft > 0 ? ` · ${daysLeft} days left` : ''}
              </p>
              <div className="relative mt-3 h-2 overflow-visible rounded-full bg-[var(--chart-track)]">
                <div
                  className={`h-2 rounded-full transition-all ${progressBarClass(tier)}`}
                  style={{ width: `${Math.min(budgetPct, 100)}%` }}
                />
                {isCurrentMonth ? (
                  <div
                    className="absolute top-[-4px] h-4 w-0.5 bg-token-primary"
                    style={{ left: `${Math.min(98, Math.max(0, expectedPct))}%` }}
                  />
                ) : null}
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-token-muted">
                <span>
                  Spent {formatCurrency(budget.total_spent, currency)} ({budgetPct}%)
                </span>
                {isCurrentMonth ? <span>Expected {expectedPct}%</span> : null}
              </div>
              {isCurrentMonth && daysLeft > 0 ? (
                <div className="mt-3 rounded-control bg-[var(--background-primary)] px-3 py-2.5">
                  <p className="text-[11px] text-token-muted">Safe per day</p>
                  <p className="text-base font-medium text-token-primary">{formatCurrency(safePerDay, currency)}</p>
                </div>
              ) : null}
            </>
          ) : loadingBudgets ? (
            <p className="py-6 text-center text-sm text-token-muted">Loading budget…</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-token-primary">No monthly limit yet</p>
              <p className="text-xs leading-relaxed text-token-secondary">
                Set a total with the edit button, or describe category limits below.
              </p>
              <Button type="button" size="sm" onClick={() => setEditLimitOpen(true)}>
                Set monthly limit
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-card border border-[var(--accent-primary)]/30 bg-token-card p-4">
          <p className="text-xs font-medium text-token-accent">Category budgets</p>
          <p className="mt-1 text-xs leading-relaxed text-token-muted">{CATEGORY_BUDGET_INPUT_HINT}</p>
          <div className="mt-3 rounded-control border border-token bg-[var(--background-tag)] px-3 py-3 focus-within:border-[var(--accent-primary)]">
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-token-accent" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" clipRule="evenodd" />
              </svg>
              <textarea
                value={categoryText}
                onChange={(e) => setCategoryText(e.target.value)}
                placeholder={CATEGORY_BUDGET_INPUT_PLACEHOLDER}
                rows={3}
                className="min-h-[5.5rem] w-full resize-none bg-transparent text-sm leading-relaxed text-token-primary placeholder:text-token-muted focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-2 flex justify-end">
            <Button type="button" size="sm" onClick={handleGenerate} isLoading={parsing} disabled={!categoryText.trim()}>
              Parse
            </Button>
          </div>

          {parsedCategories.length > 0 ? (
            <div className="mt-3 space-y-2 border-t border-token pt-3">
              <div className="flex items-center justify-between gap-2 rounded-control bg-token-accent-soft px-3 py-2">
                <span className="text-xs text-token-primary">
                  Total {formatCurrency(parsedCategories.reduce((s, i) => s + i.limit, 0), currency)}
                </span>
                <button type="button" onClick={handleSetAsMonthlyLimit} className="text-xs font-semibold text-token-accent">
                  Use as monthly limit
                </button>
              </div>
              {parsedCategories.map((item, idx) => (
                <div key={`${item.category}-${idx}`} className="flex items-center gap-2">
                  <input
                    value={item.category}
                    onChange={(e) => setParsedCategories((prev) => prev.map((p, i) => (i === idx ? { ...p, category: e.target.value } : p)))}
                    className="min-w-0 flex-1 rounded-control border border-token px-3 py-2 text-sm text-token-primary"
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={item.limit}
                    onChange={(e) => setParsedCategories((prev) => prev.map((p, i) => (i === idx ? { ...p, limit: Number(e.target.value) || 0 } : p)))}
                    className="w-24 rounded-control border border-token px-3 py-2 text-right text-sm text-token-primary"
                  />
                  <button type="button" onClick={() => setParsedCategories((prev) => prev.filter((_, i) => i !== idx))} className="p-1 text-token-muted hover:text-token-error">
                    ✕
                  </button>
                </div>
              ))}
              <Button type="button" size="sm" className="w-full" onClick={handleSaveCategoryBudgets}>
                Save category budgets
              </Button>
            </div>
          ) : null}
        </div>

        {categoryBudgets.length > 0 ? (
          <div>
            <p className="mb-2 ml-1 text-xs text-token-muted">By category</p>
            <div className="overflow-hidden rounded-card border border-token bg-token-card">
              {categoryBudgets.map((b, i) => {
                const pct = b.limit > 0 ? Math.min(100, Math.round((b.spent / b.limit) * 100)) : 0;
                const catTier = budgetSpendTier(pct);
                const isExpanded = expandedCategory === b.category;
                return (
                  <div key={`${b.year}-${b.month}-${b.category}`} className={i < categoryBudgets.length - 1 ? 'border-b border-token' : ''}>
                    <button type="button" onClick={() => handleCategoryClick(b.category)} className="flex w-full items-start gap-3 p-3 text-left">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-icon bg-[var(--chart-track)] text-lg">
                        {getCategoryEmoji(b.category)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium text-token-primary">{b.category}</span>
                          <span className="shrink-0 text-sm font-semibold tabular-nums text-token-primary">{pct}%</span>
                        </span>
                        <span className="mt-0.5 block text-xs text-token-muted">
                          {formatCurrency(b.spent, currency)} of {formatCurrency(b.limit, currency)}
                        </span>
                        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[var(--chart-track)]">
                          <span className={`block h-full rounded-full ${progressBarClass(catTier)}`} style={{ width: `${pct}%` }} />
                        </span>
                      </span>
                      <svg className={`mt-1 h-4 w-4 shrink-0 text-token-muted ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isExpanded ? (
                      <div className="space-y-2 border-t border-token px-3 py-3">
                        {loadingExpenses ? (
                          <p className="text-sm text-token-muted">Loading…</p>
                        ) : categoryExpenses.length === 0 ? (
                          <p className="text-sm text-token-muted">No transactions this month</p>
                        ) : (
                          categoryExpenses.map((e) => (
                            <div key={e.id} className="flex justify-between gap-2 text-sm">
                              <span className="truncate text-token-secondary">{e.description}</span>
                              <span className="shrink-0 font-medium text-token-primary">{formatCurrency(e.amount, e.currency)}</span>
                            </div>
                          ))
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {history.length > 0 ? (
          <div>
            <button
              type="button"
              onClick={() => setShowPastMonths((v) => !v)}
              className="flex w-full items-center justify-between px-1 text-xs font-medium text-token-muted"
            >
              Past months ({history.length})
              <svg className={`h-4 w-4 ${showPastMonths ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showPastMonths ? (
              <div className="mt-2 overflow-hidden rounded-card border border-token bg-token-card">
                {history.slice(0, 6).map((b, i) => {
                  const isSelected = b.month === month && b.year === year;
                  return (
                    <button
                      key={b.id || `${b.year}-${b.month}`}
                      type="button"
                      onClick={() => {
                        setMonth(b.month);
                        setYear(b.year);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left ${i < Math.min(history.length, 6) - 1 ? 'border-b border-token' : ''} ${
                        isSelected ? 'bg-token-accent-soft' : 'hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <span className="text-sm font-medium text-token-primary">{monthLabel(b.year, b.month, false)}</span>
                      <span className={`text-xs font-semibold ${b.total_spent <= b.total_limit ? 'text-token-accent' : 'text-token-error'}`}>
                        {b.percentage}%
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}

        <BottomSheet isOpen={datePickerOpen} onClose={() => setDatePickerOpen(false)} title="Select month">
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {monthYearOptions.map(({ month: m, year: y }) => {
              const isSelected = m === month && y === year;
              return (
                <button
                  key={`${y}-${m}`}
                  type="button"
                  onClick={() => {
                    setMonth(m);
                    setYear(y);
                    setDatePickerOpen(false);
                  }}
                  className={`w-full rounded-control px-4 py-3 text-left text-sm font-medium ${isSelected ? 'bg-token-accent-soft text-token-accent' : 'text-token-primary hover:bg-[var(--surface-hover)]'}`}
                >
                  {monthLabel(y, m)}
                </button>
              );
            })}
          </div>
        </BottomSheet>

        <BottomSheet isOpen={editLimitOpen} onClose={() => setEditLimitOpen(false)} title="Monthly limit">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-token-secondary">
                Total for {monthLabel(year, month)} ({currency})
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="Amount"
                className="w-full rounded-control border border-token px-4 py-2.5 text-sm text-token-primary focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>
            <Button type="button" className="w-full" onClick={handleSaveLimit} isLoading={isSaving}>
              Save limit
            </Button>
          </div>
        </BottomSheet>
      </div>
    </DashboardLayout>
  );
}
