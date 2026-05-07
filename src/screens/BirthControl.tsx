import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { BirthControlEntry } from '../types';
import { getAllBirthControl, addBirthControl, updateBirthControl, deleteBirthControl } from '../db/birthControl';
import BirthControlForm from '../components/BirthControlForm';
import BirthControlListItem from '../components/BirthControlListItem';

type EditingState = BirthControlEntry | 'new' | null;

export default function BirthControl() {
  const [editingEntry, setEditingEntry] = useState<EditingState>(null);
  const entries = useLiveQuery(() => getAllBirthControl(), []) ?? [];

  async function handleSave(data: Omit<BirthControlEntry, 'id' | 'updatedAt'>) {
    if (editingEntry === 'new') {
      await addBirthControl(data);
    } else if (editingEntry && editingEntry.id !== undefined) {
      await updateBirthControl(editingEntry.id, data);
    }
    setEditingEntry(null);
  }

  async function handleDelete() {
    if (editingEntry && editingEntry !== 'new' && editingEntry.id !== undefined) {
      await deleteBirthControl(editingEntry.id);
      setEditingEntry(null);
    }
  }

  return (
    <div className="p-6 flex flex-col gap-5">
      <h1 className="text-3xl font-bold text-ink">Birth Control</h1>

      {editingEntry !== null ? (
        <BirthControlForm
          initial={editingEntry === 'new' ? undefined : editingEntry}
          onSave={handleSave}
          onCancel={() => setEditingEntry(null)}
          onDelete={editingEntry !== 'new' ? handleDelete : undefined}
        />
      ) : (
        <>
          <button
            onClick={() => setEditingEntry('new')}
            className="w-full bg-coral text-white font-bold rounded-2xl py-3 active:scale-[0.98] transition-transform"
          >
            + Add
          </button>

          {entries.length === 0 ? (
            <p className="text-center text-ink/40 text-sm mt-6">No birth control logged yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {entries.map((entry) => (
                <BirthControlListItem
                  key={entry.id}
                  entry={entry}
                  onTap={() => setEditingEntry(entry)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
