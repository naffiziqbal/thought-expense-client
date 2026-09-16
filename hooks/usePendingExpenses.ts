'use client';

import { useMemo } from 'react';
import type { PendingExpense } from '@/lib/pendingExpenses';
import { outboxToPending, useOutboxStore } from '@/store/outboxStore';
import { usePendingStore } from '@/store/pendingStore';

/**
 * Every expense the user has saved but the server hasn't confirmed: parse jobs
 * in flight plus anything queued while offline. Pages treat both the same.
 */
export function usePendingExpenses(): PendingExpense[] {
  const inFlight = usePendingStore((s) => s.items);
  const batches = useOutboxStore((s) => s.batches);

  return useMemo(() => [...inFlight, ...outboxToPending(batches)], [batches, inFlight]);
}
