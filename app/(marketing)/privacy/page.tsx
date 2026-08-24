import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Read how ThoughtExpense collects, uses, and protects your data. We value your privacy and transparency in our AI-powered expense tracking service.',
  openGraph: {
    title: 'Privacy Policy | ThoughtExpense',
    description: 'How ThoughtExpense handles your data. Privacy-first expense tracking.',
    url: '/privacy',
  },
};

function SectionNumber({ n }: { n: number }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-primary)]/10 text-sm font-bold text-token-accent">
      {n}
    </span>
  );
}

const providers = [
  { name: 'Google Gemini', role: 'Parses expense text & receipt photos' },
  { name: 'Pinecone', role: 'Anonymized vectors for smarter categories' },
  { name: 'DigitalOcean', role: 'Servers, database & image storage' },
  { name: 'Resend · Google Play · RevenueCat', role: 'Account emails & subscription billing — we never see your card' },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[768px] px-4 py-14">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-primary)]/10 px-4 py-1.5 text-sm font-semibold text-token-accent">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          Legal
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-token-primary">Privacy Policy</h1>
        <p className="mt-3 text-sm text-token-muted">Last updated: August 2026</p>
      </div>

      <div className="mt-14 space-y-10">
        <section className="flex gap-5">
          <SectionNumber n={1} />
          <div>
            <h2 className="text-xl font-semibold text-token-primary">Information we collect</h2>
            <p className="mt-3 leading-relaxed text-token-secondary">
              Only what runs the service: your email, an optional name and profile picture, the expense entries you
              type (descriptions, amounts, dates, categories), budgets you set, and &mdash; if you use receipt
              scanning &mdash; the receipt photos you choose to upload. No location, no contacts, no bank
              credentials. We never sell your personal information.
            </p>
          </div>
        </section>

        <div className="flex items-start gap-4 rounded-2xl border border-[var(--accent-primary)] bg-[var(--accent-primary)]/8 p-6">
          <svg className="mt-0.5 h-6 w-6 shrink-0 text-token-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <p className="font-medium leading-relaxed text-token-primary">
            Your data is used to provide the service to you. We do <strong>not</strong> train AI models on it, and we
            never share it for marketing or advertising.
          </p>
        </div>

        <section className="flex gap-5">
          <SectionNumber n={2} />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-token-primary">AI processing &amp; service providers</h2>
            <p className="mt-3 leading-relaxed text-token-secondary">
              A small set of processors act on our behalf, each receiving only what its function requires:
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {providers.map((p) => (
                <div key={p.name} className="rounded-xl border border-token bg-token-card p-4">
                  <p className="font-semibold text-token-primary">{p.name}</p>
                  <p className="mt-1 text-sm text-token-secondary">{p.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex gap-5">
          <SectionNumber n={3} />
          <div>
            <h2 className="text-xl font-semibold text-token-primary">Storage &amp; security</h2>
            <p className="mt-3 leading-relaxed text-token-secondary">
              Encrypted in transit (HTTPS), stored on access-controlled servers. Passwords exist only as salted
              hashes; password-reset codes expire after 10 minutes; on mobile your session lives in the
              device&apos;s secure storage.
            </p>
          </div>
        </section>

        <section className="flex gap-5">
          <SectionNumber n={4} />
          <div>
            <h2 className="text-xl font-semibold text-token-primary">Your rights &amp; account deletion</h2>
            <p className="mt-3 leading-relaxed text-token-secondary">
              View and correct your data anytime in the app. Delete your account yourself &mdash; Profile &rarr;
              Security &rarr; Danger Zone, or via{' '}
              <Link href="/account-deletion" className="font-medium text-token-accent underline">
                /account-deletion
              </Link>{' '}
              &mdash; and everything goes with it immediately: expenses, budgets, insights, learned category data,
              search embeddings, and uploaded images. If you cannot access your account, email us and we will
              process the deletion within 30 days. Deleting your account does not cancel a Google Play
              subscription &mdash; cancel that in the Play Store.
            </p>
          </div>
        </section>

        <section className="flex gap-5">
          <SectionNumber n={5} />
          <div>
            <h2 className="text-xl font-semibold text-token-primary">Contact</h2>
            <p className="mt-3 leading-relaxed text-token-secondary">
              Privacy questions or data requests:{' '}
              <a href="mailto:thoughtexpense@nafiziqbal.com" className="font-medium text-token-accent underline">
                thoughtexpense@nafiziqbal.com
              </a>
              . We will notify you of material changes to this policy.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
