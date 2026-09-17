'use client';

import { useState } from 'react';
import { faqItems } from '@/lib/landingContent';

export function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {faqItems.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="rounded-2xl border border-token bg-token-card">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="text-base font-semibold text-token-primary">{item.q}</span>
              <svg
                className={`h-4 w-4 shrink-0 transition-transform ${
                  isOpen ? 'rotate-180 text-token-accent' : 'text-token-muted'
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {isOpen ? (
              <p className="border-t border-token px-6 pb-5 pt-4 text-sm leading-relaxed text-token-secondary">
                {item.a}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
