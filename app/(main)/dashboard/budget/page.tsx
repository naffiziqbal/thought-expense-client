'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { BudgetSummary, CategoryBudgetProgress, Expense } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

// Category name → emoji for breakdown cards
const CATEGORY_EMOJI: Record<string, string> = {
  food: '🍽️',
  groceries: '🥬',
  grocery: '🥬',
  rent: '🏠',
  transport: '🚗',
  transportation: '🚗',
  gas: '⛽',
  fuel: '⛽',
  health: '❤️',
  medical: '🏥',
  healthcare: '🏥',
  entertainment: '🎬',
  utilities: '💡',
  shopping: '🛍️',
  education: '📚',
  dining: '🍴',
  fitness: '💪',
  gym: '💪',
  subscriptions: '📱',
  travel: '✈️',
  other: '📦',
};

function getCategoryEmoji(category: string): string {
  const key = category.trim().toLowerCase();
  return CATEGORY_EMOJI[key] ?? '📦';
}

// Progress bar color per design tokens: Safe <75% (accent), Warning 75-95% (orange), Danger >95% (red)
function getProgressColor(percentage: number): string {
  if (percentage < 75) return 'bg-token-accent';
  if (percentage < 95) return 'bg-token-warning';
  return 'bg-token-error';
}

function getProgressBgColor(percentage: number): string {
  if (percentage < 75) return 'bg-teal-50';
  if (percentage < 95) return 'bg-orange-50';
  return 'bg-red-50';
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

  // Prefill edit form when opening
  useEffect(() => {
    if (editLimitOpen && budget) {
      setEditAmount(String(budget.total_limit));
    }
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
      } else {
        toast.error(res.message || 'Failed to save');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save');
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
        toast.success(`Parsed ${res.data.items.length} categories (Total: ${formatCurrency(total, currency)})`);
      } else {
        toast.error('Could not parse any categories');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to parse');
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
      } else {
        toast.error(res.message || 'Failed to save');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save');
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
      if (res.success) {
        setCategoryExpenses(res.data.expenses);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingExpenses(false);
    }
  };

  // Build month/year options for picker (last 24 months)
  const monthYearOptions = Array.from({ length: 24 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return { month: d.getMonth() + 1, year: d.getFullYear() };
  });

  const dateLabel = new Date(year, month - 1, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

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
      <div className="min-h-screen bg-token-surface pb-8">
        {/* Zone A: Header */}
        <div className="pt-6 pb-4">
          <h1 className="text-2xl font-bold text-token-primary tracking-tight">Monthly Budget</h1>
          <button
            onClick={() => setDatePickerOpen(true)}
            className="mt-2 flex items-center gap-1.5 text-base font-semibold text-token-secondary hover:text-[var(--accent-primary)] transition-colors"
          >
            {dateLabel}
            <svg className="h-4 w-4 text-token-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Zone B: Scoreboard (Hero Card) */}
        <div className="rounded-3xl bg-token-card p-4 sm:p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-token-muted mb-1">Safe to Spend</p>
              <p
                className={`text-4xl md:text-5xl font-extrabold tracking-tight text-token-primary ${
                  loadingBudgets ? 'opacity-50' : ''
                }`}
              >
                {loadingBudgets
                  ? '...'
                  : budget
                  ? formatCurrency(Math.max(0, budget.remaining), currency)
                  : '—'}
              </p>
            </div>
            <button
              onClick={() => setEditLimitOpen(true)}
              className="rounded-lg p-2 text-token-muted hover:bg-[var(--blueGray-100)] hover:text-token-secondary transition-colors"
              title="Edit budget"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          </div>

          {budget && (
            <>
              <div className="mt-4 h-3 rounded-full bg-[var(--blueGray-100)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getProgressColor(budget.percentage)}`}
                  style={{ width: `${Math.min(budget.percentage, 120)}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs font-medium text-token-secondary">
                <span>{formatCurrency(budget.total_spent, currency)} spent</span>
                <span>{formatCurrency(budget.total_limit, currency)} limit</span>
              </div>
            </>
          )}

          {!budget && !loadingBudgets && (
            <p className="mt-4 text-sm text-token-secondary">
              Set a total limit using the pencil icon, or generate from category budgets below.
            </p>
          )}
        </div>

        {/* Zone C: Magic Wand (AI Setup) */}
        <div className="mt-6 rounded-3xl bg-token-card p-3 sm:p-4 shadow-sm">
          <div className="flex gap-2 sm:gap-3 items-center">
            <div className="flex-1 flex items-center gap-2 h-11 rounded-full border border-token bg-[var(--blueGray-50)] px-3 sm:px-4 focus-within:border-[var(--accent-primary)] focus-within:bg-teal-50/30 focus-within:ring-2 focus-within:ring-[var(--accent-primary)]/20 transition-all">
              <svg className="h-5 w-5 shrink-0 text-token-accent" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.916 1.916l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.916 1.916l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.916-1.916l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.916-1.916l.258-1.036A.75.75 0 0118 1.5zM3 13.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.916 1.916l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.916 1.916l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.916-1.916l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.916-1.916l.258-1.036A.75.75 0 013 13.5z" clipRule="evenodd" />
            </svg>
              <input
                type="text"
                value={categoryText}
                onChange={(e) => setCategoryText(e.target.value)}
                placeholder="e.g. Food 500, Rent 2000, Gas 100..."
                className="flex-1 min-w-0 bg-transparent text-sm text-token-primary placeholder:text-token-muted focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
            </div>
            <Button
              type="button"
              size="md"
              onClick={handleGenerate}
              isLoading={parsing}
              disabled={!categoryText.trim()}
              className="shrink-0 h-11 rounded-full bg-token-accent hover:bg-[var(--accent-hover)] text-white px-5"
            >
              Generate
            </Button>
          </div>

          {parsedCategories.length > 0 && (
            <div className="mt-3 pt-3 sm:pt-4 border-t border-token space-y-2 sm:space-y-3">
              <p className="text-xs font-medium text-token-secondary">Review & save</p>
              <div className="flex items-center justify-between gap-2 rounded-xl bg-teal-50 px-3 py-2">
                <span className="text-xs text-[var(--blueGray-800)]">
                  Total from categories: {formatCurrency(parsedCategories.reduce((s, i) => s + i.limit, 0), currency)}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    const total = parsedCategories.reduce((s, i) => s + Number(i.limit), 0);
                    if (total <= 0) return;
                    try {
                      await api.setBudget({ month, year, total_limit: total });
                      toast.success('Monthly limit set from categories');
                      await loadBudgets();
                    } catch (e: any) {
                      toast.error(e?.response?.data?.message || 'Failed');
                    }
                  }}
                  className="text-xs font-semibold text-token-accent hover:text-[var(--accent-hover)]"
                >
                  Set as monthly limit
                </button>
              </div>
              <div className="space-y-2">
                {parsedCategories.map((item, idx) => (
                  <div key={`${item.category}-${idx}`} className="flex items-center gap-2">
                    <input
                      value={item.category}
                      onChange={(e) =>
                        setParsedCategories((prev) =>
                          prev.map((p, i) => (i === idx ? { ...p, category: e.target.value } : p))
                        )
                      }
                      className="flex-1 rounded-lg border border-token px-3 py-2 text-sm text-token-primary"
                    />
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.limit}
                      onChange={(e) =>
                        setParsedCategories((prev) =>
                          prev.map((p, i) => (i === idx ? { ...p, limit: Number(e.target.value) } : p))
                        )
                      }
                      className="w-24 rounded-lg border border-token px-3 py-2 text-sm text-right text-token-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setParsedCategories((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-token-muted hover:text-token-error p-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <Button type="button" size="sm" onClick={handleSaveCategoryBudgets} className="w-full">
                Save category budgets
              </Button>
            </div>
          )}
        </div>

        {/* Zone D: Breakdown (Category List) */}
        {categoryBudgets.length > 0 && (
          <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
            <h2 className="text-base font-semibold text-token-primary">Breakdown</h2>
            <div className="space-y-3">
              {categoryBudgets.map((b) => {
                const pct = b.limit > 0 ? Math.min(100, Math.round((b.spent / b.limit) * 100)) : 0;
                const barColor = getProgressColor(pct);
                const isExpanded = expandedCategory === b.category;

                return (
                  <div
                    key={`${b.year}-${b.month}-${b.category}`}
                    className={`rounded-3xl bg-token-card p-3 sm:p-4 shadow-sm ${getProgressBgColor(pct)} border border-transparent`}
                  >
                    <button
                      type="button"
                      onClick={() => handleCategoryClick(b.category)}
                      className="w-full text-left flex items-center gap-3"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-token-card/80 text-xl shadow-sm">
                        {getCategoryEmoji(b.category)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-token-primary">{b.category}</p>
                        <p className="text-xs font-medium text-token-secondary">
                          {formatCurrency(b.spent, currency)} / {formatCurrency(b.limit, currency)}
                        </p>
                      </div>
                      <svg
                        className={`h-5 w-5 text-token-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="mt-2 h-1.5 rounded-full bg-token-card/60 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-token">
                        {loadingExpenses ? (
                          <div className="py-4 text-center text-sm text-token-secondary">Loading...</div>
                        ) : categoryExpenses.length === 0 ? (
                          <p className="text-sm text-token-secondary">No transactions this month</p>
                        ) : (
                          <ul className="space-y-2">
                            {categoryExpenses.map((e) => (
                              <li
                                key={e.id}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-token-secondary truncate pr-2">{e.description}</span>
                                <span className="font-medium text-token-primary shrink-0">
                                  {formatCurrency(e.amount, e.currency)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Past budgets - compact */}
        {history.length > 0 && (
          <div className="mt-8 rounded-3xl bg-token-card p-4 sm:p-6 shadow-sm">
            <h2 className="text-base font-semibold text-token-primary mb-3">Past months</h2>
            <div className="space-y-2">
              {history.slice(0, 6).map((b) => {
                const label = new Date(b.year, b.month - 1, 1).toLocaleString('en-US', {
                  month: 'short',
                  year: 'numeric',
                });
                const isSelected = b.month === month && b.year === year;
                return (
                  <button
                    key={b.id || `${b.year}-${b.month}`}
                    type="button"
                    onClick={() => {
                      setMonth(b.month);
                      setYear(b.year);
                      setDatePickerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-left transition-colors ${
                      isSelected ? 'bg-teal-50' : 'hover:bg-[var(--blueGray-100)]'
                    }`}
                  >
                    <span className="text-sm font-medium text-token-primary">
                      {label} {isSelected && '(viewing)'}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        b.total_spent <= b.total_limit ? 'text-token-accent' : 'text-token-error'
                      }`}
                    >
                      {b.percentage}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Date Picker Bottom Sheet */}
        <BottomSheet
          isOpen={datePickerOpen}
          onClose={() => setDatePickerOpen(false)}
          title="Select month"
        >
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {monthYearOptions.map(({ month: m, year: y }) => {
              const label = new Date(y, m - 1, 1).toLocaleString('en-US', {
                month: 'long',
                year: 'numeric',
              });
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
                  className={`w-full text-left py-3 px-4 rounded-xl text-base font-medium ${
                    isSelected ? 'bg-teal-50 text-[var(--accent-primary)]' : 'text-token-primary hover:bg-[var(--blueGray-100)]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </BottomSheet>

        {/* Edit Limit Modal */}
        <Modal
          isOpen={editLimitOpen}
          onClose={() => setEditLimitOpen(false)}
          title="Edit total budget"
          footer={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEditLimitOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveLimit} isLoading={isSaving}>
                Save
              </Button>
            </div>
          }
        >
          <div>
            <label className="block text-sm font-medium text-token-secondary mb-2">Total monthly limit</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-lg border border-token px-4 py-2 text-sm text-token-primary focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
            />
            <p className="mt-2 text-xs text-token-muted">
              {dateLabel} · Your currency: {currency}
            </p>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
