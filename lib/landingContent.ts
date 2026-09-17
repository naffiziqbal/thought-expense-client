export type FaqItem = { q: string; a: string };

export type PremiumTier = {
  name: string;
  price: string;
  period: string;
  note: string;
  highlight?: boolean;
};

export type FeatureItem = {
  title: string;
  description: string;
  badge?: string;
  wide?: boolean;
};

export type HowItWorksStep = {
  step: string;
  title: string;
  description: string;
};

export type ProductCapability = {
  title: string;
  description: string;
  platforms: string;
};

export const pennyMessages = {
  heroIntro: "Hi! I'm Penny — type what you spent and I'll sort the categories.",
  demoHint: 'Try: coffee 120, uber 250',
  transform: 'Messy notes are my specialty.',
  offline: 'No signal? I queue saves until you are back online.',
  cta: "Sign up free — I'll walk you through the app.",
};

export const landingHero = {
  eyebrow: 'Natural language expense tracking',
  headline: 'Say what you spent.\nWe sort the rest.',
  subhead:
    'Type "coffee 120, uber 250" in Quick Log. AI parses amounts, picks categories, and saves — even when you are offline.',
  cta: 'Start tracking for free',
  footnote: 'Free forever · No card required · Web and Android',
};

export const howItWorks = {
  title: 'From messy note to clear ledger',
  subtitle: 'Three steps. No spreadsheet formulas.',
  steps: [
    {
      step: '1',
      title: 'Type in plain language',
      description:
        'One line or a whole list. Add a date if you want — otherwise Quick Log uses today.',
    },
    {
      step: '2',
      title: 'AI parses and categorizes',
      description:
        'Amounts, categories, and currency are extracted automatically. Low-confidence items are flagged for review.',
    },
    {
      step: '3',
      title: 'See where money goes',
      description:
        'Dashboard totals, budgets, insights, and recurring patterns update as soon as sync completes.',
    },
  ] satisfies HowItWorksStep[],
};

export const features: FeatureItem[] = [
  {
    title: 'Works offline',
    description:
      'Log on the train or with no signal. Saves queue on your device and sync when you reconnect — no double entry.',
    wide: true,
  },
  {
    title: 'Receipt scan',
    description: 'Premium on web: upload a receipt photo and OCR pulls out line items you can edit before saving.',
    badge: 'Premium · Web',
  },
  {
    title: 'Budgets & alerts',
    description: 'Set a monthly cap. Get nudges at 80% and 100% on the Android app when push is enabled.',
  },
  {
    title: 'AI advisor',
    description: 'Ask why spending changed or how to save. Free tier includes 5 questions per month; Premium is unlimited.',
  },
  {
    title: 'Goals & recurring',
    description: 'Track savings targets and auto-detect subscriptions so rent and Netflix do not surprise you.',
  },
  {
    title: 'Any currency',
    description: 'Log in BDT, USD, EUR, INR, or your default. Totals convert for summaries when needed.',
  },
];

export const productCapabilities: ProductCapability[] = [
  {
    title: 'Quick Log',
    description: 'The core loop — type, save, done. Async parsing keeps the UI fast when the server is busy.',
    platforms: 'Web · Android',
  },
  {
    title: 'Insights & briefings',
    description: 'Monthly insights on Free. Premium adds deeper intelligence, weekly email briefings, and smart alerts.',
    platforms: 'Web · Android',
  },
  {
    title: 'Push notifications',
    description: 'Budget thresholds, weekly briefings, and recurring expense confirmations on Android.',
    platforms: 'Android',
  },
  {
    title: 'Export',
    description: 'Download your ledger as CSV or PDF when you need records outside the app.',
    platforms: 'Premium · Web',
  },
];

export const freePlanFeatures = [
  'Natural language Quick Log',
  'Offline logging with auto-sync',
  '3 months of expense history',
  'Monthly AI insights',
  '5 advisor questions / month',
  'Multi-currency support',
  'Budgets and savings goals',
];

export const premiumPlanFeatures = [
  'Unlimited AI advisor',
  'Weekly briefing by email',
  'Smart alerts — anomalies & trends',
  '12-month intelligence window',
  'Receipt OCR on web',
  'Full expense history',
  'CSV & PDF export',
  'Daily & weekly insights',
];

export const premiumTiers: PremiumTier[] = [
  { name: 'Monthly', price: '$6.99', period: '/month', note: 'Cancel anytime' },
  { name: 'Annual', price: '$60', period: '/year', note: 'Save ~28%', highlight: true },
  { name: 'Lifetime', price: '$99', period: 'one-time', note: 'Pay once, keep forever' },
];

export const faqItems: FaqItem[] = [
  {
    q: 'Does it work offline?',
    a: 'Yes. On web and Android you can log expenses without a connection. Saves queue locally and sync automatically when you are back online.',
  },
  {
    q: "What's included in Free?",
    a: 'Quick Log, offline sync, 3 months of history, monthly insights, 5 advisor questions per month, budgets, goals, and multi-currency. Premium unlocks export, receipt OCR, full history, and unlimited advisor access.',
  },
  {
    q: 'Where do I buy Premium?',
    a: 'Subscriptions and lifetime unlock are purchased inside the Android app via Google Play. Sign up on web first — the same account works everywhere.',
  },
  {
    q: 'How does receipt scanning work?',
    a: 'Premium users on the web dashboard can upload a receipt image. OCR extracts the text so you can confirm amounts before saving. The Android app does not scan receipts today.',
  },
  {
    q: 'Can I export my data?',
    a: 'Premium users can export expenses as CSV or PDF anytime from the web dashboard.',
  },
  {
    q: 'Is my data private?',
    a: 'Your expenses are yours. Data is encrypted in transit (TLS). We do not sell your spending data.',
  },
];

export const platforms = [
  { name: 'Web', detail: 'Full dashboard + receipt OCR', available: true },
  { name: 'Android', detail: 'App, offline, Premium purchases', available: true },
  { name: 'iOS', detail: 'In development', available: false },
];

export const landingCta = {
  title: 'Start logging in seconds',
  body: 'Create a free account on web. Install the Android app when you want offline logging and push alerts.',
  bullets: [
    'Quick Log works offline on web and Android',
    'Same login across devices',
    'Upgrade to Premium from the Android app',
  ],
};

export const landingMetadata = {
  title: 'ThoughtExpense — Track expenses by typing',
  description:
    'Log spending in plain language. AI parses and categorizes every line. Works offline on web and Android. Budgets, insights, goals, and receipt OCR on Premium.',
};

export const jsonLdFeatureList = [
  'Natural language expense input',
  'Offline logging with automatic sync',
  'AI categorization and insights',
  'Multi-currency support',
  'Budgets and savings goals',
  'Receipt OCR on web (Premium)',
  'CSV and PDF export (Premium)',
];
