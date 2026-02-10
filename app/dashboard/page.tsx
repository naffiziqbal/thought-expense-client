'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import type { CategorySummary, Insight } from '@/types';

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const router = useRouter();

  const [summary, setSummary] = useState<CategorySummary | null>(null);
  const [recentInsights, setRecentInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    const fetchData = async () => {
      try {
        const [summaryRes, insightsRes] = await Promise.all([
          api.getCategorySummary(),
          api.getInsights({ limit: 3 }),
        ]);

        if (summaryRes.success) {
          setSummary(summaryRes.data);
        }

        if (insightsRes.success) {
          setRecentInsights(insightsRes.data.insights);
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview of your expense tracking</p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/add">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Add Expense</p>
                  <p className="mt-1 text-2xl font-bold text-blue-600">➕</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardContent>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {loading ? '...' : formatCurrency(summary?.totalSpent || 0, summary?.currency)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {loading ? '...' : summary?.transactionCount || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm font-medium text-gray-600">Top Category</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {loading ? '...' : summary?.topCategories?.[0] || 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Insights */}
        {recentInsights.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Insights</CardTitle>
                  <CardDescription>AI-powered spending analysis</CardDescription>
                </div>
                <Link href="/dashboard/insights">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className="rounded-lg border border-gray-200 bg-blue-50 p-4"
                  >
                    <p className="text-sm text-gray-800">{insight.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Categories */}
        {summary && summary.topCategories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Spending Categories</CardTitle>
              <CardDescription>Your highest expense categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.topCategories.slice(0, 5).map((category) => {
                  const amount = summary.byCategory[category];
                  const percentage = summary.percentages[category];
                  return (
                    <div key={category}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900">{category}</span>
                        <span className="text-gray-600">
                          {formatCurrency(amount, summary.currency)} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && summary?.transactionCount === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mb-4 text-6xl">📝</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                No expenses yet
              </h3>
              <p className="mb-6 text-gray-600">
                Start tracking your expenses by adding your first entry
              </p>
              <Link href="/dashboard/add">
                <Button variant="primary">Add Your First Expense</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
