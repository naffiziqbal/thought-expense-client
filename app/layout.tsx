import type { Metadata } from 'next';
import { Instrument_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import { siteUrl } from '@/lib/site';
import './globals.css';

const instrumentSans = Instrument_Sans({ subsets: ['latin'] });


export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ThoughtExpense — AI Expense Tracker. Track Expenses by Typing.',
    template: '%s | ThoughtExpense',
  },
  description:
    'Log expenses in plain language — type "coffee 120, uber 250" and AI parses, categorizes and dates every item. Budgets, insights, receipt scanning and multi-currency. Free to start, on web and Android.',
  keywords: [
    'AI expense tracker',
    'expense tracker app',
    'natural language expense tracking',
    'budget app',
    'receipt scanner app',
    'spending tracker',
    'personal finance app',
    'money tracker',
    'expense manager android',
  ],
  authors: [{ name: 'ThoughtExpense', url: siteUrl }],
  creator: 'ThoughtExpense',
  applicationName: 'ThoughtExpense',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'ThoughtExpense',
    title: 'ThoughtExpense — AI Expense Tracker. Track Expenses by Typing.',
    description:
      'Type "coffee 120, uber 250" — AI logs, categorizes and dates every expense. Budgets, insights and receipt scanning. Free to start.',
    // opengraph-image.tsx generates the OG image automatically
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ThoughtExpense — AI Expense Tracker. Track Expenses by Typing.',
    description:
      'Type "coffee 120, uber 250" — AI logs, categorizes and dates every expense. Free to start.',
    // Uses opengraph-image.tsx
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'finance',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('thoughtexpense-theme');var s=t?JSON.parse(t):{};var m=(s.state&&s.state.mode)||'system';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light');}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`,
          }}
        />
      </head>
      <body className={instrumentSans.className}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--background-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
              },
              success: {
                iconTheme: {
                  primary: 'var(--status-success)',
                  secondary: 'var(--background-card)',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--status-error)',
                  secondary: 'var(--background-card)',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
