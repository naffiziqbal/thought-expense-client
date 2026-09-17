import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  freePlanFeatures,
  premiumPlanFeatures,
  premiumTiers,
} from '@/lib/landingContent';

export function PricingSection() {
  return (
    <section id="pricing" className="border-b border-token bg-token-surface px-4 py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-token-primary md:text-4xl">
            Simple pricing
          </h2>
          <p className="mt-3 text-lg text-token-secondary">
            Start free on web. Upgrade from the Android app when you need more depth.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
          <div className="rounded-2xl border border-token bg-token-card p-8">
            <h3 className="text-xl font-semibold text-token-primary">Free</h3>
            <p className="mt-1 text-token-secondary">Everything you need to start tracking</p>
            <p className="mt-6 text-4xl font-bold text-token-primary">$0</p>
            <ul className="mt-8 space-y-3 text-sm text-token-secondary">
              {freePlanFeatures.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-token-accent" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className="mt-10 block">
              <Button variant="outline" className="w-full rounded-full border-token py-4">
                Create free account
              </Button>
            </Link>
          </div>

          <div className="rounded-2xl border-2 border-[var(--accent-primary)] bg-token-card p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-token-primary">Premium</h3>
                <p className="mt-1 text-token-secondary">For exports, OCR, and unlimited advisor</p>
              </div>
              <span className="rounded-full bg-token-accent px-3 py-1 text-xs font-semibold text-white">
                Best for power users
              </span>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {premiumTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`relative rounded-xl border p-4 text-center ${
                    tier.highlight
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
                      : 'border-token bg-token-surface'
                  }`}
                >
                  {tier.highlight ? (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-token-accent px-2.5 py-0.5 text-[10px] font-semibold text-white">
                      Best value
                    </span>
                  ) : null}
                  <p className="text-sm font-medium text-token-secondary">{tier.name}</p>
                  <p className="mt-1 text-2xl font-bold text-token-primary">{tier.price}</p>
                  <p className="text-xs text-token-muted">{tier.period}</p>
                  <p className="mt-2 text-xs text-token-secondary">{tier.note}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm text-token-muted">Purchased in the Android app via Google Play</p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2 text-sm text-token-secondary">
              {premiumPlanFeatures.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-token-accent">+</span>
                  <span>{item}</span>
                </li>
              ))}
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
  );
}
