import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { PendingExpense } from '@/lib/pendingExpenses';

interface PendingState {
  items: PendingExpense[];
  enqueue: (items: PendingExpense[]) => void;
  removeByJobId: (jobId: string) => void;
  clear: () => void;
}

export const usePendingStore = create<PendingState>()(
  persist(
    (set) => ({
      items: [],
      enqueue: (incoming) =>
        set((s) => ({
          items: [
            ...incoming,
            ...s.items.filter((p) => !incoming.some((n) => n.localId === p.localId || n.jobId === p.jobId)),
          ],
        })),
      removeByJobId: (jobId) => set((s) => ({ items: s.items.filter((p) => p.jobId !== jobId) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'thoughtexpense-pending',
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
