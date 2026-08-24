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

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[768px] px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center text-sm text-gray-600 hover:text-teal-600"
      >
        ← Back to Home
      </Link>
      <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: August 2026</p>

      <div className="mt-8 prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">1. Information We Collect</h2>
          <p className="mt-4 text-gray-600">
            ThoughtExpense collects only what is needed to run the service: your email address, your
            name (optional), a profile picture if you add one, the expense entries you type
            (descriptions, amounts, dates, categories), budgets you set, and — if you use receipt
            scanning — the receipt photos you choose to upload. We do not collect your location, your
            contacts, or your bank credentials, and we never sell your personal information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">2. How We Use Your Data</h2>
          <p className="mt-4 text-gray-600">
            Your expense text and receipt photos are processed to create structured expense records,
            categorize them, and generate spending insights and budget suggestions for you. Your data
            is used to provide the service to you — we do not use it to train AI models, and we do
            not share it with third parties for marketing or advertising.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">3. AI Processing &amp; Service Providers</h2>
          <p className="mt-4 text-gray-600">
            To provide the service, we share data with a small number of processors acting on our
            behalf: <strong>Google Gemini</strong> processes the expense text you submit and the
            receipt photos you scan in order to extract and categorize expenses;{' '}
            <strong>Pinecone</strong> stores anonymized vector representations of your expenses to
            improve categorization of your future entries; <strong>DigitalOcean</strong> hosts our
            servers, database, and uploaded images; and <strong>Resend</strong> delivers account
            emails such as password-reset codes. If you subscribe to Premium in the Android app, the
            purchase is handled by <strong>Google Play</strong>, and <strong>RevenueCat</strong>{' '}
            processes purchase tokens to manage your subscription — we never see your payment card
            details. Each provider receives only the data required for its function.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">4. Data Storage &amp; Security</h2>
          <p className="mt-4 text-gray-600">
            Data is encrypted in transit (HTTPS) and stored on access-controlled servers. Passwords
            are stored only as salted hashes, and password-reset codes expire after 10 minutes. On
            mobile, your session token is kept in the device&apos;s secure storage.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">5. Your Rights &amp; Account Deletion</h2>
          <p className="mt-4 text-gray-600">
            You can view and correct your data in the app at any time. You can permanently delete
            your account and all associated data yourself — in the app under Profile → Security →
            Danger Zone, or on the web as described at{' '}
            <Link href="/account-deletion" className="text-teal-600 underline">
              thoughtexpense.nafiziqbal.com/account-deletion
            </Link>
            . Deletion is immediate and removes your account, expenses, budgets, insights, learned
            category data, search embeddings, and uploaded images. If you cannot access your
            account, email us and we will process the deletion within 30 days. Note that deleting
            your account does not cancel a Google Play subscription — cancel it in the Play Store.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">6. Contact</h2>
          <p className="mt-4 text-gray-600">
            For privacy questions or data requests, email{' '}
            <a href="mailto:thoughtexpense@nafiziqbal.com" className="text-teal-600 underline">
              thoughtexpense@nafiziqbal.com
            </a>
            . We take your privacy seriously and are committed to transparency; we will notify you of
            material changes to this policy.
          </p>
        </section>
      </div>
    </div>
  );
}
