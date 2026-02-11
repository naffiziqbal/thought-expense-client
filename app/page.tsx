import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto max-w-[768px] px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="bg-teal-600 text-white rounded-lg p-2 shadow-md group-hover:bg-teal-500 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">
                ThoughtExpense
              </span>
            </Link>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="md" className="text-gray-700 hover:bg-gray-100">
                  Login
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="md" className="bg-teal-600 hover:bg-teal-500 text-white shadow-md transition-all">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 py-24 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="mx-auto max-w-[768px]">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 rounded-full bg-teal-50 px-4 py-2 mb-8 border border-teal-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
              </span>
              <span className="text-sm font-semibold text-teal-700">AI-Powered Expense Tracking</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
              Track Expenses
              <span className="block mt-2 text-teal-600">
                The Way You Think
              </span>
            </h1>

            {/* Subheading */}
            <p className="mx-auto mt-8 text-lg text-gray-600 leading-relaxed">
              Stop forcing yourself into categories. Just write naturally and let AI do the work.
              <span className="block mt-2 font-semibold text-gray-900">Track spending without the spreadsheet pain.</span>
            </p>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button 
                  size="lg" 
                  className="group relative bg-teal-600 hover:bg-teal-500 text-white shadow-lg transition-all duration-200 text-lg px-8 py-6 h-auto"
                >
                  <span className="flex items-center space-x-2">
                    <span>Start Tracking Free</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Button>
              </Link>
              <Link href="#features">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-6 h-auto border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 transition-all duration-300"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="text-gray-400">•</div>
              <div className="flex items-center space-x-2 text-gray-600">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free forever</span>
              </div>
              <div className="text-gray-400">•</div>
              <div className="flex items-center space-x-2 text-gray-600">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Setup in 60 seconds</span>
              </div>
            </div>
          </div>

          {/* Demo Preview */}
          <div className="mt-16">
            <div className="mx-auto max-w-full rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div className="rounded-lg bg-gray-50 p-6">
                <p className="font-mono text-sm text-gray-800">
                  <span className="text-gray-500">{">"}</span> rent 1200
                  <br />
                  <span className="text-gray-500">{">"}</span> coffee 5
                  <br />
                  <span className="text-gray-500">{">"}</span> uber to work 15
                  <br />
                  <span className="text-gray-500">{">"}</span> groceries 85
                </p>
                <div className="mt-4 flex items-center text-green-600">
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm font-medium">4 expenses parsed and categorized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white px-4 py-20">
        <div className="mx-auto max-w-[768px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Why ThoughtExpense?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Built for humans who think in sentences, not spreadsheets
            </p>
          </div>

          <div className="mt-16 grid gap-6 grid-cols-1">
            {/* Feature 1 */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Natural Input</h3>
              <p className="text-gray-600">
                Type expenses like you think. "coffee 5", "rent 1200", "uber to airport 45". No
                forms, no friction.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">AI Categorization</h3>
              <p className="text-gray-600">
                Smart AI automatically categorizes expenses with confidence scores. Review and
                correct when needed.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Smart Insights</h3>
              <p className="text-gray-600">
                Get weekly insights about spending patterns. No judgment, just useful information.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Lightning Fast</h3>
              <p className="text-gray-600">
                Parse expenses in under 3 seconds. Redis caching ensures sub-200ms response times.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Secure & Private</h3>
              <p className="text-gray-600">
                Your data is encrypted at rest. No tracking, no ads, no selling your information.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                <svg
                  className="h-6 w-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Learns From You</h3>
              <p className="text-gray-600">
                RAG system improves categorization based on your corrections. Gets smarter over
                time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 px-4 py-20">
        <div className="mx-auto max-w-[768px] text-center">
          <h2 className="text-2xl font-bold text-white">
            Ready to simplify expense tracking?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join users who track expenses the natural way. No credit card required.
          </p>
          <div className="mt-10">
            <Link href="/auth/signup">
              <Button variant="secondary" size="lg">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-4 py-12">
        <div className="mx-auto max-w-[768px]">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              © 2026 ThoughtExpense. Built for humans who hate spreadsheets.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
