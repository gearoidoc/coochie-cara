import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { addDays, differenceInDays, format, parseISO } from 'date-fns';
import { db } from '../db';

const REMIND_AFTER_DAYS = 30;
const SUPPRESS_DAYS = 7;

export default function BackupBanner() {
  const lastBackupEntry = useLiveQuery(() => db.meta.get('lastBackup'));
  const suppressEntry = useLiveQuery(() => db.meta.get('bannerSuppressedUntil'));
  const dayCount = useLiveQuery(() => db.days.count());

  if (lastBackupEntry === undefined || suppressEntry === undefined || dayCount === undefined) {
    return null;
  }

  if (dayCount === 0) return null;

  const now = new Date();

  const needsBackup =
    !lastBackupEntry ||
    differenceInDays(now, parseISO(lastBackupEntry.date)) >= REMIND_AFTER_DAYS;

  if (!needsBackup) return null;

  if (suppressEntry && now < parseISO(suppressEntry.date)) return null;

  function handleDismiss() {
    db.meta
      .put({ id: 'bannerSuppressedUntil', date: addDays(new Date(), SUPPRESS_DAYS).toISOString() })
      .catch((e) => console.error('Failed to suppress banner', e));
  }

  const lastBackupText = lastBackupEntry
    ? `Last backup: ${format(parseISO(lastBackupEntry.date), 'MMM d, yyyy')}`
    : 'No backups yet';

  return (
    <div className="bg-cream border border-ink/10 border-l-4 border-l-sage rounded-2xl p-4 mb-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-ink">Back up your data</p>
          <p className="text-sm text-ink/60 mt-0.5">{lastBackupText}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-ink/40 text-xl leading-none mt-0.5 active:scale-95 transition-all"
          aria-label="Dismiss for 7 days"
        >
          ×
        </button>
      </div>
      <Link
        to="/settings"
        className="bg-coral text-white font-semibold rounded-xl py-2 px-4 text-sm mt-3 inline-block active:scale-95 transition-all"
      >
        Back up now
      </Link>
    </div>
  );
}
