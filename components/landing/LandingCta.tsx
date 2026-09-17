import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { landingCta, platforms } from '@/lib/landingContent';

export function LandingCta() {
  return (
    <section className="border-b border-token bg-token-card px-4 py-20 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-token-primary md:text-4xl">
            {landingCta.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-token-secondary">{landingCta.body}</p>
          <ul className="mt-6 space-y-3 text-token-secondary">
            {landingCta.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-token-accent" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-token bg-token-surface p-8">
          <p className="text-sm font-medium text-token-muted">Available on</p>
          <div className="mt-4 space-y-3">
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className={`flex items-center justify-between rounded-xl border border-token px-4 py-3 ${
                  platform.available ? 'bg-token-card' : 'opacity-60'
                }`}
              >
                <div>
                  <p className="font-semibold text-token-primary">{platform.name}</p>
                  <p className="text-xs text-token-secondary">{platform.detail}</p>
                </div>
                <span className="text-xs font-medium text-token-accent">
                  {platform.available ? 'Live' : 'Soon'}
                </span>
              </div>
            ))}
          </div>
          <Link href="/auth/signup" className="mt-8 block">
            <Button className="w-full rounded-full bg-token-accent py-4 text-white hover:opacity-90">
              Create free account
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
