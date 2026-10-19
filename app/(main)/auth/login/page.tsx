"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { useRouter } from "next/navigation";
import { api, isPasswordResetRequired, RESET_REQUIRED_PATH } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const LockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

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

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878a4.5 4.5 0 106.262 6.262M4.031 11.117A9.953 9.953 0 003 12c3.732 7.943 7.523 10 12 10 2.054 0 4.002-.378 5.625-1.003M16 9a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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

  const canSubmit = formData.email.length > 0 && formData.password.length > 0;

  const underlineRow = (focused: boolean, hasError?: boolean) =>
    cn(
      "flex h-10 items-center gap-2 border-b bg-transparent px-0 transition-colors",
      hasError ? "border-token-error" : focused ? "border-token-accent" : "border-token"
    );

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
      if (isPasswordResetRequired(error)) {
        router.push(`${RESET_REQUIRED_PATH}&email=${encodeURIComponent(formData.email)}`);
        return;
      }
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
    <div className="relative flex h-dvh max-h-dvh flex-col items-center justify-center overflow-hidden bg-token-surface px-4 py-2 pt-safe pb-safe">
      <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top,0px))] z-20">
        <ThemeToggle />
      </div>
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-linear-to-br from-teal-400 to-teal-500 opacity-40 blur-3xl dark:opacity-30"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-linear-to-br from-teal-500 to-teal-600 opacity-40 blur-3xl dark:opacity-30"
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-[420px] min-h-0 flex-1 flex-col justify-center py-1">
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
            <h1 className="truncate text-lg font-bold text-token-primary">Welcome back</h1>
            <p className="truncate text-xs text-token-secondary">Thought Expense · sign in to continue</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex shrink-0 flex-col gap-1.5">
          <div>
            <div className={underlineRow(emailFocused, Boolean(errors.email))}>
              <MailIcon
                className={cn("h-4 w-4 shrink-0", emailFocused ? "text-token-accent" : "text-token-muted")}
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                className="flex-1 bg-transparent text-sm text-token-primary placeholder:text-token-muted focus:outline-none"
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-token-error">{errors.email}</p>}
          </div>

          <div>
            <div className={underlineRow(passwordFocused, Boolean(errors.password))}>
              <LockIcon
                className={cn("h-4 w-4 shrink-0", passwordFocused ? "text-token-accent" : "text-token-muted")}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className="flex-1 bg-transparent text-sm text-token-primary placeholder:text-token-muted focus:outline-none"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="shrink-0 rounded-lg p-1 text-token-muted transition-colors hover:text-token-secondary"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-token-error">{errors.password}</p>}
          </div>

          <div className="-mt-0.5 flex justify-end">
            <Link href="/auth/forgot-password" className="text-xs font-medium text-token-accent hover:opacity-90">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading || !canSubmit}
            className="group ml-auto mt-2 flex min-h-10 items-center gap-2 rounded-full bg-token-accent py-2 pl-5 pr-1 text-sm font-semibold text-on-accent transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:opacity-45"
          >
            {isLoading ? (
              <span className="flex items-center gap-2 px-3">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Signing in…
              </span>
            ) : (
              <>
                <span className="tracking-wide">Sign in</span>
                <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/20 transition-transform group-active:translate-x-0.5">
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </>
            )}
          </button>
        </form>

        <p className="mt-2 shrink-0 pb-1 text-center text-sm text-token-secondary">
          No account?{" "}
          <Link href="/auth/signup" className="font-semibold text-token-accent hover:opacity-90">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
