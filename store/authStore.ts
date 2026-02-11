import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
  
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      setUser: (user) => set({
        user: { ...user, isPremium: user.isPremium ?? false },
        isAuthenticated: true,
        error: null,
      }),
      
      clearUser: () => set({ user: null, isAuthenticated: false }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),

      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
      
      logout: () => {
        api.logout();
        set({ user: null, isAuthenticated: false, error: null });
      },

      checkAuth: async () => {
        // If we have a token but no user, verify with backend
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        if (!token) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        // If we already have user data from hydration, skip the API call
        const currentUser = get().user;
        if (currentUser && get()._hasHydrated) {
          set({ isAuthenticated: true, isLoading: false });
          return;
        }

        try {
          set({ isLoading: true });
          const response = await api.getCurrentUser();
          if (response.success) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          // Token is invalid, clear everything
          api.clearToken();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
