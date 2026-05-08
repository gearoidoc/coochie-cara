import Dexie, { type EntityTable } from 'dexie';
import type { DayEntry, SymptomConfig, BirthControlEntry, MetaEntry } from '../types';

class CoochieCaraDB extends Dexie {
  days!: EntityTable<DayEntry, 'date'>;
  symptomConfig!: EntityTable<SymptomConfig, 'id'>;
  birthControl!: EntityTable<BirthControlEntry, 'id'>;
  meta!: EntityTable<MetaEntry, 'id'>;

  constructor() {
    super('coochie-cara');
    this.version(1).stores({
      days: 'date, updatedAt',
      symptomConfig: 'id',
    });
    this.version(2).stores({
      days: 'date, updatedAt',
      symptomConfig: 'id',
      birthControl: '++id, startDate',
    });
    this.version(3).stores({
      days: 'date, updatedAt',
      symptomConfig: 'id',
      birthControl: '++id, startDate',
      meta: 'id',
    });
  }
}

export const db = new CoochieCaraDB();
