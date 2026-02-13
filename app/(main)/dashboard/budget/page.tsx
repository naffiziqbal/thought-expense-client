'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { BudgetSummary, CategoryBudgetProgress } from '@/types';
import { formatCurrency } from '@/lib/utils';

const GaugeIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 13V8m0 0a9 9 0 019 9h-3a6 6 0 10-12 0H3a9 9 0 019-9z" />
  </svg>
);

export default function BudgetPage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();

  const initialNow = new Date();
  const [month, setMonth] = useState(initialNow.getMonth() + 1);
  const [year, setYear] = useState(initialNow.getFullYear());
  const [amount, setAmount] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [loadingBudgets, setLoadingBudgets] = useState(true);
  const [currentBudget, setCurrentBudget] = useState<BudgetSummary | null>(null);
  const [history, setHistory] = useState<BudgetSummary[]>([]);
  const [categoryText, setCategoryText] = useState('');
  const [parsedCategories, setParsedCategories] = useState<{ category: string; limit: number }[]>([]);
  const [parsing, setParsing] = useState(false);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudgetProgress[]>([]);

  const loadBudgets = async () => {
    try {
      const [currentRes, historyRes] = await Promise.all([
        api.getCurrentBudget(),
        api.getBudgetHistory(6),
      ]);

      if (currentRes.success) {
        setCurrentBudget(currentRes.data);
      }
      if (historyRes.success) {
        setHistory(historyRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load budgets', err);
    } finally {
      setLoadingBudgets(false);
    }
  };

  const loadCategoryBudgets = async () => {
    try {
      const res = await api.getCurrentCategoryBudgets();
      if (res.success) setCategoryBudgets(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    loadBudgets();
    loadCategoryBudgets();
  }, [isAuthenticated, isLoading]);

  // When current budget loads, prefill form
  useEffect(() => {
    if (currentBudget) {
      setMonth(currentBudget.month);
      setYear(currentBudget.year);
      setAmount(String(currentBudget.total_limit));
      if (currentBudget.percentage >= 100) {
        toast.error('You have exceeded your monthly budget.');
      } else if (currentBudget.percentage >= 90) {
        toast('You are close to exceeding your monthly budget.', {
          icon: '⚠️',
        });
      }
    } else {
      setAmount('');
      const now = new Date();
      setMonth(now.getMonth() + 1);
      setYear(now.getFullYear());
    }
  }, [currentBudget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.setBudget({ month, year, total_limit: value });
      if (res.success) {
        toast.success('Monthly budget saved');
        await loadBudgets();
      } else {
        toast.error(res.message || 'Failed to save budget');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save budget');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCurrent = async () => {
    if (!currentBudget?.id) return;
    try {
      await api.deleteBudget(currentBudget.id);
      toast.success('Budget removed');
      setCurrentBudget(null);
      await loadBudgets();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete budget');
    }
  };

  if (isLoading || !isAuthenticated || loadingBudgets) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 pb-8">
        {/* Current budget summary */}
        <div className="relative z-10 mx-4 pt-6 rounded-3xl bg-white px-6 py-8 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <GaugeIcon />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Monthly Budget</h1>
                <p className="mt-0.5 text-xs text-gray-500">
                  {currentBudget
                    ? `Tracking your budget for ${new Date(currentBudget.year, currentBudget.month - 1, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' })}.`
                    : 'Set a simple monthly spending limit. We’ll track your progress on the dashboard.'}
                </p>
              </div>
            </div>
            {currentBudget && (
              <div className="mt-2 rounded-2xl bg-amber-50 px-4 py-3">
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(currentBudget.total_spent)} spent
                  </p>
                  <p className="text-xs text-gray-600">
                    of {formatCurrency(currentBudget.total_limit)}
                  </p>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/60 overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full ${
                      currentBudget.percentage < 70
                        ? 'bg-emerald-500'
                        : currentBudget.percentage < 90
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(currentBudget.percentage, 120)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-600">
                    {currentBudget.percentage.toFixed(0)}% used
                  </span>
                  <span className={`text-xs font-medium ${currentBudget.remaining >= 0 ? 'text-gray-700' : 'text-red-600'}`}>
                    {currentBudget.remaining >= 0 ? 'Remaining' : 'Over'}{' '}
                    {formatCurrency(Math.abs(currentBudget.remaining))}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit/create form */}
        <div className="mx-4 mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const m = idx + 1;
                    const label = new Date(2000, idx, 1).toLocaleString('en-US', { month: 'short' });
                    return (
                      <option key={m} value={m}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  min={2000}
                  max={2100}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Total monthly limit</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount in your base currency"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" className="flex-1" size="lg" isLoading={isSaving}>
                {currentBudget ? 'Update Budget' : 'Save Budget'}
              </Button>
              {currentBudget && (
                <button
                  type="button"
                  onClick={handleDeleteCurrent}
                  className="text-xs font-medium text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          </form>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mx-4 mt-4 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Past budgets</h2>
            <div className="space-y-2">
              {history.map((b) => {
                const label = new Date(b.year, b.month - 1, 1).toLocaleString('en-US', {
                  month: 'short',
                  year: 'numeric',
                });
                const isCurrent =
                  currentBudget && currentBudget.month === b.month && currentBudget.year === b.year;
                const underBudget = b.total_spent <= b.total_limit;
                return (
                  <div
                    key={b.id || `${b.year}-${b.month}`}
                    className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {label} {isCurrent && <span className="text-xs text-teal-600">(current)</span>}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(b.total_spent)} / {formatCurrency(b.total_limit)} (
                        {b.percentage.toFixed(0)}%)
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        underBudget
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {underBudget ? 'Within budget' : 'Over budget'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Category budgets input */}
        <div className="mx-4 mt-4 rounded-2xl bg-white p-6 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-gray-900">Category budgets (AI powered)</p>
          <p className="text-xs text-gray-500">
            Example: <span className="font-mono">Health 5000, Medical 10000, Groceries 4000</span>
          </p>
          <textarea
            value={categoryText}
            onChange={(e) => setCategoryText(e.target.value)}
            rows={2}
            placeholder="Type your category budgets in plain language"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <Button
            type="button"
            size="sm"
            isLoading={parsing}
            disabled={!categoryText.trim()}
            onClick={async () => {
              setParsing(true);
              try {
                const res = await api.parseCategoryBudgets(categoryText, month, year);
                if (res.success && res.data?.items?.length) {
                  setParsedCategories(res.data.items);
                  toast.success('Parsed category budgets');
                } else {
                  toast.error('Could not parse any category budgets');
                }
              } catch (e: any) {
                toast.error(e?.response?.data?.message || 'Failed to parse budgets');
              } finally {
                setParsing(false);
              }
            }}
          >
            Parse budgets
          </Button>

          {parsedCategories.length > 0 && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const cleaned = parsedCategories
                    .map((i) => ({ ...i, limit: Number(i.limit) }))
                    .filter((i) => i.category && i.limit > 0);
                  if (!cleaned.length) {
                    toast.error('No valid budgets to save');
                    return;
                  }
                  const res = await api.upsertCategoryBudgets({ month, year, items: cleaned });
                  if (res.success) {
                    toast.success('Category budgets saved');
                    setCategoryText('');
                    setParsedCategories([]);
                    await loadCategoryBudgets();
                  } else {
                    toast.error(res.message || 'Failed to save budgets');
                  }
                } catch (err: any) {
                  toast.error(err?.response?.data?.message || 'Failed to save budgets');
                }
              }}
              className="mt-3 space-y-3 border-t border-gray-100 pt-3"
            >
              <p className="text-xs font-medium text-gray-700">Review & adjust</p>
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
                      className="flex-1 rounded-lg border border-gray-200 px-2 py-1 text-xs"
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
                      className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-xs text-right"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setParsedCategories((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <Button type="submit" size="sm" className="w-full">
                Save category budgets
              </Button>
            </form>
          )}
        </div>

        {/* Current category budgets overview */}
        {categoryBudgets.length > 0 && (
          <div className="mx-4 mt-4 rounded-2xl bg-white p-6 shadow-sm space-y-2">
            <p className="text-sm font-semibold text-gray-900">This month&apos;s category budgets</p>
            <div className="space-y-2">
              {categoryBudgets.map((b) => {
                const under = b.spent <= b.limit;
                return (
                  <div
                    key={`${b.year}-${b.month}-${b.category}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2"
                  >
                    <div>
                      <p className="text-xs font-medium text-gray-900">{b.category}</p>
                      <p className="text-[11px] text-gray-500">
                        {formatCurrency(b.spent)} / {formatCurrency(b.limit)} ({b.percentage}%)
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        under ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {under ? 'Within budget' : 'Over budget'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

