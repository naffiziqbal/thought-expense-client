'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import {
  GOAL_STARTER_IDEAS,
  deadlineLabel,
  quickContributeAmounts,
  summarizeGoals,
} from '@/lib/goalsDashboard';
import toast from 'react-hot-toast';
import type { SavingsGoal } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function GoalsPage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const { user } = useAuthStore();

  const [loadingGoals, setLoadingGoals] = useState(true);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', targetAmount: '', deadline: '' });
  const [isCreating, setIsCreating] = useState(false);

  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [isContributing, setIsContributing] = useState(false);

  const [editGoal, setEditGoal] = useState<SavingsGoal | null>(null);
  const [editForm, setEditForm] = useState({ name: '', targetAmount: '', deadline: '' });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [deleteGoal, setDeleteGoal] = useState<SavingsGoal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [menuGoalId, setMenuGoalId] = useState<string | null>(null);

  const currency = user?.currency || 'USD';
  const todayMin = new Date().toISOString().slice(0, 10);

  const loadGoals = async () => {
    try {
      const res = await api.getGoals();
      if (res.success) setGoals(res.data.goals || []);
    } catch (err) {
      console.error('Failed to load goals', err);
    } finally {
      setLoadingGoals(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    loadGoals();
  }, [isAuthenticated, isLoading]);

  const openCreate = (prefill?: { name: string; targetAmount: number }) => {
    setCreateForm({
      name: prefill?.name ?? '',
      targetAmount: prefill ? String(prefill.targetAmount) : '',
      deadline: '',
    });
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    const target = parseFloat(createForm.targetAmount);
    if (!createForm.name.trim()) {
      toast.error('Please enter a goal name');
      return;
    }
    if (isNaN(target) || target <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }
    setIsCreating(true);
    try {
      const res = await api.createGoal({
        name: createForm.name.trim(),
        targetAmount: target,
        ...(createForm.deadline && { deadline: createForm.deadline }),
      });
      if (res.success) {
        toast.success('Goal created');
        setCreateOpen(false);
        setCreateForm({ name: '', targetAmount: '', deadline: '' });
        await loadGoals();
      } else {
        toast.error(res.message || 'Failed to create goal');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Failed to create goal');
    } finally {
      setIsCreating(false);
    }
  };

  const handleContribute = async (amountOverride?: number) => {
    if (!contributeGoal) return;
    const amount = amountOverride ?? parseFloat(contributeAmount);
    if (isNaN(amount) || amount === 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setIsContributing(true);
    try {
      const res = await api.contributeToGoal(contributeGoal.id, amount);
      if (res.success) {
        const updated = res.data?.goal;
        if (updated?.status === 'completed' && contributeGoal.status !== 'completed') {
          toast.success(`Goal "${contributeGoal.name}" completed!`);
        } else {
          toast.success(amount > 0 ? 'Added to goal' : 'Updated goal balance');
        }
        setContributeGoal(null);
        setContributeAmount('');
        await loadGoals();
      } else {
        toast.error(res.message || 'Failed to update goal');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Failed to update goal');
    } finally {
      setIsContributing(false);
    }
  };

  const openEdit = (goal: SavingsGoal) => {
    setMenuGoalId(null);
    setEditGoal(goal);
    setEditForm({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editGoal) return;
    const target = parseFloat(editForm.targetAmount);
    if (!editForm.name.trim()) {
      toast.error('Please enter a goal name');
      return;
    }
    if (isNaN(target) || target <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }
    setIsSavingEdit(true);
    try {
      const res = await api.updateGoal(editGoal.id, {
        name: editForm.name.trim(),
        targetAmount: target,
        deadline: editForm.deadline || null,
      });
      if (res.success) {
        toast.success('Goal updated');
        setEditGoal(null);
        await loadGoals();
      } else {
        toast.error(res.message || 'Failed to update goal');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Failed to update goal');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteGoal) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteGoal(deleteGoal.id);
      if (res.success) {
        toast.success('Goal deleted');
        setDeleteGoal(null);
        await loadGoals();
      } else {
        toast.error(res.message || 'Failed to delete goal');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Failed to delete goal');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent-primary)] border-r-transparent" />
      </div>
    );
  }

  const summary = summarizeGoals(goals);
  const contributeQuick =
    contributeGoal && !isContributing
      ? quickContributeAmounts(contributeGoal.remaining, contributeGoal.currency)
      : [];

  const renderGoalCard = (goal: SavingsGoal) => {
    const pct = Math.min(100, Math.round(goal.progress * 100));
    const isCompleted = goal.status === 'completed';
    const due = deadlineLabel(goal.deadline);
    const menuOpen = menuGoalId === goal.id;

    return (
      <div
        key={goal.id}
        className={`relative rounded-2xl border bg-token-card p-4 shadow-sm ${
          isCompleted ? 'border-[var(--accent-primary)]/35' : 'border-token'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isCompleted ? 'bg-[var(--accent-primary)]/15' : 'bg-[var(--chart-track)]'
            }`}
          >
            {isCompleted ? (
              <span className="text-lg" aria-hidden>
                🎉
              </span>
            ) : (
              <svg className="h-5 w-5 text-token-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m9-4a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-token-primary">{goal.name}</p>
            <p className="mt-0.5 text-xs text-token-muted">
              {formatCurrency(goal.savedAmount, goal.currency)} of {formatCurrency(goal.targetAmount, goal.currency)}
            </p>
            {goal.deadline ? (
              <p className="mt-1 text-[11px] text-token-secondary">
                Target {formatDate(goal.deadline)}
                {due ? <span className={due.includes('overdue') ? ' text-token-error' : ''}> · {due}</span> : null}
              </p>
            ) : null}
          </div>
          <div className="relative flex shrink-0 flex-col items-end justify-center gap-0.5">
            <p className="text-sm font-semibold tabular-nums text-token-primary">{pct}%</p>
            <button
              type="button"
              onClick={() => setMenuGoalId(menuOpen ? null : goal.id)}
              className="rounded-lg p-1 text-token-muted hover:bg-[var(--surface-hover)]"
              aria-label="Goal options"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
            {menuOpen ? (
              <>
                <button type="button" className="fixed inset-0 z-10" aria-label="Close menu" onClick={() => setMenuGoalId(null)} />
                <div className="absolute right-0 top-8 z-20 min-w-[9rem] overflow-hidden rounded-xl border border-token bg-token-card py-1 shadow-lg">
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm text-token-primary hover:bg-[var(--surface-hover)]"
                    onClick={() => openEdit(goal)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm text-token-error hover:bg-[var(--surface-hover)]"
                    onClick={() => {
                      setMenuGoalId(null);
                      setDeleteGoal(goal);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--chart-track)]">
          <div
            className={`h-full rounded-full transition-all ${isCompleted ? 'bg-token-accent' : 'bg-token-accent'}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          {isCompleted ? (
            <p className="text-xs font-medium text-token-accent">Goal reached</p>
          ) : (
            <p className="text-xs text-token-muted">
              {formatCurrency(goal.remaining, goal.currency)} to go
            </p>
          )}
          {!isCompleted ? (
            <button
              type="button"
              onClick={() => {
                setContributeGoal(goal);
                setContributeAmount('');
              }}
              className="rounded-full bg-token-accent-soft px-3 py-1 text-xs font-semibold text-token-accent"
            >
              Add funds
            </button>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg space-y-3 pb-8 pt-1">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-base font-semibold leading-tight text-token-primary">Goals</h1>
            <p className="text-xs leading-tight text-token-muted">Track what you&apos;re saving for</p>
          </div>
          <button
            type="button"
            onClick={() => openCreate()}
            aria-label="New goal"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-token bg-token-card text-token-secondary shadow-sm transition-colors hover:border-[var(--accent-primary)] hover:text-token-accent"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {loadingGoals ? (
          <div className="rounded-2xl border border-token bg-token-card py-12 text-center">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-4 border-solid border-[var(--accent-primary)] border-r-transparent" />
            <p className="text-sm text-token-muted">Loading goals…</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-dashed border-token bg-token-card px-4 py-8 text-center">
              <p className="text-sm font-medium text-token-primary">No goals yet</p>
              <p className="mt-1 text-xs leading-relaxed text-token-secondary">
                Set a target and log when you set money aside — separate from everyday spending.
              </p>
              <Button type="button" className="mt-4" onClick={() => openCreate()}>
                Create a goal
              </Button>
            </div>
            <div>
              <p className="mb-2 ml-1 text-xs text-token-muted">Popular starters</p>
              <div className="overflow-hidden rounded-2xl border border-token bg-token-card">
                {GOAL_STARTER_IDEAS.map((idea, i) => (
                  <button
                    key={idea.name}
                    type="button"
                    onClick={() => openCreate(idea)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[var(--surface-hover)] ${
                      i < GOAL_STARTER_IDEAS.length - 1 ? 'border-b border-token' : ''
                    }`}
                  >
                    <span className="text-sm font-medium text-token-primary">{idea.name}</span>
                    <span className="text-xs text-token-muted">{formatCurrency(idea.targetAmount, currency)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {summary.active.length > 0 ? (
              <div className="rounded-2xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5 p-4">
                <p className="text-xs font-medium text-token-accent">Active goals</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-token-primary">
                  {formatCurrency(summary.totalSaved, currency)}
                </p>
                <p className="text-xs text-token-secondary">
                  of {formatCurrency(summary.totalTarget, currency)} target
                  {summary.completed.length > 0 ? ` · ${summary.completed.length} completed` : ''}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--chart-track)]">
                  <div
                    className="h-full rounded-full bg-token-accent transition-all"
                    style={{ width: `${Math.round(summary.overallProgress * 100)}%` }}
                  />
                </div>
              </div>
            ) : null}

            {summary.active.length > 0 ? (
              <div className="space-y-3">{summary.active.map(renderGoalCard)}</div>
            ) : null}

            {summary.completed.length > 0 ? (
              <div>
                <button
                  type="button"
                  onClick={() => setShowCompleted((v) => !v)}
                  className="mb-2 flex w-full items-center justify-between px-1 text-xs font-medium text-token-muted"
                >
                  Completed ({summary.completed.length})
                  <svg
                    className={`h-4 w-4 transition-transform ${showCompleted ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showCompleted ? <div className="space-y-3">{summary.completed.map(renderGoalCard)}</div> : null}
              </div>
            ) : null}
          </>
        )}

        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          title="New goal"
          footer={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCreateOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreate} isLoading={isCreating} className="flex-1">
                Create
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-token-secondary">What are you saving for?</label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="e.g. Emergency fund"
                className="w-full rounded-lg border border-token px-4 py-2 text-sm text-token-primary focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-token-secondary">Target ({currency})</label>
              <input
                type="text"
                inputMode="decimal"
                value={createForm.targetAmount}
                onChange={(e) => setCreateForm({ ...createForm, targetAmount: e.target.value })}
                placeholder="Amount"
                className="w-full rounded-lg border border-token px-4 py-2 text-sm text-token-primary focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>
            <DateField
              label="Deadline (optional)"
              value={createForm.deadline}
              onChange={(deadline) => setCreateForm({ ...createForm, deadline })}
              min={todayMin}
              clearable
            />
          </div>
        </Modal>

        <Modal
          isOpen={!!contributeGoal}
          onClose={() => setContributeGoal(null)}
          title={contributeGoal ? `Add to ${contributeGoal.name}` : 'Add funds'}
          footer={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setContributeGoal(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => handleContribute()} isLoading={isContributing} className="flex-1">
                Add
              </Button>
            </div>
          }
        >
          {contributeGoal ? (
            <div className="space-y-4">
              <p className="text-sm text-token-secondary">
                {formatCurrency(contributeGoal.remaining, contributeGoal.currency)} left to hit your target.
              </p>
              {contributeQuick.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {contributeQuick.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      disabled={isContributing}
                      onClick={() => handleContribute(amt)}
                      className="rounded-full border border-token bg-[var(--background-tag)] px-3 py-1.5 text-xs font-medium text-token-primary hover:border-[var(--accent-primary)]/50"
                    >
                      +{formatCurrency(amt, contributeGoal.currency)}
                    </button>
                  ))}
                </div>
              ) : null}
              <div>
                <label className="mb-2 block text-sm font-medium text-token-secondary">Custom amount</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleContribute()}
                  placeholder="Enter amount"
                  className="w-full rounded-lg border border-token px-4 py-2 text-sm text-token-primary focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                />
                <p className="mt-2 text-xs text-token-muted">Use a negative value to undo a contribution.</p>
              </div>
            </div>
          ) : null}
        </Modal>

        <Modal
          isOpen={!!editGoal}
          onClose={() => setEditGoal(null)}
          title="Edit goal"
          footer={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEditGoal(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} isLoading={isSavingEdit} className="flex-1">
                Save
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-token-secondary">Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full rounded-lg border border-token px-4 py-2 text-sm text-token-primary focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-token-secondary">Target</label>
              <input
                type="text"
                inputMode="decimal"
                value={editForm.targetAmount}
                onChange={(e) => setEditForm({ ...editForm, targetAmount: e.target.value })}
                className="w-full rounded-lg border border-token px-4 py-2 text-sm text-token-primary focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>
            <DateField
              label="Deadline (optional)"
              value={editForm.deadline}
              onChange={(deadline) => setEditForm({ ...editForm, deadline })}
              clearable
            />
          </div>
        </Modal>

        <Modal
          isOpen={!!deleteGoal}
          onClose={() => setDeleteGoal(null)}
          title="Delete goal"
          footer={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteGoal(null)} className="flex-1">
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} isLoading={isDeleting} className="flex-1">
                Delete
              </Button>
            </div>
          }
        >
          <p className="text-sm text-token-secondary">This removes the goal and its saved progress. Expenses are not deleted.</p>
          {deleteGoal ? (
            <div className="mt-4 rounded-xl bg-[var(--background-tag)] p-3">
              <p className="font-medium text-token-primary">{deleteGoal.name}</p>
              <p className="text-xs text-token-muted">
                {formatCurrency(deleteGoal.savedAmount, deleteGoal.currency)} saved
              </p>
            </div>
          ) : null}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
