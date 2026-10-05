'use client';

import Link from 'next/link';
import { FooterPlayground } from '@/components/landing/FooterPlayground';
import { FooterTrustRow } from '@/components/landing/FooterTrustRow';
import { ThemeToggle } from '@/components/landing/ThemeToggle';
import { PLAY_STORE_URL } from '@/lib/appLinks';
import { footerNav } from '@/lib/footerPlayground';
import { platforms } from '@/lib/landingContent';

function FooterLinkGroup({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-token-muted">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => {
          const external = link.href.startsWith('http');
          return (
            <li key={link.href}>
              {external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-nav-link text-sm text-token-secondary transition-colors hover:text-token-accent"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  href={link.href}
                  className="footer-nav-link text-sm text-token-secondary transition-colors hover:text-token-accent"
                >
                  {link.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function LandingFooter() {
  return (
    <footer className="relative overflow-hidden bg-token-surface px-4 pb-8 pt-16">
      <div className="pointer-events-none absolute inset-0 bg-grid-mesh opacity-30" aria-hidden />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-[var(--accent-primary)]/8 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="rounded-xl bg-token-accent p-2 text-white shadow-md transition-opacity group-hover:opacity-90">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold text-token-primary">ThoughtExpense</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-token-secondary">
              Type what you spent. AI sorts categories, dates, and totals — on web and Android, even offline.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {platforms.map((platform) => {
                const pillClass = `footer-platform-pill inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-transform ${
                  platform.available
                    ? 'border-[var(--accent-primary)]/25 bg-[var(--accent-primary)]/8 text-token-accent'
                    : 'border-token text-token-muted'
                }`;
                const inner = (
                  <>
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        platform.available ? 'bg-emerald-500' : 'bg-token-muted'
                      }`}
                      aria-hidden
                    />
                    {platform.name}
                    {!platform.available ? ' · soon' : ''}
                  </>
                );
                if (platform.name === 'Android' && platform.available) {
                  return (
                    <a
                      key={platform.name}
                      href={PLAY_STORE_URL}
                      className={`${pillClass} hover:scale-[1.02]`}
                      title={platform.detail}
                      rel="noopener noreferrer"
                    >
                      {inner}
                    </a>
                  );
                }
                return (
                  <span key={platform.name} className={pillClass} title={platform.detail}>
                    {inner}
                  </span>
                );
              })}
            </div>

            <div className="mt-8 hidden gap-10 sm:grid sm:grid-cols-3 lg:hidden">
              <FooterLinkGroup title="Product" links={footerNav.product} />
              <FooterLinkGroup title="Account" links={footerNav.account} />
              <FooterLinkGroup title="Legal" links={footerNav.legal} />
            </div>
          </div>

          <FooterPlayground />
        </div>

        <div className="mt-12 hidden gap-10 border-t border-token pt-10 lg:grid lg:grid-cols-3">
          <FooterLinkGroup title="Product" links={footerNav.product} />
          <FooterLinkGroup title="Account" links={footerNav.account} />
          <FooterLinkGroup title="Legal" links={footerNav.legal} />
        </div>

        <FooterTrustRow />

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-token pt-6 sm:flex-row">
          <p className="text-sm text-token-muted">&copy; {new Date().getFullYear()} ThoughtExpense</p>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-token-secondary sm:hidden">
              {footerNav.legal.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-token-accent transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
