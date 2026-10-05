import { cn } from '@/lib/utils';

type TabIconProps = {
  className?: string;
  active?: boolean;
};

function stroke(active?: boolean) {
  return active ? 2 : 1.8;
}

export function TabHomeIcon({ className, active }: TabIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={stroke(active)} d="M3 10.5 12 3l9 7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={stroke(active)} d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

export function TabExpensesIcon({ className, active }: TabIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <rect x="3" y="6" width="18" height="13" rx="2" strokeWidth={stroke(active)} />
      <path strokeLinecap="round" strokeWidth={stroke(active)} d="M3 10h18" />
    </svg>
  );
}

export function TabAddIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeWidth={2.4} d="M12 5v14" />
      <path strokeLinecap="round" strokeWidth={2.4} d="M5 12h14" />
    </svg>
  );
}

export function TabInsightsIcon({ className, active }: TabIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeWidth={stroke(active)} d="M5 20V12" />
      <path strokeLinecap="round" strokeWidth={stroke(active)} d="M12 20V5" />
      <path strokeLinecap="round" strokeWidth={stroke(active)} d="M19 20v-6" />
    </svg>
  );
}

export function TabSettingsIcon({ className, active }: TabIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={stroke(active)}
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={stroke(active)}
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
      />
    </svg>
  );
}

/** @deprecated Use TabSettingsIcon for bottom navigation. */
export const TabProfileIcon = TabSettingsIcon;

export function tabIconClass(active: boolean) {
  return cn('transition-all duration-200', active ? 'h-7 w-7 text-token-accent' : 'h-6 w-6 text-token-muted');
}
