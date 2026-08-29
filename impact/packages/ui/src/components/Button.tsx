'use client';

import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, children, className = '', disabled, ...props }, ref) => {
    const variantClass = {
      primary: 'bg-[--color-brand-500] text-white hover:bg-[--color-brand-600]',
      secondary: 'border border-[--color-border] text-[--color-text-primary] hover:bg-[--color-surface-elevated]',
      ghost: 'text-[--color-text-secondary] hover:bg-[--color-surface-elevated] hover:text-[--color-text-primary]',
      danger: 'bg-[--color-risk-high] text-white hover:opacity-90',
    }[variant];

    const sizeClass = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    }[size];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-500] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClass} ${sizeClass} ${className}`}
        {...props}
      >
        {isLoading && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
