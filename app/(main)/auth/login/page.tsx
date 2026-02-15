"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const MailIcon = ({ className }: { className?: string }) => (
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
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

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

const ArrowRightIcon = ({ className }: { className?: string }) => (
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
      d="M14 5l7 7m0 0l-7 7m7-7H3"
    />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await api.login({
        email: formData.email,
        password: formData.password,
      });
      if (response.success) {
        setUser(response.data.user);
        toast.success("Login successful!");
        router.push("/dashboard/add");
      }
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || "Invalid email or password"
          : "Invalid email or password";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-token-surface px-4 py-4">
      {/* Theme toggle */}
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>
      {/* Teal Gradient Orbs (design token accent) */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-linear-to-br from-teal-400 to-teal-500 opacity-40 dark:opacity-30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-linear-to-br from-teal-500 to-teal-600 opacity-40 dark:opacity-30 blur-3xl"
        aria-hidden
      />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[420px] shrink-0 py-1">
        {/* Brand Anchor */}
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
          <h1 className="text-xl font-bold text-token-primary">Welcome Back</h1>
          <p className="mt-0.5 text-xs text-token-secondary">
            Securely login to your wallet
          </p>
        </div>

        {/* Tactile Form */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
          {/* Email */}
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
              <MailIcon
                className={cn(
                  "h-5 w-5 shrink-0",
                  emailFocused ? "text-token-accent" : "text-token-muted"
                )}
              />
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                className="flex-1 bg-transparent text-base text-token-primary placeholder:text-token-muted focus:outline-none"
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-token-error">{errors.email}</p>
            )}
          </div>

          {/* Password */}
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
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className="flex-1 bg-transparent text-base text-token-primary placeholder:text-token-muted focus:outline-none"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="shrink-0 rounded-lg p-1.5 text-token-muted hover:bg-[var(--surface-hover)] hover:text-token-secondary transition-colors"
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

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-token-accent hover:opacity-90 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Primary Action */}
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
                Signing in...
              </span>
            ) : (
              <>
                Sign In
                <ArrowRightIcon className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-4 text-center text-sm text-token-secondary">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-token-accent hover:opacity-90"
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
