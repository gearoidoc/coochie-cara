import { db } from './database';
import type { DayEntry } from '../types';

export async function getDay(date: string): Promise<DayEntry | undefined> {
  return db.days.get(date);
}

export async function upsertDay(entry: Omit<DayEntry, 'updatedAt'> & { updatedAt?: number }): Promise<void> {
  await db.days.put({ ...entry, updatedAt: Date.now() });
}

export async function getDaysInRange(startDate: string, endDate: string): Promise<DayEntry[]> {
  return db.days
    .where('date')
    .between(startDate, endDate, true, true)
    .sortBy('date');
}

export async function deleteDay(date: string): Promise<void> {
  await db.days.delete(date);
}
