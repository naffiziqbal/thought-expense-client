'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/landing/ThemeToggle';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});
    try {
      const response = await api.forgotPassword(email);
      if (response.success) {
        setEmailSent(true);
        toast.success(response.message);
      }
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || 'Something went wrong. Please try again.'
          : 'Something went wrong. Please try again.';
      toast.error(message);
      setErrors({ email: message });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-token-surface px-4 py-4">
        <div className="absolute right-4 top-4 z-20">
          <ThemeToggle />
        </div>
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-teal-400 opacity-40 dark:opacity-30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-500 opacity-40 dark:opacity-30 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10 w-full max-w-[420px] shrink-0 py-1 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950/50">
              <MailIcon className="h-8 w-8 text-token-accent" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-token-primary">Check your email</h1>
          <p className="mt-2 text-sm text-token-secondary">
            If an account exists for <strong className="text-token-primary">{email}</strong>, you&apos;ll receive a password reset link shortly.
          </p>
          <p className="mt-2 text-sm text-token-muted">
            The link will expire in 1 hour. Don&apos;t see it? Check your spam folder.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-token-accent hover:opacity-90"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-token-surface px-4 py-4">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>
      {/* Teal Gradient Orbs */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-teal-400 opacity-40 dark:opacity-30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-500 opacity-40 dark:opacity-30 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-[420px] shrink-0 py-1">
        <div className="flex flex-col items-center">
          <Link
            href="/"
            className="mb-3 inline-block rounded-xl bg-linear-to-br from-teal-500 to-teal-600 px-4 py-2.5 shadow-lg transition-transform hover:scale-105"
          >
            <span className="text-lg font-bold text-white">TE</span>
          </Link>
          <h1 className="text-xl font-bold text-token-primary">Forgot password?</h1>
          <p className="mt-0.5 text-xs text-token-secondary">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
          <div>
            <div
              className={cn(
                'flex h-11 items-center gap-2.5 rounded-xl px-3 transition-all',
                'bg-[var(--background-tag)]',
                emailFocused && 'bg-token-card ring-2 ring-[var(--accent-primary)] ring-offset-2 dark:ring-offset-[var(--background-surface)] shadow-sm',
                errors.email && 'bg-red-50 dark:bg-red-950/30'
              )}
            >
              <MailIcon
                className={cn(
                  'h-5 w-5 shrink-0',
                  emailFocused ? 'text-token-accent' : 'text-token-muted'
                )}
              />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                className="flex-1 bg-transparent text-base text-token-primary placeholder:text-token-muted focus:outline-none"
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-token-error">{errors.email}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-token-accent px-6 font-semibold text-white shadow-lg shadow-teal-200/50 dark:shadow-teal-900/30 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending...
              </span>
            ) : (
              'Send reset link'
            )}
          </button>
        </form>

        <Link
          href="/auth/login"
          className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-token-secondary hover:text-token-primary"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to login
        </Link>
      </div>
    </div>
  );
}
