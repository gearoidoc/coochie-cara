import { format } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, upsertDay } from '../db';
import PeriodButton from '../components/PeriodButton';
import FlowChips from '../components/FlowChips';
import type { FlowLevel } from '../types';

const todayStr = format(new Date(), 'yyyy-MM-dd');

export default function Today() {
  // null = loading, undefined = no record, DayEntry = found
  const entry = useLiveQuery(() => db.days.get(todayStr), [], null);

  if (entry === null) return null;

  const onPeriod = entry?.onPeriod ?? false;
  const flow: FlowLevel = entry?.flow ?? 'medium';

  function handlePeriodToggle() {
    const newOnPeriod = !onPeriod;
    upsertDay({
      date: todayStr,
      onPeriod: newOnPeriod,
      flow: newOnPeriod ? 'medium' : undefined,
      symptoms: entry?.symptoms ?? [],
      note: entry?.note,
    }).catch((e) => console.error('Failed to persist period toggle', e));
  }

  function handleFlowSelect(newFlow: FlowLevel) {
    upsertDay({
      date: todayStr,
      onPeriod: true,
      flow: newFlow,
      symptoms: entry?.symptoms ?? [],
      note: entry?.note,
    }).catch((e) => console.error('Failed to persist flow selection', e));
  }

  const dateDisplay = format(new Date(), 'EEE d MMM');

  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold">
        <span className="text-coral">Today</span>
        <span className="text-ink">, {dateDisplay}</span>
      </h1>
      <p className="text-ink/60 text-sm mt-1">How are you today?</p>

      <div className="mt-8">
        <PeriodButton onPeriod={onPeriod} onToggle={handlePeriodToggle} />
      </div>

      <div
        className={`transition-all duration-200 overflow-hidden ${
          onPeriod
            ? 'opacity-100 max-h-40'
            : 'opacity-0 max-h-0 pointer-events-none'
        }`}
      >
        <FlowChips flow={flow} onSelect={handleFlowSelect} />
      </div>
    </div>
  );
}
