'use client';

import { useId, useRef } from 'react';
import { formatDate } from '@/lib/utils';

interface DateFieldProps {
  label?: string;
  /** ISO date YYYY-MM-DD, or empty */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  clearable?: boolean;
}

export function DateField({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  min,
  max,
  clearable,
}: DateFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const el = inputRef.current;
    if (!el) return;
    if (typeof el.showPicker === 'function') {
      el.showPicker();
    } else {
      el.focus();
      el.click();
    }
  };

  const display = value ? formatDate(value) : placeholder;

  return (
    <div>
      {label ? (
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-token-secondary">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <button
          type="button"
          onClick={openPicker}
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-token bg-token-card px-4 py-2.5 text-left text-sm transition-colors hover:border-[var(--accent-primary)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
        >
          <span className={value ? 'text-token-primary' : 'text-token-muted'}>{display}</span>
          <span className="flex shrink-0 items-center gap-2">
            {clearable && value ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange('');
                  }
                }}
                className="rounded-full p-0.5 text-token-muted hover:bg-[var(--surface-hover)] hover:text-token-secondary"
                aria-label="Clear date"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            ) : null}
            <svg className="h-5 w-5 text-token-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </span>
        </button>
        <input
          ref={inputRef}
          id={inputId}
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
          tabIndex={-1}
          aria-hidden
        />
      </div>
    </div>
  );
}
