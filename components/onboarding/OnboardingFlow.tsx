'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { ONBOARDING_STEPS, PARSED_DEMO, TYPING_DEMO, type OnboardingStep } from '@/lib/onboardingSteps';

interface OnboardingFlowProps {
  onComplete: () => void;
}

function TypingDemo() {
  const [text, setText] = useState('');
  const [cursorOn, setCursorOn] = useState(true);

  useEffect(() => {
    let i = 0;
    const type = setInterval(() => {
      i += 1;
      setText(TYPING_DEMO.slice(0, i));
      if (i >= TYPING_DEMO.length) clearInterval(type);
    }, 70);
    const blink = setInterval(() => setCursorOn((v) => !v), 500);
    return () => {
      clearInterval(type);
      clearInterval(blink);
    };
  }, []);

  return (
    <div className="w-full rounded-2xl border border-token bg-token-card p-5 shadow-lg">
      <p className="text-xs font-medium uppercase tracking-wider text-token-muted mb-3">Quick Log</p>
      <p className="text-lg text-token-primary font-medium min-h-[1.75rem]">
        {text}
        <span className={cn('inline-block w-0.5 h-5 ml-0.5 align-middle bg-token-accent', cursorOn ? 'opacity-100' : 'opacity-0')} />
      </p>
    </div>
  );
}

function ParseDemo() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(1), 400);
    const t2 = setTimeout(() => setVisible(2), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-3">
      {PARSED_DEMO.map((item, idx) => (
        <div
          key={item.label}
          className={cn(
            'flex items-center justify-between rounded-xl border border-token bg-token-card px-4 py-3 shadow-md transition-all duration-500',
            idx < visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
        >
          <div>
            <p className="font-semibold text-token-primary">{item.label}</p>
            <p className="text-sm text-token-muted">{item.category}</p>
          </div>
          <p className="font-bold text-token-primary">${item.amount}</p>
        </div>
      ))}
    </div>
  );
}

function BudgetDemo() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setPct(42));
    return () => cancelAnimationFrame(id);
  }, []);

  const r = 40;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="w-full rounded-2xl border border-token bg-token-card p-6 shadow-lg flex flex-col items-center gap-4">
      <svg width="120" height="120" viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border-default)" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--accent-primary)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="text-center -mt-2">
        <p className="text-2xl font-bold text-token-primary">42%</p>
        <p className="text-sm text-token-muted">of monthly budget</p>
      </div>
    </div>
  );
}

function InsightsDemo() {
  const bars = [40, 72, 55, 88, 48];

  return (
    <div className="w-full rounded-2xl border border-token bg-token-card p-5 shadow-lg">
      <div className="flex items-end justify-center gap-2 h-32">
        {bars.map((h, i) => (
          <div
            key={i}
            className="w-8 rounded-t-lg bg-token-accent/80 animate-in"
            style={{
              height: `${h}%`,
              animationDelay: `${i * 100}ms`,
              animationFillMode: 'backwards',
            }}
          />
        ))}
      </div>
      <p className="text-center text-sm text-token-muted mt-4">Spending by category</p>
    </div>
  );
}

function StepDemo({ demo }: { demo: OnboardingStep['demo'] }) {
  switch (demo) {
    case 'typing':
      return <TypingDemo />;
    case 'parse':
      return <ParseDemo />;
    case 'budget':
      return <BudgetDemo />;
    case 'insights':
      return <InsightsDemo />;
  }
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const current = ONBOARDING_STEPS[step];
  const isLast = step === ONBOARDING_STEPS.length - 1;

  const goNext = useCallback(() => {
    if (isLast) {
      onComplete();
      return;
    }
    setStep((s) => s + 1);
    setAnimKey((k) => k + 1);
  }, [isLast, onComplete]);

  return (
    <div className="flex min-h-dvh flex-col bg-token-surface pt-safe pb-safe">
      <div className="flex justify-end px-5 pt-4">
        <button
          type="button"
          onClick={onComplete}
          className="text-sm font-medium text-token-muted hover:text-token-primary px-3 py-2"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 max-w-md mx-auto w-full">
        <div key={animKey} className="w-full mb-10 animate-in">
          <StepDemo demo={current.demo} />
        </div>

        <div key={`text-${animKey}`} className="text-center mb-8 animate-in">
          <h1 className="text-2xl font-bold text-token-primary mb-3">{current.title}</h1>
          <p className="text-token-secondary leading-relaxed">{current.subtitle}</p>
        </div>

        <div className="flex gap-2 mb-8">
          {ONBOARDING_STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === step ? 'w-8 bg-token-accent' : 'w-2 bg-[var(--blueGray-300)]'
              )}
            />
          ))}
        </div>

        <Button size="lg" className="w-full max-w-sm" onClick={goNext}>
          {isLast ? 'Log my first expense' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
