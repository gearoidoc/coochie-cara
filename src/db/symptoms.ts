import type { SymptomId } from '../types';

export interface SymptomCatalogEntry {
  id: SymptomId;
  label: string;
  emoji: string;
  isDefault: boolean;
}

export const SYMPTOM_CATALOG: SymptomCatalogEntry[] = [
  { id: 'cramps',            label: 'Cramps',            emoji: '🌀', isDefault: true },
  { id: 'headache',          label: 'Headache',          emoji: '🤕', isDefault: true },
  { id: 'nausea',            label: 'Nausea',            emoji: '🤢', isDefault: true },
  { id: 'fatigue',           label: 'Fatigue',           emoji: '😴', isDefault: true },
  { id: 'bloating',          label: 'Bloating',          emoji: '🎈', isDefault: true },
  { id: 'mood',              label: 'Mood',              emoji: '🥺', isDefault: true },
  { id: 'breast_tenderness', label: 'Breast tenderness', emoji: '💗', isDefault: false },
  { id: 'acne',              label: 'Acne',              emoji: '🌟', isDefault: false },
  { id: 'cravings',          label: 'Cravings',          emoji: '🍫', isDefault: false },
  { id: 'digestion',         label: 'Digestion',         emoji: '🌿', isDefault: false },
  { id: 'sleep',             label: 'Sleep',             emoji: '🌙', isDefault: false },
  { id: 'back_pain',         label: 'Back pain',         emoji: '🔥', isDefault: false },
  { id: 'dizziness',         label: 'Dizziness',         emoji: '💫', isDefault: false },
  { id: 'libido',            label: 'Libido',            emoji: '✨', isDefault: false },
];

export function getDefaultSymptoms(): SymptomCatalogEntry[] {
  return SYMPTOM_CATALOG.filter((s) => s.isDefault);
}

export function getOptionalSymptoms(): SymptomCatalogEntry[] {
  return SYMPTOM_CATALOG.filter((s) => !s.isDefault);
}

export function getSymptomById(id: SymptomId): SymptomCatalogEntry | undefined {
  return SYMPTOM_CATALOG.find((s) => s.id === id);
}
