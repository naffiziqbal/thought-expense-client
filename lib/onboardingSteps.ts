export interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  /** Visual variant for the animated demo */
  demo: 'typing' | 'parse' | 'budget' | 'insights';
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'type',
    title: 'Log expenses in plain language',
    subtitle: 'No forms — just type what you spent, like a text message.',
    demo: 'typing',
  },
  {
    id: 'parse',
    title: 'AI parses & categorizes',
    subtitle: 'Amounts, categories, and dates are filled in automatically.',
    demo: 'parse',
  },
  {
    id: 'budget',
    title: 'Stay on budget',
    subtitle: 'See monthly totals, safe-to-spend, and category progress at a glance.',
    demo: 'budget',
  },
  {
    id: 'insights',
    title: 'Get smart insights',
    subtitle: 'Charts, spending patterns, and an AI advisor when you need help.',
    demo: 'insights',
  },
];

export const TYPING_DEMO = 'coffee 120, uber 250';

export const PARSED_DEMO = [
  { label: 'Coffee', category: 'Food', amount: 120 },
  { label: 'Uber', category: 'Transport', amount: 250 },
] as const;
