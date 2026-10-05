import type { Metadata } from 'next';
import { GetAppRedirect } from '@/components/marketing/GetAppRedirect';
import { PLAY_STORE_URL } from '@/lib/appLinks';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Get the Android app',
  description:
    'Install ThoughtExpense on Android — natural language expense tracking with offline sync and Google Play Premium.',
  alternates: { canonical: `${siteUrl}/get-app` },
  robots: { index: true, follow: true },
};

export default function GetAppPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-token-primary">ThoughtExpense for Android</h1>
      <p className="mt-3 text-sm leading-relaxed text-token-secondary">
        Opening Google Play… If nothing happens, use the button below.
      </p>
      <GetAppRedirect />
      <p className="mt-8">
        <a
          href={PLAY_STORE_URL}
          className="inline-flex rounded-full bg-token-accent px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
          rel="noopener noreferrer"
        >
          View on Google Play
        </a>
      </p>
    </main>
  );
}
