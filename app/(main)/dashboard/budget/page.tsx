'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const BackIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const GaugeIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 13V8m0 0a9 9 0 019 9h-3a6 6 0 10-12 0H3a9 9 0 019-9z" />
  </svg>
);

export default function BudgetPage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const router = useRouter();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [amount, setAmount] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

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
        router.push('/dashboard');
      } else {
        toast.error(res.message || 'Failed to save budget');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save budget');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !isAuthenticated) {
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
        <div className="px-4 pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <BackIcon />
            <span className="text-base font-medium">Back</span>
          </Link>
        </div>

        <div className="relative z-10 mx-4 mt-4 rounded-3xl bg-white px-6 py-8 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
              <GaugeIcon />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Monthly Budget</h1>
            <p className="mt-1 text-sm text-gray-500 text-center">
              Set a simple monthly spending limit for this account. We&apos;ll track your progress on the dashboard.
            </p>
          </div>
        </div>

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

            <Button type="submit" className="w-full" size="lg" isLoading={isSaving}>
              Save Budget
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

