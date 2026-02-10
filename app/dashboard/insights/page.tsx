'use client';

import { useEffect, useState } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Insight, CategorySummary } from '@/types';
import { formatCurrency, formatDate, getCategoryChartColor } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function InsightsPage() {
  const { isAuthenticated, isLoading: authLoading } = useProtectedRoute();

  const [insights, setInsights] = useState<Insight[]>([]);
  const [summary, setSummary] = useState<CategorySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

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
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to generate insights';
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Prepare chart data
  const pieChartData = summary
    ? Object.entries(summary.byCategory).map(([category, amount]) => ({
        name: category,
        value: amount,
        percentage: summary.percentages[category],
      }))
    : [];

  const barChartData = summary
    ? Object.entries(summary.byCategory)
        .map(([category, amount]) => ({
          category,
          amount,
        }))
        .sort((a, b) => b.amount - a.amount)
    : [];

  if (authLoading || !isAuthenticated) {
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Insights</h1>
            <p className="mt-2 text-gray-600">AI-powered spending analysis and trends</p>
          </div>
          <Button onClick={handleGenerateInsights} isLoading={isGenerating}>
            Generate New Insights
          </Button>
        </div>

        {/* Charts Row */}
        {summary && summary.transactionCount > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Spending Distribution</CardTitle>
                <CardDescription>Breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.name}: ${entry.percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getCategoryChartColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number | undefined) => 
                        value ? formatCurrency(value, summary.currency) : ''
                      }
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Category Spending</CardTitle>
                <CardDescription>Amount spent per category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number | undefined) => 
                        value ? formatCurrency(value, summary.currency) : ''
                      }
                    />
                    <Bar dataKey="amount" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Summary Stats */}
        {summary && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.totalSpent, summary.currency)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {summary.transactionCount}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <p className="text-sm font-medium text-gray-600">Top Category</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {summary.topCategories[0] || 'N/A'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {Object.keys(summary.byCategory).length}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Insights</CardTitle>
            <CardDescription>
              {insights.length > 0
                ? 'Personalized analysis of your spending patterns'
                : 'Generate insights to get personalized spending analysis'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="text-gray-600">Loading insights...</p>
              </div>
            ) : insights.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mb-4 text-6xl">💡</div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  No insights yet
                </h3>
                <p className="mb-6 text-gray-600">
                  Generate insights to get AI-powered analysis of your spending
                </p>
                <Button onClick={handleGenerateInsights} isLoading={isGenerating}>
                  Generate Insights
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                        {insight.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(insight.createdAt)}
                      </span>
                    </div>
                    <p className="text-base text-gray-800">{insight.content}</p>
                    
                    {insight.metadata?.summary && (
                      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-blue-200 pt-4 sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-gray-600">Total Spent</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(
                              insight.metadata.summary.totalSpent,
                              insight.metadata.summary.currency
                            )}
                          </p>
                        </div>
                        {insight.metadata.expenseCount && (
                          <div>
                            <p className="text-xs text-gray-600">Expenses</p>
                            <p className="font-semibold text-gray-900">
                              {insight.metadata.expenseCount}
                            </p>
                          </div>
                        )}
                        {insight.metadata.summary.topCategories?.[0] && (
                          <div>
                            <p className="text-xs text-gray-600">Top Category</p>
                            <p className="font-semibold text-gray-900">
                              {insight.metadata.summary.topCategories[0]}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
