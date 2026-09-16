'use client';

import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { api } from '@/lib/api';
import { DASHBOARD_REFRESH_EVENT } from '@/lib/events';
import { useAuthStore } from '@/store/authStore';
import { useOutboxStore, type OutboxBatch } from '@/store/outboxStore';
import { usePendingStore } from '@/store/pendingStore';

/** Give up after this many tries so one bad batch can't block the queue forever. */
const MAX_ATTEMPTS = 6;

async function flushBatch(batch: OutboxBatch): Promise<'sent' | 'retry' | 'drop'> {
  try {
    const res = await api.enqueueParseExpenses(
      {
        rawInput: batch.rawInput,
        create: true,
        localPreview: batch.items,
        clientBatchId: batch.id,
      },
      batch.id
    );

    // Hand off to the parse-job poller so the optimistic row survives until
    // the server confirms it.
    usePendingStore.getState().enqueue(
      batch.items.map((item, i) => ({
        localId: `${batch.id}-${i}`,
        jobId: res.data.jobId,
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
    return 'sent';
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    // 429 = rate limited, 409 = the server is still processing this same key.
    const transient = status === 429 || status === 409;
    if (status && status >= 400 && status < 500 && !transient) return 'drop';
    return batch.attempts + 1 >= MAX_ATTEMPTS ? 'drop' : 'retry';
  }
}

/** Drains the offline outbox whenever the browser is online and signed in. */
export function OutboxSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const batches = useOutboxStore((s) => s.batches);
  const isOnline = useOnlineStatus();
  const flushing = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !isOnline) return;
    if (useOutboxStore.getState().batches.length === 0) return;

    const flush = async () => {
      if (flushing.current) return;
      flushing.current = true;

      let sent = 0;
      let dropped = 0;
      try {
        for (const batch of useOutboxStore.getState().batches) {
          const outcome = await flushBatch(batch);
          if (outcome === 'sent') {
            useOutboxStore.getState().remove(batch.id);
            sent += 1;
          } else if (outcome === 'drop') {
            useOutboxStore.getState().remove(batch.id);
            dropped += 1;
          } else {
            useOutboxStore.getState().markAttempt(batch.id);
            break; // Likely still offline; wait for the next trigger.
          }
        }
      } finally {
        flushing.current = false;
      }

      if (sent > 0) {
        toast.success(sent === 1 ? 'Offline expense synced' : `${sent} offline saves synced`);
        window.dispatchEvent(new CustomEvent(DASHBOARD_REFRESH_EVENT));
      }
      if (dropped > 0) {
        toast.error(`${dropped} offline save${dropped > 1 ? 's' : ''} could not be synced`);
      }
    };

    void flush();
  }, [batches, isAuthenticated, isOnline]);

  return null;
}
