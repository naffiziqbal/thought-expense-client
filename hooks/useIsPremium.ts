import { useAuthStore } from '@/store/authStore';

export function useIsPremium(): boolean {
  const user = useAuthStore((state) => state.user);
  return user?.isPremium ?? false;
}
