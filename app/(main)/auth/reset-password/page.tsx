"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const LockIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878a4.5 4.5 0 106.262 6.262M4.031 11.117A9.953 9.953 0 003 12c3.732 7.943 7.523 10 12 10 2.054 0 4.002-.378 5.625-1.003M16 9a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset link. Please request a new one.");
    }
  }, [token]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});
    try {
      const response = await api.resetPassword(token, password);
      if (response.success) {
        toast.success(response.message);
        router.push("/auth/login");
      }
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message ||
            "Invalid or expired link. Please request a new one."
          : "Something went wrong. Please try again.";
      toast.error(message);
      setErrors({ password: message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-token-surface px-4 py-4 pt-safe pb-safe">
        <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top,0px))] z-20">
          <ThemeToggle />
        </div>
        <div className="relative z-10 w-full max-w-[420px] shrink-0 py-1 text-center">
          <h1 className="text-xl font-bold text-token-primary">
            Invalid reset link
          </h1>
          <p className="mt-2 text-sm text-token-secondary">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <Link
            href="/auth/forgot-password"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-token-accent px-6 py-3 font-semibold text-white hover:opacity-90"
          >
            Request new link
          </Link>
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

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-token-surface px-4 py-4 pt-safe pb-safe">
      <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top,0px))] z-20">
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

      <div className="relative z-10 w-full max-w-[420px] shrink-0 py-1">
        <div className="flex flex-col items-center">
          <Link href="/" className="flex items-center space-x-2 group py-5">
            <div className="bg-token-accent text-white rounded-2xl p-2 shadow-md group-hover:opacity-90 transition-all">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </Link>
          <h1 className="text-xl font-bold text-token-primary">
            Set new password
          </h1>
          <p className="mt-0.5 text-xs text-token-secondary">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
          <div>
            <div
              className={cn(
                "flex h-11 items-center gap-2.5 rounded-xl px-3 transition-all",
                "bg-[var(--background-tag)]",
                passwordFocused &&
                  "bg-token-card ring-2 ring-[var(--accent-primary)] ring-offset-2 dark:ring-offset-[var(--background-surface)] shadow-sm",
                errors.password && "bg-red-50 dark:bg-red-950/30"
              )}
            >
              <LockIcon
                className={cn(
                  "h-5 w-5 shrink-0",
                  passwordFocused ? "text-token-accent" : "text-token-muted"
                )}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className="flex-1 bg-transparent text-base text-token-primary placeholder:text-token-muted focus:outline-none"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="shrink-0 rounded-lg p-1.5 text-token-muted hover:bg-[var(--surface-hover)] hover:text-token-secondary"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-token-error">{errors.password}</p>
            )}
          </div>

          <div>
            <div
              className={cn(
                "flex h-11 items-center gap-2.5 rounded-xl px-3 transition-all",
                "bg-[var(--background-tag)]",
                confirmFocused &&
                  "bg-token-card ring-2 ring-[var(--accent-primary)] ring-offset-2 dark:ring-offset-[var(--background-surface)] shadow-sm",
                errors.confirmPassword && "bg-red-50 dark:bg-red-950/30"
              )}
            >
              <LockIcon
                className={cn(
                  "h-5 w-5 shrink-0",
                  confirmFocused ? "text-token-accent" : "text-token-muted"
                )}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setConfirmFocused(true)}
                onBlur={() => setConfirmFocused(false)}
                className="flex-1 bg-transparent text-base text-token-primary placeholder:text-token-muted focus:outline-none"
                autoComplete="new-password"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-token-error">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-token-accent px-6 font-semibold text-white shadow-lg shadow-teal-200/50 dark:shadow-teal-900/30 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Resetting...
              </span>
            ) : (
              "Reset password"
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-token-surface">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-r-transparent" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
