'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { CurrencySearchPanel } from '@/components/currency/CurrencySearchPanel';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { CURRENCY_DISPLAY_HINT, findCurrency } from '@/lib/currencies';
import { cn, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

const PREVIEW_AMOUNT = 12450.75;

export default function CurrenciesPage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const savedCode = user?.currency || 'USD';
  const [selectedCurrency, setSelectedCurrency] = useState(savedCode);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedCurrency(savedCode);
  }, [savedCode]);

  const hasChanges = selectedCurrency !== savedCode;
  const selected = useMemo(() => findCurrency(selectedCurrency) ?? findCurrency('USD')!, [selectedCurrency]);
  const preview = formatCurrency(PREVIEW_AMOUNT, selected.code);

  const handleSave = async () => {
    if (!hasChanges || !user) return;

    setIsSaving(true);
    try {
      const res = await api.updateProfile({ currency: selectedCurrency });
      if (res.success && res.data?.user) {
        setUser({ ...user, ...res.data.user });
        toast.success(`Currency updated — amounts now display in ${selectedCurrency}`);
        router.push('/dashboard/profile');
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent-primary)] border-r-transparent" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg space-y-3 pb-8 pt-1">
        <div className="min-w-0">
          <h1 className="text-base font-semibold leading-tight text-token-primary">Currency</h1>
          <p className="mt-0.5 text-xs text-token-muted">ISO 4217 — how amounts appear on your dashboard</p>
        </div>

        <div
          className={cn(
            'rounded-2xl border p-4 transition-colors',
            hasChanges ? 'border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/5' : 'border-token bg-token-card'
          )}
        >
          <p className="text-xs font-medium text-token-muted">Display currency</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-[var(--background-primary)] text-[28px]">
              {selected.flag}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-token-primary">{selected.code}</p>
              <p className="truncate text-xs text-token-secondary">{selected.name}</p>
            </div>
            <span className="rounded-full border border-token bg-[var(--background-primary)] px-3 py-1 text-sm font-medium text-token-secondary">
              {selected.symbol}
            </span>
          </div>
          <p className="mt-3 text-[1.75rem] font-semibold tabular-nums tracking-tight text-token-primary">{preview}</p>
          <p className="mt-0.5 text-xs text-token-muted">Example formatting</p>
          {hasChanges ? (
            <p className="mt-2 text-xs font-medium text-token-accent">Save to apply this currency</p>
          ) : null}
        </div>

        <CurrencySearchPanel selectedCode={selectedCurrency} onSelect={setSelectedCurrency} />

        <p className="px-1 text-xs leading-relaxed text-token-muted">{CURRENCY_DISPLAY_HINT}</p>

        <Button type="button" onClick={handleSave} className="w-full" size="lg" isLoading={isSaving} disabled={!hasChanges}>
          {hasChanges ? 'Save currency' : 'Saved'}
        </Button>
      </div>
    </DashboardLayout>
  );
}
