'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-token-surface flex flex-col items-center">
      {/* Mobile/Tablet container - max tablet width */}
      <div className="w-full max-w-[768px] min-h-screen flex flex-col relative">
      {/* Bottom Navigation - Always visible (mobile-only app) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
        <nav className="w-full max-w-[768px]">
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
      </div>

      {/* Main Content - Mobile/Tablet only */}
      <main
        className={cn(
          'w-full max-w-[768px] px-4 pt-6 pb-24',
          (pathname === '/dashboard/add' || pathname === '/dashboard/expenses') && 'h-screen overflow-hidden flex flex-col'
        )}
      >
        {(pathname === '/dashboard/add' || pathname === '/dashboard/expenses') ? (
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {children}
          </div>
        ) : (
          children
        )}
      </main>
      </div>
    </div>
  );
}
