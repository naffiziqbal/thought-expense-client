'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { api } from '@/lib/api';
import type { NotificationPreferences } from '@/types';

interface ToggleRowProps {
  title: string;
  subtitle: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ title, subtitle, checked, disabled, onChange }: ToggleRowProps) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-4 px-4 py-4 ${disabled ? 'opacity-50' : ''}`}
    >
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-token-primary">{title}</p>
        <p className="text-sm text-token-secondary">{subtitle}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 shrink-0 accent-[var(--accent-primary)]"
      />
    </label>
  );
}

export default function NotificationsPage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;
    api
      .getNotificationPreferences()
      .then((res) => {
        if (res.success) setPrefs(res.data);
      })
      .catch(() => toast.error('Could not load notification settings'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isLoading]);

  const save = useCallback(
    async (patch: Partial<NotificationPreferences>) => {
      if (!prefs) return;
      const previous = prefs;
      setPrefs({ ...prefs, ...patch });
      setSaving(true);
      try {
        const res = await api.updateNotificationPreferences(patch);
        if (res.success) setPrefs(res.data);
      } catch {
        setPrefs(previous);
        toast.error('Could not save preferences');
      } finally {
        setSaving(false);
      }
    },
    [prefs]
  );

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
          <h1 className="text-2xl font-bold text-token-primary">Notifications</h1>
          <p className="mt-1 text-sm text-token-secondary">
            These control what ThoughtExpense sends to your account.
          </p>
        </header>

        {loading || !prefs ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-r-transparent" />
          </div>
        ) : (
          <>
            <div className="divide-y divide-[var(--border-default)] overflow-hidden rounded-2xl border border-token bg-token-card">
              <ToggleRow
                title="Push notifications"
                subtitle="Weekly briefings and auto-logged expenses"
                checked={prefs.pushEnabled}
                disabled={saving}
                onChange={(value) => save({ pushEnabled: value })}
              />
              <ToggleRow
                title="Budget alerts"
                subtitle="A nudge at 80% and 100% of your monthly budget"
                checked={prefs.budgetAlertsEnabled}
                disabled={saving || !prefs.pushEnabled}
                onChange={(value) => save({ budgetAlertsEnabled: value })}
              />
            </div>

            <p className="text-xs text-token-muted">
              Push notifications are delivered by the ThoughtExpense mobile app. Install it and sign
              in to receive them; the daily logging reminder is set up there too. Weekly briefings
              also arrive by email regardless of these settings.
            </p>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
