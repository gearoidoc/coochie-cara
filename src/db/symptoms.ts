import type { SymptomId } from '../types';

interface SymptomMeta {
  id: SymptomId;
  label: string;
  emoji: string;
  isDefault: boolean;
}

export const SYMPTOM_CATALOG: SymptomMeta[] = [
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

export function getDefaultSymptoms(): SymptomMeta[] {
  return SYMPTOM_CATALOG.filter((s) => s.isDefault);
}

export function getOptionalSymptoms(): SymptomMeta[] {
  return SYMPTOM_CATALOG.filter((s) => !s.isDefault);
}

export function getSymptomById(id: SymptomId): SymptomMeta | undefined {
  return SYMPTOM_CATALOG.find((s) => s.id === id);
}
