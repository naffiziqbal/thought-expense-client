import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Started Free',
  description: 'Create your free ThoughtExpense account. Start tracking expenses in natural language — no categories or dates to pick.',
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
