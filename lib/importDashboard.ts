import type { ExpenseImportPreview } from '@/types';

export const IMPORT_DATA_HINT =
  'CSV: review rows before import. PDF or photos: we OCR the file, queue AI parsing, then add expenses — you can keep using the app while it runs.';

export const IMPORT_ASYNC_STEPS = [
  { key: 'queued', title: 'Queued', detail: 'Your file is ready to process.' },
  { key: 'ocr', title: 'Reading document', detail: 'Extracting text from pages with OCR.' },
  { key: 'parse', title: 'Understanding expenses', detail: 'AI finds dates, amounts, and categories.' },
  { key: 'save', title: 'Updating expense list', detail: 'Saving transactions to your account.' },
  { key: 'done', title: 'Complete', detail: 'Open Expenses to review everything.' },
] as const;

export type ImportJobPhase = 'queued' | 'ocr' | 'parse' | 'save' | 'done' | 'failed' | 'cancelled';

export function importPreviewSummary(preview: ExpenseImportPreview, fileName?: string | null): string {
  const base = `${preview.rows.length} expense${preview.rows.length === 1 ? '' : 's'} from CSV`;
  return fileName ? `${base} · ${fileName}` : base;
}

export function isCsvImportFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  return lower.endsWith('.csv') || file.type.includes('csv');
}

export function isAsyncImportFile(name: string, mimeType: string): boolean {
  const lower = name.toLowerCase();
  if (lower.endsWith('.csv') || mimeType.includes('csv')) return false;
  return (
    lower.endsWith('.pdf') ||
    mimeType.includes('pdf') ||
    mimeType.startsWith('image/') ||
    /\.(jpe?g|png|webp|heic|heif)$/i.test(lower)
  );
}

export function phaseToStepIndex(phase: ImportJobPhase): number {
  if (phase === 'failed' || phase === 'cancelled') return -1;
  const order: ImportJobPhase[] = ['queued', 'ocr', 'parse', 'save', 'done'];
  const idx = order.indexOf(phase);
  return idx >= 0 ? idx : 0;
}
