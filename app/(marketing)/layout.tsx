import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/landing/ThemeToggle';

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-token-surface flex flex-col">
      {/* Normal header for landing, privacy, terms */}
      <nav className="sticky top-0 z-50 border-b border-token bg-token-card/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto max-w-6xl px-3 sm:px-4">
          <div className="flex h-14 sm:h-16 min-w-0 items-center justify-between gap-2">
            <Link href="/" className="flex shrink-0 items-center gap-2 group">
              <div className="bg-token-accent text-white rounded-2xl p-2 shadow-md group-hover:opacity-90 transition-all shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="truncate text-base sm:text-xl font-medium text-token-primary">
                ThoughtExpense
              </span>
            </Link>
            <div className="flex shrink-0 items-center gap-1 sm:gap-3">
              <ThemeToggle />
              <Link href="/#pricing" className="hidden sm:inline text-sm font-medium text-token-secondary hover:text-token-accent transition-colors">
                Pricing
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost" size="md" className="h-9 rounded-full px-3 text-sm text-token-primary hover:bg-[var(--surface-hover)] sm:h-11 sm:px-5 sm:text-base">
                  Login
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="md" className="h-9 whitespace-nowrap rounded-full bg-token-accent px-3 text-sm text-white shadow-md transition-all hover:opacity-90 sm:h-11 sm:px-5 sm:text-base">
                  <span className="sm:hidden">Start</span>
                  <span className="hidden sm:inline">Get Started</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}
