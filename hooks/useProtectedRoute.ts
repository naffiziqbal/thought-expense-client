'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function useProtectedRoute() {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth, _hasHydrated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Wait for hydration to complete
      if (!_hasHydrated) {
        return;
      }

      await checkAuth();
      setIsChecking(false);
    };

    initAuth();
  }, [_hasHydrated, checkAuth]);

  useEffect(() => {
    // Only redirect after hydration is complete and auth check is done
    if (_hasHydrated && !isChecking && !isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, isChecking, _hasHydrated, router]);

  return { 
    isAuthenticated, 
    isLoading: isLoading || isChecking || !_hasHydrated 
  };
}
