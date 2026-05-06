import Dexie, { type EntityTable } from 'dexie';
import type { DayEntry, SymptomConfig } from '../types';

class CoochieCaraDB extends Dexie {
  days!: EntityTable<DayEntry, 'date'>;
  symptomConfig!: EntityTable<SymptomConfig, 'id'>;

  constructor() {
    super('coochie-cara');
    this.version(1).stores({
      days: 'date, updatedAt',
      symptomConfig: 'id',
    });
  }
}

export const db = new CoochieCaraDB();
