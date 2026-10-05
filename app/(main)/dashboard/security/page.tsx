'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { DELETE_ACCOUNT_WARNING, SECURITY_PAGE_HINT } from '@/lib/securityDashboard';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const EyeIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878a4.5 4.5 0 106.262 6.262M4.031 11.117A9.953 9.953 0 003 12c3.732 7.943 7.523 10 12 10 2.054 0 4.002-.378 5.625-1.003M16 9a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

export default function SecurityPage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const router = useRouter();
  const { logout } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!deletePassword) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteAccount(deletePassword);
      if (res.success) {
        setDeleteModalOpen(false);
        toast.success('Your account has been deleted');
        logout();
        router.push('/');
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const validate = () => {
    setError(null);
    if (!currentPassword) {
      setError('Current password is required');
      return false;
    }
    if (!newPassword) {
      setError('New password is required');
      return false;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setError(null);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      if (res.success) {
        toast.success(res.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError('Failed to update password. Please try again.');
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg || 'Failed to update password. Please try again.');
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

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full rounded-xl border bg-[var(--background-tag)] px-3 py-2.5 text-sm text-token-primary placeholder:text-token-muted focus:border-[var(--accent-primary)] focus:outline-none',
      hasError ? 'border-red-300' : 'border-token'
    );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg space-y-3 pb-8 pt-1">
        <div className="min-w-0">
          <h1 className="text-base font-semibold leading-tight text-token-primary">Security</h1>
          <p className="mt-0.5 text-xs leading-relaxed text-token-muted">{SECURITY_PAGE_HINT}</p>
        </div>

        <div className="rounded-2xl border border-[var(--accent-primary)]/30 bg-token-card p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-token-accent-soft text-token-accent">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <p className="text-xs leading-relaxed text-token-secondary">
              Use a unique password you don&apos;t reuse elsewhere. You&apos;ll stay signed in on this device after updating.
            </p>
          </div>
        </div>

        <p className="ml-1 text-xs font-medium text-token-muted">Password</p>
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-2xl border border-token bg-token-card p-4"
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium text-token-secondary">Current password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className={cn(inputClass(!!error), 'pr-11')}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-token-muted hover:bg-[var(--surface-hover)]"
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-token-secondary">New password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className={cn(inputClass(!!error), 'pr-11')}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-token-muted hover:bg-[var(--surface-hover)]"
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-token-secondary">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className={inputClass(!!error)}
              autoComplete="new-password"
            />
          </div>

          {error ? <p className="text-sm text-token-error">{error}</p> : null}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isSaving}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            Update password
          </Button>
        </form>

        <p className="ml-1 text-xs font-medium text-token-error">Danger zone</p>
        <div className="space-y-3 rounded-2xl border border-red-300/60 bg-token-card p-4 dark:border-red-900/50">
          <p className="text-xs leading-relaxed text-token-secondary">
            Permanently delete your account, expenses, budgets, goals, and insights. This cannot be undone.
          </p>
          <Button type="button" variant="danger" className="w-full" onClick={() => setDeleteModalOpen(true)}>
            Delete my account
          </Button>
        </div>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete account?"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDeleteAccount}
              isLoading={isDeleting}
              disabled={!deletePassword}
            >
              Delete forever
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-token-secondary">{DELETE_ACCOUNT_WARNING}</p>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-token-secondary">Password</label>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              className={inputClass(false)}
            />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
