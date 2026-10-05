'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PennySpeech } from '@/components/landing/PennySpeech';
import { PlayStoreDownloadLink } from '@/components/marketing/PlayStoreDownloadLink';
import { PLAY_STORE_URL } from '@/lib/appLinks';
import { landingCta, pennyMessages, platforms } from '@/lib/landingContent';

export function CtaWithPenny() {
  return (
    <section className="border-b border-token bg-token-card px-4 py-20 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <PennySpeech
            message={pennyMessages.cta}
            size={64}
            mascotSide="left"
            className="mb-8"
            delayMs={0}
          />
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
            {platforms.map((platform) => {
              const row = (
                <>
                  <div>
                    <p className="font-semibold text-token-primary">{platform.name}</p>
                    <p className="text-xs text-token-secondary">{platform.detail}</p>
                  </div>
                  <span className="text-xs font-medium text-token-accent">
                    {platform.available ? 'Live' : 'Soon'}
                  </span>
                </>
              );
              const className = `flex items-center justify-between rounded-xl border border-token px-4 py-3 ${
                platform.available ? 'bg-token-card' : 'opacity-60'
              }`;
              if (platform.name === 'Android' && platform.available) {
                return (
                  <a
                    key={platform.name}
                    href={PLAY_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${className} transition-colors hover:border-[var(--accent-primary)]/40`}
                  >
                    {row}
                  </a>
                );
              }
              return (
                <div key={platform.name} className={className}>
                  {row}
                </div>
              );
            })}
          </div>
          <Link href="/auth/signup" className="mt-8 block">
            <Button className="w-full rounded-full bg-token-accent py-4 text-white hover:opacity-90">
              Create free account
            </Button>
          </Link>
          <div className="mt-4 flex justify-center">
            <PlayStoreDownloadLink className="w-full max-w-sm justify-center sm:w-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
