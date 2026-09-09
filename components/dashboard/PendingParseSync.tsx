'use client';

import { useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { DASHBOARD_REFRESH_EVENT } from '@/lib/events';
import { usePendingStore } from '@/store/pendingStore';

export function PendingParseSync() {
  const items = usePendingStore((s) => s.items);
  const removeByJobId = usePendingStore((s) => s.removeByJobId);
  const ticking = useRef(false);

  useEffect(() => {
    const poll = async () => {
      if (ticking.current) return;
      const jobs = [...new Set(usePendingStore.getState().items.map((p) => p.jobId).filter(Boolean))];
      if (jobs.length === 0) return;
      ticking.current = true;
      try {
        for (const jobId of jobs) {
          try {
            const res = await api.getParseJobStatus(jobId);
            if (res.data?.status === 'completed') {
              removeByJobId(jobId);
              window.dispatchEvent(new CustomEvent(DASHBOARD_REFRESH_EVENT));
            }
          } catch {
            // ignore missing jobs
          }
        }
      } finally {
        ticking.current = false;
      }
    };

    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [items, removeByJobId]);

  return null;
}
