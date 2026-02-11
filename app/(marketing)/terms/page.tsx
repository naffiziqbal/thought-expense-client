import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service - ThoughtExpense',
  description: 'Terms of Service for ThoughtExpense expense tracking app',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-[768px] px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center text-sm text-gray-600 hover:text-teal-600"
      >
        ← Back to Home
      </Link>
      <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: February 2026</p>

      <div className="mt-8 prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
          <p className="mt-4 text-gray-600">
            By using ThoughtExpense, you agree to these Terms of Service. If you do not agree, please
            do not use our service. We reserve the right to update these terms; continued use after
            changes constitutes acceptance.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">2. Service Description</h2>
          <p className="mt-4 text-gray-600">
            ThoughtExpense provides AI-powered expense tracking. You can log expenses in natural
            language, view insights, and manage spending. We strive to keep the service available but
            do not guarantee uninterrupted access. We may modify or discontinue features with notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">3. Account & Responsibility</h2>
          <p className="mt-4 text-gray-600">
            You are responsible for maintaining the confidentiality of your account and password.
            You are liable for all activity under your account. You must provide accurate information
            and notify us of any unauthorized access. You must be at least 13 years old to use the
            service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">4. Acceptable Use</h2>
          <p className="mt-4 text-gray-600">
            You agree not to use ThoughtExpense for illegal purposes, to harass others, or to attempt
            to compromise the security of our systems. We may suspend or terminate accounts that
            violate these terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">5. Limitation of Liability</h2>
          <p className="mt-4 text-gray-600">
            ThoughtExpense is provided &quot;as is.&quot; We are not liable for any indirect,
            incidental, or consequential damages arising from your use of the service. Our total
            liability is limited to the amount you paid us in the past 12 months, if any.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">6. Contact</h2>
          <p className="mt-4 text-gray-600">
            For questions about these terms, please contact us through the app or our support
            channels. We are here to help.
          </p>
        </section>
      </div>
    </div>
  );
}
