import { cn } from '@/lib/utils';
import { PLAY_STORE_URL } from '@/lib/appLinks';

type PlayStoreDownloadLinkProps = {
  className?: string;
  size?: 'sm' | 'md';
};

/** Links to the live Google Play listing (com.nafiziqbal.thoughtexpense). */
export function PlayStoreDownloadLink({ className, size = 'md' }: PlayStoreDownloadLinkProps) {
  const compact = size === 'sm';

  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-3 rounded-xl border border-black/10 bg-[#0A0F1C] text-white shadow-md transition hover:opacity-90',
        'dark:border-token dark:bg-token-card',
        compact ? 'px-3 py-2' : 'px-4 py-2.5',
        className
      )}
      aria-label="Download Thought Expense on Google Play"
    >
      <svg
        className={cn('shrink-0', compact ? 'h-7 w-7' : 'h-8 w-8')}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M3.6 1.8c-.3.2-.6.6-.6 1.1v18.2c0 .5.3.9.6 1.1l.1.1 10.2-10.2v-.2L3.7 1.7l-.1.1z" />
        <path d="M16.9 12.3 6.7 22.5c.4.2.9.2 1.4-.1l11.5-6.6-2.7-3.5z" opacity={0.85} />
        <path d="M19.8 10.4 6.7 1.5c-.5-.3-1-.3-1.4-.1l10.2 10.2 4.3-1.2z" opacity={0.7} />
        <path d="m16.9 11.7 2.7-3.5L6.7 1.4c-.4-.2-.9-.2-1.3 0l11.5 11.3z" opacity={0.55} />
      </svg>
      <span className="text-left leading-none">
        <span className={cn('block uppercase tracking-wide text-white/75', compact ? 'text-[9px]' : 'text-[10px]')}>
          Get it on
        </span>
        <span className={cn('block font-semibold text-white', compact ? 'text-sm' : 'text-base')}>Google Play</span>
      </span>
    </a>
  );
}
