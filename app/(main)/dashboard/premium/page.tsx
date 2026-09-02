'use client';

import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useIsPremium } from '@/hooks/useIsPremium';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

const CheckIcon = () => (
  <svg className="w-5 h-5 text-token-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const benefits = [
  { title: 'AI financial advisor — unlimited questions', desc: 'Ask anything about your spending, as often as you like' },
  { title: 'Weekly financial briefing by email', desc: 'A summary of your week in money, every week' },
  { title: 'Smart alerts: anomalies, trends & waste detection', desc: 'Get warned about spikes, price creep and leaks' },
  { title: '12-month intelligence window', desc: 'Deeper analysis across a full year of data' },
  { title: 'Receipt scanning', desc: 'Scan receipts with camera or upload' },
  { title: 'Full expense history', desc: 'Access all your past transactions' },
  { title: 'Export (CSV & PDF)', desc: 'Download your data anytime' },
  { title: 'Daily & Weekly insights', desc: 'Granular AI spending analysis' },
];

const pricingTiers = [
  { name: 'Monthly', price: '$6.99', period: '/month', badge: null },
  { name: 'Yearly', price: '$60', period: '/year', badge: 'Save ~28%' },
  { name: 'Lifetime', price: '$99', period: 'one-time', badge: null },
];

export default function PremiumPage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const isPremium = useIsPremium();

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
      <div className="space-y-8 pb-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l2.5 8.5H22l-5.5 4 2.5 8-7-5.5L5 22l2.5-8L2 10.5h7.5L12 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-token-primary">ThoughtExpense Premium</h1>
          <p className="mt-2 text-token-secondary">
            {isPremium
              ? "You're a Premium member. Enjoy all features!"
              : 'Unlock the full power of your expense tracker'}
          </p>
        </div>

        {/* Benefits */}
        <div className="rounded-2xl bg-token-card p-5 shadow-sm border border-token">
          <h2 className="text-lg font-semibold text-token-primary mb-4">
            {isPremium ? 'What you have' : 'What you get'}
          </h2>
          <ul className="space-y-4">
            {benefits.map((b) => (
              <li key={b.title} className="flex items-start gap-3">
                <CheckIcon />
                <div>
                  <p className="font-medium text-token-primary">{b.title}</p>
                  <p className="text-sm text-token-secondary">{b.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing tiers */}
        {!isPremium && (
          <div className="rounded-2xl bg-token-card p-5 shadow-sm border border-token">
            <h2 className="text-lg font-semibold text-token-primary mb-4">Choose your plan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`relative rounded-2xl border p-4 text-center ${
                    tier.badge
                      ? 'border-2 border-[var(--accent-primary)] bg-teal-50/50 dark:bg-teal-950/20'
                      : 'border-token bg-token-card'
                  }`}
                >
                  {tier.badge && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-token-accent px-2.5 py-0.5 text-[11px] font-semibold text-white whitespace-nowrap">
                      {tier.badge}
                    </span>
                  )}
                  <p className="text-sm font-medium text-token-secondary">{tier.name}</p>
                  <p className="mt-1 text-2xl font-bold text-token-primary">{tier.price}</p>
                  <p className="text-xs text-token-muted">{tier.period}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upgrade CTA - only for Free users */}
        {!isPremium && (
          <div className="rounded-2xl bg-token-card border border-token p-6 text-center">
            <h3 className="font-semibold text-token-primary mb-2">Ready to upgrade?</h3>
            <p className="text-sm text-token-secondary mb-4">
              Purchase happens through the mobile app. Open ThoughtExpense on your phone to upgrade!
            </p>
            <button
              disabled
              className="px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold opacity-75 cursor-not-allowed"
            >
              Upgrade via Mobile App
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
