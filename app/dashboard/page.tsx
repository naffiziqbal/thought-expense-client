'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { api } from '@/lib/api';
import { formatCurrency, formatDate, getCategoryColor, getCategoryBgColor } from '@/lib/utils';
import Link from 'next/link';
import type { CategorySummary, Expense } from '@/types';

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const { user } = useAuthStore();
  const router = useRouter();

  const [summary, setSummary] = useState<CategorySummary | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    const fetchData = async () => {
      try {
        const [summaryRes, expensesRes] = await Promise.all([
          api.getCategorySummary(),
          api.getExpenses({ limit: 5 }),
        ]);

        if (summaryRes.success) {
          setSummary(summaryRes.data);
        }

        if (expensesRes.success) {
          setRecentExpenses(expensesRes.data.expenses);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isLoading]);

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

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Food': '🍔',
      'Transport': '🚗',
      'Rent': '🏠',
      'Utilities': '💡',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Healthcare': '⚕️',
      'Education': '📚',
      'Personal Care': '💅',
      'Fees': '💳',
      'Other': '📌'
    };
    return icons[category] || '💰';
  };

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
          <Link 
            href="/dashboard/profile"
            className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold shadow-sm hover:shadow-md transition-all"
          >
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
          </Link>
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
              <h2 className="text-4xl md:text-5xl font-bold text-white">
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

          {/* Top Category Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-gray-500 mb-1">Top Category</p>
            <p className="text-2xl font-bold text-gray-900 truncate">
              {loading ? '...' : summary?.topCategories?.[0] || 'N/A'}
            </p>
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
              {recentExpenses.map((expense) => (
                <Link 
                  key={expense.id}
                  href="/dashboard/expenses"
                  className="block"
                >
                  <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.99]">
                    <div className="flex items-center gap-4">
                      {/* Icon Container (Avatar) - 48x48 squircle */}
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                        style={{ backgroundColor: getCategoryBgColor(expense.category) }}
                      >
                        {getCategoryIcon(expense.category)}
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
              ))}
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
      </div>
    </DashboardLayout>
  );
}
