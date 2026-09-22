import type { User } from '@/types';

export function premiumPlansSubtitle(user: User | null | undefined): string {
  if (!user?.isPremium) return 'Upgrade to unlock all features';
  return user.subscription?.summaryLine ?? 'You have Premium';
}
