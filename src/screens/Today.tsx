import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { addDays, format, parseISO, subDays } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, upsertDay, getDefaultSymptoms, getSymptomById } from '../db';
import DateHeader from '../components/DateHeader';
import PeriodButton from '../components/PeriodButton';
import FlowChips from '../components/FlowChips';
import SymptomTile from '../components/SymptomTile';
import NoteField from '../components/NoteField';
import type { FlowLevel, Severity, SymptomId } from '../types';

export default function Today() {
  const [viewedDate, setViewedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const noteFlushRef = useRef<(() => void) | null>(null);

  const entry = useLiveQuery(() => db.days.get(viewedDate), [viewedDate], null);
  const symptomConfig = useLiveQuery(() => db.symptomConfig.get('singleton'));

  // null = DB query in flight; show header but hide form to avoid flicker
  const isLoading = entry === null;

  const onPeriod = entry?.onPeriod ?? false;
  const flow: FlowLevel = entry?.flow ?? 'medium';

  function navigateTo(newDate: string) {
    noteFlushRef.current?.();
    setViewedDate(newDate);
  }

  function handlePrev() {
    navigateTo(format(subDays(parseISO(viewedDate), 1), 'yyyy-MM-dd'));
  }

  function handleNext() {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (viewedDate < todayStr) {
      navigateTo(format(addDays(parseISO(viewedDate), 1), 'yyyy-MM-dd'));
    }
  }

  function handleToday() {
    navigateTo(format(new Date(), 'yyyy-MM-dd'));
  }

  function handlePeriodToggle() {
    const newOnPeriod = !onPeriod;
    upsertDay({
      date: viewedDate,
      onPeriod: newOnPeriod,
      flow: newOnPeriod ? 'medium' : undefined,
      symptoms: entry?.symptoms ?? [],
      note: entry?.note,
    }).catch((e) => console.error('Failed to persist period toggle', e));
  }

  function handleFlowSelect(newFlow: FlowLevel) {
    upsertDay({
      date: viewedDate,
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
    const updated =
      nextSeverity === null
        ? current.filter((s) => s.id !== id)
        : existing
          ? current.map((s) => (s.id === id ? { ...s, severity: nextSeverity } : s))
          : [...current, { id, severity: nextSeverity }];
    upsertDay({
      date: viewedDate,
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
      date: viewedDate,
      onPeriod: entry?.onPeriod ?? false,
      flow: entry?.flow,
      symptoms: entry?.symptoms ?? [],
      note,
    }).catch((e) => console.error('Failed to persist note', e));
  }

  return (
    <div className="p-6">
      <DateHeader
        viewedDate={viewedDate}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />

      {!isLoading && (
        <>
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
            <div className="flex items-center justify-between mb-3">
              <p className="text-ink/70 font-semibold text-sm">How are you feeling?</p>
              <Link
                to="/settings"
                className="text-coralDark text-sm font-semibold active:scale-95 transition-all flex items-center gap-1"
              >
                Customize ›
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ...getDefaultSymptoms(),
                ...(symptomConfig?.enabledOptional ?? [])
                  .map((id) => getSymptomById(id))
                  .filter((s): s is NonNullable<typeof s> => s !== undefined),
              ].map((symptom) => (
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
            <NoteField
              key={viewedDate}
              persistedNote={entry?.note}
              onSave={handleNoteSave}
              flushRef={noteFlushRef}
            />
          </div>
        </>
      )}
    </div>
  );
}
