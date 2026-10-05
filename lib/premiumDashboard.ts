export const PREMIUM_PAGE_HINT = 'AI advisor, deeper insights, exports, and more — one subscription across devices.';

export const PREMIUM_BENEFITS: { title: string; desc: string }[] = [
  { title: 'Unlimited AI advisor', desc: 'Ask anything about your money — why it changed, how to save' },
  { title: 'Weekly financial briefing', desc: 'Your week in money, with recommendations, by email' },
  { title: 'Smart alerts', desc: 'Anomaly, trend & waste detection over 12 months of history' },
  { title: 'Full expense history', desc: 'Search and analyze all your past transactions' },
  { title: 'Receipt scanning', desc: 'Scan receipts with camera or upload (web)' },
  { title: 'Import & export (CSV & PDF)', desc: 'Bring in bank or sheet exports and download your ledger anytime' },
];

export const PACKAGE_LABELS: Record<string, string> = {
  MONTHLY: 'Monthly',
  ANNUAL: 'Yearly',
  SIX_MONTH: '6 months',
  THREE_MONTH: '3 months',
  WEEKLY: 'Weekly',
  LIFETIME: 'Lifetime',
};

export const PACKAGE_SUBTITLES: Record<string, string> = {
  MONTHLY: 'Cancel anytime',
  ANNUAL: 'Best for committed savers',
  LIFETIME: 'One-time payment, yours forever',
};

/** Static tiers when store billing is not configured (dev / Expo Go). */
export const FALLBACK_PLANS = [
  { id: 'monthly', label: 'Monthly', price: '$6.99/mo', subtitle: 'Cancel anytime' },
  { id: 'yearly', label: 'Yearly', price: '$60/yr', subtitle: 'Save ~28% vs monthly' },
  { id: 'lifetime', label: 'Lifetime', price: '$99', subtitle: 'One-time payment, yours forever' },
] as const;

export const WEB_PRICING_TIERS = [
  { name: 'Monthly', price: '$6.99', period: '/month', badge: null as string | null },
  { name: 'Yearly', price: '$60', period: '/year', badge: 'Save ~28%' },
  { name: 'Lifetime', price: '$99', period: 'one-time', badge: null as string | null },
];
