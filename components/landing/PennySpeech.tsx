'use client';

import { Mascot } from '@/components/tour/Mascot';

type PennySpeechProps = {
  message: string;
  size?: number;
  /** Mascot on the left (default) or above the bubble */
  layout?: 'horizontal' | 'vertical';
  className?: string;
  /** Stagger entrance animations */
  delayMs?: number;
  /** Landing bob only — no tour pop */
  animate?: boolean;
};

export function PennySpeech({
  message,
  size = 72,
  layout = 'horizontal',
  className = '',
  delayMs = 0,
  animate = true,
}: PennySpeechProps) {
  const isVertical = layout === 'vertical';

  return (
    <div
      className={`penny-speech ${isVertical ? 'flex-col items-center' : 'items-end'} flex gap-3 ${className}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <Mascot size={size} className={animate ? 'penny-mascot' : undefined} />
      <div
        className={`relative max-w-64 rounded-2xl border border-token bg-token-card px-4 py-3 shadow-sm ${
          animate ? 'penny-bubble-enter' : ''
        } ${isVertical ? 'text-center' : ''}`}
        style={{ animationDelay: `${delayMs + 120}ms` }}
      >
        <p className="text-sm leading-snug text-token-primary">{message}</p>
        {!isVertical ? <span className="penny-bubble-tail" aria-hidden /> : null}
      </div>
    </div>
  );
}
