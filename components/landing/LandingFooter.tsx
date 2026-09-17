import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="bg-token-surface px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 border-t border-token pt-8 sm:flex-row">
          <p className="text-sm text-token-muted">
            &copy; {new Date().getFullYear()} ThoughtExpense
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-token-secondary">
            <Link href="/privacy" className="hover:text-token-accent transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-token-accent transition-colors">
              Terms
            </Link>
            <Link href="/account-deletion" className="hover:text-token-accent transition-colors">
              Account deletion
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
