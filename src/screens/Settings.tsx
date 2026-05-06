import { useLiveQuery } from 'dexie-react-hooks';
import { db, getDefaultSymptoms, getOptionalSymptoms, setEnabledOptional } from '../db';
import type { SymptomId } from '../types';
import SymptomConfigRow from '../components/SymptomConfigRow';

const defaults = getDefaultSymptoms();
const optionals = getOptionalSymptoms();

export default function Settings() {
  // null = still loading (default); undefined = no record yet but DB is ready
  const config = useLiveQuery(() => db.symptomConfig.get('singleton'), [], null);

  if (config === null) return null;

  const enabledOptional: SymptomId[] = config?.enabledOptional ?? [];
  const enabledSet = new Set(enabledOptional);

  const enabledSymptoms = enabledOptional
    .map((id) => optionals.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  const available = optionals.filter((s) => !enabledSet.has(s.id as SymptomId));

  function handleRemove(id: SymptomId) {
    setEnabledOptional(enabledOptional.filter((eid) => eid !== id))
      .catch((e) => console.error('Failed to remove symptom', e));
  }

  function handleAdd(id: SymptomId) {
    setEnabledOptional([...enabledOptional, id])
      .catch((e) => console.error('Failed to add symptom', e));
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold text-ink mb-6">Settings</h1>

      <p className="text-ink/70 font-semibold text-sm mb-2">Symptoms</p>
      <p className="text-ink/60 text-sm mb-4">
        Choose extra symptoms to track alongside the defaults.
      </p>
      {enabledOptional.length > 0 && (
        <span className="text-coralDark bg-coral/10 rounded-full px-3 py-1 text-xs font-semibold inline-block mb-4">
          {enabledOptional.length} added
        </span>
      )}

      <p className="text-ink/50 text-xs font-semibold uppercase tracking-wide mb-2 mt-4">
        In your grid
      </p>
      <div className="flex flex-col gap-2">
        {defaults.map((symptom) => (
          <SymptomConfigRow key={symptom.id} symptom={symptom} mode="default" />
        ))}
        {enabledSymptoms.map((symptom) => (
          <SymptomConfigRow
            key={symptom.id}
            symptom={symptom}
            mode="enabled"
            onAction={() => handleRemove(symptom.id as SymptomId)}
          />
        ))}
      </div>

      {available.length > 0 && (
        <>
          <p className="text-ink/50 text-xs font-semibold uppercase tracking-wide mb-2 mt-6">
            Available to add
          </p>
          <div className="flex flex-col gap-2">
            {available.map((symptom) => (
              <SymptomConfigRow
                key={symptom.id}
                symptom={symptom}
                mode="available"
                onAction={() => handleAdd(symptom.id as SymptomId)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
