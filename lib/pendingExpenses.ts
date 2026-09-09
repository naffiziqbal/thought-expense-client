export type PendingExpense = {
  localId: string;
  jobId: string;
  batchId: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  rawInput: string;
  createdAt: string;
};

export function inDateRange(date: string, start?: string, end?: string): boolean {
  const day = date.slice(0, 10);
  if (start && day < start.slice(0, 10)) return false;
  if (end && day > end.slice(0, 10)) return false;
  return true;
}

export function addPendingToTotals(
  totalSpent: number,
  byCategory: Record<string, number>,
  pending: PendingExpense[],
  start?: string,
  end?: string
): { totalSpent: number; byCategory: Record<string, number> } {
  const next = { ...byCategory };
  let total = totalSpent;
  for (const p of pending) {
    if (!inDateRange(p.date, start, end)) continue;
    total += p.amount;
    next[p.category] = (next[p.category] || 0) + p.amount;
  }
  return { totalSpent: total, byCategory: next };
}
