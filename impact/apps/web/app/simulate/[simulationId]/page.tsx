import type { Metadata } from 'next';

import { SimulationResultPage } from '../../../components/simulation/SimulationResultPage';

export const metadata: Metadata = {
  title: 'Simulation Result',
  description: 'See the impact of your academic decision',
};

export default function SimulationResultRoute({
  params,
}: {
  params: { simulationId: string };
}) {
  return <SimulationResultPage simulationId={params.simulationId} />;
}
