'use client';

import type { ReactNode } from 'react';

interface StatusCardProps {
  id: string;
  label: string;
  value: string;
  subLabel?: string;
  icon?: ReactNode;
  accent?: 'brand' | 'green' | 'amber' | 'red';
}

export function StatusCard({ id, label, value, subLabel, icon, accent = 'brand' }: StatusCardProps) {
  return (
    <div id={id} className="glass-card animate-fade-in rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-[--color-text-muted]">{label}</p>
        {icon && <div className="rounded-lg p-1.5 bg-[--color-surface-elevated] text-[--color-text-secondary]">{icon}</div>}
      </div>
      <p className="text-xl font-bold text-[--color-brand-400]">{value}</p>
      {subLabel && <p className="mt-1 text-xs text-[--color-text-muted]">{subLabel}</p>}
    </div>
  );
}
