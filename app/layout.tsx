import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thoughtexpense.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ThoughtExpense - Track Expenses. Just by Typing.',
    template: '%s | ThoughtExpense',
  },
  description:
    'No categories. No dates. Just say "Coffee 15, Rent 5000" and we handle the rest. AI-powered expense tracking. Free to start.',
  keywords: [
    'expense tracker',
    'budget app',
    'natural language expenses',
    'AI expense tracking',
    'spending tracker',
    'personal finance',
    'receipt scanner',
  ],
  authors: [{ name: 'ThoughtExpense', url: siteUrl }],
  creator: 'ThoughtExpense',
  applicationName: 'ThoughtExpense',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'ThoughtExpense',
    title: 'ThoughtExpense - Track Expenses. Just by Typing.',
    description:
      'No categories. No dates. Just say "Coffee 15, Rent 5000" and we handle the rest. AI-powered expense tracking. Free to start.',
    // opengraph-image.tsx generates the OG image automatically
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ThoughtExpense - Track Expenses. Just by Typing.',
    description:
      'No categories. No dates. Just say "Coffee 15, Rent 5000" and we handle the rest. Free to start.',
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
      <body className={inter.className}>
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
