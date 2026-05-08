import { useEffect, useRef, useState } from 'react';
import { differenceInDays, format, parseISO } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getDefaultSymptoms, getOptionalSymptoms, setEnabledOptional } from '../db';
import {
  exportBackup,
  parseBackup,
  summarizeBackup,
  applyBackup,
  type BackupFile,
  type BackupSummary,
} from '../lib/backup';
import type { SymptomId } from '../types';
import SymptomConfigRow from '../components/SymptomConfigRow';

const defaults = getDefaultSymptoms();
const optionals = getOptionalSymptoms();

export default function Settings() {
  const config = useLiveQuery(() => db.symptomConfig.get('singleton'), [], null);
  const lastBackup = useLiveQuery(async () => {
    const result = await db.meta.get('lastBackup');
    return result?.date ?? null;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [pendingBackup, setPendingBackup] = useState<BackupFile | null>(null);
  const [pendingSummary, setPendingSummary] = useState<BackupSummary | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!pendingBackup) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setPendingBackup(null);
        setPendingSummary(null);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [pendingBackup]);

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

  async function handleExport() {
    setIsExporting(true);
    try {
      await exportBackup();
    } catch (e) {
      console.error('Export failed', e);
    } finally {
      setIsExporting(false);
    }
  }

  function handleRestoreClick() {
    setParseError(null);
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const backup = parseBackup(text);
      const summary = summarizeBackup(backup);
      setPendingBackup(backup);
      setPendingSummary(summary);
      setParseError(null);
    } catch (err) {
      setParseError(
        err instanceof Error
          ? err.message
          : "This file isn't a valid backup. Please pick a different file."
      );
    }
  }

  function handleModalClose() {
    setPendingBackup(null);
    setPendingSummary(null);
  }

  async function handleApplyBackup() {
    if (!pendingBackup) return;
    try {
      await applyBackup(pendingBackup);
      setPendingBackup(null);
      setPendingSummary(null);
      setRestoreSuccess(true);
      setTimeout(() => setRestoreSuccess(false), 4000);
    } catch (e) {
      console.error('Restore failed', e);
    }
  }

  function renderLastBackupStatus() {
    if (lastBackup === undefined || lastBackup === null) {
      return <p className="text-xs text-ink/50 mt-3 text-center">No backups yet</p>;
    }
    const days = differenceInDays(new Date(), parseISO(lastBackup));
    const dateStr = format(parseISO(lastBackup), 'MMM d, yyyy');
    if (days >= 365) {
      return (
        <p className="text-xs text-ink/50 mt-3 text-center">
          Last backup: {dateStr}{' '}
          <span className="text-coralDark">(over a year ago)</span>
        </p>
      );
    }
    return <p className="text-xs text-ink/50 mt-3 text-center">Last backup: {dateStr}</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold text-ink mb-6">Settings</h1>

      {/* Backup & Restore */}
      <div className="bg-cream border border-ink/10 rounded-2xl p-5 mb-5">
        <p className="text-xs uppercase tracking-wide text-ink/50 mb-3">Backup &amp; Restore</p>

        {lastBackup === null && (
          <div className="bg-sage/10 border border-sage/30 rounded-xl p-3 mb-4">
            <p className="text-sm text-ink/70">
              💡 We recommend saving to iCloud Drive so your backup survives even if you lose your
              phone or clear Safari data.
            </p>
          </div>
        )}

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-coral text-white font-bold rounded-2xl py-3 active:scale-[0.98] transition-transform w-full disabled:opacity-60"
        >
          {isExporting ? 'Backing up…' : 'Back up my data'}
        </button>
        <p className="text-sm text-ink/60 mt-2 text-center">
          Saves a file you can keep in iCloud, email, or Files
        </p>

        {renderLastBackupStatus()}

        {restoreSuccess && (
          <p className="text-sm text-sage font-semibold mt-3 text-center">Restored from backup.</p>
        )}

        <div className="border-t border-ink/10 my-4" />

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          onClick={handleRestoreClick}
          className="bg-cream border-2 border-ink/20 text-ink/70 font-bold rounded-2xl py-3 active:scale-[0.98] transition-transform w-full"
        >
          Restore from backup
        </button>
        <p className="text-sm text-ink/60 mt-2 text-center">
          Replaces all current data with a previously backed-up file
        </p>

        {parseError && (
          <p className="text-sm text-coralDark mt-3 text-center">{parseError}</p>
        )}
      </div>

      {/* Symptoms */}
      <div className="bg-cream border border-ink/10 rounded-2xl p-5">
        <p className="text-xs uppercase tracking-wide text-ink/50 mb-3">Symptoms</p>
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

      {/* Restore confirmation modal */}
      {pendingBackup && pendingSummary && (
        <>
          <div className="fixed inset-0 z-40 bg-ink/40" onClick={handleModalClose} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="bg-cream rounded-2xl p-6 w-full max-w-sm">
              <h2 className="text-xl font-bold text-ink mb-4">Restore from backup?</h2>
              <p className="text-sm text-ink/70 mb-1">This backup contains:</p>
              <ul className="text-sm text-ink/70 mb-4 space-y-1 ml-2">
                <li>
                  •{' '}
                  {pendingSummary.cycleCount !== null
                    ? pendingSummary.cycleCount
                    : 'could not count'}{' '}
                  cycles
                </li>
                <li>• {pendingSummary.loggedDayCount} logged days</li>
                <li>• {pendingSummary.bcEntryCount} birth control entries</li>
              </ul>
              <p className="text-sm text-ink/70 mb-4">
                Backed up on {format(parseISO(pendingSummary.exportedAt), 'MMM d, yyyy')}.
              </p>
              <p className="text-sm font-semibold text-ink mb-6">
                Restoring will replace ALL current data. This cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleModalClose}
                  className="bg-ink text-white font-bold rounded-2xl py-3 active:scale-[0.98] transition-transform w-full"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyBackup}
                  className="bg-cream border border-coralDark text-coralDark font-bold rounded-2xl py-3 active:scale-[0.98] transition-transform w-full"
                >
                  Replace my data
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
