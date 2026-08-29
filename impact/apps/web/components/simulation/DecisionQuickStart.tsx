'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type DecisionType = 'DROP_COURSE' | 'WITHDRAW' | 'CHANGE_MAJOR' | 'REDUCE_CREDITS' | 'OTHER';

const DECISIONS: { type: DecisionType; label: string; description: string; icon: string }[] = [
  {
    type: 'DROP_COURSE',
    label: 'Drop a course',
    description: 'Remove a course from your current schedule',
    icon: '📖',
  },
  {
    type: 'WITHDRAW',
    label: 'Withdraw from term',
    description: 'Withdraw from all courses this semester',
    icon: '🚪',
  },
  {
    type: 'CHANGE_MAJOR',
    label: 'Change my major',
    description: 'Switch to a different academic program',
    icon: '🔄',
  },
  {
    type: 'REDUCE_CREDITS',
    label: 'Reduce credit load',
    description: 'Drop to fewer credits this semester',
    icon: '📉',
  },
  {
    type: 'OTHER',
    label: 'Another decision',
    description: 'Explore other academic what-ifs',
    icon: '💭',
  },
];

export function DecisionQuickStart() {
  const router = useRouter();
  const [selected, setSelected] = useState<DecisionType | null>(null);
  const [hovering, setHovering] = useState<DecisionType | null>(null);

  const handleSelect = (type: DecisionType) => {
    setSelected(type);
    // Navigate to simulator with pre-selected type
    router.push(`/simulate?type=${type}`);
  };

  return (
    <div className="space-y-3">
      {DECISIONS.map((decision) => {
        const isSelected = selected === decision.type;
        const isHovering = hovering === decision.type;

        return (
          <button
            key={decision.type}
            id={`decision-btn-${decision.type.toLowerCase()}`}
            onClick={() => handleSelect(decision.type)}
            onMouseEnter={() => setHovering(decision.type)}
            onMouseLeave={() => setHovering(null)}
            className={`
              group w-full rounded-xl border p-4 text-left transition-all duration-200
              ${
                isSelected
                  ? 'border-[--color-brand-500] bg-[--color-brand-500]/10'
                  : 'border-[--color-border-subtle] bg-[--color-surface-card] hover:border-[--color-brand-500]/50 hover:bg-[--color-surface-elevated]'
              }
            `}
            aria-label={`Simulate: ${decision.label}`}
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div
                className={`
                  flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl
                  transition-transform duration-200
                  ${isHovering || isSelected ? 'scale-110' : ''}
                  ${
                    isSelected
                      ? 'bg-[--color-brand-500]/20'
                      : 'bg-[--color-surface-elevated]'
                  }
                `}
              >
                {decision.icon}
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p
                  className={`font-semibold transition-colors ${
                    isSelected
                      ? 'text-[--color-brand-400]'
                      : 'text-[--color-text-primary] group-hover:text-[--color-brand-400]'
                  }`}
                >
                  {decision.label}
                </p>
                <p className="mt-0.5 text-xs text-[--color-text-muted]">
                  {decision.description}
                </p>
              </div>

              {/* Arrow */}
              <span
                className={`
                  text-lg transition-all duration-200
                  ${
                    isHovering || isSelected
                      ? 'translate-x-1 text-[--color-brand-400]'
                      : 'text-[--color-text-muted]'
                  }
                `}
              >
                →
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
