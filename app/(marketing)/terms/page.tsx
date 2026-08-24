import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of Service for ThoughtExpense. Learn about your rights and responsibilities when using our AI-powered expense tracking app.',
  openGraph: {
    title: 'Terms of Service | ThoughtExpense',
    description: 'Terms and conditions for using ThoughtExpense expense tracker.',
    url: '/terms',
  },
};

function SectionNumber({ n }: { n: number }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-primary)]/10 text-sm font-bold text-token-accent">
      {n}
    </span>
  );
}

const billingPoints = [
  <>Premium is an <strong className="text-token-primary">auto-renewing subscription</strong> purchased through Google Play; prices are shown before you buy.</>,
  <><strong className="text-token-primary">Cancel anytime</strong> in Play Store &rarr; Subscriptions, at least 24h before renewal; access lasts to period end.</>,
  <>Refunds follow <strong className="text-token-primary">Google Play&apos;s refund policy</strong>; price changes are notified in advance and apply from the next renewal.</>,
  <>Deleting your account does <strong className="text-token-primary">not</strong> cancel the subscription &mdash; cancel in Google Play first.</>,
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[768px] px-4 py-14">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-primary)]/10 px-4 py-1.5 text-sm font-semibold text-token-accent">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
            <path d="M14 3v6h6" />
          </svg>
          Legal
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-token-primary">Terms of Service</h1>
        <p className="mt-3 text-sm text-token-muted">Last updated: August 2026</p>
      </div>

      <div className="mt-14 space-y-10">
        <section className="flex gap-5">
          <SectionNumber n={1} />
          <div>
            <h2 className="text-xl font-semibold text-token-primary">Acceptance &amp; the service</h2>
            <p className="mt-3 leading-relaxed text-token-secondary">
              Using ThoughtExpense (web or mobile) means you accept these terms. The service turns natural-language
              input and receipt photos into structured expense records with AI analysis. We aim for high
              availability but don&apos;t guarantee uninterrupted access, and we may evolve features with notice.
              Continued use after changes constitutes acceptance; we will notify you of material changes.
            </p>
          </div>
        </section>

        <div className="flex items-start gap-4 rounded-2xl border border-[var(--status-warning)] bg-[var(--status-warning)]/10 p-6">
          <svg className="mt-0.5 h-6 w-6 shrink-0 text-[var(--status-warning)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3 2.5 20h19z" />
            <path d="M12 10v4" />
            <path d="M12 17.2v0.3" />
          </svg>
          <p className="font-medium leading-relaxed text-token-primary">
            AI can be wrong. Amounts may be misread and categories mislabeled &mdash; review your entries. Insights
            are informational only and are <strong>not financial, tax, or investment advice</strong>. Do not rely on
            the service as your sole financial record.
          </p>
        </div>

        <section className="flex gap-5">
          <SectionNumber n={2} />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-token-primary">Subscriptions &amp; billing</h2>
            <div className="mt-4 space-y-3 rounded-2xl border border-token bg-token-card p-6">
              {billingPoints.map((point, i) => (
                <div key={i} className="flex gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-token-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="leading-relaxed text-token-secondary">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex gap-5">
          <SectionNumber n={3} />
          <div>
            <h2 className="text-xl font-semibold text-token-primary">Your account</h2>
            <p className="mt-3 leading-relaxed text-token-secondary">
              Keep your password confidential &mdash; you are responsible for activity under your account. Be at
              least 13, provide accurate information, and tell us about unauthorized access. You can permanently
              delete your account anytime in the app (Profile &rarr; Security) or via{' '}
              <Link href="/account-deletion" className="font-medium text-token-accent underline">
                /account-deletion
              </Link>
              ; deletion is permanent.
            </p>
          </div>
        </section>

        <section className="flex gap-5">
          <SectionNumber n={4} />
          <div>
            <h2 className="text-xl font-semibold text-token-primary">Acceptable use</h2>
            <p className="mt-3 leading-relaxed text-token-secondary">
              No illegal use, no uploading content you have no right to, no abusing or overloading the service, no
              attempts to compromise its security. Violations can mean suspension or termination.
            </p>
          </div>
        </section>

        <section className="flex gap-5">
          <SectionNumber n={5} />
          <div>
            <h2 className="text-xl font-semibold text-token-primary">Limitation of liability</h2>
            <p className="mt-3 leading-relaxed text-token-secondary">
              The service is provided &quot;as is.&quot; To the maximum extent permitted by law, we are not liable
              for indirect, incidental, or consequential damages arising from your use of the service, including
              losses resulting from inaccurate AI output. Our total liability is limited to the amount you paid us
              in the past 12 months, if any.
            </p>
          </div>
        </section>

        <section className="flex gap-5">
          <SectionNumber n={6} />
          <div>
            <h2 className="text-xl font-semibold text-token-primary">Contact</h2>
            <p className="mt-3 leading-relaxed text-token-secondary">
              Questions about these terms? Email{' '}
              <a href="mailto:thoughtexpense@nafiziqbal.com" className="font-medium text-token-accent underline">
                thoughtexpense@nafiziqbal.com
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
