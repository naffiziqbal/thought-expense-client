'use client';

import { useState, useEffect, useRef } from 'react';

type Row = {
  label: string;
  category: string;
  amount: string;
  icon: 'cup' | 'car' | 'bag' | 'home' | 'film' | 'health' | 'sparkle';
  chip: string;
  bubble: string;
};

const ICON_PATHS: Record<Row['icon'], React.ReactNode> = {
  cup: (
    <>
      <path d="M17 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      <path d="M7 9h10a4 4 0 0 1 0 8h-0.5" />
      <path d="M7 9v6a4 4 0 0 0 8 0V9" />
    </>
  ),
  car: (
    <>
      <path d="M4 16v-3l2-5h12l2 5v3z" />
      <circle cx="7.5" cy="16" r="0.5" />
      <circle cx="16.5" cy="16" r="0.5" />
    </>
  ),
  bag: (
    <>
      <path d="M6 8h12l-1.2 12H7.2z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </>
  ),
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </>
  ),
  film: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8.5 5v14" />
      <path d="M15.5 5v14" />
    </>
  ),
  health: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8.5v7" />
      <path d="M8.5 12h7" />
    </>
  ),
  sparkle: <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z" />,
};

const CHIP = {
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
  indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300',
  green: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300',
};

const DEMOS: { text: string; rows: Row[] }[] = [
  {
    text: 'coffee 120, uber 250 and groceries 900',
    rows: [
      { label: 'Coffee', category: 'Food', amount: '-120.00', icon: 'cup', chip: CHIP.amber, bubble: CHIP.amber },
      { label: 'Uber', category: 'Transport', amount: '-250.00', icon: 'car', chip: CHIP.blue, bubble: CHIP.blue },
      { label: 'Groceries', category: 'Food', amount: '-900.00', icon: 'bag', chip: CHIP.amber, bubble: CHIP.amber },
    ],
  },
  {
    text: 'rent 5000 and netflix 15.49',
    rows: [
      { label: 'Rent', category: 'Rent', amount: '-5,000.00', icon: 'home', chip: CHIP.red, bubble: CHIP.red },
      { label: 'Netflix', category: 'Entertainment', amount: '-15.49', icon: 'film', chip: CHIP.indigo, bubble: CHIP.indigo },
    ],
  },
  {
    text: 'pharmacy 85, gym membership 1200',
    rows: [
      { label: 'Pharmacy', category: 'Healthcare', amount: '-85.00', icon: 'health', chip: CHIP.green, bubble: CHIP.green },
      { label: 'Gym membership', category: 'Personal Care', amount: '-1,200.00', icon: 'sparkle', chip: CHIP.orange, bubble: CHIP.orange },
    ],
  },
];

function parseAmount(amount: string) {
  return Math.abs(parseFloat(amount.replace(/,/g, ''))) || 0;
}

type ParseState = {
  visible: boolean;
  rowCount: number;
  total: number;
};

type MagicInputHeroProps = {
  className?: string;
  variant?: 'default' | 'embedded';
  onParseStateChange?: (state: ParseState) => void;
};

export function MagicInputHero({
  className = 'mx-auto w-full max-w-2xl',
  variant = 'default',
  onParseStateChange,
}: MagicInputHeroProps) {
  const [demoIndex, setDemoIndex] = useState(0);
  const [visibleText, setVisibleText] = useState('');
  const [rowsVisible, setRowsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const charIndexRef = useRef(0);

  const demo = DEMOS[demoIndex];
  const isEmbedded = variant === 'embedded';

  useEffect(() => {
    if (!rowsVisible) {
      onParseStateChange?.({ visible: false, rowCount: 0, total: 0 });
      return;
    }

    const total = demo.rows.reduce((sum, row) => sum + parseAmount(row.amount), 0);
    onParseStateChange?.({ visible: true, rowCount: demo.rows.length, total });
  }, [rowsVisible, demo.rows, onParseStateChange]);

  useEffect(() => {
    charIndexRef.current = 0;

    const typeNext = () => {
      const idx = charIndexRef.current;
      if (idx < demo.text.length) {
        setVisibleText(demo.text.slice(0, idx + 1));
        charIndexRef.current = idx + 1;
        timerRef.current = setTimeout(typeNext, 45);
      } else {
        setRowsVisible(true);
        timerRef.current = setTimeout(() => {
          setRowsVisible(false);
          setVisibleText('');
          setDemoIndex((i) => (i + 1) % DEMOS.length);
        }, 3200);
      }
    };

    timerRef.current = setTimeout(typeNext, 150);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [demoIndex, demo.text]);

  const cardClass = isEmbedded
    ? 'text-left'
    : 'overflow-hidden rounded-3xl border border-token bg-token-card text-left shadow-lg';

  return (
    <div className={className}>
      <div className={cardClass}>
        <div
          className={`relative ${
            isEmbedded
              ? 'min-h-[76px] bg-[var(--background-primary)]/40 px-5 py-5'
              : 'min-h-[68px] px-7 py-5'
          } text-lg text-token-primary`}
        >
          {isEmbedded ? (
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-token-muted">
              Type naturally
            </span>
          ) : null}
          <p className="leading-snug">
            {visibleText || (isEmbedded ? (
              <span className="text-token-muted/60">coffee 120, uber 250…</span>
            ) : null)}
            <span className="animate-cursor-blink text-token-accent" aria-hidden>|</span>
          </p>
        </div>

        <div
          className={`border-t border-token transition-all duration-300 ${
            isEmbedded ? 'bg-token-card px-5' : 'px-7'
          } ${rowsVisible ? 'max-h-72 py-4 opacity-100' : 'max-h-0 overflow-hidden py-0 opacity-0'}`}
        >
          {isEmbedded && rowsVisible ? (
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-token-accent">
              Parsed & categorized
            </p>
          ) : null}
          <div className="space-y-2.5">
            {demo.rows.map((row, i) => (
              <div
                key={row.label}
                className={`flex items-center gap-3 rounded-xl px-1 py-0.5 ${
                  rowsVisible ? 'hero-row-in' : ''
                }`}
                style={rowsVisible ? { animationDelay: `${i * 80}ms` } : undefined}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${row.bubble}`}>
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    {ICON_PATHS[row.icon]}
                  </svg>
                </span>
                <span className="flex-1 truncate text-[15px] font-semibold text-token-primary">{row.label}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${row.chip}`}>
                  {row.category}
                </span>
                <span className="w-20 shrink-0 text-right text-[15px] font-bold tabular-nums text-token-primary">
                  {row.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
