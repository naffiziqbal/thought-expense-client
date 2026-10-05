'use client';

import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useIsPremium } from '@/hooks/useIsPremium';
import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import {
  PREMIUM_BENEFITS,
  PREMIUM_PAGE_HINT,
  WEB_PRICING_TIERS,
} from '@/lib/premiumDashboard';
import { premiumPlansSubtitle } from '@/lib/subscription';
import { cn } from '@/lib/utils';

export default function PremiumPage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const isPremium = useIsPremium();
  const user = useAuthStore((s) => s.user);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-token-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent-primary)] border-r-transparent" />
      </div>
    );
  }

  const statusLine = isPremium ? premiumPlansSubtitle(user) : PREMIUM_PAGE_HINT;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg space-y-3 pb-8 pt-1">
        <div className="min-w-0">
          <h1 className="text-base font-semibold leading-tight text-token-primary">Subscription</h1>
          <p className="mt-0.5 text-xs leading-relaxed text-token-muted">{statusLine}</p>
        </div>

        <div
          className={cn(
            'rounded-2xl border p-4',
            isPremium ? 'border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/5' : 'border-token bg-token-card'
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-[52px] w-[52px] items-center justify-center rounded-xl',
                isPremium ? 'bg-token-accent text-on-accent' : 'bg-[var(--background-primary)] text-token-accent'
              )}
            >
              <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21 8 13.6 2 9h7.6L12 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-token-muted">Your plan</p>
              <p className="text-lg font-semibold text-token-primary">{isPremium ? 'Premium' : 'Free'}</p>
              {isPremium && user?.subscription?.summaryLine ? (
                <p className="mt-0.5 truncate text-xs text-token-secondary">{user.subscription.summaryLine}</p>
              ) : null}
            </div>
          </div>
        </div>

        <p className="ml-1 text-xs font-medium text-token-muted">{isPremium ? 'Included' : 'Premium includes'}</p>
        <div className="overflow-hidden rounded-2xl border border-token bg-token-card">
          {PREMIUM_BENEFITS.map((b, i) => (
            <div
              key={b.title}
              className={cn('flex gap-3 px-3 py-3', i < PREMIUM_BENEFITS.length - 1 && 'border-b border-token')}
            >
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-token-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="min-w-0">
                <p className="text-sm font-medium text-token-primary">{b.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-token-muted">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {!isPremium ? (
          <>
            <p className="ml-1 text-xs font-medium text-token-muted">Plans</p>
            <div className="grid grid-cols-3 gap-2">
              {WEB_PRICING_TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className={cn(
                    'relative rounded-xl border bg-token-card p-3 text-center',
                    tier.badge ? 'border-[var(--accent-primary)]' : 'border-token'
                  )}
                >
                  {tier.badge ? (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-token-accent px-2 py-0.5 text-[10px] font-semibold text-on-accent">
                      {tier.badge}
                    </span>
                  ) : null}
                  <p className="text-[11px] font-medium text-token-muted">{tier.name}</p>
                  <p className="mt-1 text-base font-semibold tabular-nums text-token-primary">{tier.price}</p>
                  <p className="text-[10px] text-token-muted">{tier.period}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-token bg-token-card p-4 text-center">
              <p className="text-sm font-medium text-token-primary">Subscribe on mobile</p>
              <p className="mt-1 text-xs leading-relaxed text-token-secondary">
                Purchases go through the App Store or Google Play. Open ThoughtExpense on your phone, go to Settings →
                Subscription, and pick a plan there — Premium applies to this account on web too.
              </p>
            </div>
          </>
        ) : (
          <p className="px-1 text-xs leading-relaxed text-token-muted">
            To change or cancel billing, use the App Store or Google Play on the device where you subscribed. Premium
            stays active until the current period ends.
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
