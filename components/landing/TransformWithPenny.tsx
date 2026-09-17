'use client';

import { TransformationShowcase } from '@/components/landing/TransformationShowcase';
import { PennySpeech } from '@/components/landing/PennySpeech';
import { pennyMessages } from '@/lib/landingContent';

export function TransformWithPenny() {
  return (
    <div className="mt-16 rounded-3xl border border-token bg-token-surface p-6 md:p-10">
      <div className="mb-8 flex flex-col items-center gap-6 md:flex-row md:items-end md:justify-between">
        <p className="text-sm font-medium text-token-muted md:max-w-xs">
          Example: one messy note becomes categorized totals
        </p>
        <PennySpeech
          message={pennyMessages.transform}
          size={64}
          mascotSide="right"
          delayMs={200}
        />
      </div>
      <TransformationShowcase />
    </div>
  );
}
