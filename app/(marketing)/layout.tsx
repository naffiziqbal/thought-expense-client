import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-token-surface flex flex-col">
      {/* Normal header for landing, privacy, terms */}
      <nav className="sticky top-0 z-50 border-b border-token bg-token-card/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="bg-token-accent text-white rounded-2xl p-2 shadow-md group-hover:opacity-90 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xl font-medium text-token-primary">ThoughtExpense</span>
            </Link>
            <div className="flex items-center space-x-3">
              <Link href="/#pricing" className="hidden sm:inline text-sm font-medium text-token-secondary hover:text-token-accent transition-colors">
                Pricing
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost" size="md" className="rounded-full text-token-primary hover:bg-[var(--blueGray-100)]">
                  Login
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="md" className="rounded-full bg-token-accent hover:opacity-90 text-white shadow-md transition-all">
                  Get Started
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
