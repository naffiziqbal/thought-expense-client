import { format, parseISO, subDays } from 'date-fns';
import type { Expense } from '@/types';

export function timeOfDayGreeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function daysLeftInMonth(date = new Date()): number {
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Math.max(0, last - date.getDate());
}

export function daysInMonth(date = new Date()): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function dayOfMonth(date = new Date()): number {
  return date.getDate();
}

export function expectedPacePercent(date = new Date()): number {
  const total = daysInMonth(date);
  const elapsed = dayOfMonth(date);
  return Math.round((elapsed / total) * 100);
}

export function budgetPaceLabel(spentPercent: number, expectedPercent: number): string {
  if (spentPercent <= expectedPercent + 5) return 'On track';
  if (spentPercent <= expectedPercent + 15) return 'Watch pace';
  return 'Over pace';
}

export function isoDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export type DailySpendBucket = {
  key: string;
  label: string;
  amount: number;
};

export function buildLastFiveDayBuckets(expenses: Expense[], end = new Date()) {
  const buckets: DailySpendBucket[] = [];
  for (let i = 4; i >= 0; i--) {
    const d = subDays(end, i);
    const key = isoDay(d);
    buckets.push({
      key,
      label: i === 0 ? 'Today' : format(d, 'MMM d'),
      amount: 0,
    });
  }
  for (const e of expenses) {
    const key = e.date.slice(0, 10);
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) bucket.amount += e.amount;
  }
  return buckets;
}

export function sumExpensesOnDay(expenses: Expense[], dayKey: string): number {
  return expenses.reduce((s, e) => (e.date.slice(0, 10) === dayKey ? s + e.amount : s), 0);
}

export function expensesToday(expenses: Expense[], dayKey = isoDay(new Date())): Expense[] {
  return expenses
    .filter((e) => e.date.slice(0, 10) === dayKey)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
