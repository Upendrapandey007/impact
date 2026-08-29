'use client';

import { AlertTriangle, BookOpen, Calendar, DollarSign, GraduationCap, TrendingUp } from 'lucide-react';
import Link from 'next/link';

import { RiskBadge } from '../ui/RiskBadge';
import { StatusCard } from '../ui/StatusCard';
import { DecisionQuickStart } from '../simulation/DecisionQuickStart';

// ─── Mock data — replace with TanStack Query hooks ──────────────────────────
const MOCK_STUDENT = {
  name: 'Alex Brown',
  program: 'Computer Science',
  level: 'Junior',
  gpa: 3.18,
  creditsEnrolled: 15,
  creditsCompleted: 78,
  creditsRequired: 120,
  sapStatus: 'satisfactory' as const,
  enrollmentStatus: 'full_time' as const,
  expectedGraduation: 'May 2027',
  totalAid: 9500,
  termAid: 4750,
  riskLevel: null as 'low' | 'moderate' | 'high' | 'critical' | null,
};

const MOCK_RECENT_SIMULATIONS = [
  { id: '1', type: 'DROP_COURSE', course: 'BIO 201', risk: 'high' as const, date: '2 hours ago' },
  { id: '2', type: 'CHANGE_MAJOR', course: 'Business Administration', risk: 'moderate' as const, date: 'Yesterday' },
];

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const student = MOCK_STUDENT;
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-[--color-surface]">
      {/* ─── Top Nav ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-[--color-border-subtle] bg-[--color-surface]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[--color-brand-500]">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-[--color-text-primary]">Impact</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/notifications"
              className="relative rounded-lg p-2 text-[--color-text-secondary] transition-colors hover:bg-[--color-surface-elevated] hover:text-[--color-text-primary]"
              aria-label="Notifications"
            >
              <div className="h-5 w-5">🔔</div>
            </Link>
            <button
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-[--color-text-secondary] transition-colors hover:bg-[--color-surface-elevated] hover:text-[--color-text-primary]"
              id="user-menu-button"
              aria-label="User menu"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[--color-brand-600] text-xs font-bold text-white">
                {student.name.charAt(0)}
              </div>
              <span className="hidden sm:block">{student.name}</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ─── Greeting ────────────────────────────────────────────────── */}
        <div className="mb-8 animate-fade-in">
          <p className="text-sm font-medium text-[--color-text-muted]">
            {student.program} · {student.level}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-[--color-text-primary]">
            {greeting},{' '}
            <span className="gradient-text">{student.name.split(' ')[0]}</span>
          </h1>
        </div>

        {/* ─── Risk Alert Banner ────────────────────────────────────────── */}
        {student.riskLevel && student.riskLevel !== 'low' && (
          <div className="mb-6 flex animate-fade-in items-start gap-3 rounded-xl border border-[--color-risk-high]/30 bg-[--color-risk-high]/10 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[--color-risk-high]" />
            <div>
              <p className="text-sm font-semibold text-[--color-risk-high]">
                Potential academic or financial risk detected
              </p>
              <p className="mt-0.5 text-xs text-[--color-text-secondary]">
                Review your recent simulations for details.
              </p>
            </div>
          </div>
        )}

        {/* ─── Status Cards ─────────────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatusCard
            id="card-academic"
            label="Credits"
            value={`${student.creditsEnrolled}`}
            subLabel={`${student.creditsCompleted} / ${student.creditsRequired} completed`}
            icon={<BookOpen className="h-4 w-4" />}
            accent="brand"
          />
          <StatusCard
            id="card-financial-aid"
            label="Term Aid"
            value={`$${student.termAid.toLocaleString()}`}
            subLabel={`$${student.totalAid.toLocaleString()} annual`}
            icon={<DollarSign className="h-4 w-4" />}
            accent="green"
          />
          <StatusCard
            id="card-sap"
            label="SAP Status"
            value="Satisfactory"
            subLabel="Good standing"
            icon={<TrendingUp className="h-4 w-4" />}
            accent="green"
          />
          <StatusCard
            id="card-graduation"
            label="Graduation"
            value={student.expectedGraduation}
            subLabel={`GPA: ${student.gpa.toFixed(2)}`}
            icon={<GraduationCap className="h-4 w-4" />}
            accent="brand"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ─── Decision Simulator ──────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[--color-text-primary]">
                What are you planning to do?
              </h2>
              <Link
                href="/simulations"
                className="text-sm text-[--color-brand-400] transition-colors hover:text-[--color-brand-300]"
              >
                View history →
              </Link>
            </div>
            <DecisionQuickStart />
          </div>

          {/* ─── Sidebar ─────────────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Recent Simulations */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="mb-4 text-sm font-semibold text-[--color-text-secondary] uppercase tracking-wider">
                Recent Simulations
              </h3>

              {MOCK_RECENT_SIMULATIONS.length === 0 ? (
                <p className="text-sm text-[--color-text-muted]">
                  No simulations yet. Try one above!
                </p>
              ) : (
                <div className="space-y-3">
                  {MOCK_RECENT_SIMULATIONS.map((sim) => (
                    <Link
                      key={sim.id}
                      href={`/simulate/${sim.id}`}
                      className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-[--color-surface-elevated]"
                      id={`sim-link-${sim.id}`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[--color-text-primary]">
                          {sim.type === 'DROP_COURSE' ? 'Drop' : 'Change'} {sim.course}
                        </p>
                        <p className="text-xs text-[--color-text-muted]">{sim.date}</p>
                      </div>
                      <RiskBadge risk={sim.risk} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Deadlines */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="mb-4 text-sm font-semibold text-[--color-text-secondary] uppercase tracking-wider">
                Upcoming Deadlines
              </h3>
              <div className="space-y-3">
                <DeadlineItem
                  label="Course withdrawal deadline"
                  date="Oct 15, 2026"
                  urgency="moderate"
                />
                <DeadlineItem
                  label="SAP appeal deadline"
                  date="Nov 1, 2026"
                  urgency="low"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DeadlineItem({
  label,
  date,
  urgency,
}: {
  label: string;
  date: string;
  urgency: 'low' | 'moderate' | 'high';
}) {
  const colors = {
    low: 'text-[--color-text-secondary]',
    moderate: 'text-[--color-risk-moderate]',
    high: 'text-[--color-risk-high]',
  };

  return (
    <div className="flex items-start gap-3">
      <Calendar className={`mt-0.5 h-4 w-4 shrink-0 ${colors[urgency]}`} />
      <div>
        <p className="text-sm text-[--color-text-primary]">{label}</p>
        <p className={`text-xs ${colors[urgency]}`}>{date}</p>
      </div>
    </div>
  );
}
