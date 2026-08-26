import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { MagicInputHero } from '@/components/landing/MagicInputHero';
import { TransformationShowcase } from '@/components/landing/TransformationShowcase';
import { SocialTrust } from '@/components/landing/SocialTrust';
import { FAQAccordion } from '@/components/landing/FAQAccordion';
import type { Metadata } from 'next';
import { siteUrl } from '@/lib/site';


export const metadata: Metadata = {
  title: 'AI Expense Tracker — Track Expenses. Just by Typing.',
  description:
    'Log expenses in plain language: type "coffee 120, uber 250" and AI parses, categorizes and dates every item. Budgets, AI insights, receipt scanning, multi-currency. Free forever plan — no card required.',
  openGraph: {
    url: siteUrl,
    type: 'website',
  },
  alternates: {
    canonical: siteUrl,
  },
};

const faqItems = [
  {
    q: "What's included in Free?",
    a: 'Free gets you natural language text input, 3 months of expense history, monthly AI insights, and multi-currency support. Upgrade to Premium for receipt scanning, full history, export (CSV/PDF), and daily & weekly insights.',
  },
  {
    q: 'Is my data encrypted?',
    a: 'Yes. All data is encrypted at rest using industry-standard AES-256. In transit, we use TLS 1.3. Your expense data is never shared or sold.',
  },
  {
    q: 'Can I export my data?',
    a: 'Premium users can export expenses as CSV or PDF anytime. Free users can upgrade to Premium to unlock export. Your data is yours—no lock-in.',
  },
  {
    q: 'How does receipt scanning work?',
    a: 'Premium users can snap or upload receipts in the Android app. AI vision extracts every line item, and you can always correct entries manually.',
  },
];

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ThoughtExpense',
    description:
      'AI-powered expense tracker. Log expenses in natural language — no categories or dates to pick. Just type "Coffee 15, Rent 5000" and we handle the rest.',
    url: siteUrl,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ThoughtExpense',
      url: siteUrl,
      logo: `${siteUrl}/icon`,
    },
    featureList: [
      'Natural language expense input',
      'AI-powered categorization',
      'Multi-currency support',
      'Monthly spending insights',
      'Receipt scan (Premium)',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  },
];

const featureIcon = 'flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-primary)]/10 text-token-accent';

export default function HomePage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      {/* Section 01: The Magic Hero */}
      <section className="flex min-h-[85vh] flex-col items-center justify-center px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-primary)]/10 px-4 py-1.5 text-sm font-semibold text-token-accent">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z" />
            </svg>
            AI-powered expense tracking
          </span>
          <h1 className="mt-7 text-5xl font-bold tracking-tighter text-token-primary md:text-6xl">
            Track expenses.<br />Just by typing.
          </h1>
          <p className="mt-6 text-xl text-token-secondary leading-relaxed">
            No categories to select. No dates to pick. Just say &quot;coffee 120, uber 250&quot; and we handle the rest.
          </p>
          <div className="mt-14">
            <MagicInputHero />
          </div>
          <Link href="/auth/signup" className="mt-10 inline-block">
            <Button
              size="lg"
              className="rounded-full bg-token-accent px-10 py-4 text-lg font-semibold text-white hover:opacity-90 shadow-lg"
            >
              Start tracking for free
            </Button>
          </Link>
          <p className="mt-4 text-sm text-token-muted">Free forever plan &middot; No card required</p>
        </div>
      </section>

      {/* Section 02: The Transformation */}
      <section id="how-it-works" className="border-t border-token bg-token-card px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-4xl font-bold tracking-tight text-token-primary">
            Turn your brain dump into a budget.
          </h2>
          <p className="mt-4 text-center text-lg text-token-secondary">
            Auto-sort, instantly. Magically.
          </p>
          <div className="mt-16">
            <TransformationShowcase />
          </div>
        </div>
      </section>

      {/* Section 03: Lifestyle Features */}
      <section id="features" className="border-t border-token bg-token-surface px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-4xl font-bold tracking-tight text-token-primary">
            More than just typing.
          </h2>
          <p className="mt-4 text-center text-lg text-token-secondary">
            Everything you need to stay on top of spending.
          </p>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Card 1: Receipt Snap - Premium */}
            <div className="rounded-3xl border border-token bg-token-card p-8 shadow-sm transition-shadow hover:shadow-md relative">
              <span className="absolute right-4 top-4 rounded-full bg-[var(--accent-primary)]/10 px-2.5 py-0.5 text-xs font-semibold text-token-accent">
                Premium
              </span>
              <div className={featureIcon}>
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9a2 2 0 0 1 2-2h1l1.5-2h9L18 7h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <circle cx="12" cy="13" r="3.5" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-token-primary">Receipt Snap</h3>
              <p className="mt-3 text-token-secondary">
                Don&apos;t type at all. Just snap a photo of your receipt and AI extracts every line item.
              </p>
            </div>

            {/* Card 2: Spending Wisdom */}
            <div className="rounded-3xl border border-token bg-token-card p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className={featureIcon}>
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                  <path d="M5 20V12" />
                  <path d="M12 20V5" />
                  <path d="M19 20v-6" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-token-primary">Spending Wisdom</h3>
              <p className="mt-3 text-token-secondary">
                Monthly insights for everyone. Daily &amp; weekly analysis on Premium.
              </p>
              <div className="mt-6 flex items-center justify-center">
                <svg width="88" height="88" viewBox="0 0 88 88" aria-hidden>
                  <circle cx="44" cy="44" r="34" fill="none" stroke="var(--accent-primary)" strokeOpacity="0.15" strokeWidth="12" />
                  <circle cx="44" cy="44" r="34" fill="none" stroke="var(--accent-primary)" strokeWidth="12" strokeLinecap="round" strokeDasharray="137 214" transform="rotate(-90 44 44)" />
                </svg>
              </div>
            </div>

            {/* Card 3: Global Ready */}
            <div className="rounded-3xl border border-token bg-token-card p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className={featureIcon}>
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18" />
                  <path d="M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-token-primary">Global Ready</h3>
              <p className="mt-3 text-token-secondary">
                Track in any currency. USD, EUR, BDT, INR&mdash;we&apos;ve got you covered.
              </p>
              <div className="mt-6 flex gap-2">
                <span className="rounded-full bg-[var(--background-tag)] px-3 py-1 text-sm font-semibold text-token-primary">$</span>
                <span className="rounded-full bg-[var(--background-tag)] px-3 py-1 text-sm font-semibold text-token-primary">&#2547;</span>
                <span className="rounded-full bg-[var(--background-tag)] px-3 py-1 text-sm font-semibold text-token-primary">&euro;</span>
                <span className="rounded-full bg-[var(--background-tag)] px-3 py-1 text-sm font-semibold text-token-primary">&#8377;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 05: Pricing */}
      <section id="pricing" className="border-t border-token bg-token-card px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-4xl font-bold tracking-tight text-token-primary">
            Simple pricing
          </h2>
          <p className="mt-4 text-center text-lg text-token-secondary">
            Start free. Upgrade when you need more.
          </p>
          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {/* Free */}
            <div className="rounded-3xl border border-token bg-token-card p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-token-primary">Free</h3>
              <p className="mt-1 text-token-secondary">For everyone</p>
              <p className="mt-8 text-4xl font-bold text-token-primary">$0</p>
              <ul className="mt-8 space-y-4 text-token-secondary">
                <li>Natural language text input</li>
                <li>3 months of expense history</li>
                <li>Monthly spending insights</li>
                <li>5 AI advisor questions / month</li>
                <li>Multi-currency support</li>
              </ul>
              <Link href="/auth/signup" className="mt-10 block">
                <Button
                  variant="outline"
                  className="w-full rounded-full border-token py-4"
                >
                  Get started free
                </Button>
              </Link>
            </div>

            {/* Premium */}
            <div className="rounded-3xl border-2 border-[var(--accent-primary)] bg-token-card p-8 shadow-lg relative overflow-hidden">
              <div className="absolute right-4 top-4 rounded-full bg-token-accent px-3 py-1 text-xs font-semibold text-white">
                Best value
              </div>
              <h3 className="text-xl font-semibold text-token-primary">Premium</h3>
              <p className="mt-1 text-token-secondary">For smart spenders</p>
              <div className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="text-3xl font-bold text-token-primary">
                  $6.99<span className="text-base font-medium text-token-secondary">/month</span>
                </p>
              </div>
              <p className="mt-2 text-sm text-token-secondary">
                $60/year{' '}
                <span className="rounded-full bg-[var(--accent-primary)]/10 px-2 py-0.5 text-xs font-semibold text-token-accent">
                  Save ~28%
                </span>{' '}
                &middot; $99 lifetime (one-time)
              </p>
              <p className="mt-1 text-sm text-token-secondary">purchase via the Android app</p>
              <ul className="mt-8 space-y-4 text-token-secondary">
                <li>Everything in Free, plus:</li>
                <li><strong className="text-token-primary">AI financial advisor</strong> &mdash; unlimited questions</li>
                <li><strong className="text-token-primary">Weekly briefing</strong> &mdash; by email</li>
                <li><strong className="text-token-primary">Smart alerts</strong> &mdash; anomalies, trends &amp; waste detection</li>
                <li><strong className="text-token-primary">12-month</strong> intelligence window</li>
                <li><strong className="text-token-primary">Receipt scan</strong> &mdash; camera or upload</li>
                <li><strong className="text-token-primary">Full history</strong> &mdash; lifetime access</li>
                <li><strong className="text-token-primary">Export</strong> &mdash; CSV &amp; PDF</li>
                <li><strong className="text-token-primary">Daily &amp; weekly</strong> insights, ad-free</li>
              </ul>
              <Link href="/auth/signup" className="mt-10 block">
                <Button className="w-full rounded-full bg-token-accent py-4 text-white hover:opacity-90">
                  Start free, upgrade later
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 04b: FAQ */}
      <section id="faq" className="border-t border-token bg-token-surface px-4 py-24">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-4xl font-bold tracking-tight text-token-primary">
            Frequently asked
          </h2>
          <div className="mt-12">
            <FAQAccordion />
          </div>
        </div>
      </section>

      {/* Section 04: Social Trust */}
      <section className="border-t border-token bg-token-card px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <SocialTrust />
        </div>
      </section>

      {/* Section 06: CTA band */}
      <section className="bg-token-accent px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white">
            Ready to track smarter?
          </h2>
          <p className="mt-4 text-lg text-white/85">
            Join thousands who ditched the spreadsheets.
          </p>
          <Link href="/auth/signup" className="mt-10 inline-block">
            <span className="inline-block rounded-full bg-white px-10 py-4 text-lg font-bold text-[var(--accent-hover)] shadow-lg transition-transform hover:scale-[1.02]">
              Start tracking for free
            </span>
          </Link>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <span className="flex items-center gap-2 rounded-xl bg-white/15 px-5 py-3 text-sm font-semibold text-white">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18" />
                <path d="M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
              </svg>
              Web App
            </span>
            <span className="flex items-center gap-2 rounded-xl bg-white/15 px-5 py-3 text-sm font-semibold text-white">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <rect x="7" y="3" width="10" height="18" rx="2" />
                <path d="M11 18h2" />
              </svg>
              Android
            </span>
            <span className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white/60">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20.5c-4 0-6.5-3.4-6.5-7.2 0-3.7 2.5-5.6 4.7-5.6 1 0 1.8 0.4 1.8 0.4s0.8-0.4 1.8-0.4c2.2 0 4.7 1.9 4.7 5.6 0 3.8-2.5 7.2-6.5 7.2z" />
                <path d="M12 7.5c0-2 1.5-3.5 3-3.5 0 2-1.5 3.5-3 3.5z" />
              </svg>
              iOS coming soon
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-token bg-token-card px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-token-secondary">
            <Link href="/privacy" className="hover:text-token-accent transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-token-accent transition-colors">Terms</Link>
            <Link href="/account-deletion" className="hover:text-token-accent transition-colors">Account deletion</Link>
          </div>
          <p className="mt-6 text-center text-sm text-token-muted">
            &copy; 2026 ThoughtExpense &middot; Say it. We track it.
          </p>
        </div>
      </footer>
    </>
  );
}
