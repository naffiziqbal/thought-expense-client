import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Normal header for landing, privacy, terms */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="bg-teal-500 text-white rounded-2xl p-2 shadow-md group-hover:bg-teal-400 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xl font-medium text-gray-900">ThoughtExpense</span>
            </Link>
            <div className="flex items-center space-x-3">
              <Link href="/#pricing" className="hidden sm:inline text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors">
                Pricing
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost" size="md" className="rounded-full text-gray-700 hover:bg-gray-100">
                  Login
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="md" className="rounded-full bg-teal-500 hover:bg-teal-400 text-white shadow-md transition-all">
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
