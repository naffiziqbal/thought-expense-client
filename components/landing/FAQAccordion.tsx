'use client';

import { useState } from 'react';

const FAQ_ITEMS = [
  {
    q: "What's included in Free?",
    a: 'Free gets you natural language text input, 3 months of expense history, monthly AI insights, and multi-currency support. Upgrade to Premium for receipt scanning, full history, export (CSV/PDF), and daily & weekly insights.',
  },
  {
    q: 'Is my data encrypted?',
    a: 'Yes. All data is encrypted at rest using industry-standard AES-256. In transit, we use TLS 1.3. Your expense data is never shared or sold.',
  },
  {
    q: 'Can I export my data?',
    a: 'Premium users can export expenses as CSV or PDF anytime. Free users can upgrade to Premium to unlock export. Your data is yours—no lock-in.',
  },
  {
    q: 'How does receipt scanning work?',
    a: 'Premium users can snap or upload receipts in the Android app. AI vision extracts every line item, and you can always correct entries manually.',
  },
];

export function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3.5">
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="rounded-2xl border border-token bg-token-card shadow-sm">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-7 py-5 text-left"
            >
              <span className="text-[17px] font-semibold text-token-primary">{item.q}</span>
              <svg
                className={`h-[18px] w-[18px] shrink-0 transition-transform ${
                  isOpen ? 'rotate-180 text-token-accent' : 'text-token-muted'
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                viewBox="0 0 24 24"
              >
                {isOpen ? <path d="M6 9l6 6 6-6" /> : <><path d="M12 5v14" /><path d="M5 12h14" /></>}
              </svg>
            </button>
            {isOpen && (
              <p className="px-7 pb-6 text-[15px] leading-relaxed text-token-secondary">{item.a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
