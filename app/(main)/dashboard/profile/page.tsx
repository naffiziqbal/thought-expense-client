'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { premiumPlansSubtitle } from '@/lib/subscription';
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useIsPremium } from '@/hooks/useIsPremium';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { getImageUrl } from '@/lib/utils';

const UserIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CrownIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l2.5 8.5H22l-5.5 4 2.5 8-7-5.5L5 22l2.5-8L2 10.5h7.5L12 2z" />
  </svg>
);

const WalletIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0h.5a2.5 2.5 0 002.5-2.5V3.935M12 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const DeviceSettingsIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const BellIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 5.165 6 7.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1h6z" />
  </svg>
);

const RepeatIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M20 9A8 8 0 006.34 6.34M4 15a8 8 0 0013.66 2.66" />
  </svg>
);

const LogOutIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const LifebuoyIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3.5" />
    <path strokeLinecap="round" d="M5.6 5.6l3.9 3.9M18.4 5.6l-3.9 3.9M5.6 18.4l3.9-3.9M18.4 18.4l-3.9-3.9" />
  </svg>
);

const ChevronIcon = () => (
  <svg className="h-5 w-5 text-token-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

interface MenuItemProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  href?: string;
  isLast?: boolean;
  comingSoon?: boolean;
  onComingSoonClick?: (title: string) => void;
  /** Rows that act in place rather than navigate (e.g. replaying the tour). */
  onClick?: () => void;
}

function MenuItem({ icon, iconBg, iconColor, title, subtitle, href, isLast, comingSoon, onComingSoonClick, onClick }: MenuItemProps) {
  const content = (
    <>
      <div className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-token-primary">{title}</h3>
        <p className="text-sm text-token-secondary truncate">{subtitle}</p>
      </div>
      <ChevronIcon />
    </>
  );

  const rowClass = `flex h-[64px] sm:h-[72px] w-full items-center gap-3 sm:gap-4 px-3 sm:px-4 text-left transition-colors hover:bg-[var(--surface-hover)] active:bg-[var(--surface-hover)] ${
    !isLast ? 'border-b border-token' : ''
  }`;

  if (comingSoon || onClick) {
    return (
      <button
        type="button"
        onClick={() => (comingSoon ? onComingSoonClick?.(title) : onClick?.())}
        className={rowClass}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={href ?? '#'} className={rowClass}>
      {content}
    </Link>
  );
}

export default function ProfilePage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const { user, logout } = useAuthStore();
  const isPremium = useIsPremium();
  const router = useRouter();
  const [comingSoonModal, setComingSoonModal] = useState<string | null>(null);
  const startTour = useOnboardingStore((s) => s.start);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-token-surface">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent-primary)] border-r-transparent" />
          <p className="text-token-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  const generalItems = [
    {
      icon: <UserIcon />,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      title: 'Edit Profile',
      subtitle: 'Update name & avatar',
      href: '/dashboard/profile/edit',
      comingSoon: false,
    },
    {
      icon: <CrownIcon />,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      title: 'Premium Plans',
      subtitle: premiumPlansSubtitle(user),
      href: '/dashboard/premium',
      comingSoon: false,
    },
  ];

  const appItems: Array<Omit<MenuItemProps, 'isLast' | 'onComingSoonClick'>> = [
    {
      icon: <LifebuoyIcon />,
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
      title: 'Replay the tour',
      subtitle: 'Let Penny walk you through it again',
      // The overlay navigates to each step's page itself.
      onClick: startTour,
    },
    {
      icon: <BellIcon />,
      iconBg: 'bg-pink-50',
      iconColor: 'text-pink-600',
      title: 'Notifications',
      subtitle: 'Budget alerts & briefings',
      href: '/dashboard/notifications',
      comingSoon: false,
    },
    {
      icon: <RepeatIcon />,
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      title: 'Recurring',
      subtitle: 'Auto-log subscriptions & bills',
      href: '/dashboard/recurring',
      comingSoon: false,
    },
    {
      icon: <WalletIcon />,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      title: 'Accounts',
      subtitle: 'Manage bank & cash',
      href: '/dashboard/accounts',
      comingSoon: true,
    },
    {
      icon: <DeviceSettingsIcon />,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      title: 'Device Settings',
      subtitle: 'Dark mode & appearance',
      href: '/dashboard/settings/device',
      comingSoon: false,
    },
    {
      icon: <GlobeIcon />,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      title: 'Currencies',
      subtitle: `${user?.currency || 'USD'} and more`,
      href: '/dashboard/currencies',
      comingSoon: false,
    },
  ];

  const securityItems = [
    {
      icon: <ShieldIcon />,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      title: 'Security',
      subtitle: 'Change password & PIN',
      href: '/dashboard/security',
      comingSoon: false,
    },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-token-surface pb-8">
        {/* A. Island Header */}
        <div className="relative z-10 rounded-b-3xl bg-token-card px-4 sm:px-6 pb-6 sm:pb-8 pt-6 sm:pt-8 shadow-sm border-b border-token">
          {/* Logout icon - top right */}
          <button
            onClick={handleLogout}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full text-token-secondary hover:text-red-500 hover:bg-red-50 transition-colors"
            aria-label="Logout"
          >
            <LogOutIcon />
          </button>

          <div className="flex flex-col items-center">
            {/* Avatar with Badge */}
            <div className="relative mb-4">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-token-accent flex items-center justify-center shadow-md overflow-hidden relative">
                {getImageUrl(user?.profilePicture || user?.profilePictureUrl) ? (
                  <Image
                    src={getImageUrl(user?.profilePicture || user?.profilePictureUrl)!}
                    alt="Profile"
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <span className={`absolute -bottom-1 -right-1 rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold ${
                isPremium ? 'bg-amber-100 text-amber-800' : 'bg-[var(--blueGray-200)] text-token-secondary'
              }`}>
                {isPremium ? 'PREMIUM' : 'FREE'}
              </span>
            </div>

            {/* Identity */}
            <h1 className="text-lg sm:text-xl font-bold text-token-primary">
              {user?.name || 'User'}
            </h1>
            {isPremium && user?.subscription?.summaryLine ? (
              <p className="mt-2 text-sm text-token-secondary text-center max-w-xs">
                {user.subscription.summaryLine}
              </p>
            ) : null}
            <p className="mt-1 text-xs text-token-muted font-mono">
              ID: {user?.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* B. Settings Body */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-6">
          {/* General */}
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-token-muted">
            General
          </p>
          <div className="mb-4 sm:mb-6 overflow-hidden rounded-2xl bg-token-card shadow-sm border border-token">
            {generalItems.map((item, i) => (
              <MenuItem
                key={item.title}
                {...item}
                isLast={i === generalItems.length - 1}
                onComingSoonClick={setComingSoonModal}
              />
            ))}
          </div>

          {/* App Settings */}
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-token-muted">
            App Settings
          </p>
          <div className="mb-4 sm:mb-6 overflow-hidden rounded-2xl bg-token-card shadow-sm border border-token">
            {appItems.map((item, i) => (
              <MenuItem
                key={item.title}
                {...item}
                isLast={i === appItems.length - 1}
                onComingSoonClick={setComingSoonModal}
              />
            ))}
          </div>

          {/* Security */}
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-token-muted">
            Security
          </p>
          <div className="mb-6 overflow-hidden rounded-2xl bg-token-card shadow-sm border border-token">
            {securityItems.map((item, i) => (
              <MenuItem
                key={item.title}
                {...item}
                isLast={i === securityItems.length - 1}
                onComingSoonClick={setComingSoonModal}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Coming Soon Modal */}
      <Modal
        isOpen={!!comingSoonModal}
        onClose={() => setComingSoonModal(null)}
        title={comingSoonModal ? `${comingSoonModal} - Coming soon!` : ''}
        footer={
          <Button onClick={() => setComingSoonModal(null)} className="w-full">
            OK
          </Button>
        }
      >
        <p className="text-token-secondary">This feature is under development. Check back soon!</p>
      </Modal>
    </DashboardLayout>
  );
}
