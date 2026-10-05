'use client';

import type { ExpenseImportPreview } from '@/types';
import { importPreviewSummary } from '@/lib/importDashboard';
import { formatCurrency } from '@/lib/utils';

type Props = {
  preview: ExpenseImportPreview;
  fileName?: string | null;
};

export function ExpenseImportPreviewPanel({ preview, fileName }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-token-primary">{importPreviewSummary(preview, fileName)}</p>
      <p className="text-xs text-token-muted">Review everything below before you import.</p>
      {preview.skippedRows > 0 ? (
        <p className="text-xs text-token-muted">{preview.skippedRows} row(s) in the file were skipped.</p>
      ) : null}
      {preview.warnings.map((w) => (
        <p key={w} className="text-xs text-amber-600 dark:text-amber-400">
          {w}
        </p>
      ))}
      <div className="max-h-[min(50vh,22rem)] overflow-auto rounded-control border border-token">
        <table className="w-full min-w-[520px] border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-token-card">
            <tr className="border-b border-token text-token-muted">
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Description</th>
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row, i) => (
              <tr key={`${row.date}-${row.description}-${i}`} className="border-b border-token/60 last:border-0">
                <td className="whitespace-nowrap px-3 py-2 text-token-secondary">{row.date}</td>
                <td className="max-w-[200px] truncate px-3 py-2 text-token-primary" title={row.description}>
                  {row.description}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-token-secondary">{row.category}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right font-medium text-token-primary">
                  {formatCurrency(row.amount, row.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
