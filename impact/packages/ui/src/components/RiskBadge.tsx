'use client';

import type { RiskLevel } from '@impact/types';

interface RiskBadgeProps {
  risk: RiskLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskBadge({ risk, showLabel = true, size = 'sm' }: RiskBadgeProps) {
  const configs: Record<RiskLevel, { label: string; icon: string; className: string }> = {
    low: { label: 'Low', icon: '✓', className: 'risk-low' },
    moderate: { label: 'Moderate', icon: '⚠', className: 'risk-moderate' },
    high: { label: 'High', icon: '⚠', className: 'risk-high' },
    critical: { label: 'Critical', icon: '✕', className: 'risk-critical' },
  };

  const sizeClass = { sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-1 text-xs', lg: 'px-3 py-1.5 text-sm' }[size];
  const config = configs[risk];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wider ${config.className} ${sizeClass}`}
      role="status"
      aria-label={`Risk level: ${config.label}`}
    >
      <span aria-hidden="true">{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
