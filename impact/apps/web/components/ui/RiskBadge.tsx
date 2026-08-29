'use client';

import type { RiskLevel } from '@impact/types';

interface RiskBadgeProps {
  risk: RiskLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; icon: string; className: string }
> = {
  low: {
    label: 'Low',
    icon: '✓',
    className: 'risk-low',
  },
  moderate: {
    label: 'Moderate',
    icon: '⚠',
    className: 'risk-moderate',
  },
  high: {
    label: 'High',
    icon: '⚠',
    className: 'risk-high',
  },
  critical: {
    label: 'Critical',
    icon: '✕',
    className: 'risk-critical',
  },
};

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export function RiskBadge({ risk, showLabel = true, size = 'sm' }: RiskBadgeProps) {
  const config = RISK_CONFIG[risk];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wider
        ${config.className} ${SIZE_CLASSES[size]}
      `}
      role="status"
      aria-label={`Risk level: ${config.label}`}
    >
      <span aria-hidden="true">{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
