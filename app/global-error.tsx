'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

/**
 * Last-resort boundary: a render error in the root layout lands here, so it is
 * also the only place those crashes can be reported from.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#F5F8F8] px-6 text-center">
        <h1 className="text-xl font-semibold text-[#101A26]">Something went wrong</h1>
        <p className="max-w-sm text-sm text-[#5B6B78]">
          We’ve been notified and are looking into it. Reloading usually fixes it.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="h-11 rounded-lg bg-[#0E9488] px-6 text-sm font-medium text-white"
        >
          Reload
        </button>
      </body>
    </html>
  );
}
