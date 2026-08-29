'use client';

import type { ReactNode } from 'react';

interface StatusCardProps {
  id: string;
  label: string;
  value: string;
  subLabel?: string;
  icon?: ReactNode;
  accent?: 'brand' | 'green' | 'amber' | 'red';
  trend?: 'up' | 'down' | 'neutral';
}

const ACCENT_CLASSES = {
  brand: {
    glow: 'shadow-[0_0_30px_-10px_oklch(58%_0.2_260)]',
    icon: 'bg-[--color-brand-500]/20 text-[--color-brand-400]',
    value: 'text-[--color-brand-400]',
  },
  green: {
    glow: 'shadow-[0_0_30px_-10px_var(--color-risk-low)]',
    icon: 'bg-[--color-risk-low]/20 text-[--color-risk-low]',
    value: 'text-[--color-risk-low]',
  },
  amber: {
    glow: 'shadow-[0_0_30px_-10px_var(--color-risk-moderate)]',
    icon: 'bg-[--color-risk-moderate]/20 text-[--color-risk-moderate]',
    value: 'text-[--color-risk-moderate]',
  },
  red: {
    glow: 'shadow-[0_0_30px_-10px_var(--color-risk-high)]',
    icon: 'bg-[--color-risk-high]/20 text-[--color-risk-high]',
    value: 'text-[--color-risk-high]',
  },
};

export function StatusCard({
  id,
  label,
  value,
  subLabel,
  icon,
  accent = 'brand',
}: StatusCardProps) {
  const accentCss = ACCENT_CLASSES[accent];

  return (
    <div
      id={id}
      className={`
        glass-card animate-fade-in rounded-xl p-4
        transition-all duration-200 hover:-translate-y-0.5
        ${accentCss.glow}
      `}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-[--color-text-muted]">
          {label}
        </p>
        {icon && (
          <div className={`rounded-lg p-1.5 ${accentCss.icon}`}>
            {icon}
          </div>
        )}
      </div>

      <p className={`text-xl font-bold ${accentCss.value}`}>{value}</p>

      {subLabel && (
        <p className="mt-1 text-xs text-[--color-text-muted]">{subLabel}</p>
      )}
    </div>
  );
}
