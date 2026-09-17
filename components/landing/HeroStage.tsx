'use client';

import { useState } from 'react';
import { MagicInputHero } from '@/components/landing/MagicInputHero';
import { PennySpeech } from '@/components/landing/PennySpeech';
import { pennyMessages } from '@/lib/landingContent';

type ParseState = {
  visible: boolean;
  rowCount: number;
  total: number;
};

function formatTotal(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function HeroStage() {
  const [parsed, setParsed] = useState<ParseState>({ visible: false, rowCount: 0, total: 0 });

  return (
    <div className="hero-stage relative mx-auto w-full max-w-lg pb-10 lg:max-w-none lg:mx-0">
      <PennySpeech
        message={pennyMessages.heroIntro}
        size={52}
        mascotSide="left"
        className="mb-5"
        delayMs={0}
      />

      <div className="hero-stage-shell">
        <div className="hero-stage-frame overflow-hidden rounded-2xl border border-token/80 bg-token-card shadow-[0_24px_64px_-16px_rgba(14,148,136,0.22)] ring-1 ring-[var(--accent-primary)]/10">
          <div className="flex items-center gap-3 border-b border-token bg-[var(--background-primary)]/70 px-4 py-2.5 backdrop-blur-sm">
            <div className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/75" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/75" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/75" />
            </div>
            <p className="flex-1 truncate text-center text-[11px] font-medium text-token-muted">
              Quick Log
            </p>
            <span className="rounded-full bg-[var(--accent-primary)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-token-accent">
              Live
            </span>
          </div>

          <MagicInputHero variant="embedded" onParseStateChange={setParsed} className="w-full" />
        </div>
      </div>

      <div
        className={`hero-parsed-chip pointer-events-none absolute -bottom-3 left-4 right-4 mx-auto flex max-w-xs items-center justify-center gap-2 rounded-full border border-token bg-token-card px-4 py-2 shadow-lg transition-all duration-300 sm:left-auto sm:right-6 sm:mx-0 ${
          parsed.visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
        aria-hidden={!parsed.visible}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-primary)]/15 text-[10px] text-token-accent">
          ✓
        </span>
        <span className="text-xs font-semibold text-token-primary">
          {parsed.rowCount} {parsed.rowCount === 1 ? 'expense' : 'expenses'} · {formatTotal(parsed.total)}
        </span>
      </div>
    </div>
  );
}
