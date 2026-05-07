import { db } from './database';
import { getOptionalSymptoms } from './symptoms';
import type { SymptomConfig, SymptomId } from '../types';

const SINGLETON_ID = 'singleton' as const;

export async function getSymptomConfig(): Promise<SymptomConfig> {
  const existing = await db.symptomConfig.get(SINGLETON_ID);
  if (existing) return existing;

  const defaults: SymptomConfig = { id: SINGLETON_ID, enabledOptional: [] };
  await db.symptomConfig.put(defaults);
  return defaults;
}

export async function setEnabledOptional(ids: SymptomId[]): Promise<void> {
  const optionalIds = new Set(getOptionalSymptoms().map((s) => s.id));

  const invalid = ids.filter((id) => !optionalIds.has(id));
  if (invalid.length > 0) {
    throw new Error(
      `Invalid optional symptom IDs: ${invalid.join(', ')}. Only optional symptoms may be enabled here.`
    );
  }

  const config = await getSymptomConfig();
  await db.symptomConfig.put({ ...config, enabledOptional: ids });
}
