'use client';

/** Ad slot for Free users. Renders a placeholder until real ads are integrated. */
export function AdPlaceholder() {
  return (
    <div className="rounded-2xl border border-token bg-token-card p-4 sm:p-6 text-center">
      <p className="text-xs font-medium text-token-muted uppercase tracking-wider mb-1">Sponsored</p>
      <div className="h-12 rounded-lg bg-[var(--blueGray-100)] flex items-center justify-center mb-2">
        <span className="text-token-muted text-sm">Ad placeholder</span>
      </div>
      <p className="text-xs text-token-muted">Upgrade to Premium for an ad-free experience</p>
    </div>
  );
}
