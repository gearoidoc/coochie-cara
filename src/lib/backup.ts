import { format } from 'date-fns';
import { db } from '../db';
import { detectCycles } from './predictions';
import type { DayEntry, SymptomConfig, BirthControlEntry } from '../types';

export const SCHEMA_VERSION = 1;

export type BackupFile = {
  schemaVersion: number;
  exportedAt: string;
  data: {
    days: DayEntry[];
    birthControl: BirthControlEntry[];
    symptomConfig: SymptomConfig | undefined;
  };
};

export type BackupSummary = {
  schemaVersion: number;
  exportedAt: string;
  cycleCount: number | null;
  loggedDayCount: number;
  bcEntryCount: number;
};

export async function buildBackup(): Promise<BackupFile> {
  const [days, birthControl, symptomConfig] = await Promise.all([
    db.days.toArray(),
    db.birthControl.toArray(),
    db.symptomConfig.get('singleton'),
  ]);
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: { days, birthControl, symptomConfig },
  };
}

export async function exportBackup(): Promise<void> {
  const file = await buildBackup();
  const json = JSON.stringify(file, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const filename = `coochie-cara-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  await db.meta.put({ id: 'lastBackup', date: new Date().toISOString() });
}

export function parseBackup(json: string): BackupFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("This file isn't a valid backup. Please pick a different file.");
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error("This file isn't a valid backup. Please pick a different file.");
  }
  const obj = parsed as Record<string, unknown>;
  if (
    typeof obj.schemaVersion !== 'number' ||
    typeof obj.exportedAt !== 'string' ||
    typeof obj.data !== 'object' ||
    obj.data === null
  ) {
    throw new Error("This file isn't a valid backup. Please pick a different file.");
  }
  const data = obj.data as Record<string, unknown>;
  if (!Array.isArray(data.days) || !Array.isArray(data.birthControl)) {
    throw new Error("This file isn't a valid backup. Please pick a different file.");
  }
  if (obj.schemaVersion > SCHEMA_VERSION) {
    throw new Error('This backup file is from a newer version of the app.');
  }
  if (obj.schemaVersion < SCHEMA_VERSION) {
    throw new Error('This backup file is from an older version of the app.');
  }
  return parsed as BackupFile;
}

export function summarizeBackup(file: BackupFile): BackupSummary {
  let cycleCount: number | null;
  try {
    cycleCount = detectCycles(file.data.days).length;
  } catch {
    cycleCount = null;
  }
  const loggedDayCount = file.data.days.filter(
    (d) =>
      d.onPeriod ||
      d.flow !== undefined ||
      d.symptoms.length > 0 ||
      (d.note?.trim().length ?? 0) > 0
  ).length;
  return {
    schemaVersion: file.schemaVersion,
    exportedAt: file.exportedAt,
    cycleCount,
    loggedDayCount,
    bcEntryCount: file.data.birthControl.length,
  };
}

export async function applyBackup(file: BackupFile): Promise<void> {
  await db.transaction('rw', [db.days, db.birthControl, db.symptomConfig], async () => {
    await db.days.clear();
    await db.birthControl.clear();
    await db.symptomConfig.clear();
    if (file.data.days.length > 0) await db.days.bulkPut(file.data.days);
    if (file.data.birthControl.length > 0) await db.birthControl.bulkPut(file.data.birthControl);
    if (file.data.symptomConfig) await db.symptomConfig.put(file.data.symptomConfig);
  });
}

export async function getLastBackupDate(): Promise<string | null> {
  const result = await db.meta.get('lastBackup');
  return result?.date ?? null;
}
