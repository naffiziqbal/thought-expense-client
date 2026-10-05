export type AdvisorPromptAction = 'ask' | 'why' | 'plan';

export type AdvisorPrompt = {
  id: string;
  title: string;
  subtitle: string;
  action: AdvisorPromptAction;
  /** Question sent when action is ask or why */
  question: string;
};

export type AdvisorPromptGroup = {
  id: string;
  label: string;
  prompts: AdvisorPrompt[];
};

export const ADVISOR_PROMPT_GROUPS: AdvisorPromptGroup[] = [
  {
    id: 'understand',
    label: 'Understand spending',
    prompts: [
      {
        id: 'why-month',
        title: 'Why spending jumped',
        subtitle: 'Compare this month to your usual',
        action: 'why',
        question: 'Why did I spend so much this month?',
      },
      {
        id: 'top-categories',
        title: 'Where money goes',
        subtitle: 'Top categories and trends',
        action: 'ask',
        question: 'Where does most of my money go this month?',
      },
    ],
  },
  {
    id: 'save',
    label: 'Save smarter',
    prompts: [
      {
        id: 'waste',
        title: 'Find waste',
        subtitle: 'Leaks and one-off spikes',
        action: 'ask',
        question: 'Where am I wasting money based on my history?',
      },
      {
        id: 'cut-food',
        title: 'Trim a category',
        subtitle: 'Concrete cuts you can make',
        action: 'ask',
        question: 'How can I reduce my food spending without giving up everything?',
      },
    ],
  },
  {
    id: 'plan',
    label: 'Plans & recurring',
    prompts: [
      {
        id: 'subscriptions',
        title: 'Recurring charges',
        subtitle: 'Subscriptions and repeat bills',
        action: 'ask',
        question: 'What recurring expenses and subscriptions am I paying for?',
      },
      {
        id: 'savings-plan',
        title: 'Monthly savings plan',
        subtitle: 'Step-by-step from your data',
        action: 'plan',
        question: 'Build a savings plan for next month',
      },
    ],
  },
];
