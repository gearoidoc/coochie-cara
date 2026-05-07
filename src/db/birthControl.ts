import { db } from './database';
import type { BirthControlEntry, BirthControlType } from '../types';

export const BIRTH_CONTROL_LABELS: Record<BirthControlType, { label: string; emoji: string }> = {
  pill:         { label: 'Pill',         emoji: '💊' },
  implant:      { label: 'Implant',      emoji: '💉' },
  iud_hormonal: { label: 'Hormonal IUD', emoji: '🩷' },
  iud_copper:   { label: 'Copper IUD',   emoji: '🟠' },
};

export async function getAllBirthControl(): Promise<BirthControlEntry[]> {
  const entries = await db.birthControl.toArray();
  return entries.sort((a, b) => (b.startDate > a.startDate ? 1 : -1));
}

export async function addBirthControl(
  entry: Omit<BirthControlEntry, 'id' | 'updatedAt'>,
): Promise<number> {
  return db.birthControl.add({ ...entry, updatedAt: Date.now() } as BirthControlEntry) as Promise<number>;
}

export async function updateBirthControl(
  id: number,
  patch: Partial<Omit<BirthControlEntry, 'id'>>,
): Promise<void> {
  await db.birthControl.update(id, { ...patch, updatedAt: Date.now() });
}

export async function deleteBirthControl(id: number): Promise<void> {
  await db.birthControl.delete(id);
}
