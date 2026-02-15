"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { CURRENCIES, getDefaultCurrency } from "@/lib/currencies";

function getPasswordStrength(pwd: string): 0 | 1 | 2 | 3 | 4 {
  if (!pwd.length) return 0;
  if (pwd.length < 6) return 1; // Weak
  if (pwd.length < 8) return 2;
  if (pwd.length < 10) return 3;
  return 4; // Strong
}

const UserIcon = ({ className }: { className?: string }) => (
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
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

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

const CoinsIcon = ({ className }: { className?: string }) => (
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
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
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
      d="M19 9l-7 7-7-7"
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

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const AppleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c1.32-1.58 1.18-4.04-.31-5.62-1.37-1.46-3.53-1.89-5.37-1.05-1.45.76-2.46 1.94-2.44 2.04.22.11 2.09 1.01 3.12 2.63z" />
  </svg>
);

export default function SignupPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    currency: getDefaultCurrency(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currencySheetOpen, setCurrencySheetOpen] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const strength = getPasswordStrength(formData.password);
  const isPasswordValid = formData.password.length >= 6;

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !isPasswordValid) return;

    setIsLoading(true);
    try {
      const response = await api.signup({
        email: formData.email,
        password: formData.password,
        name: formData.name || undefined,
        currency: formData.currency,
      });

      if (response.success) {
        setUser(response.data.user);
        toast.success("Account created successfully!");
        router.push("/dashboard/add");
      }
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
            errors?: Array<{ field: string; message: string }>;
          };
        };
      };
      const message =
        err.response?.data?.message ||
        "Failed to create account. Please try again.";
      toast.error(message);

      if (err.response?.data?.errors) {
        const apiErrors: Record<string, string> = {};
        err.response.data.errors.forEach(
          (e: { field: string; message: string }) => {
            apiErrors[e.field] = e.message;
          }
        );
        setErrors(apiErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = (provider: string) => {
    toast(`${provider} sign up - Coming soon!`);
  };

  const selectedCurrency = CURRENCIES.find(
    (c) => c.value === formData.currency
  );

  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-token-surface px-4 py-4">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>
      {/* Teal Gradient Orbs (design token accent) */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-linear-to-br from-teal-400 to-teal-600 opacity-40 dark:opacity-30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-linear-to-br from-teal-500 to-teal-600 opacity-40 dark:opacity-30 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-[420px] shrink-0 py-1">
        {/* Header */}
        <div className="flex shrink-0 flex-col items-center ">
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
            Create Account
          </h1>
          <p className="mt-0.5 text-xs text-token-secondary">
            Start tracking expenses naturally
          </p>
        </div>

        {/* Smart Form */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
          {/* Full Name */}
          <div>
            <div
              className={cn(
                "flex h-11 items-center gap-2.5 rounded-xl px-3 transition-all",
                "bg-[var(--background-tag)]",
                nameFocused &&
                  "bg-token-card ring-2 ring-[var(--accent-primary)] ring-offset-2 dark:ring-offset-[var(--background-surface)] shadow-sm",
                errors.name && "bg-red-50 dark:bg-red-950/30"
              )}
            >
              <UserIcon
                className={cn(
                  "h-5 w-5 shrink-0",
                  nameFocused ? "text-token-accent" : "text-token-muted"
                )}
              />
              <input
                ref={nameInputRef}
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                className="flex-1 bg-transparent text-base text-token-primary placeholder:text-token-muted focus:outline-none"
                autoComplete="name"
                aria-label="Full Name"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-token-error">{errors.name}</p>
            )}
          </div>

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
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                className="flex-1 bg-transparent text-base text-token-primary placeholder:text-token-muted focus:outline-none"
                autoComplete="email"
                aria-label="Email"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-token-error">{errors.email}</p>
            )}
          </div>

          {/* Password + Strength Meter */}
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
                placeholder="Password (min 6 characters)"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className="flex-1 bg-transparent text-base text-token-primary placeholder:text-token-muted focus:outline-none"
                autoComplete="new-password"
                aria-label="Password"
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
            {/* Strength Meter - 4 pills */}
            <div className="mt-1.5 flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    strength === 0 && "bg-[var(--border-default)]",
                    strength === 1 &&
                      (i === 0
                        ? "bg-token-error"
                        : "bg-[var(--border-default)]"),
                    strength === 2 &&
                      (i < 2
                        ? "bg-token-warning"
                        : "bg-[var(--border-default)]"),
                    strength === 3 &&
                      (i < 3
                        ? "bg-token-warning"
                        : "bg-[var(--border-default)]"),
                    strength === 4 && "bg-token-success"
                  )}
                />
              ))}
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-token-error">{errors.password}</p>
            )}
          </div>

          {/* Currency Selector */}
          <div>
            <button
              type="button"
              onClick={() => setCurrencySheetOpen(true)}
              className="flex h-11 w-full items-center gap-2.5 rounded-xl bg-[var(--background-tag)] px-3 text-left transition-all hover:bg-[var(--surface-hover)]"
            >
              <CoinsIcon className="h-5 w-5 shrink-0 text-token-muted" />
              <span className="flex-1 text-base text-token-primary">
                {selectedCurrency?.label ?? formData.currency}
              </span>
              <ChevronDownIcon className="h-5 w-5 shrink-0 text-token-muted" />
            </button>
          </div>

          {/* Primary Button */}
          <button
            type="submit"
            disabled={isLoading || !isPasswordValid}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-token-accent px-6 font-semibold text-white shadow-lg shadow-teal-200/50 dark:shadow-teal-900/30 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50"
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
                Creating account...
              </span>
            ) : (
              <>
                Get Started
                <ArrowRightIcon className="h-5 w-5" />
              </>
            )}
          </button>

          {/* Legal */}
          <p className="text-center text-[11px] leading-tight text-token-secondary">
            By signing up, you agree to our{" "}
            <Link
              href="/terms"
              className="font-medium text-token-primary underline hover:text-token-accent"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-medium text-token-primary underline hover:text-token-accent"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </form>

        {/* Social Sign-Up */}
        <div className="mt-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--border-default)]" />
            <span className="text-xs font-medium text-token-secondary">
              Or continue with
            </span>
            <div className="h-px flex-1 bg-[var(--border-default)]" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialSignup("Google")}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-token bg-token-card text-sm font-medium text-token-primary transition-colors hover:bg-[var(--surface-hover)]"
            >
              <GoogleIcon className="h-5 w-5" />
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialSignup("Apple")}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-token bg-token-card text-sm font-medium text-token-primary transition-colors hover:bg-[var(--surface-hover)]"
            >
              <AppleIcon className="h-5 w-5" />
              Apple
            </button>
          </div>
        </div>

        {/* Login Link */}
        <p className="mt-4 text-center text-sm text-token-secondary">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-token-accent hover:opacity-90"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Currency Bottom Sheet */}
      <BottomSheet
        isOpen={currencySheetOpen}
        onClose={() => setCurrencySheetOpen(false)}
        title="Select Currency"
      >
        <div className="space-y-1">
          {CURRENCIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, currency: c.value }));
                setCurrencySheetOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors",
                formData.currency === c.value
                  ? "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300"
                  : "hover:bg-[var(--surface-hover)]"
              )}
            >
              <span className="font-medium text-token-primary">{c.label}</span>
              {formData.currency === c.value && (
                <svg
                  className="h-5 w-5 text-token-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
