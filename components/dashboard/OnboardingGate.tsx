'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore } from '@/store/onboardingStore';

/** Sends new signups to onboarding before other dashboard routes. */
export function OnboardingGate() {
  const router = useRouter();
  const pathname = usePathname();
  const userId = useAuthStore((s) => s.user?.id);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const needsOnboarding = useOnboardingStore((s) => s.needsOnboarding);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    if (pathname?.startsWith('/dashboard/onboarding')) return;
    if (needsOnboarding(userId)) {
      router.replace('/dashboard/onboarding');
    }
  }, [isAuthenticated, needsOnboarding, pathname, router, userId]);

  return null;
}
