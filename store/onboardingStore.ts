import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface OnboardingState {
  completedUserIds: string[];
  pendingUserId: string | null;
  markPending: (userId: string) => void;
  complete: (userId: string) => void;
  needsOnboarding: (userId: string | undefined) => boolean;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      completedUserIds: [],
      pendingUserId: null,

      markPending: (userId) => set({ pendingUserId: userId }),

      complete: (userId) =>
        set((s) => ({
          pendingUserId: s.pendingUserId === userId ? null : s.pendingUserId,
          completedUserIds: s.completedUserIds.includes(userId)
            ? s.completedUserIds
            : [...s.completedUserIds, userId],
        })),

      needsOnboarding: (userId) => {
        if (!userId) return false;
        const { pendingUserId, completedUserIds } = get();
        if (completedUserIds.includes(userId)) return false;
        return pendingUserId === userId;
      },
    }),
    {
      name: 'thoughtexpense-onboarding',
      storage: createJSONStorage(() =>
        typeof window === 'undefined'
          ? { getItem: () => null, setItem: () => {}, removeItem: () => {} }
          : localStorage
      ),
    }
  )
);
