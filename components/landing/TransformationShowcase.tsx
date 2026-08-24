'use client';

const RESULT_ROWS = [
  { label: 'Food', amount: '1,350.00', dot: 'bg-amber-600' },
  { label: 'Transport', amount: '220.00', dot: 'bg-blue-600' },
  { label: 'Entertainment', amount: '15.49', dot: 'bg-indigo-500' },
  { label: 'Healthcare', amount: '85.00', dot: 'bg-green-600' },
  { label: 'Personal Care', amount: '1,200.00', dot: 'bg-pink-600' },
];

export function TransformationShowcase() {
  return (
    <div className="grid items-center gap-8 md:grid-cols-[1fr,auto,1fr]">
      {/* Left: brain dump */}
      <div className="rounded-3xl border border-token bg-[var(--background-tag)] p-7 text-left shadow-sm">
        <p className="text-base leading-loose text-token-secondary">
          lunch with sam 450&hellip;
          <br />
          uber home 220, netflix 15.49
          <br />
          groceries 900 and pharmacy 85
          <br />
          gym membership 1200
        </p>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <svg className="h-10 w-10 rotate-90 text-token-accent md:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14" />
          <path d="M13 6l6 6-6 6" />
        </svg>
      </div>

      {/* Right: sorted result */}
      <div className="space-y-3.5 rounded-3xl border border-token bg-token-card p-7 shadow-md">
        {RESULT_ROWS.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${row.dot}`} />
              <span className="text-[15px] font-semibold text-token-primary">{row.label}</span>
            </span>
            <span className="text-[15px] font-bold text-token-primary">{row.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
