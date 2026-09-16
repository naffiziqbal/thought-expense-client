'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import type { RecurringExpenseItem, RecurringFrequency, RecurringRule } from '@/types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function describeSchedule(rule: RecurringRule): string {
  if (rule.frequency === 'weekly') return `Every ${WEEKDAYS[rule.dayOfWeek ?? 0]}`;
  return rule.dayOfMonth ? `Monthly on day ${rule.dayOfMonth}` : 'Monthly';
}

function formatNextRun(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

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

  // Hide suggestions the user has already automated.
  const suggestions = useMemo(() => {
    const automated = new Set(rules.map((r) => normalize(r.description)));
    return detected.filter((d) => !automated.has(normalize(d.description)));
  }, [detected, rules]);

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
      <div className="flex min-h-dvh items-center justify-center bg-token-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-r-transparent" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-token-primary">Recurring</h1>
          <p className="mt-1 text-sm text-token-secondary">
            Subscriptions and bills we log for you, so you never have to type them again.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-r-transparent" />
          </div>
        ) : (
          <>
            {rules.length === 0 && suggestions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-token p-8 text-center">
                <p className="font-semibold text-token-primary">No recurring expenses yet</p>
                <p className="mt-1 text-sm text-token-secondary">
                  Once you’ve logged the same subscription or bill for a few months, it shows up
                  here ready to automate.
                </p>
              </div>
            ) : null}

            {rules.length > 0 ? (
              <section className="space-y-3">
                <h2 className="text-xs font-semibold tracking-widest text-token-muted">
                  AUTOMATIC
                </h2>
                <div className="space-y-3">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="rounded-2xl border border-token bg-token-card p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-token-primary">
                            {rule.description}
                          </p>
                          <p className="mt-0.5 text-xs text-token-secondary">
                            {describeSchedule(rule)}
                            {rule.isActive ? ` · next ${formatNextRun(rule.nextRunAt)}` : ' · paused'}
                          </p>
                        </div>
                        <p className="shrink-0 font-bold text-token-primary">
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
                          <span className="text-xs text-token-secondary">
                            {rule.isActive ? 'Active' : 'Paused'}
                          </span>
                        </label>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busyId === rule.id}
                          onClick={() => logNow(rule)}
                        >
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
                  ))}
                </div>
              </section>
            ) : null}

            {suggestions.length > 0 ? (
              <section className="space-y-3">
                <h2 className="text-xs font-semibold tracking-widest text-token-muted">
                  DETECTED IN YOUR HISTORY
                </h2>
                <div className="divide-y divide-[var(--border-default)] overflow-hidden rounded-2xl border border-token bg-token-card">
                  {suggestions.map((item) => (
                    <div
                      key={item.description}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-token-primary">
                          {item.description}
                        </p>
                        <p className="text-xs text-token-muted">
                          {item.category} · seen {item.monthsSeen} months · ~
                          {formatCurrency(item.averageAmount, item.currency)}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => openDraft(item)}>
                        Automate
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
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
              We’ll add “{draft.description}” for you on schedule. You can pause it any time.
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
                <label className="mb-1 block text-sm font-medium text-token-secondary">
                  Day of month
                </label>
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
                <p className="mt-1 text-xs text-token-muted">
                  Capped at 28 so it fires every month.
                </p>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-sm font-medium text-token-secondary">
                  Day of week
                </label>
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
