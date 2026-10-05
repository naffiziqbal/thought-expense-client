'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useIsPremium } from '@/hooks/useIsPremium';
import { premiumPlansSubtitle } from '@/lib/subscription';
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useThemeStore, type ThemeMode } from '@/store/themeStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import type { ExpenseImportPreview, NotificationPreferences } from '@/types';
import { ExpenseImportPreviewPanel } from '@/components/import/ExpenseImportPreviewPanel';
import { ImportAsyncProgressPanel } from '@/components/import/ImportAsyncProgressPanel';
import { IMPORT_DATA_HINT, isCsvImportFile, type ImportJobPhase } from '@/lib/importDashboard';

function themeLabel(mode: ThemeMode): string {
  if (mode === 'system') return 'System';
  if (mode === 'dark') return 'Dark';
  return 'Light';
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 ml-1 text-xs text-token-muted">{children}</p>;
}

function RowChevron() {
  return (
    <svg className="h-4 w-4 shrink-0 text-token-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function NavRow({
  href,
  icon,
  title,
  value,
  last,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  value?: string;
  last?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-[52px] items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-hover)] ${
        !last ? 'border-b border-token' : ''
      }`}
    >
      <span className="shrink-0 text-token-muted">{icon}</span>
      <span className="flex-1 text-sm font-medium text-token-primary">{title}</span>
      {value ? <span className="text-sm text-token-muted">{value}</span> : null}
      <RowChevron />
    </Link>
  );
}

export default function ProfilePage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const { user, logout } = useAuthStore();
  const isPremium = useIsPremium();
  const router = useRouter();
  const startTour = useOnboardingStore((s) => s.start);
  const themeMode = useThemeStore((s) => s.mode);

  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [recurringActive, setRecurringActive] = useState(0);
  const [budgetHint, setBudgetHint] = useState('Set up');
  const [goalsHint, setGoalsHint] = useState('Create');
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [exportFrom, setExportFrom] = useState('');
  const [exportTo, setExportTo] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<ExpenseImportPreview | null>(null);
  const [importParsing, setImportParsing] = useState(false);
  const [importApplying, setImportApplying] = useState(false);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [importJobId, setImportJobId] = useState<string | null>(null);
  const [importPhase, setImportPhase] = useState<ImportJobPhase>('queued');
  const [importMessage, setImportMessage] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const [importCancelling, setImportCancelling] = useState(false);

  const handleCancelImportJob = async () => {
    if (!importJobId || importCancelling) return;
    setImportCancelling(true);
    try {
      const res = await api.cancelImportJob(importJobId);
      toast.success(res.message || 'Import cancelled');
      setImportJobId(null);
      setImportPhase('cancelled');
      setImportMessage(
        res.message || 'Import cancelled. Nothing new was added from this file.'
      );
      setImportProgress(0);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Could not cancel import');
    } finally {
      setImportCancelling(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    const currency = user?.currency || 'USD';
    Promise.all([
      api.getNotificationPreferences().catch(() => null),
      api.getRecurringRules().catch(() => null),
      api.getCurrentBudget().catch(() => null),
      api.getGoals().catch(() => null),
    ]).then(([prefsRes, recurringRes, budgetRes, goalsRes]) => {
      if (prefsRes?.success) setPrefs(prefsRes.data);
      if (recurringRes?.success) {
        setRecurringActive(recurringRes.data.rules.filter((r) => r.isActive).length);
      }
      if (budgetRes?.success && budgetRes.data) {
        setBudgetHint(`${formatCurrency(Math.max(0, budgetRes.data.remaining), currency)} left`);
      } else {
        setBudgetHint('Set up');
      }
      if (goalsRes?.success) {
        const active = goalsRes.data.goals.filter((g) => g.status === 'active').length;
        setGoalsHint(active > 0 ? `${active} active` : 'Create');
      }
      setPrefsLoading(false);
    });
  }, [isAuthenticated, isLoading, user?.currency]);

  const savePrefs = useCallback(
    async (patch: Partial<NotificationPreferences>) => {
      if (!prefs) return;
      const previous = prefs;
      setPrefs({ ...prefs, ...patch });
      setPrefsSaving(true);
      try {
        const res = await api.updateNotificationPreferences(patch);
        if (res.success) setPrefs(res.data);
      } catch {
        setPrefs(previous);
        toast.error('Could not save preference');
      } finally {
        setPrefsSaving(false);
      }
    },
    [prefs]
  );

  const copyId = async () => {
    if (!user?.id) return;
    await navigator.clipboard.writeText(user.id);
    toast.success('User ID copied');
  };

  const openImport = () => {
    if (!isPremium) {
      toast.error('Import is available on Premium');
      router.push('/dashboard/premium');
      return;
    }
    setImportPreview(null);
    setImportFileName(null);
    setImportJobId(null);
    setImportPhase('queued');
    setImportMessage('');
    setImportProgress(0);
    setImportModalOpen(true);
  };

  useEffect(() => {
    if (!importJobId) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await api.getParseJobStatus(importJobId);
        if (cancelled) return;
        const d = res.data;
        if (d.message) setImportMessage(d.message);
        if (typeof d.progress === 'number') setImportProgress(d.progress);
        if (d.phase) setImportPhase(d.phase as ImportJobPhase);
        if (d.status === 'completed') {
          toast.success(d.message || 'Import complete');
          setImportJobId(null);
          setImportModalOpen(false);
          router.push('/dashboard/expenses');
        }
        if (d.status === 'cancelled') {
          setImportJobId(null);
          setImportPhase('cancelled');
          if (d.message) setImportMessage(d.message);
          setImportProgress(0);
        }
        if (d.status === 'failed') {
          setImportJobId(null);
          setImportPhase('failed');
          if (d.message) setImportMessage(d.message);
        }
      } catch {
        if (!cancelled) setImportMessage('Still working… checking again shortly.');
      }
    };
    poll();
    const interval = setInterval(poll, 2500);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [importJobId, router]);

  const handleImportFile = async (file: File | null) => {
    if (!file) return;
    setImportFileName(file.name);
    setImportPreview(null);
    setImportJobId(null);

    if (isCsvImportFile(file)) {
      setImportParsing(true);
      try {
        const res = await api.previewExpenseImport(file);
        if (res.success) setImportPreview(res.data);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } };
        toast.error(e.response?.data?.message || 'Could not read file');
      } finally {
        setImportParsing(false);
      }
      return;
    }

    setImportParsing(true);
    setImportPhase('queued');
    setImportMessage('Uploading your document…');
    setImportProgress(0);
    try {
      const res = await api.enqueueImportDocument(file);
      if (res.success) {
        setImportJobId(res.data.jobId);
        setImportMessage(res.data.message || 'Import started — reading your document…');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Could not start import');
      setImportPhase('failed');
      setImportMessage(e.response?.data?.message || 'Could not start import');
    } finally {
      setImportParsing(false);
    }
  };

  const handleApplyImport = async () => {
    if (!importPreview?.rows.length) return;
    setImportApplying(true);
    try {
      const res = await api.applyExpenseImport(importPreview.rows);
      toast.success(res.message || `Imported ${res.data.imported} expenses`);
      setImportModalOpen(false);
      setImportPreview(null);
      setImportFileName(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Import failed');
    } finally {
      setImportApplying(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await api.exportExpenses(exportFormat, exportFrom || undefined, exportTo || undefined);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses-${new Date().toISOString().slice(0, 10)}.${exportFormat === 'csv' ? 'csv' : 'pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
      setExportModalOpen(false);
      toast.success('Export downloaded');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-token-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent-primary)] border-r-transparent" />
      </div>
    );
  }

  const shortId = user?.id.slice(0, 8).toUpperCase() ?? '—';
  const avatarUrl = getImageUrl(user?.profilePicture || user?.profilePictureUrl);

  const iconClass = 'h-5 w-5';

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg space-y-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-token-accent">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" fill className="object-cover" sizes="56px" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xl font-medium text-white">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-medium text-token-primary">{user?.name || 'User'}</p>
            <button type="button" onClick={copyId} className="mt-0.5 flex items-center gap-1 text-xs text-token-muted">
              ID {shortId}
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <Link
            href="/dashboard/profile/edit"
            className="shrink-0 rounded-lg border border-token px-3 py-2 text-sm font-medium text-token-primary"
          >
            Edit
          </Link>
        </div>

        {/* Plan */}
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--accent-primary)]/35 bg-token-card p-4">
          <svg className="h-5 w-5 shrink-0 text-token-accent" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l2.2 5.4 5.8.5-4.4 3.9 1.3 5.7L12 15.5l-4.9 3 1.3-5.7L4 8.9l5.8-.5L12 2z" />
          </svg>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-token-primary">{isPremium ? 'Premium plan' : 'Free plan'}</p>
            <p className="mt-0.5 truncate text-xs text-token-muted">
              {isPremium
                ? user?.subscription?.summaryLine || premiumPlansSubtitle(user)
                : 'Upgrade to unlock all features'}
            </p>
          </div>
          {!isPremium ? (
            <Link
              href="/dashboard/premium"
              className="shrink-0 rounded-lg bg-token-accent px-3.5 py-2 text-sm font-medium text-white"
            >
              See plans
            </Link>
          ) : (
            <Link
              href="/dashboard/premium"
              className="shrink-0 rounded-lg border border-token px-3 py-2 text-sm text-token-primary"
            >
              Manage
            </Link>
          )}
        </div>

        <SectionLabel>Money</SectionLabel>
        <div className="overflow-hidden rounded-2xl border border-token bg-token-card">
          <NavRow
            href="/dashboard/budget"
            title="Monthly budget"
            value={budgetHint}
            icon={
              <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <NavRow
            href="/dashboard/goals"
            title="Savings goals"
            value={goalsHint}
            icon={
              <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m9-4a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <NavRow
            href="/dashboard/currencies"
            title="Currency"
            value={user?.currency || 'USD'}
            icon={
              <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" d="M3 12h18" />
                <path strokeLinecap="round" d="M12 7v10" />
              </svg>
            }
          />
          <NavRow
            href="/dashboard/recurring"
            title="Recurring"
            value={recurringActive > 0 ? `${recurringActive} active` : 'Auto-log'}
            last
            icon={
              <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M20 9A8 8 0 006.34 6.34M4 15a8 8 0 0013.66 2.66" />
              </svg>
            }
          />
        </div>

        <SectionLabel>Preferences</SectionLabel>
        <div className="overflow-hidden rounded-2xl border border-token bg-token-card">
          <label className="flex min-h-[52px] items-center gap-3 border-b border-token px-4 py-3">
            <svg className={`${iconClass} shrink-0 text-token-muted`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4a2 2 0 00-.6-1.4V11a6 6 0 00-4-5.7V5a2 2 0 10-4 0v.3A6 6 0 006 11v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1h6z" />
            </svg>
            <span className="flex-1 text-sm font-medium text-token-primary">Budget alerts</span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-[var(--accent-primary)]"
              checked={prefs?.budgetAlertsEnabled ?? false}
              disabled={prefsLoading || prefsSaving || !prefs?.pushEnabled}
              onChange={(e) => savePrefs({ budgetAlertsEnabled: e.target.checked })}
            />
          </label>
          <label className="flex min-h-[52px] items-center gap-3 border-b border-token px-4 py-3">
            <svg className={`${iconClass} shrink-0 text-token-muted`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="flex-1 text-sm font-medium text-token-primary">Weekly AI briefing</span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-[var(--accent-primary)]"
              checked={prefs?.pushEnabled ?? false}
              disabled={prefsLoading || prefsSaving}
              onChange={(e) => savePrefs({ pushEnabled: e.target.checked })}
            />
          </label>
          <NavRow
            href="/dashboard/settings/device"
            title="Appearance"
            value={themeLabel(themeMode)}
            icon={
              <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            }
          />
          <NavRow
            href="/dashboard/security"
            title="Security"
            value="Password"
            last
            icon={
              <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c.5-1.2 1.6-2 3-2a3 3 0 013 3v2h-5v5h-2v-5H8v-2c0-1.7 1.3-3 3-3 1.4 0 2.5.8 3 2z" />
                <rect x="3" y="11" width="18" height="10" rx="2" />
              </svg>
            }
          />
        </div>

        <SectionLabel>Data and help</SectionLabel>
        <div className="overflow-hidden rounded-2xl border border-token bg-token-card">
          <button
            type="button"
            onClick={openImport}
            className="flex min-h-[52px] w-full items-center gap-3 border-b border-token px-4 py-3 text-left transition-colors hover:bg-[var(--surface-hover)]"
          >
            <svg className={`${iconClass} shrink-0 text-token-muted`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8v8a2 2 0 002 2h12a2 2 0 002-2V8M7 10l5-5 5 5M12 15V3" />
            </svg>
            <span className="flex-1 text-sm font-medium text-token-primary">Import data</span>
            <span className="text-sm text-token-muted">{isPremium ? 'CSV / PDF' : 'Premium'}</span>
            <RowChevron />
          </button>
          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="flex min-h-[52px] w-full items-center gap-3 border-b border-token px-4 py-3 text-left transition-colors hover:bg-[var(--surface-hover)]"
          >
            <svg className={`${iconClass} shrink-0 text-token-muted`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            <span className="flex-1 text-sm font-medium text-token-primary">Export data</span>
            <span className="text-sm text-token-muted">CSV</span>
            <RowChevron />
          </button>
          <button
            type="button"
            onClick={startTour}
            className="flex min-h-[52px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-hover)]"
          >
            <svg className={`${iconClass} shrink-0 text-token-muted`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" d="M9.5 9.5a3 3 0 015 0" />
              <path strokeLinecap="round" d="M12 17h.01" />
            </svg>
            <span className="flex-1 text-sm font-medium text-token-primary">Replay the tour</span>
            <RowChevron />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setLogoutConfirm(true)}
          className="flex w-full items-center justify-center gap-2 py-4 text-sm font-medium text-red-500"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log out
        </button>
      </div>

      <Modal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Export Expenses"
        footer={
          <div className="flex gap-3">
            <Button onClick={() => setExportModalOpen(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleExport} className="flex-1" disabled={isExporting}>
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-token-primary">Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
              className="w-full rounded-lg border border-token bg-token-card px-3 py-2 text-sm text-token-primary focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-token-primary">From (optional)</label>
              <input
                type="date"
                value={exportFrom}
                onChange={(e) => setExportFrom(e.target.value)}
                className="w-full rounded-lg border border-token bg-token-card px-3 py-2 text-sm text-token-primary focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-token-primary">To (optional)</label>
              <input
                type="date"
                value={exportTo}
                onChange={(e) => setExportTo(e.target.value)}
                className="w-full rounded-lg border border-token bg-token-card px-3 py-2 text-sm text-token-primary focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>
          </div>
          <p className="text-sm text-token-secondary">Leave dates empty to export all expenses.</p>
        </div>
      </Modal>

      <Modal
        isOpen={importModalOpen}
        onClose={() => {
          setImportModalOpen(false);
          setImportPreview(null);
          setImportFileName(null);
        }}
        title={importJobId ? 'Import in progress' : importPreview ? 'Review import' : 'Import Expenses'}
        footer={
          importJobId ? (
            <div className="flex w-full gap-3">
              <Button
                variant="outline"
                className="flex-1"
                disabled={importCancelling}
                onClick={() => void handleCancelImportJob()}
              >
                {importCancelling ? 'Cancelling…' : 'Cancel import'}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setImportModalOpen(false);
                  toast.success('Import continues in the background.');
                }}
              >
                Close
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setImportModalOpen(false);
                  setImportPreview(null);
                  setImportFileName(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              {importPreview ? (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={importParsing || importApplying}
                  onClick={() => {
                    setImportPreview(null);
                    setImportFileName(null);
                  }}
                >
                  Choose another file
                </Button>
              ) : null}
              <Button
                onClick={handleApplyImport}
                className="flex-1"
                disabled={!importPreview?.rows.length || importApplying || importParsing}
              >
                {importApplying ? 'Importing…' : importPreview?.rows.length ? `Import ${importPreview.rows.length}` : 'Import'}
              </Button>
            </div>
          )
        }
      >
        <div className="space-y-4">
          {importJobId || importPhase === 'failed' || importPhase === 'cancelled' ? (
            <ImportAsyncProgressPanel
              fileName={importFileName}
              phase={importPhase}
              message={importMessage}
              progress={importProgress}
            />
          ) : null}
          {!importPreview && !importJobId && importPhase !== 'failed' && importPhase !== 'cancelled' ? (
            <p className="text-sm text-token-secondary">{IMPORT_DATA_HINT}</p>
          ) : null}
          {!importPreview && !importJobId && importPhase !== 'failed' && importPhase !== 'cancelled' ? (
            <input
              type="file"
              accept=".csv,.pdf,image/*,text/csv,application/pdf"
              disabled={importParsing || importApplying}
              onChange={(e) => void handleImportFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-token-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-token-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
            />
          ) : null}
          {importParsing && !importJobId ? <p className="text-sm text-token-muted">Reading file…</p> : null}
          {importPreview ? <ExpenseImportPreviewPanel preview={importPreview} fileName={importFileName} /> : null}
          {(importPhase === 'failed' || importPhase === 'cancelled') && !importJobId ? (
            <Button
              variant="outline"
              onClick={() => {
                setImportPhase('queued');
                setImportMessage('');
                setImportProgress(0);
                setImportFileName(null);
              }}
            >
              Try another file
            </Button>
          ) : null}
        </div>
      </Modal>

      <Modal
        isOpen={logoutConfirm}
        onClose={() => setLogoutConfirm(false)}
        title="Log out?"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setLogoutConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {
                setLogoutConfirm(false);
                logout();
                router.push('/');
              }}
            >
              Log out
            </Button>
          </div>
        }
      >
        <p className="text-token-secondary">You’ll need to sign in again to access your expenses.</p>
      </Modal>
    </DashboardLayout>
  );
}
