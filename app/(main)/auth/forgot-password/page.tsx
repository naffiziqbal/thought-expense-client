"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const KeyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
    />
  </svg>
);

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);

  const validateEmail = () => {
    const newErrors: Record<string, string> = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateEmail()) return;

    setIsLoading(true);
    setErrors({});
    try {
      const response = await api.forgotPassword(email);
      if (response.success) {
        toast.success(response.message);
        setOtp("");
        setStep("otp");
      }
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || "Something went wrong. Please try again."
          : "Something went wrong. Please try again.";
      toast.error(message);
      setErrors({ email: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      setErrors({ otp: "Enter the 6-digit code from your email" });
      return;
    }

    setIsLoading(true);
    setErrors({});
    try {
      const response = await api.verifyResetOtp(email, otp.trim());
      if (response.success && response.data?.resetToken) {
        router.push(`/auth/reset-password?token=${encodeURIComponent(response.data.resetToken)}`);
      } else {
        setErrors({ otp: "Invalid or expired code. Please try again." });
      }
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || "Invalid or expired code. Please try again."
          : "Invalid or expired code. Please try again.";
      setErrors({ otp: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-token-surface px-4 py-4 pt-safe pb-safe">
      <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top,0px))] z-20">
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
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950/50 my-5">
            {step === "email" ? (
              <MailIcon className="h-8 w-8 text-token-accent" />
            ) : (
              <KeyIcon className="h-8 w-8 text-token-accent" />
            )}
          </div>
          <h1 className="text-xl font-bold text-token-primary">
            {step === "email" ? "Forgot password?" : "Enter your code"}
          </h1>
          <p className="mt-0.5 text-xs text-token-secondary text-center max-w-[320px]">
            {step === "email"
              ? "Enter your email and we'll send you a 6-digit code"
              : `We sent a 6-digit code to ${email}. It expires in 10 minutes.`}
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="mt-4 flex flex-col gap-2">
            <div>
              <div
                className={cn(
                  "flex h-11 items-center gap-2.5 rounded-xl px-3 transition-all",
                  "bg-[var(--background-tag)]",
                  emailFocused &&
                    "bg-token-card ring-2 ring-[var(--accent-primary)] ring-offset-2 dark:ring-offset-[var(--background-surface)] shadow-sm",
                  errors.email && "bg-red-50 dark:bg-red-950/30"
                )}
              >
                <MailIcon className={cn("h-5 w-5 shrink-0", emailFocused ? "text-token-accent" : "text-token-muted")} />
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
              {isLoading ? "Sending..." : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-4 flex flex-col gap-3">
            <div>
              <div
                className={cn(
                  "flex h-14 items-center justify-center rounded-xl px-3 transition-all",
                  "bg-[var(--background-tag)]",
                  otpFocused &&
                    "bg-token-card ring-2 ring-[var(--accent-primary)] ring-offset-2 dark:ring-offset-[var(--background-surface)] shadow-sm",
                  errors.otp && "bg-red-50 dark:bg-red-950/30"
                )}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  onFocus={() => setOtpFocused(true)}
                  onBlur={() => setOtpFocused(false)}
                  maxLength={6}
                  className="w-full bg-transparent text-center text-2xl font-bold tracking-[0.6em] text-token-primary placeholder:text-token-muted focus:outline-none"
                />
              </div>
              {errors.otp && <p className="mt-1 text-sm text-token-error text-center">{errors.otp}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-token-accent px-6 font-semibold text-white shadow-lg shadow-teal-200/50 dark:shadow-teal-900/30 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Verify code"}
            </button>

            <button
              type="button"
              onClick={() => handleSendOtp()}
              disabled={isLoading}
              className="text-sm font-medium text-token-accent hover:opacity-90 disabled:opacity-50"
            >
              Resend code
            </button>
          </form>
        )}

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
