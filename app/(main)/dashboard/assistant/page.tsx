'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { ADVISOR_PROMPT_GROUPS, type AdvisorPrompt } from '@/lib/advisorPrompts';
import toast from 'react-hot-toast';
import type { AssistantMessage, SavingsPlan } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ChatItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  followUps?: string[];
  plan?: SavingsPlan;
}

let chatIdCounter = 0;
function nextId(): string {
  chatIdCounter += 1;
  return `msg-${chatIdCounter}`;
}

function parseBareNumber(text: string): number | null {
  const cleaned = text.trim().replace(/,/g, '');
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const value = parseFloat(cleaned);
  return isNaN(value) || value <= 0 ? null : value;
}

function SavingsPlanCard({ plan }: { plan: SavingsPlan }) {
  return (
    <div className="mt-3 space-y-2 rounded-xl border border-token bg-token-card p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-token-muted">
          Savings plan · {formatCurrency(plan.targetAmount, plan.currency)}
        </p>
        {!plan.feasible ? (
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-300">
            Stretch
          </span>
        ) : null}
      </div>
      <ul className="space-y-2">
        {plan.steps.map((step, i) => (
          <li key={`${step.category}-${i}`} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-token-primary">{step.category}</p>
              <p className="text-xs text-token-secondary">{step.action}</p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-token-accent">
              +{formatCurrency(step.estimatedMonthlySaving, plan.currency)}/mo
            </span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t border-token pt-2">
        <span className="text-sm font-medium text-token-primary">Estimated total</span>
        <span className="text-sm font-bold text-token-accent">
          {formatCurrency(plan.estimatedTotalSaving, plan.currency)}/mo
        </span>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  const { isAuthenticated, isLoading: authLoading } = useProtectedRoute();
  const { user } = useAuthStore();

  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [hasRemainingInfo, setHasRemainingInfo] = useState(false);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planAmount, setPlanAmount] = useState('');
  const [quickSaveAmount, setQuickSaveAmount] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const applyRemaining = (value: number | null) => {
    setRemaining(value);
    setHasRemainingInfo(true);
  };

  const handleApiError = (err: unknown, fallback: string) => {
    const e = err as { response?: { status?: number; data?: { message?: string } } };
    if (e.response?.status === 403) {
      setLimitMessage(e.response.data?.message || 'You have used all your free questions this month.');
      applyRemaining(0);
    } else {
      toast.error(e.response?.data?.message || fallback);
    }
  };

  const buildHistory = (items: ChatItem[]): AssistantMessage[] =>
    items.map((m) => ({ role: m.role, content: m.content }));

  const runSavingsPlan = async (targetAmount: number, userLabel?: string) => {
    if (isThinking) return;
    const userMessage: ChatItem = {
      id: nextId(),
      role: 'user',
      content: userLabel || `Build a savings plan for ${formatCurrency(targetAmount, user?.currency || 'USD')}`,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);
    try {
      const res = await api.createSavingsPlan(targetAmount);
      if (res.success) {
        const { plan, remainingFreeQuestions } = res.data;
        applyRemaining(remainingFreeQuestions);
        setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', content: plan.summary, plan }]);
      }
    } catch (err) {
      handleApiError(err, 'Failed to build savings plan');
    } finally {
      setIsThinking(false);
    }
  };

  const runWhy = async (label: string) => {
    if (isThinking) return;
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', content: label }]);
    setIsThinking(true);
    try {
      const res = await api.askAssistantWhy();
      if (res.success) {
        applyRemaining(res.data.remainingFreeQuestions);
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'assistant', content: res.data.answer, followUps: res.data.followUps },
        ]);
      }
    } catch (err) {
      handleApiError(err, 'Failed to get an answer');
    } finally {
      setIsThinking(false);
    }
  };

  const sendQuestion = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isThinking) return;

    const bareNumber = parseBareNumber(trimmed);
    if (bareNumber !== null) {
      await runSavingsPlan(bareNumber, trimmed);
      return;
    }

    const history = buildHistory(messages);
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', content: trimmed }]);
    setIsThinking(true);
    try {
      const res = await api.askAssistant(trimmed, history.length > 0 ? history : undefined);
      if (res.success) {
        applyRemaining(res.data.remainingFreeQuestions);
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'assistant', content: res.data.answer, followUps: res.data.followUps },
        ]);
      }
    } catch (err) {
      handleApiError(err, 'Failed to get an answer');
    } finally {
      setIsThinking(false);
    }
  };

  const handlePrompt = (prompt: AdvisorPrompt) => {
    if (prompt.action === 'plan') setPlanModalOpen(true);
    else if (prompt.action === 'why') runWhy(prompt.question);
    else sendQuestion(prompt.question);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = input;
    setInput('');
    sendQuestion(value);
  };

  const handlePlanSubmit = () => {
    const value = parseFloat(planAmount.replace(/,/g, ''));
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }
    setPlanModalOpen(false);
    setPlanAmount('');
    runSavingsPlan(value);
  };

  const handleQuickSave = () => {
    const value = parseFloat(quickSaveAmount.replace(/,/g, ''));
    if (isNaN(value) || value <= 0) {
      toast.error('Enter an amount to save');
      return;
    }
    setQuickSaveAmount('');
    runSavingsPlan(value);
  };

  const resetChat = () => {
    setMessages([]);
    setLimitMessage(null);
    setInput('');
  };

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  const followUps =
    messages.length > 0 && !isThinking && lastAssistant?.followUps?.length ? lastAssistant.followUps : [];

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-token-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent-primary)] border-r-transparent" />
      </div>
    );
  }

  const currency = user?.currency || 'USD';

  return (
    <DashboardLayout>
      <div className="mx-auto flex h-full min-h-0 w-full max-w-lg flex-1 flex-col pb-1">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-token bg-token-card shadow-sm">
          <div className="flex shrink-0 items-center gap-2 border-b border-token px-3 py-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-primary)]/15 text-token-accent">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight text-token-primary">Penny</p>
              <p className="text-[11px] leading-tight text-token-muted">Your spending data</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {hasRemainingInfo && remaining !== null && !user?.isPremium ? (
                <span className="rounded-full border border-token bg-[var(--background-tag)] px-2 py-0.5 text-[10px] font-medium text-token-secondary">
                  {remaining} free
                </span>
              ) : null}
              {messages.length > 0 ? (
                <button
                  type="button"
                  onClick={resetChat}
                  className="text-xs font-medium text-token-accent hover:underline"
                >
                  New chat
                </button>
              ) : null}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
            {messages.length === 0 ? (
              <div className="space-y-4 pb-2">
                <p className="text-sm leading-relaxed text-token-secondary">
                  Ask why spending changed, where money goes, or get a savings plan with numbers from your account —
                  not generic tips.
                </p>

                <div className="rounded-xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5 p-3">
                  <p className="text-xs font-medium text-token-accent">Quick savings plan</p>
                  <p className="mt-1 text-xs text-token-secondary">Target to save next month ({currency})</p>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={quickSaveAmount}
                      onChange={(e) => setQuickSaveAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      className="min-w-0 flex-1 rounded-lg border border-token bg-token-card px-3 py-2 text-sm text-token-primary"
                    />
                    <Button type="button" size="sm" onClick={handleQuickSave} disabled={isThinking}>
                      Build
                    </Button>
                  </div>
                </div>

                {ADVISOR_PROMPT_GROUPS.map((group) => (
                  <div key={group.id}>
                    <p className="mb-2 ml-1 text-xs text-token-muted">{group.label}</p>
                    <div className="overflow-hidden rounded-xl border border-token">
                      {group.prompts.map((prompt, i) => (
                        <button
                          key={prompt.id}
                          type="button"
                          disabled={isThinking}
                          onClick={() => handlePrompt(prompt)}
                          className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-50 ${
                            i < group.prompts.length - 1 ? 'border-b border-token' : ''
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-token-primary">{prompt.title}</p>
                            <p className="text-xs text-token-muted">{prompt.subtitle}</p>
                          </div>
                          <svg className="h-4 w-4 shrink-0 text-token-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id}>
                    {message.role === 'user' ? (
                      <div className="flex justify-end">
                        <div className="max-w-[88%] rounded-2xl rounded-br-md bg-token-accent px-3.5 py-2.5 text-sm text-white">
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-[95%]">
                        <p className="mb-1 text-[11px] font-medium text-token-accent">Penny</p>
                        <div className="rounded-2xl rounded-bl-md border border-token bg-[var(--background-tag)] px-3.5 py-2.5 text-sm leading-relaxed text-token-primary whitespace-pre-wrap">
                          {message.content}
                          {message.plan ? <SavingsPlanCard plan={message.plan} /> : null}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isThinking ? (
                  <div>
                    <p className="mb-1 text-[11px] font-medium text-token-muted">Penny</p>
                    <div className="inline-flex rounded-2xl rounded-bl-md border border-token bg-[var(--background-tag)] px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-token-muted [animation-delay:0ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-token-muted [animation-delay:150ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-token-muted [animation-delay:300ms]" />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-token-muted">Checking your spending…</p>
                  </div>
                ) : null}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {limitMessage ? (
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-token bg-amber-500/10 px-4 py-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">{limitMessage}</p>
              <Link href="/dashboard/premium" className="shrink-0 rounded-lg bg-token-accent px-3 py-1.5 text-sm font-medium text-white">
                Upgrade
              </Link>
            </div>
          ) : null}

          {followUps.length > 0 ? (
            <div className="shrink-0 border-t border-token px-3 py-2">
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-token-muted">Follow up</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {followUps.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => sendQuestion(f)}
                    className="shrink-0 rounded-full border border-token bg-token-card px-3 py-1.5 text-xs font-medium text-token-secondary hover:border-[var(--accent-primary)]/50 hover:text-token-accent"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="shrink-0 border-t border-token p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="Ask about your spending…"
                className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border border-token bg-[var(--background-tag)] px-3 py-2.5 text-sm text-token-primary placeholder:text-token-muted focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={isThinking || !input.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-token-accent text-white disabled:opacity-40"
                aria-label="Send"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      <Modal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title="Savings plan"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setPlanModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handlePlanSubmit} className="flex-1">
              Build plan
            </Button>
          </div>
        }
      >
        <label className="mb-2 block text-sm font-medium text-token-secondary">
          How much do you want to save next month?
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={planAmount}
          onChange={(e) => setPlanAmount(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePlanSubmit()}
          placeholder="Enter target amount"
          className="w-full rounded-lg border border-token px-4 py-2 text-sm text-token-primary"
        />
        <p className="mt-2 text-xs text-token-muted">Currency: {currency}</p>
      </Modal>
    </DashboardLayout>
  );
}
