import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  DollarSign,
  ExternalLink,
  GraduationCap,
  Info,
  Phone,
  Shield,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import type { ImpactCategory, RiskLevel } from '@impact/types';
import { RiskBadge } from '../ui/RiskBadge';
import { OpportunityDrawer } from './OpportunityDrawer';

// ─── Mock data — replace with API call via TanStack Query ──────────────────
const MOCK_SIMULATION = {
  id: 'sim-001',
  type: 'DROP_COURSE',
  courseName: 'BIO 201 — Introduction to Biology',
  overallRisk: 'high' as RiskLevel,
  riskScores: { financial: 82, academic: 20, graduation: 68, compliance: 5, overall: 71 },
  impacts: [
    {
      id: 'imp-1',
      category: 'scholarship' as ImpactCategory,
      severity: 'high' as RiskLevel | 'none',
      changed: true,
      title: 'University Merit Scholarship eligibility may change',
      description:
        'Dropping BIO 201 would reduce your credits from 15 to 12. Your scholarship requires at least 15 credits per semester.',
      currentValue: { eligible: true, amount: 2500 },
      projectedValue: { eligible: false, amount: 0 },
      ruleCode: 'RULE-SCH-001',
      policyName: '2026–27 Scholarship Policy',
      policyCitation: 'Section 3.2 — Credit Requirements',
    },
    {
      id: 'imp-2',
      category: 'graduation' as ImpactCategory,
      severity: 'high' as RiskLevel | 'none',
      changed: true,
      title: 'Graduation timeline may shift',
      description:
        'BIO 201 is a prerequisite for CHEM 202 (required for your program). Dropping may push your graduation by one semester.',
      currentValue: { expectedGraduation: 'May 2027' },
      projectedValue: { expectedGraduation: 'Dec 2027' },
      ruleCode: 'RULE-GRAD-004',
      policyName: '2026–27 Academic Catalog',
      policyCitation: 'Section 12.1 — Prerequisite Requirements',
    },
    {
      id: 'imp-3',
      category: 'enrollment_status' as ImpactCategory,
      severity: 'none' as RiskLevel | 'none',
      changed: false,
      title: 'Enrollment status unchanged',
      description: '12 credits still meets the full-time threshold (≥12 credits).',
      currentValue: { status: 'full_time', credits: 15 },
      projectedValue: { status: 'full_time', credits: 12 },
      ruleCode: 'RULE-ENRL-001',
      policyName: '2026–27 Financial Aid Handbook',
      policyCitation: 'Section 2.1 — Enrollment Status',
    },
    {
      id: 'imp-4',
      category: 'financial_aid' as ImpactCategory,
      severity: 'none' as RiskLevel | 'none',
      changed: false,
      title: 'Pell Grant unchanged',
      description: 'You will remain at least half-time (≥6 credits), so Pell eligibility is maintained.',
      currentValue: { eligible: true, amount: 3500 },
      projectedValue: { eligible: true, amount: 3500 },
      ruleCode: 'RULE-PELL-001',
      policyName: '2026–27 Financial Aid Handbook',
      policyCitation: 'Section 4.2 — Pell Grant Requirements',
    },
  ],
  recommendedActions: [
    {
      priority: 1,
      action: 'CONTACT_ADVISOR',
      title: 'Speak with your academic advisor',
      description:
        'Before dropping this course, discuss scholarship implications and alternative options with your advisor.',
    },
    {
      priority: 2,
      action: 'EXPLORE_ALTERNATIVES',
      title: 'Explore alternative courses',
      description:
        'Adding another 3-credit course would keep your credit load at 15 and preserve scholarship eligibility.',
    },
  ],
  disclaimer:
    'This simulation is informational only and does not constitute an official financial-aid determination. Final eligibility is determined by your institution.',
  evaluatedAt: new Date().toISOString(),
};

// ─── Component ────────────────────────────────────────────────────────────────

export function SimulationResultPage({ simulationId }: { simulationId: string }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const sim = MOCK_SIMULATION; // TODO: replace with useQuery

  const changedImpacts = sim.impacts.filter((i) => i.changed);
  const unchangedImpacts = sim.impacts.filter((i) => !i.changed);

  return (
    <div className="min-h-screen bg-[--color-surface]">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="border-b border-[--color-border-subtle] bg-[--color-surface]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-[--color-text-muted] transition-colors hover:text-[--color-text-primary]"
            >
              ← Dashboard
            </Link>
            <span className="text-[--color-border]">/</span>
            <span className="text-sm text-[--color-text-secondary]">Simulation Result</span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* ─── Decision Summary ─────────────────────────────────────────── */}
        <div className="mb-8 animate-fade-in">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[--color-text-muted]">
              Your Decision
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[--color-text-primary]">
            Drop {sim.courseName}
          </h1>
          <p className="mt-1 text-sm text-[--color-text-muted]">
            Simulated on {new Date(sim.evaluatedAt).toLocaleDateString()} at{' '}
            {new Date(sim.evaluatedAt).toLocaleTimeString()}
          </p>
        </div>

        {/* ─── Overall Risk ─────────────────────────────────────────────── */}
        <div
          className={`
            mb-8 animate-fade-in rounded-2xl border p-6
            ${
              sim.overallRisk === 'critical'
                ? 'border-[--color-risk-critical]/40 bg-[--color-risk-critical]/10'
                : sim.overallRisk === 'high'
                  ? 'border-[--color-risk-high]/40 bg-[--color-risk-high]/10'
                  : sim.overallRisk === 'moderate'
                    ? 'border-[--color-risk-moderate]/40 bg-[--color-risk-moderate]/10'
                    : 'border-[--color-risk-low]/40 bg-[--color-risk-low]/10'
            }
          `}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[--color-text-muted]">
                Overall Risk
              </p>
              <div className="mt-2">
                <RiskBadge risk={sim.overallRisk} size="lg" />
              </div>
              <p className="mt-3 text-sm text-[--color-text-secondary]">
                {changedImpacts.length} potential consequence
                {changedImpacts.length !== 1 ? 's' : ''} detected
              </p>
            </div>

            {/* Risk Score Bars */}
            <div className="hidden space-y-2 sm:block">
              {Object.entries({
                Financial: sim.riskScores.financial,
                Academic: sim.riskScores.academic,
                Graduation: sim.riskScores.graduation,
              }).map(([label, score]) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-20 text-right text-xs text-[--color-text-muted]">
                    {label}
                  </span>
                  <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[--color-border]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score >= 80
                          ? 'bg-[--color-risk-critical]'
                          : score >= 55
                            ? 'bg-[--color-risk-high]'
                            : score >= 30
                              ? 'bg-[--color-risk-moderate]'
                              : 'bg-[--color-risk-low]'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="w-6 text-xs tabular-nums text-[--color-text-muted]">
                    {score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Alternative Funding Callout ──────────────────────────────── */}
        <div className="mb-8 rounded-2xl border border-[--color-brand-500]/30 bg-gradient-to-r from-[--color-brand-500]/10 via-[--color-surface-elevated] to-[--color-surface-card] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-[--color-brand-500]/20 text-[--color-brand-400]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[--color-text-primary]">
                3 Funding Alternatives Available
              </h3>
              <p className="text-xs text-[--color-text-muted] mt-0.5">
                We matched on-campus student jobs & replacement grants that could offset the $2,500 scholarship gap.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[--color-brand-500] px-5 py-2.5 text-xs font-bold text-white transition-all shadow-[0_0_20px_-5px_oklch(58%_0.2_260)] hover:bg-[--color-brand-600] shrink-0"
          >
            <span>Explore Alternatives</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ─── Changed Impacts ──────────────────────────────────────────── */}
        {changedImpacts.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-base font-semibold text-[--color-text-primary]">
              What would change
            </h2>
            <div className="space-y-4">
              {changedImpacts.map((impact, i) => (
                <ImpactCard key={impact.id} impact={impact} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* ─── Unchanged Impacts ────────────────────────────────────────── */}
        {unchangedImpacts.length > 0 && (
          <CollapsibleSection
            title={`${unchangedImpacts.length} unchanged outcome${unchangedImpacts.length !== 1 ? 's' : ''}`}
            defaultOpen={false}
          >
            <div className="space-y-3">
              {unchangedImpacts.map((impact, i) => (
                <ImpactCard key={impact.id} impact={impact} index={i} />
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* ─── Recommended Actions ──────────────────────────────────────── */}
        <div className="mb-8">
          <h2 className="mb-4 text-base font-semibold text-[--color-text-primary]">
            Recommended actions
          </h2>
          <div className="space-y-3">
            {sim.recommendedActions.map((action) => (
              <div
                key={action.action}
                className="glass-card flex items-start gap-4 rounded-xl p-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[--color-brand-500]/20 text-sm font-bold text-[--color-brand-400]">
                  {action.priority}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[--color-text-primary]">{action.title}</p>
                  <p className="mt-1 text-sm text-[--color-text-secondary]">
                    {action.description}
                  </p>
                </div>
                {action.action === 'CONTACT_ADVISOR' && (
                  <button
                    id="contact-advisor-btn"
                    className="shrink-0 rounded-lg bg-[--color-brand-500] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[--color-brand-600]"
                  >
                    <Phone className="inline h-3.5 w-3.5 mr-1" />
                    Contact
                  </button>
                )}
                {action.action === 'EXPLORE_ALTERNATIVES' && (
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="shrink-0 rounded-lg bg-[--color-surface-elevated] border border-[--color-brand-500]/40 text-[--color-brand-400] px-4 py-2 text-sm font-medium transition-colors hover:bg-[--color-brand-500]/10"
                  >
                    <Sparkles className="inline h-3.5 w-3.5 mr-1" />
                    View Matches
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── Opportunity Drawer ──────────────────────────────────────── */}
        <OpportunityDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

        {/* ─── Disclaimer ───────────────────────────────────────────────── */}
        <div
          className="rounded-xl border border-[--color-border-subtle] bg-[--color-surface-elevated] p-4"
          role="note"
          aria-label="Important disclaimer"
        >
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[--color-text-muted]" />
            <p className="text-xs leading-relaxed text-[--color-text-muted]">
              <strong className="text-[--color-text-secondary]">Informational only. </strong>
              {sim.disclaimer}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Impact Card ─────────────────────────────────────────────────────────────

function ImpactCard({
  impact,
  index,
}: {
  impact: (typeof MOCK_SIMULATION.impacts)[0];
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const categoryIcons: Partial<Record<ImpactCategory, typeof DollarSign>> = {
    financial_aid: DollarSign,
    scholarship: DollarSign,
    graduation: GraduationCap,
    sap: Shield,
    enrollment_status: BookOpen,
    gpa: TrendingUp,
    compliance: Shield,
  };

  const Icon = categoryIcons[impact.category] ?? Info;
  const borderColor = impact.changed
    ? impact.severity === 'critical' || impact.severity === 'high'
      ? 'border-l-[--color-risk-high]'
      : impact.severity === 'moderate'
        ? 'border-l-[--color-risk-moderate]'
        : 'border-l-[--color-risk-low]'
    : 'border-l-[--color-border]';

  return (
    <div
      className={`
        animate-fade-in glass-card rounded-xl border-l-4 p-4
        transition-all duration-200 hover:bg-[--color-surface-elevated]
        ${borderColor}
      `}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div
          className={`
            flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
            ${impact.changed ? 'bg-[--color-surface-elevated]' : 'bg-[--color-surface]'}
          `}
        >
          <Icon className="h-4 w-4 text-[--color-text-secondary]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-[--color-text-primary]">{impact.title}</p>
            {impact.changed && impact.severity !== 'none' && (
              <RiskBadge risk={impact.severity as RiskLevel} size="sm" />
            )}
            {!impact.changed && (
              <span className="rounded-full bg-[--color-surface-elevated] px-2 py-0.5 text-xs text-[--color-text-muted]">
                No change
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-[--color-text-secondary]">{impact.description}</p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 rounded-lg p-1.5 text-[--color-text-muted] transition-colors hover:bg-[--color-surface-elevated] hover:text-[--color-text-primary]"
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse details' : 'Expand details'}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded: Rule → Data → Result */}
      {expanded && (
        <div className="mt-4 rounded-lg bg-[--color-surface] p-4 text-xs">
          <div className="mb-3 grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-[--color-text-muted] uppercase tracking-wider mb-1">
                Current
              </p>
              <pre className="text-[--color-text-secondary] whitespace-pre-wrap">
                {JSON.stringify(impact.currentValue, null, 2)}
              </pre>
            </div>
            <div>
              <p className="font-semibold text-[--color-text-muted] uppercase tracking-wider mb-1">
                After Decision
              </p>
              <pre className="text-[--color-text-secondary] whitespace-pre-wrap">
                {JSON.stringify(impact.projectedValue, null, 2)}
              </pre>
            </div>
          </div>

          <div className="mt-3 border-t border-[--color-border-subtle] pt-3">
            <p className="font-semibold text-[--color-text-muted] uppercase tracking-wider mb-1">
              Policy Source
            </p>
            <div className="flex items-center gap-2 text-[--color-brand-400]">
              <ExternalLink className="h-3 w-3" />
              <span>
                {impact.policyName} — {impact.policyCitation}
              </span>
            </div>
            <p className="mt-1 text-[--color-text-muted]">Rule: {impact.ruleCode}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CollapsibleSection ───────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-8">
      <button
        className="mb-4 flex w-full items-center justify-between rounded-lg px-1 py-2 text-left transition-colors hover:bg-[--color-surface-elevated]"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <h2 className="text-base font-semibold text-[--color-text-secondary]">{title}</h2>
        {open ? (
          <ChevronUp className="h-4 w-4 text-[--color-text-muted]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[--color-text-muted]" />
        )}
      </button>
      {open && children}
    </div>
  );
}
