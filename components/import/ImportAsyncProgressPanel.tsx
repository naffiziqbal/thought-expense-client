'use client';

import { IMPORT_ASYNC_STEPS, phaseToStepIndex, type ImportJobPhase } from '@/lib/importDashboard';
import { cn } from '@/lib/utils';

type Props = {
  fileName: string | null;
  phase: ImportJobPhase;
  message: string;
  progress?: number;
};

export function ImportAsyncProgressPanel({ fileName, phase, message, progress }: Props) {
  const activeStep = phaseToStepIndex(phase);
  const terminal = phase === 'failed' || phase === 'cancelled';

  return (
    <div className="space-y-4">
      {fileName ? <p className="text-xs text-token-muted truncate">{fileName}</p> : null}
      <p className="text-sm leading-relaxed text-token-primary">{message}</p>
      {typeof progress === 'number' && progress > 0 && progress < 100 ? (
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--background-primary)]">
          <div
            className="h-full rounded-full bg-token-accent transition-all duration-500"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      ) : null}
      <ol className="space-y-2">
        {IMPORT_ASYNC_STEPS.map((step, i) => {
          const done = !terminal && activeStep > i;
          const current = !terminal && activeStep === i;
          return (
            <li
              key={step.key}
              className={cn(
                'flex gap-3 rounded-card border px-3 py-2.5 text-sm',
                current && 'border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/5',
                done && 'border-token opacity-80',
                !done && !current && 'border-token opacity-50'
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-pill text-xs font-semibold',
                  done && 'bg-token-accent text-on-accent',
                  current && 'bg-[var(--accent-primary)] text-white',
                  !done && !current && 'bg-[var(--background-primary)] text-token-muted'
                )}
              >
                {done ? '✓' : i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-token-primary">{step.title}</p>
                <p className="text-xs text-token-muted">{current ? message : step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
      {!terminal ? (
        <p className="text-xs text-token-muted">This usually takes under a minute. You can leave this screen — we&apos;ll keep working.</p>
      ) : null}
    </div>
  );
}
