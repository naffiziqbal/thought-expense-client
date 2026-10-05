import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { HeroStage } from '@/components/landing/HeroStage';
import { PlayStoreDownloadLink } from '@/components/marketing/PlayStoreDownloadLink';
import { landingHero } from '@/lib/landingContent';

const TRUST_PILLS = ['Free forever', 'No card required', 'Web + Android'];

export function LandingHero() {
  const [headlineLead, headlineAccent] = landingHero.headline.split('\n');

  return (
    <section className="relative overflow-hidden border-b border-token">
      {/* Atmospheric background */}
      <div className="pointer-events-none absolute inset-0 bg-grid-mesh opacity-50" aria-hidden />
      <div
        className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-[var(--accent-primary)]/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.08fr] lg:gap-10 xl:gap-14">
          <div className="min-w-0 text-center lg:text-left">
            <span className="inline-flex items-center rounded-full border border-[var(--accent-primary)]/25 bg-[var(--accent-primary)]/8 px-3 py-1 text-xs font-semibold text-token-accent">
              {landingHero.eyebrow}
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-[1.06] tracking-tight text-token-primary sm:text-5xl lg:text-[3.35rem]">
              {headlineLead}
              <span className="mt-1 block bg-gradient-to-r from-[var(--accent-primary)] via-teal-400 to-[var(--accent-primary)] bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient">
                {headlineAccent}
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-relaxed text-token-secondary lg:mx-0 mx-auto">
              {landingHero.subhead}
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap lg:justify-start">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="rounded-full bg-token-accent px-8 py-4 text-base font-semibold text-white shadow-lg shadow-teal-600/20 hover:opacity-90"
                >
                  {landingHero.cta}
                </Button>
              </Link>
              <PlayStoreDownloadLink />
              <Link
                href="/#how-it-works"
                className="text-sm font-semibold text-token-muted transition-colors hover:text-token-accent"
              >
                How it works
              </Link>
            </div>

            <ul className="mt-6 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              {TRUST_PILLS.map((pill) => (
                <li
                  key={pill}
                  className="rounded-full border border-token bg-token-card/80 px-3 py-1 text-xs font-medium text-token-secondary backdrop-blur-sm"
                >
                  {pill}
                </li>
              ))}
            </ul>
          </div>

          <HeroStage />
        </div>
      </div>
    </section>
  );
}
