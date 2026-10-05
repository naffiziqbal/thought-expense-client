import type { RecurringRule } from '@/types';

export const RECURRING_PAGE_HINT =
  'Subscriptions and bills we log on schedule — pause anytime or tap Log now to add one early.';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function describeRecurringSchedule(rule: RecurringRule): string {
  if (rule.frequency === 'weekly') {
    return `Every ${WEEKDAYS[rule.dayOfWeek ?? 0]}`;
  }
  const day = rule.dayOfMonth;
  return day ? `Monthly on day ${day}` : 'Monthly';
}

export function formatRecurringNextRun(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function summarizeRecurringRules(rules: RecurringRule[]) {
  const active = rules.filter((r) => r.isActive);
  const paused = rules.filter((r) => !r.isActive);
  const next =
    active.length > 0
      ? [...active].sort((a, b) => new Date(a.nextRunAt).getTime() - new Date(b.nextRunAt).getTime())[0]
      : null;
  return { active, paused, next, total: rules.length };
}

export function normalizeRecurringDescription(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}
