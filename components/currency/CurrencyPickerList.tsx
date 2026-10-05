'use client';

import { cn } from '@/lib/utils';
import type { Iso4217Currency } from '@/lib/iso4217';

interface CurrencyPickerListProps {
  items: Iso4217Currency[];
  selectedCode: string;
  onSelect: (code: string) => void;
}

export function CurrencyPickerList({ items, selectedCode, onSelect }: CurrencyPickerListProps) {
  return (
    <>
      {items.map((currency, i) => {
        const active = selectedCode === currency.code;
        return (
          <button
            key={currency.code}
            type="button"
            onClick={() => onSelect(currency.code)}
            className={cn(
              'flex w-full items-center gap-3 px-3 py-3 text-left transition-colors',
              active && 'bg-token-accent-soft',
              i < items.length - 1 && 'border-b border-token'
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-icon bg-[var(--background-primary)] text-xl">
              {currency.flag}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-token-primary">{currency.code}</p>
              <p className="truncate text-xs text-token-muted">{currency.name}</p>
            </div>
            <span className="shrink-0 text-sm text-token-muted">{currency.symbol}</span>
            <span
              className={cn(
                'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2',
                active ? 'border-token-accent bg-token-accent text-on-accent' : 'border-token'
              )}
            >
              {active ? (
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : null}
            </span>
          </button>
        );
      })}
    </>
  );
}
