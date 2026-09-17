import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { MagicInputHero } from '@/components/landing/MagicInputHero';
import { landingHero } from '@/lib/landingContent';

export function LandingHero() {
  return (
    <section className="border-b border-token bg-token-surface px-4 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr,1.05fr] lg:gap-16">
        <div className="text-center lg:text-left">
          <p className="text-sm font-semibold text-token-accent">{landingHero.eyebrow}</p>
          <h1 className="mt-4 whitespace-pre-line text-4xl font-bold leading-[1.08] tracking-tight text-token-primary sm:text-5xl lg:text-[3.25rem]">
            {landingHero.headline}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-token-secondary lg:mx-0 mx-auto">
            {landingHero.subhead}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="rounded-full bg-token-accent px-8 py-4 text-base font-semibold text-white hover:opacity-90"
              >
                {landingHero.cta}
              </Button>
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-semibold text-token-secondary hover:text-token-accent transition-colors"
            >
              See how it works
            </Link>
          </div>
          <p className="mt-4 text-sm text-token-muted">{landingHero.footnote}</p>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-[var(--accent-primary)]/5 blur-2xl" aria-hidden />
          <MagicInputHero />
        </div>
      </div>
    </section>
  );
}
