export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type Severity = 'mild' | 'moderate' | 'severe';

export type SymptomId =
  | 'cramps'
  | 'headache'
  | 'nausea'
  | 'fatigue'
  | 'bloating'
  | 'mood'
  | 'breast_tenderness'
  | 'acne'
  | 'cravings'
  | 'digestion'
  | 'sleep'
  | 'back_pain'
  | 'dizziness'
  | 'libido';

export interface SymptomEntry {
  id: SymptomId;
  severity: Severity;
}

export interface DayEntry {
  date: string; // YYYY-MM-DD, primary key
  onPeriod: boolean;
  flow?: FlowLevel;
  symptoms: SymptomEntry[];
  note?: string;
  updatedAt: number; // ms epoch
}

export interface SymptomConfig {
  id: 'singleton';
  enabledOptional: SymptomId[]; // max 4, from optional pool only
}

export type BirthControlType = 'pill' | 'implant' | 'iud_hormonal' | 'iud_copper';

export interface BirthControlEntry {
  id?: number;
  type: BirthControlType;
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD, undefined = currently using
  notes?: string;
  updatedAt: number;
}

export interface MetaEntry {
  id: 'lastBackup' | 'bannerSuppressedUntil';
  date: string; // ISO timestamp
}
