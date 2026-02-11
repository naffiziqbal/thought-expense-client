'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: 'Add Expense', 
      href: '/dashboard/add', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    { 
      name: 'Expenses', 
      href: '/dashboard/expenses', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    { 
      name: 'Insights', 
      href: '/dashboard/insights', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation - Desktop Only */}
      <nav className="hidden md:block sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo with gradient */}
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2 group">
                <div className="bg-teal-600 text-white rounded-lg p-2 shadow-md group-hover:bg-teal-500 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  ThoughtExpense
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="flex items-center space-x-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {/* Currency Badge - Desktop */}
              {user?.currency && (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-semibold text-green-700">{user.currency}</span>
                </div>
              )}

              {/* User Profile Dropdown - Desktop */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 rounded-xl px-3 py-2 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold shadow-md">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </nav>


      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Subtle shadow above nav */}
        <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-black/5 pointer-events-none" />
        
        <div className="bg-white shadow-2xl">
          <div className="flex items-center justify-around px-6 pb-safe safe-area-inset-bottom" style={{ height: '72px' }}>
            {/* Home */}
            <Link
              href="/dashboard"
              className={cn(
                'flex items-center justify-center transition-all duration-200 active:scale-95',
                'w-12 h-12'
              )}
            >
              <svg 
                className={cn(
                  'transition-all duration-200',
                  pathname === '/dashboard' 
                    ? 'w-7 h-7 text-teal-600' 
                    : 'w-6 h-6 text-gray-400'
                )} 
                fill="none"
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>

            {/* Expenses/List */}
            <Link
              href="/dashboard/expenses"
              className={cn(
                'flex items-center justify-center transition-all duration-200 active:scale-95',
                'w-12 h-12'
              )}
            >
              <svg 
                className={cn(
                  'transition-all duration-200',
                  pathname === '/dashboard/expenses' 
                    ? 'w-7 h-7 text-teal-600' 
                    : 'w-6 h-6 text-gray-400'
                )} 
                fill="none"
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </Link>

            {/* Primary Action Button - Floating & Elevated */}
            <Link
              href="/dashboard/add"
              className="flex items-center justify-center -mt-8 transition-all duration-200 active:scale-95"
            >
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-teal-500 blur-xl opacity-30"></div>
                
                {/* Main button */}
                <div className="relative w-16 h-16 rounded-full bg-teal-600 hover:bg-teal-500 flex items-center justify-center shadow-lg transition-all duration-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Insights */}
            <Link
              href="/dashboard/insights"
              className={cn(
                'flex items-center justify-center transition-all duration-200 active:scale-95',
                'w-12 h-12'
              )}
            >
              <svg 
                className={cn(
                  'transition-all duration-200',
                  pathname === '/dashboard/insights' 
                    ? 'w-7 h-7 text-teal-600' 
                    : 'w-6 h-6 text-gray-400'
                )} 
                fill="none"
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </Link>

            {/* Profile */}
            <Link
              href="/dashboard/profile"
              className={cn(
                'flex items-center justify-center transition-all duration-200 active:scale-95',
                'w-12 h-12'
              )}
            >
              <svg 
                className={cn(
                  'transition-all duration-200',
                  pathname === '/dashboard/profile' 
                    ? 'w-7 h-7 text-teal-600' 
                    : 'w-6 h-6 text-gray-400'
                )} 
                fill="none"
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content - Hierarchical spacing */}
      <main
        className={cn(
          'mx-auto max-w-7xl px-4 md:px-6 pt-6 pb-24 md:py-8',
          pathname === '/dashboard/add' && 'h-screen md:h-[calc(100vh-4rem)] overflow-hidden flex flex-col'
        )}
      >
        {pathname === '/dashboard/add' ? (
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {children}
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
