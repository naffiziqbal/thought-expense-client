'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { SavingsGoal } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

// Progress bar color: teal while saving, celebrate at completion
function getGoalProgressColor(progressPct: number): string {
  if (progressPct >= 100) return 'bg-token-accent';
  if (progressPct >= 75) return 'bg-teal-500';
  return 'bg-token-accent';
}

export default function GoalsPage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const { user } = useAuthStore();

  const [loadingGoals, setLoadingGoals] = useState(true);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);

  // Create goal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', targetAmount: '', deadline: '' });
  const [isCreating, setIsCreating] = useState(false);

  // Contribute
  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [isContributing, setIsContributing] = useState(false);

  // Edit
  const [editGoal, setEditGoal] = useState<SavingsGoal | null>(null);
  const [editForm, setEditForm] = useState({ name: '', targetAmount: '', deadline: '' });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete
  const [deleteGoal, setDeleteGoal] = useState<SavingsGoal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currency = user?.currency || 'USD';

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

  const handleContribute = async () => {
    if (!contributeGoal) return;
    const amount = parseFloat(contributeAmount);
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
          toast.success(`🎉 Goal "${contributeGoal.name}" completed!`);
        } else {
          toast.success(amount > 0 ? 'Money added to goal' : 'Money removed from goal');
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
        ...(editForm.deadline && { deadline: editForm.deadline }),
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
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent-primary)] border-r-transparent" />
          <p className="text-token-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  const renderGoalCard = (goal: SavingsGoal) => {
    const pct = Math.min(100, Math.round(goal.progress * 100));
    const isCompleted = goal.status === 'completed';

    return (
      <div
        key={goal.id}
        className={`rounded-3xl bg-token-card p-4 sm:p-5 shadow-sm border ${
          isCompleted ? 'border-[var(--accent-primary)]/40' : 'border-transparent'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--background-tag)] text-xl">
              {isCompleted ? '🎉' : '🎯'}
            </span>
            <div className="min-w-0">
              <p className="text-base font-semibold text-token-primary truncate">{goal.name}</p>
              <p className="text-xs font-medium text-token-secondary">
                {formatCurrency(goal.savedAmount, goal.currency)} / {formatCurrency(goal.targetAmount, goal.currency)}
                {goal.deadline && <> &middot; by {formatDate(goal.deadline)}</>}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => openEdit(goal)}
              className="rounded-lg p-2 text-token-muted hover:bg-[var(--surface-hover)] hover:text-token-secondary transition-colors"
              title="Edit goal"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
            <button
              onClick={() => setDeleteGoal(goal)}
              className="rounded-lg p-2 text-token-muted hover:bg-red-50 hover:text-token-error transition-colors"
              title="Delete goal"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 h-3 rounded-full bg-[var(--blueGray-100)] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${getGoalProgressColor(pct)}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-medium text-token-secondary">
          <span>{pct}% saved</span>
          <span>
            {isCompleted
              ? 'Goal reached!'
              : `${formatCurrency(goal.remaining, goal.currency)} to go`}
          </span>
        </div>

        {isCompleted ? (
          <div className="mt-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 px-4 py-3 text-center">
            <p className="text-sm font-semibold text-token-accent">
              🎉 Congratulations! You reached this goal.
            </p>
          </div>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setContributeGoal(goal);
              setContributeAmount('');
            }}
            className="mt-4 w-full rounded-full"
          >
            Add money
          </Button>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-token-surface pb-8">
        {/* Zone A: Header */}
        <div className="pt-6 pb-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-token-primary tracking-tight">Savings Goals</h1>
            <p className="mt-1 text-sm text-token-secondary">
              Set targets and watch your savings grow
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="shrink-0 rounded-full"
          >
            + New goal
          </Button>
        </div>

        {loadingGoals ? (
          <div className="py-16 text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent-primary)] border-r-transparent" />
            <p className="text-token-secondary text-sm">Loading goals...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="rounded-3xl bg-token-card border border-token p-6 sm:p-12 text-center shadow-sm">
            <div className="mb-4 text-6xl">🎯</div>
            <h3 className="mb-2 text-xl font-semibold text-token-primary">No goals yet</h3>
            <p className="mb-6 text-token-secondary">
              Create your first savings goal and start putting money aside
            </p>
            <Button onClick={() => setCreateOpen(true)}>Create your first goal</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {activeGoals.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-base font-semibold text-token-primary">Active</h2>
                <div className="space-y-3">{activeGoals.map(renderGoalCard)}</div>
              </div>
            )}

            {completedGoals.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-base font-semibold text-token-primary">Completed</h2>
                <div className="space-y-3">{completedGoals.map(renderGoalCard)}</div>
              </div>
            )}
          </div>
        )}

        {/* Create Goal Modal */}
        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          title="New savings goal"
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
              <label className="mb-2 block text-sm font-medium text-token-secondary">Name</label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="e.g. Emergency fund"
                className="w-full rounded-lg border border-token px-4 py-2 text-sm text-token-primary focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-token-secondary">Target amount</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={createForm.targetAmount}
                onChange={(e) => setCreateForm({ ...createForm, targetAmount: e.target.value })}
                placeholder="Enter amount"
                className="w-full rounded-lg border border-token px-4 py-2 text-sm text-token-primary focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
              />
              <p className="mt-1 text-xs text-token-muted">Your currency: {currency}</p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-token-secondary">Deadline (optional)</label>
              <input
                type="date"
                value={createForm.deadline}
                onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                className="w-full rounded-lg border border-token px-4 py-2 text-sm text-token-primary focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
              />
            </div>
          </div>
        </Modal>

        {/* Contribute Modal */}
        <Modal
          isOpen={!!contributeGoal}
          onClose={() => setContributeGoal(null)}
          title={contributeGoal ? `Add money to "${contributeGoal.name}"` : 'Add money'}
          footer={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setContributeGoal(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleContribute} isLoading={isContributing} className="flex-1">
                Save
              </Button>
            </div>
          }
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-token-secondary">Amount</label>
            <input
              type="number"
              step="0.01"
              value={contributeAmount}
              onChange={(e) => setContributeAmount(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleContribute()}
              placeholder="Enter amount"
              className="w-full rounded-lg border border-token px-4 py-2 text-sm text-token-primary focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
            />
            {contributeGoal && (
              <p className="mt-2 text-xs text-token-muted">
                {formatCurrency(contributeGoal.remaining, contributeGoal.currency)} left to reach this goal.
                Use a negative amount to remove money.
              </p>
            )}
          </div>
        </Modal>

        {/* Edit Goal Modal */}
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
                className="w-full rounded-lg border border-token px-4 py-2 text-sm text-token-primary focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-token-secondary">Target amount</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={editForm.targetAmount}
                onChange={(e) => setEditForm({ ...editForm, targetAmount: e.target.value })}
                className="w-full rounded-lg border border-token px-4 py-2 text-sm text-token-primary focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-token-secondary">Deadline (optional)</label>
              <input
                type="date"
                value={editForm.deadline}
                onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                className="w-full rounded-lg border border-token px-4 py-2 text-sm text-token-primary focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
              />
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
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
          <p className="text-token-primary">
            Are you sure you want to delete this goal? This action cannot be undone.
          </p>
          {deleteGoal && (
            <div className="mt-4 rounded-lg bg-[var(--background-tag)] p-4">
              <p className="font-medium text-token-primary">{deleteGoal.name}</p>
              <p className="text-sm text-token-secondary">
                {formatCurrency(deleteGoal.savedAmount, deleteGoal.currency)} of{' '}
                {formatCurrency(deleteGoal.targetAmount, deleteGoal.currency)} saved
              </p>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
