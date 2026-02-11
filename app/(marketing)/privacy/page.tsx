import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - ThoughtExpense',
  description: 'Privacy Policy for ThoughtExpense expense tracking app',
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
      <p className="mt-2 text-sm text-gray-500">Last updated: February 2026</p>

      <div className="mt-8 prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">1. Information We Collect</h2>
          <p className="mt-4 text-gray-600">
            ThoughtExpense collects only the information necessary to provide our expense tracking
            service. This includes your email, name (optional), expense entries, and categorization
            data. We do not sell or share your personal information with third parties for marketing.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">2. How We Use Your Data</h2>
          <p className="mt-4 text-gray-600">
            Your expense data is used to categorize transactions, generate insights, and improve our
            AI models. Data is processed securely and encrypted at rest. We use industry-standard
            practices to protect your information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">3. Data Storage & Security</h2>
          <p className="mt-4 text-gray-600">
            All data is stored on secure servers with encryption. Profile pictures are stored via
            DigitalOcean Spaces. We implement access controls and regular security assessments to
            protect your data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">4. Your Rights</h2>
          <p className="mt-4 text-gray-600">
            You may request access to, correction of, or deletion of your personal data at any time.
            Contact us to exercise these rights. We will respond within 30 days.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">5. Contact</h2>
          <p className="mt-4 text-gray-600">
            For privacy-related questions, please contact us through the app or at our support
            address. We take your privacy seriously and are committed to transparency.
          </p>
        </section>
      </div>
    </div>
  );
}
