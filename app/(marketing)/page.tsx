import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { MagicInputHero } from '@/components/landing/MagicInputHero';
import { TransformationShowcase } from '@/components/landing/TransformationShowcase';
import { SocialTrust } from '@/components/landing/SocialTrust';
import { FAQAccordion } from '@/components/landing/FAQAccordion';

export default function HomePage() {
  return (
    <>
      {/* Section 01: The Magic Hero */}
      <section className="flex min-h-[85vh] flex-col items-center justify-center px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-medium tracking-tight text-gray-900 md:text-5xl">
            Track expenses. Just by typing.
          </h1>
          <p className="mt-6 text-xl text-gray-500 leading-relaxed">
            No categories to select. No dates to pick. Just say &quot;Coffee 15, Rent 5000&quot; and we handle the rest.
          </p>
          <div className="mt-14">
            <MagicInputHero />
          </div>
          <Link href="/auth/signup" className="mt-10 inline-block">
            <Button
              size="lg"
              className="rounded-full bg-teal-500 px-10 py-4 text-lg font-medium hover:bg-teal-400 shadow-lg"
            >
              Start Tracking for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Section 02: The Transformation */}
      <section id="how-it-works" className="border-t border-gray-200 bg-gray-50 px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-medium tracking-tight text-gray-900">
            Turn your brain dump into a budget.
          </h2>
          <p className="mt-4 text-center text-lg text-gray-500">
            Auto-sort, instantly. Magically.
          </p>
          <div className="mt-16">
            <TransformationShowcase />
          </div>
        </div>
      </section>

      {/* Section 03: Lifestyle Features */}
      <section id="features" className="border-t border-gray-200 bg-white px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-medium tracking-tight text-gray-900">
            More than just typing.
          </h2>
          <p className="mt-4 text-center text-lg text-gray-500">
            Everything you need to stay on top of spending.
          </p>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Card 1: Receipt Snap - Premium */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md relative">
              <span className="absolute right-4 top-4 rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                Premium
              </span>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-4xl">
                📸
              </div>
              <h3 className="text-xl font-medium text-gray-900">Receipt Snap</h3>
              <p className="mt-3 text-gray-500">
                Don&apos;t type at all. Just snap a photo of your receipt and we&apos;ll extract the details.
              </p>
            </div>

            {/* Card 2: Spending Wisdom */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-4xl">
                🍩
              </div>
              <h3 className="text-xl font-medium text-gray-900">Spending Wisdom</h3>
              <p className="mt-3 text-gray-500">
                Monthly insights for everyone. Daily & weekly analysis on Premium.
              </p>
              <div className="mt-6 flex items-center justify-center">
                <div className="h-24 w-24 rounded-full border-8 border-teal-200 border-t-teal-500" />
              </div>
            </div>

            {/* Card 3: Global Ready */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-4xl">
                🌍
              </div>
              <h3 className="text-xl font-medium text-gray-900">Global Ready</h3>
              <p className="mt-3 text-gray-500">
                Track in any currency. USD, EUR, BDT, INR—we&apos;ve got you covered.
              </p>
              <div className="mt-6 flex gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">$</span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">৳</span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">€</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 04: Social Trust */}
      <section className="border-t border-gray-200 bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <SocialTrust />
        </div>
      </section>

      {/* Section 04b: FAQ */}
      <section id="faq" className="border-t border-gray-200 bg-white px-4 py-24">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-3xl font-medium tracking-tight text-gray-900">
            Frequently asked
          </h2>
          <p className="mt-4 text-center text-lg text-gray-500 mb-12">
            Quick answers about ThoughtExpense
          </p>
          <FAQAccordion />
        </div>
      </section>

      {/* Section 05: Pricing */}
      <section id="pricing" className="border-t border-gray-200 bg-white px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-medium tracking-tight text-gray-900">
            Simple pricing
          </h2>
          <p className="mt-4 text-center text-lg text-gray-500">
            Start free. Upgrade when you need more.
          </p>
          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {/* Free */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-medium text-gray-900">Free</h3>
              <p className="mt-1 text-gray-500">For everyone</p>
              <p className="mt-8 text-4xl font-semibold text-gray-900">$0</p>
              <ul className="mt-8 space-y-4 text-gray-600">
                <li>Natural language text input</li>
                <li>3 months of expense history</li>
                <li>Monthly spending insights</li>
                <li>Multi-currency support</li>
              </ul>
              <Link href="/auth/signup" className="mt-10 block">
                <Button
                  variant="outline"
                  className="w-full rounded-full border-gray-300 py-4"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Premium */}
            <div className="rounded-3xl border-2 border-teal-500 bg-white p-8 shadow-lg relative overflow-hidden">
              <div className="absolute right-4 top-4 rounded-full bg-teal-500 px-3 py-1 text-xs font-medium text-white">
                Best Value
              </div>
              <h3 className="text-xl font-medium text-gray-900">Premium</h3>
              <p className="mt-1 text-gray-500">For smart spenders</p>
              <p className="mt-8 text-4xl font-semibold text-gray-900">
                Coming soon
              </p>
              <p className="mt-1 text-sm text-gray-500">via Mobile App</p>
              <ul className="mt-8 space-y-4 text-gray-600">
                <li>Everything in Free, plus:</li>
                <li><strong className="text-gray-900">Receipt scan</strong> — camera or upload</li>
                <li><strong className="text-gray-900">Full history</strong> — lifetime access</li>
                <li><strong className="text-gray-900">Export</strong> — CSV & PDF</li>
                <li><strong className="text-gray-900">Daily & weekly</strong> insights</li>
                <li><strong className="text-gray-900">Ad-free</strong> experience</li>
              </ul>
              <Link href="/auth/signup" className="mt-10 block">
                <Button className="w-full rounded-full bg-teal-500 py-4 hover:bg-teal-400">
                  Start Free, Upgrade Later
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 06: Get Started */}
      <section className="border-t border-gray-200 bg-gray-50 px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-medium tracking-tight text-gray-900">
            Ready to track smarter?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Join thousands who ditched the spreadsheets.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link href="/auth/signup" className="inline-block">
              <Button
                size="lg"
                className="rounded-full bg-teal-500 px-10 py-4 text-lg font-medium hover:bg-teal-400 shadow-lg"
              >
                Start Tracking for Free
              </Button>
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 shadow-sm">
              <span className="text-2xl">📱</span>
              <span className="text-sm font-medium text-gray-700">Web App</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 shadow-sm opacity-60">
              <span className="text-2xl">🍎</span>
              <span className="text-sm font-medium text-gray-500">Coming to iOS</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 shadow-sm opacity-60">
              <span className="text-2xl">🤖</span>
              <span className="text-sm font-medium text-gray-500">Coming to Android</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-teal-500">Privacy</Link>
            <Link href="/terms" className="hover:text-teal-500">Terms</Link>
          </div>
          <p className="mt-6 text-center text-sm text-gray-400">
            © 2026 ThoughtExpense. Track expenses. Just by typing.
          </p>
        </div>
      </footer>
    </>
  );
}
