'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore } from '@/store/onboardingStore';

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const userId = useAuthStore((s) => s.user?.id);
  const complete = useOnboardingStore((s) => s.complete);
  const needsOnboarding = useOnboardingStore((s) => s.needsOnboarding);

  const finish = useCallback(() => {
    if (userId) complete(userId);
    router.replace('/dashboard/add');
  }, [complete, router, userId]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-token-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-token-accent border-t-transparent" />
      </div>
    );
  }

  if (userId && !needsOnboarding(userId)) {
    router.replace('/dashboard');
    return null;
  }

  return <OnboardingFlow onComplete={finish} />;
}
