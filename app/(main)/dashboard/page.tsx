'use client';

import { useEffect, useState, useRef } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { useIsPremium } from '@/hooks/useIsPremium';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getCategoryColor, getCategoryBgColor } from '@/lib/utils';
import { getCategoryIcon } from '@/lib/categoryIcons';
import Link from 'next/link';
import type { CategorySummary, Expense, Insight, BudgetSummary } from '@/types';
import { AdPlaceholder } from '@/components/landing/AdPlaceholder';

export default function DashboardPage() {
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

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    const fetchData = async () => {
      try {
        const [summaryRes, expensesRes, insightsRes, budgetRes] = await Promise.all([
          api.getCategorySummary(),
          api.getExpenses({ limit: 5 }),
          api.getInsights({ limit: 10 }),
          api.getCurrentBudget(),
        ]);

        if (summaryRes.success) {
          setSummary(summaryRes.data);
        }

        if (expensesRes.success) {
          setRecentExpenses(expensesRes.data.expenses);
        }

        if (insightsRes.success) {
          setInsights(insightsRes.data.insights);
        }

        if (budgetRes.success) {
          setBudget(budgetRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isLoading]);

  // Fetch insights when notification popover opens
  const fetchInsights = async () => {
    setInsightsLoading(true);
    try {
      const response = await api.getInsights({ limit: 10 });
      if (response.success) {
        setInsights(response.data.insights);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleNotificationClick = () => {
    const willOpen = !notificationOpen;
    setNotificationOpen(willOpen);
    if (willOpen && insights.length === 0 && !insightsLoading) {
      fetchInsights();
    }
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };
    if (notificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationOpen]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Modern Hierarchical Layout - Spatial Model */}
      <div className="space-y-8">
        {/* A. Header (Context) - Two Column Flexbox */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Welcome back,</p>
            <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'User'}</h1>
          </div>
          
          {/* Notification Icon with Popover */}
          <div className="relative" ref={popoverRef}>
            <button
              onClick={handleNotificationClick}
              className="relative w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-sm hover:shadow-md hover:bg-teal-500 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {insights.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {insights.length > 9 ? '9+' : insights.length}
                </span>
              )}
            </button>

            {/* Popover */}
            {notificationOpen && (
              <div className="absolute right-0 top-full mt-2 w-[min(calc(100vw-2rem),384px)] rounded-2xl bg-white shadow-xl border border-gray-200 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">AI Insights</h3>
                  <p className="text-xs text-gray-500">Your spending analysis</p>
                </div>
                <div className="max-h-[min(60vh,320px)] overflow-y-auto">
                  {insightsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 animate-spin rounded-full border-2 border-teal-600 border-r-transparent"></div>
                    </div>
                  ) : insights.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <p className="text-sm text-gray-500">No insights yet</p>
                      <p className="text-xs text-gray-400 mt-1">Add expenses to generate AI insights</p>
                      <Link 
                        href="/dashboard/insights" 
                        onClick={() => setNotificationOpen(false)}
                        className="mt-3 inline-block text-sm font-semibold text-teal-600 hover:text-teal-700"
                      >
                        Go to Insights
                      </Link>
                    </div>
                  ) : (
                    <div className="p-2 space-y-2">
                      {insights.map((insight) => (
                        <div
                          key={insight.id}
                          className="p-3 rounded-xl bg-teal-50/50 hover:bg-teal-50 transition-colors"
                        >
                          <p className="text-sm text-gray-800">{insight.content}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(insight.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                  <Link href="/dashboard/insights" onClick={() => setNotificationOpen(false)}>
                    <span className="text-sm font-semibold text-teal-600 hover:text-teal-700">View all insights</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* B. Hero Card (Total Balance Anchor) - Credit Card Metaphor */}
        <div className="relative aspect-[1.58/1] max-w-full overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 to-teal-700 p-6 shadow-2xl">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
          
          {/* Content */}
          <div className="relative h-full flex flex-col justify-between">
            <div>
              <p className="text-teal-100 text-sm font-medium mb-2">Total Spent</p>
              <h2 className="text-4xl font-bold text-white">
                {loading ? '...' : formatCurrency(summary?.totalSpent || 0, summary?.currency)}
              </h2>
            </div>
            
            {/* Trend Indicator */}
            <div className="flex items-center space-x-2">
              <div className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-sm font-semibold text-white">
                  {summary?.transactionCount || 0} transactions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* C. Secondary Metrics (At-a-Glance Row) - 2 Column Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Transactions Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-gray-500 mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '...' : summary?.transactionCount || 0}
            </p>
          </div>

          {/* Budget Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-gray-500 mb-2">Monthly Budget</p>
            {budget ? (
              <>
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(budget.total_spent, summary?.currency || user?.currency || 'USD')} spent
                  </p>
                  <p className="text-xs text-gray-500">
                    of {formatCurrency(budget.total_limit, summary?.currency || user?.currency || 'USD')}
                  </p>
                </div>
                <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full ${
                      budget.percentage < 70
                        ? 'bg-emerald-500'
                        : budget.percentage < 90
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(budget.percentage, 120)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {budget.percentage.toFixed(0)}% used
                  </span>
                  <span className={`text-xs font-medium ${budget.remaining >= 0 ? 'text-gray-700' : 'text-red-600'}`}>
                    {budget.remaining >= 0 ? 'Remaining' : 'Over'}{' '}
                    {formatCurrency(Math.abs(budget.remaining), summary?.currency || user?.currency || 'USD')}
                  </span>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">No budget set for this month.</p>
                <Link
                  href="/dashboard/budget"
                  className="inline-flex items-center text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  Set monthly budget
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* D. Transaction List (Core Feature) */}
        {recentExpenses.length > 0 && (
          <div>
            {/* List Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Recent Expenses</h3>
              <Link 
                href="/dashboard/expenses"
                className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
              >
                View All
              </Link>
            </div>

            {/* Transaction Tiles - Flat on Background */}
            <div className="space-y-3">
              {recentExpenses.map((expense) => {
                const CategoryIcon = getCategoryIcon(expense.category);
                return (
                <Link 
                  key={expense.id}
                  href="/dashboard/expenses"
                  className="block"
                >
                  <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.99]">
                    <div className="flex items-center gap-4">
                      {/* Icon Container (Avatar) - 48x48 squircle */}
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-700 shrink-0"
                        style={{ backgroundColor: getCategoryBgColor(expense.category) }}
                      >
                        <CategoryIcon className="w-6 h-6 shrink-0" aria-hidden />
                      </div>

                      {/* Metadata (Middle) */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{expense.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
                      </div>

                      {/* Amount (Right) */}
                      <div className="text-right shrink-0">
                        <p className="font-bold text-gray-900">
                          -{formatCurrency(expense.amount, expense.currency)}
                        </p>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && summary?.transactionCount === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="mb-4 text-6xl">📝</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              No expenses yet
            </h3>
            <p className="mb-6 text-gray-600">
              Start tracking your expenses by adding your first entry
            </p>
            <Link href="/dashboard/add">
              <button className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold shadow-sm transition-all duration-200">
                Add Your First Expense
              </button>
            </Link>
          </div>
        )}

        {/* Ad placeholder - Free users only */}
        {!isPremium && !loading && (
          <div>
            <AdPlaceholder />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
