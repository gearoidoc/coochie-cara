import { format } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, upsertDay, getDefaultSymptoms } from '../db';
import PeriodButton from '../components/PeriodButton';
import FlowChips from '../components/FlowChips';
import SymptomTile from '../components/SymptomTile';
import NoteField from '../components/NoteField';
import type { FlowLevel, Severity, SymptomId } from '../types';

const DEFAULT_SYMPTOMS = getDefaultSymptoms();

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

  function handleSymptomTap(id: SymptomId) {
    navigator.vibrate?.(10);
    const current = entry?.symptoms ?? [];
    const existing = current.find((s) => s.id === id);
    const CYCLE: Array<Severity | null> = [null, 'mild', 'moderate', 'severe'];
    const nextSeverity = CYCLE[(CYCLE.indexOf(existing?.severity ?? null) + 1) % CYCLE.length];
    const updated = nextSeverity === null
      ? current.filter((s) => s.id !== id)
      : existing
        ? current.map((s) => s.id === id ? { ...s, severity: nextSeverity } : s)
        : [...current, { id, severity: nextSeverity }];
    upsertDay({
      date: todayStr,
      onPeriod: entry?.onPeriod ?? false,
      flow: entry?.flow,
      symptoms: updated,
      note: entry?.note,
    }).catch((e) => console.error('Failed to persist symptom tap', e));
  }

  function getSeverity(id: SymptomId): Severity | null {
    return entry?.symptoms.find((s) => s.id === id)?.severity ?? null;
  }

  function handleNoteSave(note: string | undefined) {
    upsertDay({
      date: todayStr,
      onPeriod: entry?.onPeriod ?? false,
      flow: entry?.flow,
      symptoms: entry?.symptoms ?? [],
      note,
    }).catch((e) => console.error('Failed to persist note', e));
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

      <div className="mt-8">
        <p className="text-ink/70 font-semibold text-sm mb-3">How are you feeling?</p>
        <div className="grid grid-cols-2 gap-3">
          {DEFAULT_SYMPTOMS.map((symptom) => (
            <SymptomTile
              key={symptom.id}
              symptom={symptom}
              severity={getSeverity(symptom.id as SymptomId)}
              onTap={() => handleSymptomTap(symptom.id as SymptomId)}
            />
          ))}
        </div>
      </div>
      <div className="mt-8">
        <NoteField persistedNote={entry?.note} onSave={handleNoteSave} />
      </div>
    </div>
  );
}
