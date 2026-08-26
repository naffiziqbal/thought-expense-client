'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
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

const STARTER_PROMPTS: { label: string; action: 'ask' | 'why' | 'plan' }[] = [
  { label: 'Why did I spend so much this month?', action: 'why' },
  { label: 'How can I save 20,000 next month?', action: 'ask' },
  { label: 'Where does most of my money go?', action: 'ask' },
  { label: 'What subscriptions am I paying for?', action: 'ask' },
  { label: 'Build savings plan…', action: 'plan' },
];

let chatIdCounter = 0;
function nextId(): string {
  chatIdCounter += 1;
  return `msg-${chatIdCounter}`;
}

/** A user message that is just a number is treated as a savings-plan target */
function parseBareNumber(text: string): number | null {
  const cleaned = text.trim().replace(/,/g, '');
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const value = parseFloat(cleaned);
  return isNaN(value) || value <= 0 ? null : value;
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
      content: userLabel || `Build a savings plan for ${targetAmount}`,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);
    try {
      const res = await api.createSavingsPlan(targetAmount);
      if (res.success) {
        const { plan, remainingFreeQuestions } = res.data;
        applyRemaining(remainingFreeQuestions);
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'assistant', content: plan.summary, plan },
        ]);
      }
    } catch (err) {
      handleApiError(err, 'Failed to build savings plan');
    } finally {
      setIsThinking(false);
    }
  };

  const runWhy = async (label: string) => {
    if (isThinking) return;
    const userMessage: ChatItem = { id: nextId(), role: 'user', content: label };
    setMessages((prev) => [...prev, userMessage]);
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

    // A bare number is a savings-plan target
    const bareNumber = parseBareNumber(trimmed);
    if (bareNumber !== null) {
      await runSavingsPlan(bareNumber, trimmed);
      return;
    }

    const history = buildHistory(messages);
    const userMessage: ChatItem = { id: nextId(), role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = input;
    setInput('');
    sendQuestion(value);
  };

  const handleStarter = (prompt: { label: string; action: 'ask' | 'why' | 'plan' }) => {
    if (prompt.action === 'plan') {
      setPlanModalOpen(true);
    } else if (prompt.action === 'why') {
      runWhy(prompt.label);
    } else {
      sendQuestion(prompt.label);
    }
  };

  const handlePlanSubmit = () => {
    const value = parseFloat(planAmount);
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }
    setPlanModalOpen(false);
    setPlanAmount('');
    runSavingsPlan(value);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-token-surface">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent-primary)] border-r-transparent" />
          <p className="text-token-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  const currency = user?.currency || 'USD';

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-token-surface overflow-hidden">
        {/* Header */}
        <div className="shrink-0 pt-2 pb-3 sm:pt-0 sm:pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-token-primary">AI Advisor</h1>
          <p className="text-sm text-token-secondary mt-0.5">
            Ask anything about your spending
            {hasRemainingInfo && remaining !== null && (
              <span className="ml-1 text-token-muted">
                &middot; {remaining} free question{remaining !== 1 ? 's' : ''} left this month
              </span>
            )}
          </p>
        </div>

        {/* Chat area */}
        <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-token-card border border-token shadow-sm overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="mb-3 text-5xl">💬</div>
                <h3 className="mb-1 text-lg font-semibold text-token-primary">
                  Your personal finance advisor
                </h3>
                <p className="mb-6 text-sm text-token-secondary">
                  Ask about your spending, or tap a suggestion to get started
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.label}
                      type="button"
                      onClick={() => handleStarter(prompt)}
                      disabled={isThinking}
                      className="rounded-full border border-token bg-[var(--background-tag)] px-4 py-2 text-sm font-medium text-token-primary hover:border-[var(--accent-primary)]/50 hover:text-token-accent transition-colors disabled:opacity-50"
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, idx) => {
                  const isLast = idx === messages.length - 1;
                  return (
                    <div key={message.id}>
                      <div
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                            message.role === 'user'
                              ? 'bg-token-accent text-white rounded-br-md'
                              : 'bg-[var(--background-tag)] text-token-primary rounded-bl-md'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>

                          {/* Savings plan card */}
                          {message.plan && (
                            <div className="mt-3 rounded-xl bg-token-card border border-token p-3 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-bold uppercase tracking-wider text-token-muted">
                                  Savings plan &middot; target{' '}
                                  {formatCurrency(message.plan.targetAmount, message.plan.currency)}
                                </p>
                                {!message.plan.feasible && (
                                  <span className="shrink-0 rounded-full bg-amber-100 dark:bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-300">
                                    Stretch goal
                                  </span>
                                )}
                              </div>
                              <ul className="space-y-2">
                                {message.plan.steps.map((step, stepIdx) => (
                                  <li
                                    key={`${step.category}-${stepIdx}`}
                                    className="flex items-start justify-between gap-3"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-token-primary">{step.category}</p>
                                      <p className="text-xs text-token-secondary">{step.action}</p>
                                    </div>
                                    <span className="shrink-0 text-sm font-semibold text-token-accent">
                                      +{formatCurrency(step.estimatedMonthlySaving, message.plan!.currency)}/mo
                                    </span>
                                  </li>
                                ))}
                              </ul>
                              <div className="pt-2 border-t border-token flex items-center justify-between">
                                <span className="text-sm font-semibold text-token-primary">Estimated total</span>
                                <span className="text-sm font-bold text-token-accent">
                                  {formatCurrency(message.plan.estimatedTotalSaving, message.plan.currency)}/mo
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Follow-up chips - only on the latest assistant message */}
                      {message.role === 'assistant' &&
                        isLast &&
                        !isThinking &&
                        message.followUps &&
                        message.followUps.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {message.followUps.map((followUp) => (
                              <button
                                key={followUp}
                                type="button"
                                onClick={() => sendQuestion(followUp)}
                                className="rounded-full border border-token bg-token-card px-3 py-1.5 text-xs font-medium text-token-secondary hover:border-[var(--accent-primary)]/50 hover:text-token-accent transition-colors"
                              >
                                {followUp}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  );
                })}

                {isThinking && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md bg-[var(--background-tag)] px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-token-muted animate-bounce [animation-delay:0ms]" />
                        <span className="h-2 w-2 rounded-full bg-token-muted animate-bounce [animation-delay:150ms]" />
                        <span className="h-2 w-2 rounded-full bg-token-muted animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Free limit reached banner */}
          {limitMessage && (
            <div className="shrink-0 border-t border-token bg-amber-50 dark:bg-amber-950/30 px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-sm text-amber-800 dark:text-amber-300">{limitMessage}</p>
              <Link
                href="/dashboard/premium"
                className="shrink-0 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500 transition-colors"
              >
                Upgrade
              </Link>
            </div>
          )}

          {/* Input row */}
          <form onSubmit={handleSubmit} className="shrink-0 border-t border-token p-3 sm:p-4">
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(true)}
                  disabled={isThinking}
                  title="Build savings plan"
                  className="shrink-0 h-11 w-11 rounded-full border border-token bg-[var(--background-tag)] flex items-center justify-center text-token-secondary hover:border-[var(--accent-primary)]/50 hover:text-token-accent transition-colors disabled:opacity-50"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your spending..."
                className="flex-1 min-w-0 h-11 rounded-full border border-token bg-[var(--background-tag)] px-4 text-sm text-token-primary placeholder:text-token-muted focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all"
              />
              <Button
                type="submit"
                size="md"
                isLoading={isThinking}
                disabled={!input.trim()}
                className="shrink-0 h-11 rounded-full px-5"
              >
                Send
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Savings plan target modal */}
      <Modal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title="Build savings plan"
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
        <div>
          <label className="mb-2 block text-sm font-medium text-token-secondary">
            How much do you want to save next month?
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={planAmount}
            onChange={(e) => setPlanAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePlanSubmit()}
            placeholder="Enter target amount"
            className="w-full rounded-lg border border-token px-4 py-2 text-sm text-token-primary focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
          />
          <p className="mt-2 text-xs text-token-muted">Your currency: {currency}</p>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
