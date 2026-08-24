import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Delete your account',
  description: 'How to permanently delete your ThoughtExpense account and all associated data.',
};

export default function AccountDeletionPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold text-token-primary">Delete your ThoughtExpense account</h1>
      <p className="mt-4 text-token-secondary leading-relaxed">
        You can permanently delete your ThoughtExpense account and all associated data at any time. Deletion is
        immediate and cannot be undone.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-token-primary">From the mobile app</h2>
      <ol className="mt-3 list-decimal pl-6 text-token-secondary leading-relaxed space-y-1">
        <li>Open ThoughtExpense and go to the Profile tab</li>
        <li>Tap Security</li>
        <li>Scroll to the Danger Zone and tap Delete my account</li>
        <li>Confirm with your password</li>
      </ol>

      <h2 className="mt-8 text-xl font-semibold text-token-primary">From the web</h2>
      <ol className="mt-3 list-decimal pl-6 text-token-secondary leading-relaxed space-y-1">
        <li>
          <Link href="/auth/login" className="text-token-accent font-medium underline">
            Sign in to your account
          </Link>
        </li>
        <li>Go to Profile → Security</li>
        <li>In the Danger Zone, confirm your password and click Delete my account</li>
      </ol>

      <h2 className="mt-8 text-xl font-semibold text-token-primary">What gets deleted</h2>
      <p className="mt-3 text-token-secondary leading-relaxed">
        Your account, all expenses, budgets, insights, learned category mappings, search embeddings, and any uploaded
        profile image are permanently removed from our systems when you delete your account.
      </p>

      <p className="mt-8 text-sm text-token-muted">
        Lost access to your account? Email{' '}
        <a href="mailto:thoughtexpense@nafiziqbal.com" className="underline">
          thoughtexpense@nafiziqbal.com
        </a>{' '}
        from your registered address and we will process the deletion for you.
      </p>
    </div>
  );
}
