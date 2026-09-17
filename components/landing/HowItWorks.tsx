import { howItWorks } from '@/lib/landingContent';
import { TransformationShowcase } from '@/components/landing/TransformationShowcase';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-token bg-token-card px-4 py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-token-primary md:text-4xl">
            {howItWorks.title}
          </h2>
          <p className="mt-3 text-lg text-token-secondary">{howItWorks.subtitle}</p>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {howItWorks.steps.map((item) => (
            <li
              key={item.step}
              className="rounded-2xl border border-token bg-token-surface p-6"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-primary)]/10 text-sm font-bold text-token-accent">
                {item.step}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-token-primary">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-token-secondary">{item.description}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 rounded-3xl border border-token bg-token-surface p-6 md:p-10">
          <p className="mb-8 text-center text-sm font-medium text-token-muted">
            Example: one messy note becomes categorized totals
          </p>
          <TransformationShowcase />
        </div>
      </div>
    </section>
  );
}
