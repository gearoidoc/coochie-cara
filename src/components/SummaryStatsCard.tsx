import { format, parseISO } from 'date-fns';
import type { Cycle, CycleStats } from '../lib/predictions';

interface Props {
  stats: CycleStats;
  cycles: Cycle[];
}

function regularityLabel(stdDev: number): string {
  if (stdDev <= 2) return 'Very regular';
  if (stdDev <= 4) return 'Regular';
  if (stdDev <= 7) return 'Somewhat irregular';
  return 'Irregular';
}

function formatStdDev(stdDev: number): string {
  const val = Number.isInteger(stdDev) ? String(stdDev) : stdDev.toFixed(1);
  return `±${val} days variation`;
}

export default function SummaryStatsCard({ stats, cycles }: Props) {
  const earliestCycle = cycles[0];
  const trackingSince = earliestCycle
    ? format(parseISO(earliestCycle.startDate), 'MMM d, yyyy')
    : null;

  return (
    <div className="bg-cream border border-ink/10 rounded-2xl p-5">
      <p className="text-xs uppercase tracking-wide text-ink/50 mb-4">Summary</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-6">

        {stats.medianCycleLength !== null && (
          <div>
            <p className="text-3xl font-bold text-ink">{stats.medianCycleLength}</p>
            <p className="text-sm text-ink/60">days · Median cycle length</p>
          </div>
        )}

        {stats.medianPeriodLength !== null && (
          <div>
            <p className="text-3xl font-bold text-ink">{stats.medianPeriodLength}</p>
            <p className="text-sm text-ink/60">days · Median period length</p>
          </div>
        )}

        {stats.cycleLengthStdDev !== null && (
          <div className="col-span-2">
            <p className="text-lg font-semibold text-ink">
              {regularityLabel(stats.cycleLengthStdDev)}
            </p>
            <p className="text-sm text-ink/60">{formatStdDev(stats.cycleLengthStdDev)}</p>
          </div>
        )}

        <div>
          <p className="text-3xl font-bold text-ink">{stats.usableCycles.length}</p>
          <p className="text-sm text-ink/60">cycles tracked</p>
        </div>

        {trackingSince !== null && (
          <div>
            <p className="text-xl font-bold text-ink">{trackingSince}</p>
            <p className="text-sm text-ink/60">Tracking since</p>
          </div>
        )}

      </div>
    </div>
  );
}
