'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { CURRENCIES } from '@/lib/currencies';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const GlobeIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0h.5a2.5 2.5 0 002.5-2.5V3.935M12 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default function CurrenciesPage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || 'USD');
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = selectedCurrency !== (user?.currency || 'USD');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges || !user) return;

    setIsSaving(true);
    try {
      const res = await api.updateProfile({ currency: selectedCurrency });
      if (res.success && res.data?.user) {
        setUser({ ...user, ...res.data.user });
        toast.success('Currency updated — all amounts will now display in ' + selectedCurrency);
        router.push('/dashboard');
      } else {
        toast.error('Failed to update currency. Please try again.');
      }
    } catch {
      toast.error('Failed to update currency. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-token-surface">
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
        {/* Header */}
        <div className="relative z-10 mt-6 rounded-3xl bg-token-card border border-token px-6 py-8 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
              <GlobeIcon />
            </div>
            <h1 className="text-xl font-bold text-token-primary">Currency</h1>
            <p className="mt-1 text-sm text-token-secondary">
              Choose your default currency for expenses
            </p>
          </div>
        </div>

        {/* Currency List */}
        <div className="mt-6 rounded-2xl bg-token-card border border-token shadow-sm overflow-hidden">
          <div className="divide-y divide-[var(--border-default)]">
            {CURRENCIES.map((currency) => (
              <button
                key={currency.value}
                type="button"
                onClick={() => setSelectedCurrency(currency.value)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-4 text-left transition-colors',
                  selectedCurrency === currency.value
                    ? 'bg-token-accent/10 text-token-accent'
                    : 'hover:bg-[var(--surface-hover)] active:bg-[var(--surface-hover)]'
                )}
              >
                <span className="font-medium text-token-primary">{currency.label}</span>
                {selectedCurrency === currency.value && (
                  <span className="shrink-0 rounded-full bg-token-accent p-1 text-white">
                    <CheckIcon />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6">
          <Button
            type="button"
            onClick={handleSave}
            className="w-full"
            size="lg"
            isLoading={isSaving}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
