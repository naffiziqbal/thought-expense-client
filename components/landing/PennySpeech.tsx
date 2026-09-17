'use client';

import { Mascot } from '@/components/tour/Mascot';

type PennySpeechProps = {
  message: string;
  size?: number;
  /** Mascot on the left or right of the bubble */
  mascotSide?: 'left' | 'right';
  className?: string;
  delayMs?: number;
  animate?: boolean;
};

export function PennySpeech({
  message,
  size = 72,
  mascotSide = 'left',
  className = '',
  delayMs = 0,
  animate = true,
}: PennySpeechProps) {
  const mascotOnRight = mascotSide === 'right';
  const tailClass = mascotOnRight ? 'penny-bubble-tail-right' : 'penny-bubble-tail-left';

  return (
    <div
      className={`penny-speech flex items-center gap-2.5 ${
        mascotOnRight ? 'flex-row-reverse' : 'flex-row'
      } ${className}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <Mascot
        size={size}
        mirror={mascotOnRight}
        className={animate ? 'penny-mascot' : undefined}
      />
      <div
        className={`relative max-w-xs rounded-2xl border border-token bg-token-card px-4 py-3 shadow-sm ${
          animate ? 'penny-bubble-enter' : ''
        }`}
        style={{ animationDelay: `${delayMs + 120}ms` }}
      >
        <p className="text-sm leading-snug text-token-primary">{message}</p>
        <span className={tailClass} aria-hidden />
      </div>
    </div>
  );
}
