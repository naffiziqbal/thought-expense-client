'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Mascot } from '@/components/tour/Mascot';
import {
  footerContent,
  footerExamples,
  parseFooterInput,
  type FooterParsedRow,
} from '@/lib/footerPlayground';

function formatAmount(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function FooterPlayground() {
  const [input, setInput] = useState('');
  const [debounced, setDebounced] = useState('');
  const [poseKey, setPoseKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(input), 280);
    return () => clearTimeout(timer);
  }, [input]);

  const rows = useMemo(() => parseFooterInput(debounced), [debounced]);
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const isTyping = input !== debounced;
  const hasInput = debounced.trim().length > 0;

  const pennyLine = useMemo(() => {
    if (isTyping) return footerContent.pennyParsing;
    if (rows.length > 0) return footerContent.pennyParsed(rows.length);
    if (hasInput) return footerContent.pennyIdle;
    return footerContent.pennyEmpty;
  }, [hasInput, isTyping, rows.length]);

  useEffect(() => {
    if (rows.length > 0 && !isTyping) setPoseKey((k) => k + 1);
  }, [rows.length, isTyping]);

  return (
    <div className="footer-playground relative overflow-hidden rounded-2xl border border-token bg-token-card p-5 shadow-sm sm:p-6">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--accent-primary)]/10 blur-2xl"
        aria-hidden
      />

      <p className="text-sm font-semibold text-token-primary">{footerContent.playgroundTitle}</p>
      <p className="mt-1 text-xs text-token-muted">{footerContent.playgroundHint}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {footerExamples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setInput(example)}
            className="footer-example-chip rounded-full border border-token bg-token-surface px-3 py-1 text-xs font-medium text-token-secondary transition-colors hover:border-[var(--accent-primary)]/40 hover:text-token-accent"
          >
            {example}
          </button>
        ))}
      </div>

      <label className="mt-4 block">
        <span className="sr-only">Try logging an expense</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="coffee 120, uber 250"
          className="w-full rounded-xl border border-token bg-token-surface px-4 py-3 text-sm text-token-primary outline-none transition-shadow placeholder:text-token-muted focus:border-[var(--accent-primary)]/50 focus:ring-2 focus:ring-[var(--accent-primary)]/15"
          autoComplete="off"
          spellCheck={false}
        />
      </label>

      <div
        className={`mt-3 min-h-[4.5rem] transition-all duration-300 ${
          rows.length > 0 ? 'opacity-100' : 'opacity-70'
        }`}
      >
        {rows.length > 0 ? (
          <ul className="space-y-2">
            {rows.map((row: FooterParsedRow, i) => (
              <li
                key={`${row.label}-${row.amount}`}
                className="footer-row-in flex items-center gap-2 rounded-lg bg-token-surface px-3 py-2"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <span className="flex-1 truncate text-sm font-medium text-token-primary">{row.label}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${row.chip}`}>
                  {row.category}
                </span>
                <span className="w-16 shrink-0 text-right text-sm font-bold tabular-nums text-token-primary">
                  -{formatAmount(row.amount)}
                </span>
              </li>
            ))}
            <li className="flex items-center justify-between border-t border-token pt-2 text-xs font-semibold text-token-muted">
              <span>{rows.length} parsed locally</span>
              <span className="tabular-nums text-token-primary">-{formatAmount(total)}</span>
            </li>
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-token px-3 py-4 text-center text-xs text-token-muted">
            {hasInput && !isTyping
              ? 'Add an amount after each item — e.g. coffee 120'
              : 'Parsed rows appear here instantly'}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-token pt-4">
        <div className="flex items-end gap-2">
          <Mascot size={44} poseKey={poseKey} className="penny-mascot shrink-0" />
          <p className="max-w-[14rem] text-xs leading-snug text-token-secondary">{pennyLine}</p>
        </div>
        {rows.length > 0 ? (
          <Link
            href="/auth/signup"
            className="footer-save-link shrink-0 rounded-full bg-token-accent px-4 py-2 text-xs font-semibold text-white transition-transform hover:opacity-90 active:scale-95"
          >
            Save for real →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
