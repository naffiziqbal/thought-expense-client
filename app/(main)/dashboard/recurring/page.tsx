'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { api } from '@/lib/api';
import { getCategoryIcon } from '@/lib/categoryIcons';
import {
  RECURRING_PAGE_HINT,
  describeRecurringSchedule,
  formatRecurringNextRun,
  normalizeRecurringDescription,
  summarizeRecurringRules,
} from '@/lib/recurringDashboard';
import { formatCurrency, getCategoryChartColor } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import type { RecurringExpenseItem, RecurringFrequency, RecurringRule } from '@/types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface DraftState {
  description: string;
  amount: string;
  category: string;
  currency: string;
  frequency: RecurringFrequency;
  dayOfMonth: number;
  dayOfWeek: number;
}

export default function RecurringPage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const { user } = useAuthStore();
  const fallbackCurrency = user?.currency || 'USD';

  const [rules, setRules] = useState<RecurringRule[]>([]);
  const [detected, setDetected] = useState<RecurringExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const load = useCallback(async () => {
    try {
      const [rulesRes, detectedRes] = await Promise.all([
        api.getRecurringRules(),
        api.getRecurringExpenses().catch(() => null),
      ]);
      if (rulesRes.success) setRules(rulesRes.data.rules);
      if (detectedRes?.success) setDetected(detectedRes.data.recurring);
    } catch {
      toast.error('Could not load recurring expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    void load();
  }, [isAuthenticated, isLoading, load]);

  const suggestions = useMemo(() => {
    const automated = new Set(rules.map((r) => normalizeRecurringDescription(r.description)));
    return detected.filter((d) => !automated.has(normalizeRecurringDescription(d.description)));
  }, [detected, rules]);

  const summary = useMemo(() => summarizeRecurringRules(rules), [rules]);

  const openDraft = (item: RecurringExpenseItem) => {
    const lastDate = new Date(item.lastDate);
    const day = Number.isNaN(lastDate.getTime()) ? 1 : lastDate.getDate();
    setDraft({
      description: item.description,
      amount: String(item.averageAmount),
      category: item.category,
      currency: item.currency || fallbackCurrency,
      frequency: 'monthly',
      dayOfMonth: Math.min(day, 28),
      dayOfWeek: Number.isNaN(lastDate.getTime()) ? 1 : lastDate.getDay(),
    });
  };

  const saveDraft = async () => {
    if (!draft) return;
    const amount = parseFloat(draft.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    setIsSavingDraft(true);
    try {
      const res = await api.createRecurringRule({
        description: draft.description,
        amount,
        currency: draft.currency,
        category: draft.category,
        frequency: draft.frequency,
        ...(draft.frequency === 'monthly'
          ? { dayOfMonth: draft.dayOfMonth }
          : { dayOfWeek: draft.dayOfWeek }),
      });
      if (res.success) {
        setRules((prev) => [...prev, res.data.rule]);
        setDraft(null);
        toast.success('Will be logged automatically');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Could not save recurring expense');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const togglePaused = async (rule: RecurringRule) => {
    setBusyId(rule.id);
    try {
      const res = await api.updateRecurringRule(rule.id, { isActive: !rule.isActive });
      if (res.success) setRules((prev) => prev.map((r) => (r.id === rule.id ? res.data.rule : r)));
    } catch {
      toast.error('Could not update');
    } finally {
      setBusyId(null);
    }
  };

  const logNow = async (rule: RecurringRule) => {
    setBusyId(rule.id);
    try {
      const res = await api.runRecurringRule(rule.id);
      if (res.success) {
        toast.success('Logged');
        await load();
      }
    } catch {
      toast.error('Could not log expense');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (rule: RecurringRule) => {
    setBusyId(rule.id);
    try {
      await api.deleteRecurringRule(rule.id);
      setRules((prev) => prev.filter((r) => r.id !== rule.id));
      toast.success('Removed');
    } catch {
      toast.error('Could not remove');
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-token-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent-primary)] border-r-transparent" />
      </div>
    );
  }

  const renderRule = (rule: RecurringRule, showBorder: boolean) => {
    const CategoryIcon = getCategoryIcon(rule.category);
    return (
      <div key={rule.id} className={`px-3 py-3 ${showBorder ? 'border-b border-token' : ''}`}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--chart-track)]"
            aria-hidden
          >
            <CategoryIcon className="h-5 w-5" style={{ color: getCategoryChartColor(rule.category) }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-token-primary">{rule.description}</p>
            <p className="mt-0.5 text-xs text-token-muted">
              {describeRecurringSchedule(rule)}
              {rule.isActive ? ` · next ${formatRecurringNextRun(rule.nextRunAt)}` : ' · paused'}
            </p>
          </div>
          <p className="shrink-0 text-sm font-semibold tabular-nums text-token-primary">
            {formatCurrency(rule.amount, rule.currency)}
          </p>
        </div>

        <div className="mt-3 flex items-center gap-3 border-t border-token pt-3">
          <label className="flex flex-1 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={rule.isActive}
              disabled={busyId === rule.id}
              onChange={() => togglePaused(rule)}
              className="h-4 w-4 accent-[var(--accent-primary)]"
            />
            <span className="text-xs text-token-secondary">{rule.isActive ? 'Active' : 'Paused'}</span>
          </label>
          <Button variant="outline" size="sm" disabled={busyId === rule.id} onClick={() => logNow(rule)}>
            Log now
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={busyId === rule.id}
            onClick={() => remove(rule)}
            className="text-token-error"
          >
            Remove
          </Button>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg space-y-3 pb-8 pt-1">
        <div className="min-w-0">
          <h1 className="text-base font-semibold leading-tight text-token-primary">Recurring</h1>
          <p className="mt-0.5 text-xs leading-relaxed text-token-muted">{RECURRING_PAGE_HINT}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-r-transparent" />
          </div>
        ) : rules.length === 0 && suggestions.length === 0 ? (
          <div className="rounded-2xl border border-token bg-token-card px-6 py-8 text-center">
            <p className="text-sm font-medium text-token-primary">No recurring expenses yet</p>
            <p className="mt-1 text-xs leading-relaxed text-token-secondary">
              Log the same subscription or bill for a few months and we&apos;ll suggest automating it here.
            </p>
          </div>
        ) : (
          <>
            {summary.total > 0 ? (
              <div className="rounded-2xl border border-[var(--accent-primary)]/30 bg-token-card p-4">
                <p className="text-xs font-medium text-token-muted">Automated</p>
                <p className="mt-1 text-[1.75rem] font-semibold text-token-primary">
                  {summary.active.length}
                  <span className="text-base font-normal text-token-muted"> active</span>
                </p>
                {summary.next ? (
                  <p className="mt-1 truncate text-xs text-token-secondary">
                    Next: {summary.next.description} · {formatRecurringNextRun(summary.next.nextRunAt)}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-token-secondary">All rules paused</p>
                )}
              </div>
            ) : null}

            {rules.length > 0 ? (
              <div>
                <p className="mb-2 ml-1 text-xs font-medium text-token-muted">Your rules</p>
                <div className="overflow-hidden rounded-2xl border border-token bg-token-card">
                  {rules.map((rule, i) => renderRule(rule, i < rules.length - 1))}
                </div>
              </div>
            ) : null}

            {suggestions.length > 0 ? (
              <div>
                <p className="mb-2 ml-1 text-xs font-medium text-token-muted">Suggested from history</p>
                <div className="overflow-hidden rounded-2xl border border-token bg-token-card">
                  {suggestions.map((item, i) => {
                    const CategoryIcon = getCategoryIcon(item.category);
                    return (
                      <div
                        key={item.description}
                        className={`flex items-center gap-3 px-3 py-3 ${i < suggestions.length - 1 ? 'border-b border-token' : ''}`}
                      >
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--chart-track)]"
                          aria-hidden
                        >
                          <CategoryIcon className="h-4 w-4" style={{ color: getCategoryChartColor(item.category) }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-token-primary">{item.description}</p>
                          <p className="mt-0.5 text-xs text-token-muted">
                            {item.category} · {item.monthsSeen} mo · ~{formatCurrency(item.averageAmount, item.currency)}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openDraft(item)}>
                          Automate
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      <Modal
        isOpen={!!draft}
        onClose={() => setDraft(null)}
        title="Log this automatically"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button className="flex-1" isLoading={isSavingDraft} onClick={saveDraft}>
              Automate
            </Button>
          </div>
        }
      >
        {draft ? (
          <div className="space-y-4">
            <p className="text-sm text-token-secondary">
              We&apos;ll add &ldquo;{draft.description}&rdquo; for you on schedule. You can pause it any time.
            </p>

            <div>
              <label className="mb-1 block text-sm font-medium text-token-secondary">Amount</label>
              <input
                type="number"
                inputMode="decimal"
                value={draft.amount}
                onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                className="w-full rounded-lg border border-token bg-token-card px-3 py-2 text-token-primary focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-token-secondary">Repeats</label>
              <div className="flex gap-2">
                {(['monthly', 'weekly'] as RecurringFrequency[]).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setDraft({ ...draft, frequency: freq })}
                    className={
                      draft.frequency === freq
                        ? 'flex-1 rounded-lg bg-token-accent px-3 py-2 text-sm font-semibold text-white'
                        : 'flex-1 rounded-lg border border-token px-3 py-2 text-sm font-medium text-token-secondary'
                    }
                  >
                    {freq === 'monthly' ? 'Monthly' : 'Weekly'}
                  </button>
                ))}
              </div>
            </div>

            {draft.frequency === 'monthly' ? (
              <div>
                <label className="mb-1 block text-sm font-medium text-token-secondary">Day of month</label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={draft.dayOfMonth}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      dayOfMonth: Math.min(28, Math.max(1, parseInt(e.target.value, 10) || 1)),
                    })
                  }
                  className="w-full rounded-lg border border-token bg-token-card px-3 py-2 text-token-primary focus:border-[var(--accent-primary)] focus:outline-none"
                />
                <p className="mt-1 text-xs text-token-muted">Capped at 28 so it fires every month.</p>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-sm font-medium text-token-secondary">Day of week</label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((label, index) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setDraft({ ...draft, dayOfWeek: index })}
                      className={
                        draft.dayOfWeek === index
                          ? 'rounded-lg border-2 border-[var(--accent-primary)] px-3 py-1.5 text-xs font-medium text-token-accent'
                          : 'rounded-lg border border-token px-3 py-1.5 text-xs font-medium text-token-secondary'
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </DashboardLayout>
  );
}
