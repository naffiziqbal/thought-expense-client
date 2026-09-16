import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { PendingExpense } from '@/lib/pendingExpenses';

export interface OutboxItem {
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  rawInput: string;
}

/** One save the user made while offline, replayed verbatim once we reconnect. */
export interface OutboxBatch {
  /** Also the idempotency key, so a retry after a timeout can't double-save. */
  id: string;
  rawInput: string;
  date: string;
  items: OutboxItem[];
  createdAt: string;
  attempts: number;
  lastError?: string;
}

const MAX_BATCHES = 100;

interface OutboxState {
  batches: OutboxBatch[];
  enqueue: (batch: Omit<OutboxBatch, 'attempts' | 'createdAt'>) => void;
  remove: (id: string) => void;
  markAttempt: (id: string, error?: string) => void;
  clear: () => void;
}

export const useOutboxStore = create<OutboxState>()(
  persist(
    (set) => ({
      batches: [],

      enqueue: (batch) =>
        set((s) => ({
          batches: [
            ...s.batches.filter((b) => b.id !== batch.id),
            { ...batch, createdAt: new Date().toISOString(), attempts: 0 },
          ].slice(-MAX_BATCHES),
        })),

      remove: (id) => set((s) => ({ batches: s.batches.filter((b) => b.id !== id) })),

      markAttempt: (id, error) =>
        set((s) => ({
          batches: s.batches.map((b) =>
            b.id === id ? { ...b, attempts: b.attempts + 1, lastError: error } : b
          ),
        })),

      clear: () => set({ batches: [] }),
    }),
    {
      name: 'thoughtexpense-outbox',
      storage: createJSONStorage(() =>
        typeof window === 'undefined'
          ? {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
          : localStorage
      ),
    }
  )
);

/**
 * Render queued-offline saves alongside in-flight parse jobs. An empty jobId
 * keeps them out of the parse-job poller, which only polls real job ids.
 */
export function outboxToPending(batches: OutboxBatch[]): PendingExpense[] {
  return batches.flatMap((batch) =>
    batch.items.map((item, i) => ({
      localId: `${batch.id}-${i}`,
      jobId: '',
      batchId: batch.id,
      description: item.description,
      amount: item.amount,
      currency: item.currency,
      category: item.category,
      date: item.date,
      rawInput: item.rawInput,
      createdAt: batch.createdAt,
    }))
  );
}
