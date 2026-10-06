"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { getDefaultCurrency, getIso4217Currency } from "@/lib/currencies";
import { CurrencySearchPanel } from "@/components/currency/CurrencySearchPanel";

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

export default function SignupPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const markPending = useOnboardingStore((state) => state.markPending);
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
        // Flags the account for the guided tour, which starts itself once the
        // dashboard shell mounts (see components/tour/TourOverlay.tsx).
        markPending(response.data.user.id);
        toast.success("Account created successfully!");
        router.push("/dashboard");
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

  const selectedCurrency = getIso4217Currency(formData.currency);

  const underlineRow = (focused: boolean, hasError?: boolean) =>
    cn(
      "flex h-10 items-center gap-2 border-b bg-transparent px-0 transition-colors",
      hasError ? "border-token-error" : focused ? "border-token-accent" : "border-token"
    );

  return (
    <div className="relative flex h-dvh max-h-dvh flex-col items-center justify-center overflow-hidden bg-token-surface px-4 py-2 pt-safe pb-safe">
      <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top,0px))] z-20">
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

      <div className="relative z-10 flex w-full max-w-[420px] min-h-0 flex-1 flex-col justify-center py-1">
        {/* Header */}
        <div className="mb-3 flex shrink-0 items-center gap-3">
          <Link href="/" className="group shrink-0">
            <div className="rounded-xl bg-token-accent p-2 text-white shadow-md transition-all group-hover:opacity-90">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-token-primary">Create account</h1>
            <p className="truncate text-xs text-token-secondary">Thought Expense · natural-language tracking</p>
          </div>
        </div>

        {/* Smart Form */}
        <form onSubmit={handleSubmit} className="flex shrink-0 flex-col gap-1.5">
          {/* Full Name */}
          <div>
            <div className={underlineRow(nameFocused, Boolean(errors.name))}>
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
            <div className={underlineRow(emailFocused, Boolean(errors.email))}>
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
            <div className={underlineRow(passwordFocused, Boolean(errors.password))}>
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
            {formData.password.length > 0 ? (
            <div className="mt-1 flex gap-1">
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
            ) : null}
            {errors.password && (
              <p className="mt-1 text-sm text-token-error">{errors.password}</p>
            )}
          </div>

          {/* Currency Selector */}
          <div>
            <button
              type="button"
              onClick={() => setCurrencySheetOpen(true)}
              className="flex h-10 w-full items-center gap-2 border-b border-token bg-transparent px-0 text-left text-sm transition-colors hover:border-token-accent"
            >
              <CoinsIcon className="h-4 w-4 shrink-0 text-token-muted" />
              <span className="flex-1 truncate text-token-primary">
                Display currency · {selectedCurrency?.code ?? formData.currency}
              </span>
              <ChevronDownIcon className="h-4 w-4 shrink-0 text-token-muted" />
            </button>
          </div>

          {/* Primary Button */}
          <button
            type="submit"
            disabled={isLoading || !isPasswordValid}
            className="group ml-auto mt-2 flex min-h-10 items-center gap-2 rounded-full bg-token-accent py-2 pl-5 pr-1 text-sm font-semibold text-on-accent transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:opacity-45"
          >
            {isLoading ? (
              <span className="flex items-center gap-2 px-3">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
                Creating…
              </span>
            ) : (
              <>
                <span className="tracking-wide">Get started</span>
                <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/20 transition-transform group-active:translate-x-0.5">
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </>
            )}
          </button>

          {/* Legal */}
          <p className="text-center text-[10px] leading-tight text-token-muted">
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

        {/* Login Link */}
        <p className="mt-2 shrink-0 pb-1 text-center text-sm text-token-secondary">
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
        title="Select currency"
      >
        <div className="max-h-[min(60vh,28rem)] overflow-y-auto pr-0.5">
          <CurrencySearchPanel
            selectedCode={formData.currency}
            onSelect={(code) => {
              setFormData((prev) => ({ ...prev, currency: code }));
              setCurrencySheetOpen(false);
            }}
          />
        </div>
      </BottomSheet>
    </div>
  );
}
