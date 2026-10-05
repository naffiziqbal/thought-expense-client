'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTourTarget } from '@/hooks/useTourTarget';
import { cn } from '@/lib/utils';
import { TOUR_TARGETS } from '@/lib/tourSteps';
import { TourOverlay } from '../tour/TourOverlay';
import { OfflineBanner } from './OfflineBanner';
import { OutboxSync } from './OutboxSync';
import { PendingParseSync } from './PendingParseSync';
import {
  TabAddIcon,
  TabExpensesIcon,
  TabHomeIcon,
  TabInsightsIcon,
  TabSettingsIcon,
  tabIconClass,
} from './TabBarIcons';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const addTarget = useTourTarget(TOUR_TARGETS.navAdd);
  const insightsTarget = useTourTarget<HTMLAnchorElement>(TOUR_TARGETS.navInsights);

  return (
    <div className="min-h-screen bg-token-surface flex flex-col items-center">
      {/* Mobile/Tablet container - max tablet width */}
      <div className="w-full max-w-[768px] min-h-screen flex flex-col relative">
      {/* Bottom Navigation - Always visible (mobile-only app) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
        <nav className="w-full max-w-[768px]">
        {/* Subtle shadow above nav */}
        <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-black/5 pointer-events-none" />
        
        <div className="bg-token-surface border-t border-token safe-area-inset-bottom">
          <div className="flex h-[72px] items-center justify-around px-6">
            <Link
              href="/dashboard"
              aria-label="Home"
              className={cn(
                'flex h-12 w-12 items-center justify-center transition-all duration-200 active:scale-95'
              )}
            >
              <TabHomeIcon className={tabIconClass(pathname === '/dashboard')} active={pathname === '/dashboard'} />
            </Link>

            <Link
              href="/dashboard/expenses"
              aria-label="Expenses"
              className={cn(
                'flex h-12 w-12 items-center justify-center transition-all duration-200 active:scale-95'
              )}
            >
              <TabExpensesIcon
                className={tabIconClass(pathname === '/dashboard/expenses')}
                active={pathname === '/dashboard/expenses'}
              />
            </Link>

            <Link
              href="/dashboard/add"
              aria-label="Add expense"
              className="-mt-8 flex items-center justify-center transition-all duration-200 active:scale-95"
            >
              <div ref={addTarget} className="relative">
                <div className="absolute inset-0 rounded-full bg-token-accent opacity-30 blur-xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-token-accent shadow-lg transition-all duration-200 hover:opacity-90">
                  <TabAddIcon className="h-7 w-7 text-on-accent" />
                </div>
              </div>
            </Link>

            <Link
              ref={insightsTarget}
              href="/dashboard/insights"
              aria-label="Insights"
              className={cn(
                'flex h-12 w-12 items-center justify-center transition-all duration-200 active:scale-95'
              )}
            >
              <TabInsightsIcon
                className={tabIconClass(pathname === '/dashboard/insights')}
                active={pathname === '/dashboard/insights'}
              />
            </Link>

            <Link
              href="/dashboard/profile"
              aria-label="Settings"
              className={cn(
                'flex h-12 w-12 items-center justify-center transition-all duration-200 active:scale-95'
              )}
            >
              <TabSettingsIcon
                className={tabIconClass(pathname === '/dashboard/profile')}
                active={pathname === '/dashboard/profile'}
              />
            </Link>
          </div>
        </div>
        </nav>
      </div>

      {/* Main Content - Mobile/Tablet only */}
      <main
        className={cn(
          'w-full max-w-[768px] px-2.5 sm:px-4 pb-[calc(6rem+env(safe-area-inset-bottom,0px))]',
          pathname === '/dashboard/assistant'
            ? 'pt-[max(0.375rem,env(safe-area-inset-top,0px))]'
            : 'pt-[max(1.5rem,env(safe-area-inset-top,0px))]',
          (pathname === '/dashboard/add' || pathname === '/dashboard/expenses' || pathname === '/dashboard/assistant') && 'h-dvh overflow-hidden flex flex-col'
        )}
      >
        {(pathname === '/dashboard/add' || pathname === '/dashboard/expenses' || pathname === '/dashboard/assistant') ? (
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {children}
          </div>
        ) : (
          children
        )}
      </main>
      <OfflineBanner />
      {/* Sits above the nav so the tour can dim the buttons it points at. */}
      <TourOverlay />
      <OutboxSync />
      <PendingParseSync />
      </div>
    </div>
  );
}
