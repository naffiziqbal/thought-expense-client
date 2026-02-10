'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Expense } from '@/types';
import { formatCurrency, getCategoryColor, getConfidenceBadgeColor } from '@/lib/utils';

export default function AddExpensePage() {
  const { isAuthenticated, isLoading: authLoading } = useProtectedRoute();
  const router = useRouter();

  const [rawInput, setRawInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedExpenses, setParsedExpenses] = useState<Expense[]>([]);
  const [needsReview, setNeedsReview] = useState<string[]>([]);

  const handleParse = async () => {
    if (!rawInput.trim()) {
      toast.error('Please enter some expenses');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.parseExpenses({ rawInput });

      if (response.success) {
        setParsedExpenses(response.data.expenses);
        setNeedsReview(response.data.needsReview);
        toast.success(response.message);
        
        // Clear input and navigate to expenses list after successful creation
        setTimeout(() => {
          setRawInput('');
          setParsedExpenses([]);
          setNeedsReview([]);
          toast.success(`${response.data.expenses.length} expense(s) added!`);
          router.push('/dashboard/expenses');
        }, 1500); // Small delay to show success message
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to parse expenses';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setRawInput('');
    setParsedExpenses([]);
    setNeedsReview([]);
  };

  const handleViewExpenses = () => {
    router.push('/dashboard/expenses');
  };

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Expenses</h1>
          <p className="mt-2 text-gray-600">
            Type your expenses naturally, and AI will handle the rest
          </p>
        </div>

        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle>Natural Language Input</CardTitle>
            <CardDescription>
              Type expenses like "coffee 5", "rent 1200", or "uber to work 15"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="rent 1200&#10;coffee 5&#10;uber to work 15&#10;groceries at walmart 85"
                rows={8}
                className="font-mono"
              />

              <div className="flex gap-3">
                <Button
                  onClick={handleParse}
                  isLoading={isLoading}
                  disabled={!rawInput.trim()}
                  className="flex-1 h-12 text-base font-semibold"
                >
                  Parse Expenses
                </Button>
                <Button 
                  onClick={handleClear} 
                  variant="outline" 
                  className="flex-1 h-12 text-base font-semibold"
                >
                  Clear
                </Button>
              </div>

              {/* Examples */}
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="mb-2 text-sm font-medium text-blue-900">
                  💡 Example formats:
                </p>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Simple: "coffee 5"</li>
                  <li>• Detailed: "bought groceries for 85 dollars"</li>
                  <li>• With context: "uber ride to airport was 45"</li>
                  <li>• Multiple lines: Enter each expense on a new line</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parsed Results */}
        {parsedExpenses.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Parsed Expenses</CardTitle>
                  <CardDescription>
                    {parsedExpenses.length} expense(s) successfully categorized
                  </CardDescription>
                </div>
                <Button onClick={handleViewExpenses} variant="outline" size="sm">
                  View All Expenses
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {parsedExpenses.map((expense) => {
                  const needsReviewFlag = needsReview.includes(expense.id);
                  return (
                    <div
                      key={expense.id}
                      className={`rounded-lg border p-4 ${
                        needsReviewFlag ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {expense.description}
                            </p>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(expense.category)}`}
                            >
                              {expense.category}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            {expense.rawInput}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(expense.amount, expense.currency)}
                          </p>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getConfidenceBadgeColor(expense.confidence)}`}
                          >
                            {Math.round(expense.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                      {needsReviewFlag && (
                        <div className="mt-2 flex items-center text-sm text-yellow-800">
                          <svg
                            className="mr-1 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          Low confidence - Please review in the expenses list
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm text-green-800">
                  ✅ All expenses have been saved! You can view and edit them in the expenses
                  list.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
