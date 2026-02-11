'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { api } from '@/lib/api';
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

const LayersIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
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

const LogOutIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const ChevronIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

interface MenuItemProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  href: string;
  isLast?: boolean;
  comingSoon?: boolean;
}

function MenuItem({ icon, iconBg, iconColor, title, subtitle, href, isLast, comingSoon }: MenuItemProps) {
  const content = (
    <>
      <div className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 truncate">{subtitle}</p>
      </div>
      <ChevronIcon />
    </>
  );

  const rowClass = `flex h-[72px] w-full items-center gap-4 px-4 text-left transition-colors active:bg-gray-50 ${
    !isLast ? 'border-b border-gray-100' : ''
  }`;

  if (comingSoon) {
    return (
      <button
        type="button"
        onClick={() => alert(`${title} - Coming soon!`)}
        className={rowClass}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className={rowClass}>
      {content}
    </Link>
  );
}

export default function ProfilePage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [transactionCount, setTransactionCount] = useState<number | null>(null);
  const [categoryCount, setCategoryCount] = useState<number>(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchStats = async () => {
      try {
        const res = await api.getCategorySummary();
        if (res.success && res.data) {
          setTransactionCount(res.data.transactionCount);
          setCategoryCount(Object.keys(res.data.byCategory).length || 0);
        }
      } catch {
        setTransactionCount(0);
      }
    };
    fetchStats();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent" />
          <p className="text-gray-600">Loading...</p>
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
      subtitle: 'Unlock unlimited features',
      href: '/dashboard/premium',
      comingSoon: true,
    },
  ];

  const appItems = [
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
      icon: <LayersIcon />,
      iconBg: 'bg-pink-50',
      iconColor: 'text-pink-600',
      title: 'Categories',
      subtitle: 'Add or edit expense types',
      href: '/dashboard/categories',
      comingSoon: true,
    },
    {
      icon: <GlobeIcon />,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      title: 'Currencies',
      subtitle: `${user?.currency || 'USD'} and more`,
      href: '/dashboard/currencies',
      comingSoon: true,
    },
  ];

  const securityItems = [
    {
      icon: <ShieldIcon />,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      title: 'Security',
      subtitle: 'FaceID & PIN',
      href: '/dashboard/security',
      comingSoon: true,
    },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 pb-8">
        {/* A. Island Header */}
        <div className="relative z-10 rounded-b-3xl bg-white px-6 pb-8 shadow-sm">
          <div className="flex flex-col items-center pt-8">
            {/* Avatar with Badge */}
            <div className="relative mb-4">
              <div className="h-24 w-24 rounded-full bg-teal-600 flex items-center justify-center shadow-md overflow-hidden relative">
                {getImageUrl(user?.profilePicture || user?.profilePictureUrl) ? (
                  <Image
                    src={getImageUrl(user?.profilePicture || user?.profilePictureUrl)!}
                    alt="Profile"
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                FREE
              </span>
            </div>

            {/* Identity */}
            <h1 className="text-xl font-bold text-gray-900">
              {user?.name || 'User'}
            </h1>
            <p className="mt-1 text-xs text-gray-500 font-mono">
              ID: {user?.id.slice(0, 8).toUpperCase()}
            </p>

            {/* Quick Stats */}
            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">
                {transactionCount !== null ? `${transactionCount} Transactions` : '— Transactions'}
              </span>
              <span className="h-4 w-px bg-gray-200" />
              <span className="text-sm font-medium text-gray-600">
                {categoryCount > 0 ? `${categoryCount} Categories` : '1 Account'}
              </span>
            </div>
          </div>
        </div>

        {/* B. Settings Body */}
        <div className="px-6 pt-6">
          {/* General */}
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            General
          </p>
          <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
            {generalItems.map((item, i) => (
              <MenuItem
                key={item.title}
                {...item}
                isLast={i === generalItems.length - 1}
              />
            ))}
          </div>

          {/* App Settings */}
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            App Settings
          </p>
          <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
            {appItems.map((item, i) => (
              <MenuItem
                key={item.title}
                {...item}
                isLast={i === appItems.length - 1}
              />
            ))}
          </div>

          {/* Security */}
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            Security
          </p>
          <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm">
            {securityItems.map((item, i) => (
              <MenuItem
                key={item.title}
                {...item}
                isLast={i === securityItems.length - 1}
              />
            ))}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-red-50 text-red-500 font-semibold transition-colors hover:bg-red-100 active:bg-red-100"
          >
            <LogOutIcon />
            Logout
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
