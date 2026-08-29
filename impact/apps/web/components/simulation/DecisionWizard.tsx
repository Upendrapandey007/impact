'use client';

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  GraduationCap,
  Layers,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

type ScenarioType = 'DROP_COURSE' | 'WITHDRAW' | 'CHANGE_MAJOR' | 'REDUCE_CREDITS';

interface CourseOption {
  id: string;
  code: string;
  title: string;
  credits: number;
  department: string;
}

const MOCK_CURRENT_COURSES: CourseOption[] = [
  { id: 'c-1', code: 'BIO 201', title: 'Introduction to Biology', credits: 3, department: 'Biology' },
  { id: 'c-2', code: 'CS 301', title: 'Data Structures and Algorithms', credits: 3, department: 'Computer Science' },
  { id: 'c-3', code: 'MATH 201', title: 'Calculus II', credits: 3, department: 'Mathematics' },
  { id: 'c-4', code: 'ENG 101', title: 'Technical and Academic Writing', credits: 3, department: 'English' },
  { id: 'c-5', code: 'CS 201', title: 'Discrete Structures', credits: 3, department: 'Computer Science' },
];

const MOCK_PROGRAMS = [
  { id: 'p-1', code: 'CS', name: 'Computer Science (BS)', credits: 120 },
  { id: 'p-2', code: 'BIO', name: 'Biological Sciences (BS)', credits: 120 },
  { id: 'p-3', code: 'BBA', name: 'Business Administration (BBA)', credits: 120 },
];

const REASONS = [
  'Coursework is too challenging',
  'Schedule or job conflict',
  'Health or personal circumstances',
  'Exploring different career goals',
  'Financial constraints',
];

export function DecisionWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as ScenarioType) ?? 'DROP_COURSE';

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedType, setSelectedType] = useState<ScenarioType>(initialType);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('c-1');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('p-2');
  const [targetCredits, setTargetCredits] = useState<number>(12);
  const [selectedReason, setSelectedReason] = useState<string>(REASONS[0]!);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const handleStartSimulation = () => {
    setIsSimulating(true);
    setStep(4);

    // Simulate quick calculation transition
    setTimeout(() => {
      router.push('/simulate/sim-001');
    }, 1200);
  };

  const selectedCourse = MOCK_CURRENT_COURSES.find((c) => c.id === selectedCourseId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* ─── Breadcrumb ──────────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center gap-2 text-sm text-[--color-text-muted]">
        <Link href="/dashboard" className="hover:text-[--color-text-primary] transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-[--color-text-secondary]">Decision Simulator</span>
      </div>

      {/* ─── Step Indicator ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Decision' },
            { num: 2, label: 'Target' },
            { num: 3, label: 'Context' },
            { num: 4, label: 'Simulation' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  step >= s.num
                    ? 'bg-[--color-brand-500] text-white shadow-[0_0_15px_-3px_oklch(58%_0.2_260)]'
                    : 'bg-[--color-surface-elevated] text-[--color-text-muted] border border-[--color-border]'
                }`}
              >
                {step > s.num ? <Check className="h-4 w-4" /> : s.num}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  step >= s.num ? 'text-[--color-text-primary]' : 'text-[--color-text-muted]'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 h-1 w-full rounded-full bg-[--color-surface-elevated]">
          <div
            className="h-full rounded-full bg-[--color-brand-500] transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* ─── Step 1: Choose Decision Type ───────────────────────────────────── */}
      {step === 1 && (
        <div className="animate-fade-in space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[--color-text-primary]">
              What academic decision are you considering?
            </h1>
            <p className="mt-1.5 text-sm text-[--color-text-muted]">
              Impact will model the prospective consequences on your financial aid, scholarships, and graduation date.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                type: 'DROP_COURSE' as ScenarioType,
                title: 'Drop a course',
                desc: 'Remove an individual course from your schedule',
                icon: '📖',
              },
              {
                type: 'WITHDRAW' as ScenarioType,
                title: 'Withdraw from term',
                desc: 'Withdraw from all courses for Fall 2026',
                icon: '🚪',
              },
              {
                type: 'CHANGE_MAJOR' as ScenarioType,
                title: 'Change major',
                desc: 'Switch to a different academic degree program',
                icon: '🔄',
              },
              {
                type: 'REDUCE_CREDITS' as ScenarioType,
                title: 'Reduce credit load',
                desc: 'Drop down to a specific target credit count',
                icon: '📉',
              },
            ].map((option) => (
              <button
                key={option.type}
                onClick={() => setSelectedType(option.type)}
                className={`rounded-xl border p-5 text-left transition-all ${
                  selectedType === option.type
                    ? 'border-[--color-brand-500] bg-[--color-brand-500]/10 shadow-[0_0_20px_-8px_oklch(58%_0.2_260)]'
                    : 'border-[--color-border-subtle] bg-[--color-surface-card] hover:border-[--color-brand-500]/40 hover:bg-[--color-surface-elevated]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{option.icon}</span>
                  {selectedType === option.type && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[--color-brand-500] text-white text-xs">
                      ✓
                    </div>
                  )}
                </div>
                <h3 className="mt-3 font-semibold text-[--color-text-primary]">{option.title}</h3>
                <p className="mt-1 text-xs text-[--color-text-muted]">{option.desc}</p>
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-xl bg-[--color-brand-500] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[--color-brand-600]"
            >
              <span>Continue to details</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 2: Target Selection ───────────────────────────────────────── */}
      {step === 2 && (
        <div className="animate-fade-in space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[--color-text-primary]">
              {selectedType === 'DROP_COURSE' && 'Select the course you are thinking of dropping'}
              {selectedType === 'WITHDRAW' && 'Confirm term withdrawal'}
              {selectedType === 'CHANGE_MAJOR' && 'Select your intended new major'}
              {selectedType === 'REDUCE_CREDITS' && 'Choose your desired target credit load'}
            </h1>
            <p className="mt-1.5 text-sm text-[--color-text-muted]">
              Current schedule: 15 enrolled credits across 5 courses in Fall 2026.
            </p>
          </div>

          {selectedType === 'DROP_COURSE' && (
            <div className="space-y-3">
              {MOCK_CURRENT_COURSES.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-all flex items-center justify-between ${
                    selectedCourseId === course.id
                      ? 'border-[--color-brand-500] bg-[--color-brand-500]/10'
                      : 'border-[--color-border-subtle] bg-[--color-surface-card] hover:bg-[--color-surface-elevated]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[--color-surface-elevated] font-mono text-xs font-bold text-[--color-brand-400]">
                      {course.credits}cr
                    </div>
                    <div>
                      <p className="font-semibold text-[--color-text-primary]">{course.code}</p>
                      <p className="text-xs text-[--color-text-muted]">{course.title}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-[--color-text-secondary] rounded-md bg-[--color-surface-elevated] px-2.5 py-1">
                    {course.department}
                  </span>
                </button>
              ))}
            </div>
          )}

          {selectedType === 'CHANGE_MAJOR' && (
            <div className="space-y-3">
              {MOCK_PROGRAMS.map((program) => (
                <button
                  key={program.id}
                  onClick={() => setSelectedProgramId(program.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-all flex items-center justify-between ${
                    selectedProgramId === program.id
                      ? 'border-[--color-brand-500] bg-[--color-brand-500]/10'
                      : 'border-[--color-border-subtle] bg-[--color-surface-card] hover:bg-[--color-surface-elevated]'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-[--color-text-primary]">{program.name}</p>
                    <p className="text-xs text-[--color-text-muted]">Requires {program.credits} credits to graduate</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-[--color-brand-400] bg-[--color-surface-elevated] px-3 py-1 rounded-lg">
                    {program.code}
                  </span>
                </button>
              ))}
            </div>
          )}

          {selectedType === 'REDUCE_CREDITS' && (
            <div className="rounded-xl border border-[--color-border-subtle] bg-[--color-surface-card] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[--color-text-primary]">Target credit load:</span>
                <span className="font-mono text-xl font-bold text-[--color-brand-400]">{targetCredits} Credits</span>
              </div>
              <input
                type="range"
                min={3}
                max={15}
                step={3}
                value={targetCredits}
                onChange={(e) => setTargetCredits(parseInt(e.target.value))}
                className="w-full accent-[--color-brand-500] cursor-pointer"
              />
              <div className="flex justify-between text-xs text-[--color-text-muted]">
                <span>3 credits (Less than half-time)</span>
                <span>6 credits (Half-time)</span>
                <span>12 credits (Full-time threshold)</span>
                <span>15 credits (Current)</span>
              </div>
            </div>
          )}

          {selectedType === 'WITHDRAW' && (
            <div className="rounded-xl border border-[--color-risk-critical]/30 bg-[--color-risk-critical]/10 p-5 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-[--color-risk-critical] mt-0.5" />
              <div>
                <p className="font-semibold text-[--color-text-primary]">Full term withdrawal evaluation</p>
                <p className="text-xs text-[--color-text-secondary] mt-1 leading-relaxed">
                  Withdrawing will drop all 15 credits for Fall 2026. Impact will evaluate return of Title IV aid (R2T4), transcript notations, and scholarship retention rights.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[--color-border] px-5 py-2.5 text-sm font-medium text-[--color-text-secondary] hover:bg-[--color-surface-elevated]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 rounded-xl bg-[--color-brand-500] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[--color-brand-600]"
            >
              <span>Continue to reason</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 3: Context & Reason ─────────────────────────────────────────── */}
      {step === 3 && (
        <div className="animate-fade-in space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[--color-text-primary]">
              What is the primary reason for this decision?
            </h1>
            <p className="mt-1.5 text-sm text-[--color-text-muted]">
              This context helps the platform identify tailored funding alternatives and academic advisor support.
            </p>
          </div>

          <div className="space-y-2.5">
            {REASONS.map((reason) => (
              <button
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`w-full rounded-xl border p-4 text-left transition-all flex items-center justify-between ${
                  selectedReason === reason
                    ? 'border-[--color-brand-500] bg-[--color-brand-500]/10 text-[--color-text-primary]'
                    : 'border-[--color-border-subtle] bg-[--color-surface-card] text-[--color-text-secondary] hover:bg-[--color-surface-elevated]'
                }`}
              >
                <span className="text-sm font-medium">{reason}</span>
                {selectedReason === reason && (
                  <span className="h-2 w-2 rounded-full bg-[--color-brand-400]" />
                )}
              </button>
            ))}
          </div>

          {/* Review Card */}
          <div className="rounded-xl border border-[--color-border-subtle] bg-[--color-surface-elevated] p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[--color-text-muted]">
              Simulation Review
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-[--color-text-muted]">Decision Type</span>
                <p className="font-semibold text-[--color-text-primary] mt-0.5">{selectedType.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-xs text-[--color-text-muted]">Target</span>
                <p className="font-semibold text-[--color-text-primary] mt-0.5">
                  {selectedType === 'DROP_COURSE' && selectedCourse?.code}
                  {selectedType === 'CHANGE_MAJOR' && selectedProgramId}
                  {selectedType === 'REDUCE_CREDITS' && `${targetCredits} Credits`}
                  {selectedType === 'WITHDRAW' && 'All Fall 2026 Courses'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[--color-border] px-5 py-2.5 text-sm font-medium text-[--color-text-secondary] hover:bg-[--color-surface-elevated]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleStartSimulation}
              className="inline-flex items-center gap-2 rounded-xl bg-[--color-brand-500] px-8 py-2.5 text-sm font-semibold text-white transition-all shadow-[0_0_25px_-5px_oklch(58%_0.2_260)] hover:bg-[--color-brand-600]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Run Prospective Simulation</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 4: Loading Screen ─────────────────────────────────────────── */}
      {step === 4 && (
        <div className="animate-fade-in py-16 text-center space-y-4">
          <div className="inline-flex p-4 rounded-2xl bg-[--color-brand-500]/10 text-[--color-brand-400]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-[--color-text-primary]">
            Evaluating Prospective Consequences...
          </h2>
          <p className="text-xs text-[--color-text-muted] max-w-sm mx-auto">
            Evaluating differential state across financial aid packages, merit scholarship criteria, and SAP pace rates.
          </p>
        </div>
      )}
    </div>
  );
}
