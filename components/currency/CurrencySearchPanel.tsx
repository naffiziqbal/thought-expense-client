'use client';

import { useMemo, useState } from 'react';
import { listIso4217CurrenciesGrouped, searchIso4217Currencies } from '@/lib/currencies';
import { CurrencyPickerList } from './CurrencyPickerList';

interface CurrencySearchPanelProps {
  selectedCode: string;
  onSelect: (code: string) => void;
  className?: string;
}

export function CurrencySearchPanel({ selectedCode, onSelect, className }: CurrencySearchPanelProps) {
  const [query, setQuery] = useState('');

  const { popular, rest, searching } = useMemo(() => {
    const q = query.trim();
    if (q) {
      return { popular: searchIso4217Currencies(q), rest: [] as ReturnType<typeof searchIso4217Currencies>, searching: true };
    }
    const grouped = listIso4217CurrenciesGrouped();
    return { popular: grouped.popular, rest: grouped.all, searching: false };
  }, [query]);

  return (
    <div className={className}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search ISO code or currency name…"
        className="mb-3 w-full rounded-control border border-token bg-[var(--background-tag)] px-3 py-2.5 text-sm text-token-primary placeholder:text-token-muted focus:border-[var(--accent-primary)] focus:outline-none"
      />
      {!searching && popular.length > 0 ? (
        <>
          <p className="mb-1 ml-1 text-[11px] font-medium uppercase tracking-wide text-token-muted">Popular</p>
          <div className="mb-3 overflow-hidden rounded-2xl border border-token bg-token-card">
            <CurrencyPickerList items={popular} selectedCode={selectedCode} onSelect={onSelect} />
          </div>
        </>
      ) : null}
      {!searching ? (
        <p className="mb-1 ml-1 text-[11px] font-medium uppercase tracking-wide text-token-muted">All ISO 4217</p>
      ) : null}
      <div className="overflow-hidden rounded-2xl border border-token bg-token-card">
        <CurrencyPickerList items={searching ? popular : rest} selectedCode={selectedCode} onSelect={onSelect} />
      </div>
    </div>
  );
}
