import type { CycleStatus } from '../lib/predictions';

export default function PredictionStatus({ status }: { status: CycleStatus }) {
  let primary = '';
  if (status.state === 'no-data') {
    primary = 'Log 2 periods to see predictions';
  } else if (status.state === 'on-period') {
    primary = `Day ${status.periodDay} of period`;
  } else if (status.state === 'pre-period') {
    primary =
      status.daysUntilNextPeriod === 1
        ? 'Period due tomorrow'
        : `Period due in ${status.daysUntilNextPeriod} days`;
  } else if (status.state === 'late') {
    if (status.daysUntilNextPeriod === 0) {
      primary = 'Period due today';
    } else {
      const abs = Math.abs(status.daysUntilNextPeriod!);
      primary = `Period ${abs} day${abs !== 1 ? 's' : ''} late`;
    }
  }

  const secondary = status.cycleDay !== null ? `Cycle day ${status.cycleDay}` : null;

  let confidenceLabel: string | null = null;
  if (status.confidence === 'low') {
    confidenceLabel = 'Low confidence — based on 2-3 cycles';
  } else if (status.confidence === 'approximate') {
    confidenceLabel = 'Approximate — cycles vary';
  }

  const isOnPeriod = status.state === 'on-period';

  return (
    <div
      className={`bg-cream rounded-2xl p-4 mb-4 ${
        isOnPeriod
          ? 'border border-ink/10 border-l-4 border-l-coral'
          : 'border border-ink/10'
      }`}
    >
      <p className="text-2xl font-bold text-ink">{primary}</p>
      {secondary !== null && (
        <p className="text-base text-ink/70 mt-1">{secondary}</p>
      )}
      {confidenceLabel !== null && (
        <p className="text-sm italic text-ink/60 mt-1">{confidenceLabel}</p>
      )}
    </div>
  );
}
