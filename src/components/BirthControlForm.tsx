import { useState } from 'react';
import type { BirthControlEntry, BirthControlType } from '../types';
import { BIRTH_CONTROL_LABELS } from '../db/birthControl';

interface Props {
  initial?: BirthControlEntry;
  onSave: (entry: Omit<BirthControlEntry, 'id' | 'updatedAt'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const inputClass =
  'w-full bg-cream border-2 border-coral/20 rounded-xl px-4 py-2.5 text-ink focus:outline-none focus:border-coral transition-colors';

export default function BirthControlForm({ initial, onSave, onCancel, onDelete }: Props) {
  const [type, setType] = useState<BirthControlType>(initial?.type ?? 'pill');
  const [startDate, setStartDate] = useState(initial?.startDate ?? '');
  const [endDate, setEndDate] = useState(initial?.endDate ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!type || !startDate) {
      setError('Type and start date are required.');
      return;
    }
    if (endDate && endDate < startDate) {
      setError('End date must be on or after start date.');
      return;
    }
    setError(null);
    onSave({
      type,
      startDate,
      endDate: endDate || undefined,
      notes: notes.trim() || undefined,
    });
  }

  function handleDelete() {
    if (window.confirm('Delete this birth control entry?')) {
      onDelete?.();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-ink/70">Method</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as BirthControlType)}
          className={inputClass}
        >
          {(Object.keys(BIRTH_CONTROL_LABELS) as BirthControlType[]).map((key) => {
            const { label, emoji } = BIRTH_CONTROL_LABELS[key];
            return (
              <option key={key} value={key}>
                {emoji} {label}
              </option>
            );
          })}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-ink/70">Start date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-ink/70">End date <span className="font-normal text-ink/40">(leave blank if still current)</span></label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-ink/70">Notes <span className="font-normal text-ink/40">(optional)</span></label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Any notes…"
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 font-semibold">{error}</p>
      )}

      <div className="flex flex-col gap-2 pt-1">
        <button
          type="submit"
          className="w-full bg-coral text-white font-bold rounded-2xl py-3 active:scale-[0.98] transition-transform"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full bg-cream border-2 border-coral/30 text-coral font-bold rounded-2xl py-3 active:scale-[0.98] transition-transform"
        >
          Cancel
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="w-full text-red-400 font-semibold text-sm py-2 active:scale-[0.98] transition-transform"
          >
            Delete entry
          </button>
        )}
      </div>
    </form>
  );
}
