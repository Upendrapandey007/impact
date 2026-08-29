import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DecisionWizard } from '../../components/simulation/DecisionWizard';

export const metadata: Metadata = {
  title: 'Simulate Academic Decision | Impact',
  description: 'Prospective decision calculator evaluating downstream aid, scholarship, and SAP consequences',
};

export default function SimulatePage() {
  return (
    <div className="min-h-screen bg-[--color-surface]">
      <Suspense fallback={<div className="p-8 text-center text-sm text-[--color-text-muted]">Loading simulator...</div>}>
        <DecisionWizard />
      </Suspense>
    </div>
  );
}
