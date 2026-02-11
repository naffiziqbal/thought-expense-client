'use client';

import { useState } from 'react';

const FAQ_ITEMS = [
  {
    q: 'Is my data encrypted?',
    a: 'Yes. All data is encrypted at rest using industry-standard AES-256. In transit, we use TLS 1.3. Your expense data is never shared or sold.',
  },
  {
    q: 'Can I export my data and leave?',
    a: 'Absolutely. Developer accounts get CSV export. Production accounts get JSON + SQL dump. Your data is yours—no lock-in.',
  },
  {
    q: 'How does the OCR work?',
    a: 'We use Tesseract.js for receipt scanning with custom preprocessing. Typical accuracy is 99.8% on clean receipts. You can always correct entries manually.',
  },
];

export function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-200 bg-white shadow-sm"
        >
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            {item.q}
            <svg
              className={`h-4 w-4 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {open === i && (
            <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-500">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
