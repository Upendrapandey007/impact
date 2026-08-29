import type { Metadata } from 'next';

import { DashboardPage } from '../../components/dashboard/DashboardPage';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your academic and financial overview',
};

// In production this would be server-side with session check
// For now, serves as the entry point
export default function DashboardRoute() {
  return <DashboardPage />;
}
