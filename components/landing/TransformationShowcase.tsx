'use client';

export function TransformationShowcase() {
  return (
    <div className="grid gap-8 md:grid-cols-[1fr,auto,1fr] md:items-center">
      {/* Left: Messy note */}
      <div className="rounded-3xl border border-token bg-amber-50/50 dark:bg-amber-950/30 p-8 shadow-sm">
        <p className="mb-4 text-sm font-medium text-token-secondary">You type:</p>
        <div className="rounded-2xl border border-dashed border-amber-300 dark:border-amber-700 bg-token-card p-6">
          <p className="text-lg text-token-primary italic">
            &quot;Paid 1200 for internet and 300 for snacks&quot;
          </p>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950/50">
          <svg
            className="h-6 w-6 text-teal-600 dark:text-teal-400 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>

      {/* Right: Clean result */}
      <div className="rounded-3xl border border-token bg-token-card p-8 shadow-sm">
        <p className="mb-4 text-sm font-medium text-token-accent">Instantly sorted:</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl bg-[var(--background-tag)] px-4 py-3">
            <span className="text-2xl">📶</span>
            <div className="flex-1">
              <span className="font-medium text-token-primary">Internet</span>
              <span className="ml-2 text-token-secondary">Utilities</span>
            </div>
            <span className="font-semibold text-red-500 dark:text-red-400">-1,200</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-[var(--background-tag)] px-4 py-3">
            <span className="text-2xl">🍿</span>
            <div className="flex-1">
              <span className="font-medium text-token-primary">Snacks</span>
              <span className="ml-2 text-token-secondary">Food</span>
            </div>
            <span className="font-semibold text-red-500 dark:text-red-400">-300</span>
          </div>
        </div>
      </div>
    </div>
  );
}
