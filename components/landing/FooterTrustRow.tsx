import Link from 'next/link';
import type { ReactNode } from 'react';
import { footerTrustItems } from '@/lib/footerPlayground';

const icons: Record<string, ReactNode> = {
  offline: (
    <>
      <path d="M3 7h18v10H3z" />
      <path d="M8 21h8M12 17v4M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
      <path d="M12 11v2M9 12h6" />
    </>
  ),
  free: (
    <>
      <path d="M12 3v18M7 8h10a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h8" />
    </>
  ),
  privacy: (
    <>
      <path d="M12 3l8 4v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  secure: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
};

function TrustIcon({ id }: { id: string }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-primary)]/10 text-token-accent">
      <svg
        className="h-[18px] w-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {icons[id]}
      </svg>
    </div>
  );
}

function TrustCard({ label, href, id }: { label: string; href?: string; id: string }) {
  const className =
    'footer-trust-item flex gap-3 rounded-xl border border-token bg-token-card/60 p-3.5 transition-colors sm:p-4 ' +
    (href ? 'hover:border-[var(--accent-primary)]/35 hover:bg-token-card' : '');

  const content = (
    <>
      <TrustIcon id={id} />
      <span className="text-xs font-medium leading-snug text-token-secondary sm:text-sm">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

export function FooterTrustRow() {
  return (
    <div className="mt-12 border-t border-token pt-10">
      <p className="text-center text-xs font-bold uppercase tracking-widest text-token-muted sm:text-left">
        Built for trust
      </p>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {footerTrustItems.map((item) => (
          <li key={item.id}>
            <TrustCard id={item.id} label={item.label} href={item.href} />
          </li>
        ))}
      </ul>
    </div>
  );
}
