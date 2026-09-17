import type { ReactNode } from 'react';
import { features } from '@/lib/landingContent';

const icons: Record<string, ReactNode> = {
  'Works offline': (
    <path d="M3 7h18v10H3z M8 21h8 M12 17v4 M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2 M8 11h8" />
  ),
  'Receipt scan': (
    <path d="M3 9a2 2 0 0 1 2-2h1l1.5-2h9L18 7h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M12 13a3.5 3.5 0 1 0 0 .1" />
  ),
  'Budgets & alerts': (
    <path d="M5 20V12 M12 20V5 M19 20v-6" />
  ),
  'AI advisor': (
    <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z" />
  ),
  'Goals & recurring': (
    <path d="M4 19h16M6 16l3-8 3 5 2-3 4 6" />
  ),
  'Any currency': (
    <path d="M12 3a9 9 0 1 0 9 9 M12 7v10 M9 10h4a2 2 0 1 1 0 4h-1" />
  ),
};

function FeatureIcon({ title }: { title: string }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-primary)]/10 text-token-accent sm:h-12 sm:w-12">
      <svg
        className="h-5 w-5 sm:h-6 sm:w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {icons[title]}
      </svg>
    </div>
  );
}

export function FeatureGrid() {
  return (
    <section id="features" className="border-b border-token bg-token-surface px-4 py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-token-primary md:text-4xl">
            Built for real life, not perfect spreadsheets
          </h2>
          <p className="mt-3 text-lg text-token-secondary">
            Log fast. Stay aware. Upgrade when you need exports, OCR, or a deeper view of your money.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className={`relative rounded-2xl border border-token bg-token-card p-4 sm:p-6 ${
                feature.wide ? 'col-span-2 lg:col-span-3 lg:flex lg:items-start lg:gap-8' : ''
              }`}
            >
              {feature.badge ? (
                <span className="absolute right-2 top-2 rounded-full bg-[var(--accent-primary)]/10 px-2 py-0.5 text-[10px] font-semibold leading-tight text-token-accent sm:right-4 sm:top-4 sm:px-2.5 sm:text-xs">
                  {feature.badge}
                </span>
              ) : null}
              <FeatureIcon title={feature.title} />
              <div className={feature.wide ? 'lg:mt-0 mt-3 sm:mt-4' : 'mt-3 sm:mt-4'}>
                <h3 className="text-base font-semibold text-token-primary sm:text-lg">{feature.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-token-secondary sm:mt-2 sm:text-sm">
                  {feature.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
