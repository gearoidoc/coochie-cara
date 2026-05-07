import { format, parseISO } from 'date-fns';
import type { BirthControlEntry } from '../types';
import { BIRTH_CONTROL_LABELS } from '../db/birthControl';

interface Props {
  entry: BirthControlEntry;
  onTap: () => void;
}

function fmt(dateStr: string) {
  return format(parseISO(dateStr), 'MMM d, yyyy');
}

export default function BirthControlListItem({ entry, onTap }: Props) {
  const { label, emoji } = BIRTH_CONTROL_LABELS[entry.type];
  const dateRange = entry.endDate
    ? `${fmt(entry.startDate)} – ${fmt(entry.endDate)}`
    : `Started ${fmt(entry.startDate)}`;

  return (
    <button
      onClick={onTap}
      className="w-full bg-white rounded-2xl px-4 py-3 flex items-center gap-3 text-left active:scale-[0.99] transition-transform shadow-sm"
    >
      <span className="text-2xl leading-none">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-ink">{label}</span>
          {!entry.endDate && (
            <span className="text-xs font-semibold bg-sage text-white rounded-full px-2 py-0.5">
              Current
            </span>
          )}
        </div>
        <p className="text-sm text-ink/60">{dateRange}</p>
        {entry.notes && (
          <p className="text-sm text-ink/60 truncate mt-0.5">{entry.notes}</p>
        )}
      </div>
      <span className="text-ink/30 text-lg">›</span>
    </button>
  );
}
