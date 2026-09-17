'use client';

import { MagicInputHero } from '@/components/landing/MagicInputHero';
import { PennySpeech } from '@/components/landing/PennySpeech';
import { pennyMessages } from '@/lib/landingContent';

export function HeroDemoWithPenny() {
  return (
    <div className="relative">
      <div
        className="absolute -inset-4 rounded-[2rem] bg-[var(--accent-primary)]/5 blur-2xl"
        aria-hidden
      />
      <MagicInputHero />
      <div className="absolute -bottom-3 left-0 z-10 hidden sm:block md:-left-4 lg:-bottom-6">
        <PennySpeech message={pennyMessages.demoHint} size={68} delayMs={400} />
      </div>
    </div>
  );
}
