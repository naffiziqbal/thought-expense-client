import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-token-primary">
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'w-full rounded-lg border border-token bg-token-card px-4 py-3 text-base text-token-primary transition-colors',
            'focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-opacity-20',
            'placeholder:text-token-muted disabled:cursor-not-allowed disabled:bg-[var(--blueGray-100)] disabled:text-token-muted',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-token-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
