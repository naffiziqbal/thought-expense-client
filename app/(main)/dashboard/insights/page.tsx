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
import type { Insight, CategorySummary } from '@/types';
import { formatCurrency, formatDate, getCategoryChartColor } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const TOP_N = 4; // Top 3 categories + "Others"
const DEFAULT_CATEGORIES_VISIBLE = 5;

function getInsightCardStyle(type: string): { bg: string; border: string; tag: string; iconColor: string } {
  const lower = type.toLowerCase();
  if (lower.includes('warning') || lower.includes('attention') || lower.includes('high')) {
    return {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      tag: 'bg-orange-100 text-orange-800',
      iconColor: 'text-orange-600',
    };
  }
  return {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    tag: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600',
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

  const dateRange = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
  }, []);

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
      const response = await api.getCategorySummary();
      if (response.success) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    fetchInsights();
    fetchSummary();
  }, [isAuthenticated, authLoading]);

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
        _children: others,
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
      <div className="space-y-6 pb-4">
        {/* A. Header Section */}
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Spending Analysis</h1>
              <p className="mt-1 text-sm text-gray-500">{dateRange}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerateInsights}
              isLoading={isGenerating}
              className="text-teal-600"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* B. Big Picture Card - Donut Chart */}
        {summary && summary.transactionCount > 0 && (
          <div className="rounded-3xl bg-white p-5 shadow-sm">
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
                    <span className="text-lg font-bold text-gray-900">
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
                        <span className="truncate text-gray-700">{entry.name}</span>
                        <span className="ml-auto shrink-0 text-gray-500">{entry.percentage}%</span>
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
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-gray-900">Top Spending Categories</h3>
            <div className="space-y-4">
              {visibleBarData.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-medium text-gray-900">{item.category}</span>
                    <span className="shrink-0 text-sm font-semibold text-gray-900">
                      {formatCurrency(item.amount, summary.currency)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${maxAmount ? (item.amount / maxAmount) * 100 : 0}%`,
                        backgroundColor: getCategoryChartColor(item.category),
                      }}
                    />
                  </div>
                </div>
              ))}
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

        {/* D. Daily & Weekly Insights - Premium Locked (Free users only) */}
        {!isPremium && (
          <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Daily & Weekly Insights</h3>
            <p className="text-sm text-gray-600 mb-4">Get granular spending patterns with daily and weekly AI analysis on Premium.</p>
            <Link
              href="/dashboard/premium"
              className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-500 transition-colors"
            >
              Upgrade to Premium
            </Link>
          </div>
        )}

        {/* E. AI Observations - Smart Cards */}
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-gray-900">AI Observations</h3>
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent" />
              <p className="text-gray-600">Loading insights...</p>
            </div>
          ) : insights.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-4 text-5xl">💡</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No insights yet</h3>
              <p className="mb-6 text-sm text-gray-600">
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
                    <p className="line-clamp-3 text-sm font-medium text-gray-900">{insight.content}</p>
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
                className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
              >
                <span className="font-medium text-gray-900">{item.name}</span>
                <span className="text-sm text-gray-600">
                  {formatCurrency(item.value, summary.currency)} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No other categories</p>
        )}
      </BottomSheet>
    </DashboardLayout>
  );
}
