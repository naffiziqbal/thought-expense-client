import { PLAY_STORE_URL } from '@/lib/appLinks';
import { getCategoryFromKeyword, normalizeDigits } from '@/lib/utils';

export type FooterParsedRow = {
  label: string;
  amount: number;
  category: string;
  chip: string;
};

const CATEGORY_STYLES: Record<string, string> = {
  Food: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  Transport: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
  Rent: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
  Entertainment: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300',
  Healthcare: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
  Shopping: 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300',
  Other: 'bg-gray-100 text-gray-800 dark:bg-gray-500/15 dark:text-gray-300',
};

const KEYWORDS: [RegExp, string][] = [
  [/coffee|lunch|dinner|grocer|food|restaurant|starbucks/i, 'Food'],
  [/uber|lyft|taxi|bus|fuel|gas|transport|metro/i, 'Transport'],
  [/rent|lease|landlord/i, 'Rent'],
  [/netflix|spotify|movie|cinema|game|entertain/i, 'Entertainment'],
  [/pharmacy|doctor|hospital|health|medicine/i, 'Healthcare'],
  [/amazon|shop|store|mall|clothes/i, 'Shopping'],
];

function inferCategory(label: string): string {
  for (const [pattern, category] of KEYWORDS) {
    if (pattern.test(label)) return category;
  }
  // Bangla / Banglish ("চা", "pathao") — whole-word match so "চা" doesn't hit "রিচার্জ"
  return getCategoryFromKeyword(label);
}

function parsePart(part: string): FooterParsedRow | null {
  const cleaned = normalizeDigits(part).replace(/৳|টাকা|\b(?:tk|taka|bdt)\b\.?/gi, ' ').replace(/\s+/g, ' ').trim();
  const match = cleaned.match(/^(.+?)\s+(\d+(?:,\d{3})*(?:\.\d+)?)$/);
  if (!match) return null;

  const label = match[1].trim().replace(/^\w/, (c) => c.toUpperCase());
  const amount = parseFloat(match[2].replace(/,/g, ''));
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const category = inferCategory(label);
  return { label, amount, category, chip: CATEGORY_STYLES[category] ?? CATEGORY_STYLES.Other };
}

/** Lightweight client-side parse — mirrors Quick Log, no API call */
export function parseFooterInput(text: string): FooterParsedRow[] {
  if (!text.trim()) return [];

  return text
    .split(/,|।|\band\b|\sএবং\s/i)
    .map(parsePart)
    .filter((row): row is FooterParsedRow => row !== null);
}

export const footerExamples = ['coffee 120', 'uber 250', 'groceries 900', 'rent 5000'];

export const footerContent = {
  playgroundTitle: 'One last log before you go?',
  playgroundHint: 'Type like Quick Log — Penny sorts it locally, no account needed.',
  pennyIdle: 'Your turn. Type an expense above.',
  pennyParsing: 'Reading your note…',
  pennyParsed: (count: number) =>
    count === 1 ? 'Sorted! One expense, one category.' : `Sorted! ${count} expenses, all categorized.`,
  pennyEmpty: 'Try a chip or type: coffee 120, uber 250',
};

export type FooterTrustItem = {
  id: string;
  label: string;
  href?: string;
};

export const footerTrustItems: FooterTrustItem[] = [
  {
    id: 'offline',
    label: 'Offline sync on web & Android',
    href: '/#features',
  },
  {
    id: 'free',
    label: 'Free forever — no card required',
    href: '/#pricing',
  },
  {
    id: 'privacy',
    label: 'We never sell your spending data',
    href: '/privacy',
  },
  {
    id: 'secure',
    label: 'Encrypted in transit (TLS)',
    href: '/privacy',
  },
];

export const footerNav = {
  product: [
    { label: 'Download Android app', href: PLAY_STORE_URL },
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'FAQ', href: '/#faq' },
  ],
  account: [
    { label: 'Sign up free', href: '/auth/signup' },
    { label: 'Log in', href: '/auth/login' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Account deletion', href: '/account-deletion' },
  ],
};
