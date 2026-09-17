'use client';

import { Mascot } from '@/components/tour/Mascot';
import { pennyMessages } from '@/lib/landingContent';

/** Compact Penny + intro line for the hero column */
export function PennyIntro() {
  return (
    <div className="penny-intro mb-5 flex items-start gap-3 text-left lg:mx-0 mx-auto max-w-xl">
      <Mascot size={52} className="penny-mascot penny-mascot-delayed" />
      <div
        className="relative max-w-sm rounded-2xl border border-token bg-token-card px-4 py-3 shadow-sm penny-bubble-enter pt-0.5"
        style={{ animationDelay: '180ms' }}
      >
        <p className="text-sm leading-relaxed text-token-secondary">{pennyMessages.heroIntro}</p>
        <span className="penny-bubble-tail-left" aria-hidden />
      </div>
    </div>
  );
}
