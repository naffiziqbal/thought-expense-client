export interface GoalLike {
  status: string;
  savedAmount: number;
  targetAmount: number;
  deadline?: string | null;
}

export interface GoalsSummary<T extends GoalLike = GoalLike> {
  active: T[];
  completed: T[];
  totalSaved: number;
  totalTarget: number;
  overallProgress: number;
}

export function summarizeGoals<T extends GoalLike>(goals: T[]): GoalsSummary<T> {
  const active = goals.filter((g) => g.status === 'active');
  const completed = goals.filter((g) => g.status === 'completed');
  const totalSaved = active.reduce((sum, g) => sum + g.savedAmount, 0);
  const totalTarget = active.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.min(1, totalSaved / totalTarget) : 0;
  return { active, completed, totalSaved, totalTarget, overallProgress };
}

export function daysUntilDeadline(deadline: string | null | undefined): number | null {
  if (!deadline) return null;
  const end = new Date(deadline);
  if (Number.isNaN(end.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / 86400000);
}

export function deadlineLabel(deadline: string | null | undefined): string | null {
  const days = daysUntilDeadline(deadline);
  if (days === null) return null;
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return '1 day left';
  if (days <= 30) return `${days} days left`;
  return null;
}

export const GOAL_STARTER_IDEAS = [
  { name: 'Emergency fund', targetAmount: 10000 },
  { name: 'Vacation', targetAmount: 50000 },
  { name: 'New laptop', targetAmount: 80000 },
] as const;

export function quickContributeAmounts(remaining: number, currency: string): number[] {
  const scales =
    currency === 'BDT' || currency === 'INR' || currency === 'PKR'
      ? [1000, 5000, 10000]
      : [25, 100, 500];
  const fromRemaining = remaining > 0 ? [Math.round(remaining / 4), Math.round(remaining / 2), remaining] : [];
  const merged = [...scales, ...fromRemaining.filter((n) => n > 0)];
  const unique = Array.from(new Set(merged.map((n) => Math.max(1, Math.round(n)))));
  return unique.sort((a, b) => a - b).slice(0, 4);
}
