import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { detectCycles, computeCycleStats } from '../lib/predictions';
import SummaryStatsCard from '../components/SummaryStatsCard';
import CycleLengthChart from '../components/CycleLengthChart';
import PeriodLengthChart from '../components/PeriodLengthChart';

export default function Insights() {
  const allRecords = useLiveQuery(() => db.days.toArray());

  if (allRecords === undefined) return null;

  const cycles = detectCycles(allRecords);
  const stats = computeCycleStats(cycles);

  if (stats.usableCycles.length < 2) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <p className="text-base text-ink/60">Log 2 periods to see insights</p>
      </div>
    );
  }

  return (
    <div className="p-6 pb-8">
      <h1 className="text-3xl font-bold text-ink mb-6">Insights</h1>
      <SummaryStatsCard stats={stats} cycles={cycles} />
      <div className="mb-4" />
      <CycleLengthChart cycles={stats.usableCycles} medianCycleLength={stats.medianCycleLength} />
      <div className="mb-4" />
      <PeriodLengthChart cycles={stats.usableCycles} medianPeriodLength={stats.medianPeriodLength} />
    </div>
  );
}
