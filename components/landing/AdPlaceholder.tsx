'use client';

/** Ad slot for Free users. Renders a placeholder until real ads are integrated. */
export function AdPlaceholder() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Sponsored</p>
      <div className="h-12 rounded-lg bg-gray-200 flex items-center justify-center mb-2">
        <span className="text-gray-400 text-sm">Ad placeholder</span>
      </div>
      <p className="text-xs text-gray-400">Upgrade to Premium for an ad-free experience</p>
    </div>
  );
}
