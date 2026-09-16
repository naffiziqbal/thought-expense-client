import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { TOUR_STEPS } from '@/lib/tourSteps';

export interface TourRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface OnboardingState {
  /** Persisted: who has already seen the tour, and who still owes it. */
  completedUserIds: string[];
  pendingUserId: string | null;

  /** Runtime only — the tour is never resumed mid-way after a reload. */
  isActive: boolean;
  stepIndex: number;
  targets: Record<string, TourRect>;

  markPending: (userId: string) => void;
  needsTour: (userId: string | undefined) => boolean;

  start: () => void;
  next: () => void;
  back: () => void;
  finish: (userId: string | undefined) => void;

  setTargetRect: (id: string, rect: TourRect) => void;
}

const sameRect = (a: TourRect | undefined, b: TourRect): boolean =>
  !!a &&
  Math.abs(a.x - b.x) < 1 &&
  Math.abs(a.y - b.y) < 1 &&
  Math.abs(a.width - b.width) < 1 &&
  Math.abs(a.height - b.height) < 1;

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      completedUserIds: [],
      pendingUserId: null,
      isActive: false,
      stepIndex: 0,
      targets: {},

      markPending: (userId) => set({ pendingUserId: userId }),

      needsTour: (userId) => {
        if (!userId) return false;
        const { pendingUserId, completedUserIds } = get();
        if (completedUserIds.includes(userId)) return false;
        return pendingUserId === userId;
      },

      start: () => set({ isActive: true, stepIndex: 0, targets: {} }),

      next: () =>
        set((s) => ({ stepIndex: Math.min(s.stepIndex + 1, TOUR_STEPS.length - 1) })),

      back: () => set((s) => ({ stepIndex: Math.max(s.stepIndex - 1, 0) })),

      finish: (userId) =>
        set((s) => ({
          isActive: false,
          stepIndex: 0,
          targets: {},
          pendingUserId: userId && s.pendingUserId === userId ? null : s.pendingUserId,
          completedUserIds:
            userId && !s.completedUserIds.includes(userId)
              ? [...s.completedUserIds, userId]
              : s.completedUserIds,
        })),

      // Targets re-measure on scroll and resize, so skip no-op writes to avoid
      // re-rendering the overlay on every frame.
      setTargetRect: (id, rect) =>
        set((s) =>
          sameRect(s.targets[id], rect) ? s : { targets: { ...s.targets, [id]: rect } }
        ),
    }),
    {
      name: 'thoughtexpense-onboarding',
      storage: createJSONStorage(() =>
        typeof window === 'undefined'
          ? { getItem: () => null, setItem: () => {}, removeItem: () => {} }
          : localStorage
      ),
      partialize: (state) => ({
        completedUserIds: state.completedUserIds,
        pendingUserId: state.pendingUserId,
      }),
    }
  )
);
