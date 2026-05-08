// BC rule: The prediction engine does not import from or reference birthControl. Natural-cycle prediction only.

import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import type { DayEntry } from '../types';

export type Cycle = {
  startDate: string;       // YYYY-MM-DD, the onPeriod=true cycle anchor
  endDate: string;         // YYYY-MM-DD, day before next cycle start (or last logged day if ongoing)
  lengthDays: number;      // endDate - startDate + 1
  periodLengthDays: number; // count of period days from start until first 3+ day gap
  isOngoing: boolean;      // true if no subsequent cycle start exists yet
};

export type CycleStats = {
  usableCycles: Cycle[];
  medianCycleLength: number | null;
  medianPeriodLength: number | null;
  cycleLengthStdDev: number | null;
};

export type ConfidenceLevel = 'none' | 'low' | 'approximate' | 'normal';
// 'none'        = n < 2: hide predictions entirely
// 'low'         = 2 ≤ n < 4: show with "low confidence" label
// 'approximate' = n ≥ 4 and stdDev > 4: show with "approximate" label
// 'normal'      = n ≥ 4 and stdDev ≤ 4: show without caveat

export type Prediction = {
  nextPeriodStart: string | null;
  predictedPeriodLength: number | null;
  confidence: ConfidenceLevel;
};

export type CycleStatus = {
  // Status derived from today's actual date, not URL-driven date navigation.
  // Caller passes today as YYYY-MM-DD.
  state: 'no-data' | 'on-period' | 'pre-period' | 'late';
  cycleDay: number | null;
  daysUntilNextPeriod: number | null;
  periodDay: number | null;
  confidence: ConfidenceLevel;
};

const MAX_CYCLES = 12;

// Walk forward from startDate to endDate, count onPeriod=true days, stopping at the first
// run of 3+ consecutive days with no period (absent records or onPeriod=false both count as not-period).
function walkPeriod(
  startDate: string,
  endDate: string,
  recordMap: Map<string, DayEntry>,
): { periodDates: string[]; periodLengthDays: number } {
  const periodDates: string[] = [];
  let consecutiveGap = 0;
  const start = parseISO(startDate);
  const totalDays = differenceInCalendarDays(parseISO(endDate), start) + 1;

  for (let i = 0; i < totalDays; i++) {
    const date = format(addDays(start, i), 'yyyy-MM-dd');
    const isOnPeriod = recordMap.get(date)?.onPeriod ?? false;

    if (isOnPeriod) {
      periodDates.push(date);
      consecutiveGap = 0;
    } else {
      consecutiveGap++;
      if (consecutiveGap >= 3) break;
    }
  }

  return { periodDates, periodLengthDays: periodDates.length };
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function populationStdDev(values: number[]): number {
  const n = values.length;
  if (n === 0) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / n;
  return Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / n);
}

// Anchoring rule: cycles are anchored on onPeriod=true only.
// A day with onPeriod=false, flow='spotting' is mid-cycle spotting and must NOT reset
// cycle counts or count as a cycle start.
// A day with onPeriod=true, flow='spotting' is tail-end period spotting and IS part of the period.
export function detectCycles(records: DayEntry[]): Cycle[] {
  if (records.length === 0) return [];

  const recordMap = new Map<string, DayEntry>(records.map(r => [r.date, r]));
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const mostRecentDate = sorted[sorted.length - 1].date;

  // Find cycle starts: onPeriod=true days with no onPeriod=true day in the prior 10 days.
  // Mid-cycle spotting (onPeriod=false, flow='spotting') is ignored for cycle anchoring.
  const cycleStarts: string[] = [];
  for (const { date } of sorted) {
    if (!recordMap.get(date)!.onPeriod) continue;

    let hasRecentPeriod = false;
    const d = parseISO(date);
    for (let i = 1; i <= 10; i++) {
      if (recordMap.get(format(addDays(d, -i), 'yyyy-MM-dd'))?.onPeriod) {
        hasRecentPeriod = true;
        break;
      }
    }
    if (!hasRecentPeriod) cycleStarts.push(date);
  }

  if (cycleStarts.length === 0) return [];

  return cycleStarts.map((startDate, i) => {
    const nextStart = cycleStarts[i + 1];
    const isOngoing = nextStart === undefined;
    const endDate = isOngoing
      ? mostRecentDate
      : format(addDays(parseISO(nextStart), -1), 'yyyy-MM-dd');
    const lengthDays = differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1;
    const { periodLengthDays } = walkPeriod(startDate, endDate, recordMap);
    return { startDate, endDate, lengthDays, periodLengthDays, isOngoing };
  });
}

export function computeCycleStats(cycles: Cycle[]): CycleStats {
  const empty: CycleStats = {
    usableCycles: [],
    medianCycleLength: null,
    medianPeriodLength: null,
    cycleLengthStdDev: null,
  };
  if (cycles.length === 0) return empty;

  // Anchor the 365-day cutoff on the most recent logged date (= ongoing cycle's endDate).
  const mostRecentDate = cycles[cycles.length - 1].endDate;
  const cutoffDate = format(addDays(parseISO(mostRecentDate), -365), 'yyyy-MM-dd');

  const usableCycles = cycles
    .filter(c => !c.isOngoing)
    .filter(c => c.lengthDays >= 15 && c.lengthDays <= 90)
    .filter(c => c.startDate >= cutoffDate)
    .slice(-MAX_CYCLES);

  if (usableCycles.length === 0) return { ...empty, usableCycles: [] };

  const cycleLengths = usableCycles.map(c => c.lengthDays);
  const periodLengths = usableCycles.map(c => c.periodLengthDays);

  return {
    usableCycles,
    medianCycleLength: median(cycleLengths),
    medianPeriodLength: median(periodLengths),
    cycleLengthStdDev: populationStdDev(cycleLengths),
  };
}

export function getConfidenceLevel(stats: CycleStats): ConfidenceLevel {
  const n = stats.usableCycles.length;
  if (n < 2) return 'none';
  if (n < 4) return 'low';
  return (stats.cycleLengthStdDev ?? 0) <= 4 ? 'normal' : 'approximate';
}

export function predictNextPeriod(records: DayEntry[]): Prediction {
  const cycles = detectCycles(records);
  const stats = computeCycleStats(cycles);
  const confidence = getConfidenceLevel(stats);

  if (confidence === 'none' || stats.medianCycleLength === null || stats.medianPeriodLength === null) {
    return { nextPeriodStart: null, predictedPeriodLength: null, confidence: 'none' };
  }

  const mostRecentCycleStart = cycles[cycles.length - 1].startDate;
  const nextPeriodStart = format(
    addDays(parseISO(mostRecentCycleStart), stats.medianCycleLength),
    'yyyy-MM-dd',
  );

  return {
    nextPeriodStart,
    predictedPeriodLength: Math.round(stats.medianPeriodLength),
    confidence,
  };
}

export function deriveCycleStatus(records: DayEntry[], today: string): CycleStatus {
  const cycles = detectCycles(records);
  const stats = computeCycleStats(cycles);
  const confidence = getConfidenceLevel(stats);

  if (confidence === 'none') {
    return { state: 'no-data', cycleDay: null, daysUntilNextPeriod: null, periodDay: null, confidence };
  }

  const mostRecentCycle = cycles[cycles.length - 1];
  const cycleDay = differenceInCalendarDays(parseISO(today), parseISO(mostRecentCycle.startDate)) + 1;

  const recordMap = new Map<string, DayEntry>(records.map(r => [r.date, r]));
  const { periodDates } = walkPeriod(mostRecentCycle.startDate, mostRecentCycle.endDate, recordMap);
  const periodIdx = periodDates.indexOf(today);

  if (periodIdx !== -1) {
    return { state: 'on-period', cycleDay, daysUntilNextPeriod: null, periodDay: periodIdx + 1, confidence };
  }

  // Compute next period start from most recent cycle start + median cycle length.
  const nextPeriodStart = format(
    addDays(parseISO(mostRecentCycle.startDate), stats.medianCycleLength!),
    'yyyy-MM-dd',
  );
  const daysUntil = differenceInCalendarDays(parseISO(nextPeriodStart), parseISO(today));

  return {
    state: daysUntil > 0 ? 'pre-period' : 'late',
    cycleDay,
    daysUntilNextPeriod: daysUntil,
    periodDay: null,
    confidence,
  };
}
