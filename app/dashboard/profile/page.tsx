'use client';

import { useRouter } from 'next/navigation';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function ProfilePage() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const menuItems = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: 'User profile',
      description: 'Change profile image, name or password',
      href: '/dashboard/profile/edit',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      title: 'Premium plans',
      description: 'Explore premium options and enjoy',
      href: '/dashboard/premium',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: 'Accounts',
      description: 'Manage accounts and description',
      href: '/dashboard/accounts',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Currencies',
      description: 'Add other currencies, adjust exchange rates',
      href: '/dashboard/currencies',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      title: 'Categories',
      description: 'Manage categories and add sub-categories',
      href: '/dashboard/categories',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Security',
      description: 'Protect your app with PIN or Fingerprint',
      href: '/dashboard/security',
    },
  ];

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Mobile-optimized profile page */}
        <div className="bg-white rounded-2xl shadow-sm min-h-[calc(100vh-10rem)]">
          {/* Back Button */}
          <div className="px-6 pt-6 pb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-900 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-base font-medium">Back</span>
            </button>
          </div>

          {/* Profile Header */}
          <div className="flex flex-col items-center px-6 py-8 pb-6">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full bg-teal-600 flex items-center justify-center shadow-lg mb-6">
              <span className="text-white text-5xl font-bold">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
              </span>
            </div>

            {/* Name */}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {user?.name || 'User'}
            </h1>

            {/* User ID */}
            <p className="text-sm text-gray-500 font-medium">
              ID: {user?.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          {/* Menu Items */}
          <div className="px-6 py-4 space-y-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  // For now, just show alert for unimplemented features
                  if (item.href) {
                    alert(`${item.title} - Coming soon!`);
                  }
                }}
                className="w-full flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 text-left group"
              >
                <div className="shrink-0 w-11 h-11 rounded-lg bg-gray-900 flex items-center justify-center text-white group-hover:bg-gray-800 transition-all duration-200">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 mb-0.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Logout Button */}
          <div className="px-6 py-8 flex justify-center">
            <button
              onClick={handleLogout}
              className="px-16 py-4 rounded-full text-red-500 bg-red-50 hover:bg-red-100 text-base font-semibold transition-all shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
