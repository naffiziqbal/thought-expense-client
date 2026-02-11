'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878a4.5 4.5 0 106.262 6.262M4.031 11.117A9.953 9.953 0 003 12c3.732 7.943 7.523 10 12 10 2.054 0 4.002-.378 5.625-1.003M16 9a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const AppleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c1.32-1.58 1.18-4.04-.31-5.62-1.37-1.46-3.53-1.89-5.37-1.05-1.45.76-2.46 1.94-2.44 2.04.22.11 2.09 1.01 3.12 2.63z" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
        toast.success('Login successful!');
        router.push('/dashboard/add');
      }
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || 'Invalid email or password'
          : 'Invalid email or password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast(`Sign in with ${provider} - Coming soon!`);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-y-auto overflow-x-hidden bg-white px-6 py-12">
      {/* Teal Gradient Orbs (design token accent) */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-linear-to-br from-teal-400 to-teal-500 opacity-60 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-linear-to-br from-teal-500 to-teal-600 opacity-60 blur-3xl"
        aria-hidden
      />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[420px]">
        {/* Brand Anchor */}
        <div className="flex flex-col items-center">
          <Link
            href="/"
            className="mb-6 inline-block rounded-2xl bg-linear-to-br from-teal-500 to-teal-600 px-5 py-4 shadow-lg transition-transform hover:scale-105"
            style={{ transform: 'rotate(3deg)' }}
          >
            <span className="text-xl font-bold text-white">TE</span>
          </Link>
          <h1 className="text-[30px] font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm font-medium text-gray-500">Securely login to your wallet</p>
        </div>

        {/* Tactile Form */}
        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          {/* Email */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-800">
              Email
            </label>
            <div
              className={cn(
                'flex h-14 items-center gap-3 rounded-2xl px-4 transition-all',
                'bg-gray-50',
                emailFocused && 'bg-white ring-2 ring-teal-500 ring-offset-2 shadow-sm',
                errors.email && 'bg-red-50'
              )}
            >
              <MailIcon
                className={cn(
                  'h-5 w-5 shrink-0',
                  emailFocused ? 'text-teal-600' : 'text-gray-400'
                )}
              />
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                className="flex-1 bg-transparent text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-800">
              Password
            </label>
            <div
              className={cn(
                'flex h-14 items-center gap-3 rounded-2xl px-4 transition-all',
                'bg-gray-50',
                passwordFocused && 'bg-white ring-2 ring-teal-500 ring-offset-2 shadow-sm',
                errors.password && 'bg-red-50'
              )}
            >
              <LockIcon
                className={cn(
                  'h-5 w-5 shrink-0',
                  passwordFocused ? 'text-teal-600' : 'text-gray-400'
                )}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className="flex-1 bg-transparent text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Primary Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 font-semibold text-white shadow-lg shadow-teal-200 transition-all hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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

        {/* Social Login */}
        <div className="mt-8">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium text-gray-500">Or continue with</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <GoogleIcon className="h-6 w-6" />
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('Apple')}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white font-medium text-gray-900 transition-colors hover:bg-gray-50"
            >
              <AppleIcon className="h-6 w-6 text-gray-900" />
              Apple
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="font-semibold text-teal-600 hover:text-teal-700">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
