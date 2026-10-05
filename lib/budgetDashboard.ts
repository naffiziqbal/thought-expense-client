import { budgetPaceLabel, daysLeftInMonth, expectedPacePercent } from './homeDashboard';

export { budgetPaceLabel, daysLeftInMonth, expectedPacePercent };

export function monthLabel(year: number, month: number, long = true): string {
  return new Date(year, month - 1, 1).toLocaleString('en-US', {
    month: long ? 'long' : 'short',
    year: 'numeric',
  });
}

export type BudgetSpendTier = 'safe' | 'warn' | 'danger';

export function budgetSpendTier(percent: number): BudgetSpendTier {
  if (percent < 75) return 'safe';
  if (percent < 95) return 'warn';
  return 'danger';
}

export function budgetContextForMonth(month: number, year: number) {
  const now = new Date();
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();
  const expectedPct = isCurrentMonth ? expectedPacePercent(now) : 100;
  const daysLeft = isCurrentMonth ? daysLeftInMonth(now) : 0;
  return { isCurrentMonth, expectedPct, daysLeft };
}

const CATEGORY_EMOJI: Record<string, string> = {
  food: '🍽️',
  groceries: '🥬',
  grocery: '🥬',
  rent: '🏠',
  transport: '🚗',
  transportation: '🚗',
  gas: '⛽',
  fuel: '⛽',
  health: '❤️',
  medical: '🏥',
  healthcare: '🏥',
  entertainment: '🎬',
  utilities: '💡',
  shopping: '🛍️',
  education: '📚',
  dining: '🍴',
  fitness: '💪',
  gym: '💪',
  subscriptions: '📱',
  travel: '✈️',
  other: '📦',
};

export function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJI[category.trim().toLowerCase()] ?? '📦';
}
