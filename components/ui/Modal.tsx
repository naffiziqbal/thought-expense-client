import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet on narrow viewports (keyboard-safe); centered dialog on larger screens */}
      <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
        <div
          className={cn(
            'relative z-10 flex w-full max-w-md max-h-[min(90dvh,100%)] flex-col overflow-hidden bg-token-card shadow-2xl border border-token',
            'rounded-t-2xl sm:rounded-xl',
            'animate-in fade-in zoom-in duration-200'
          )}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-token p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-token-primary sm:text-xl">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-token-muted hover:bg-[var(--surface-hover)] hover:text-token-primary"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>

          {/* Footer */}
          {footer ? (
            <div className="shrink-0 border-t border-token bg-token-surface p-4 sm:p-6">{footer}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
