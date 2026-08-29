'use client';

import {
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  ExternalLink,
  GraduationCap,
  Sparkles,
  X,
} from 'lucide-react';
import { useState } from 'react';
import type { OpportunityMatch } from '@impact/types';

interface OpportunityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  matches?: OpportunityMatch[];
}

const DEFAULT_MOCK_MATCHES: OpportunityMatch[] = [
  {
    opportunity: {
      id: 'opp-1',
      type: 'student_job',
      title: 'Computer Science Peer Tutor / Lab Assistant',
      provider: 'Apex Department of Computer Science',
      description:
        'Assist lower-division undergraduate students in CS 101 and CS 201 with programming labs and debugging.',
      amountOrWage: '$18.50 / hour (10-15 hrs/wk)',
      amountNumeric: 18.5,
      applicationDeadline: '2026-10-15',
      sourceUrl: 'https://careers.apex.edu/jobs/cs-peer-tutor-402',
      sourceDomain: 'careers.apex.edu',
      isVerified: true,
      status: 'active',
      eligibility: {
        minGpa: 3.0,
        requiredMajorCodes: ['CS'],
        minCreditsEnrolled: 6,
      },
      tags: ['on-campus', 'flexible hours', 'tutoring'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    matchScore: 100,
    matchedCriteria: [
      'GPA 3.18 meets minimum 3.00',
      'Enrolled in 12 credits (>= 6 credits)',
      'Major (CS) is eligible',
    ],
    unmetCriteria: [],
    isEligible: true,
  },
  {
    opportunity: {
      id: 'opp-2',
      type: 'scholarship',
      title: 'State STEM Bridge Opportunity Grant',
      provider: 'State Department of Higher Education',
      description:
        'Tuition replacement grant for juniors and seniors maintaining at least 12 credits in STEM disciplines.',
      amountOrWage: '$2,000 / semester',
      amountNumeric: 2000,
      applicationDeadline: '2026-10-30',
      sourceUrl: 'https://heas.state.gov/scholarships/stem-bridge-2026',
      sourceDomain: 'heas.state.gov',
      isVerified: true,
      status: 'active',
      eligibility: {
        minGpa: 3.0,
        minCreditsEnrolled: 12,
        requiredMajorCodes: ['CS', 'BIO'],
      },
      tags: ['state grant', 'tuition assistance', 'stem'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    matchScore: 95,
    matchedCriteria: [
      'GPA 3.18 meets minimum 3.00',
      'Enrolled in 12 credits (>= 12 credits)',
      'Major (CS) is eligible',
    ],
    unmetCriteria: [],
    isEligible: true,
  },
  {
    opportunity: {
      id: 'opp-3',
      type: 'work_study',
      title: 'Campus Science Library Assistant',
      provider: 'Apex University Libraries',
      description:
        'Circulation desk support, inventory maintenance, and study room reservations in the Science Library.',
      amountOrWage: '$16.00 / hour (8-12 hrs/wk)',
      amountNumeric: 16.0,
      applicationDeadline: '2026-10-01',
      sourceUrl: 'https://careers.apex.edu/jobs/library-asst-109',
      sourceDomain: 'careers.apex.edu',
      isVerified: true,
      status: 'active',
      eligibility: {
        minCreditsEnrolled: 6,
      },
      tags: ['work-study', 'quiet environment'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    matchScore: 90,
    matchedCriteria: ['Enrolled in 12 credits (>= 6 credits)'],
    unmetCriteria: [],
    isEligible: true,
  },
];

export function OpportunityDrawer({
  isOpen,
  onClose,
  matches = DEFAULT_MOCK_MATCHES,
}: OpportunityDrawerProps) {
  const [filter, setFilter] = useState<'all' | 'jobs' | 'scholarships'>('all');

  if (!isOpen) return null;

  const filteredMatches = matches.filter((m) => {
    if (filter === 'jobs') return m.opportunity.type === 'student_job' || m.opportunity.type === 'work_study';
    if (filter === 'scholarships') return m.opportunity.type === 'scholarship' || m.opportunity.type === 'grant';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-[--color-surface-elevated] border-l border-[--color-border] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[--color-border-subtle] flex items-center justify-between bg-[--color-surface]/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[--color-brand-500]/20 text-[--color-brand-400]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[--color-text-primary]">
                  Explore Funding Alternatives
                </h2>
                <p className="text-xs text-[--color-text-muted]">
                  Matched student jobs & replacement grants based on your profile
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-[--color-surface] transition-colors"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="px-6 py-3 border-b border-[--color-border-subtle] flex items-center gap-2 bg-[--color-surface]">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-[--color-brand-500] text-white'
                  : 'text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-[--color-surface-elevated]'
              }`}
            >
              All Alternatives ({matches.length})
            </button>
            <button
              onClick={() => setFilter('jobs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'jobs'
                  ? 'bg-[--color-brand-500] text-white'
                  : 'text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-[--color-surface-elevated]'
              }`}
            >
              Student Jobs & Work-Study
            </button>
            <button
              onClick={() => setFilter('scholarships')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'scholarships'
                  ? 'bg-[--color-brand-500] text-white'
                  : 'text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-[--color-surface-elevated]'
              }`}
            >
              Scholarships & Grants
            </button>
          </div>

          {/* Opportunity Cards */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {filteredMatches.map((item) => {
              const opp = item.opportunity;
              const isJob = opp.type === 'student_job' || opp.type === 'work_study';

              return (
                <div
                  key={opp.id}
                  className="rounded-xl border border-[--color-border-subtle] bg-[--color-surface] p-5 transition-all hover:border-[--color-brand-500]/50 hover:bg-[--color-surface-elevated]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-md bg-[--color-surface-elevated] text-[--color-brand-400]">
                        {isJob ? <Briefcase className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[--color-text-muted]">
                        {opp.type.replace('_', ' ')}
                      </span>
                    </div>

                    {item.isEligible && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[--color-risk-low]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {item.matchScore}% Match
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-base font-bold text-[--color-text-primary]">
                    {opp.title}
                  </h3>
                  <p className="text-xs text-[--color-text-secondary] mt-0.5">
                    {opp.provider}
                  </p>

                  <p className="mt-2.5 text-xs text-[--color-text-muted] leading-relaxed">
                    {opp.description}
                  </p>

                  {/* Compensation & Deadline */}
                  <div className="mt-4 pt-3 border-t border-[--color-border-subtle] grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[--color-brand-400] font-semibold">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>{opp.amountOrWage ?? 'Award amount varies'}</span>
                    </div>
                    {opp.applicationDeadline && (
                      <div className="flex items-center justify-end gap-1.5 text-[--color-text-muted]">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Due {opp.applicationDeadline}</span>
                      </div>
                    )}
                  </div>

                  {/* Matched Criteria Badges */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.matchedCriteria.map((crit, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-[--color-risk-low]/10 px-2 py-0.5 text-[11px] font-medium text-[--color-risk-low]"
                      >
                        ✓ {crit}
                      </span>
                    ))}
                  </div>

                  {/* External Application Link */}
                  <div className="mt-4 pt-3 flex justify-end">
                    <a
                      href={opp.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[--color-brand-500] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[--color-brand-600]"
                    >
                      <span>Apply on {opp.sourceDomain}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="p-4 border-t border-[--color-border-subtle] bg-[--color-surface] text-center">
            <p className="text-[11px] text-[--color-text-muted]">
              Opportunities are automatically aggregated from verified institutional & state career feeds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
