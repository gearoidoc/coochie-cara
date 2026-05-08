import { describe, it, expect } from 'vitest';
import { addDays, format, parseISO } from 'date-fns';
import {
  detectCycles,
  computeCycleStats,
  getConfidenceLevel,
  predictNextPeriod,
  deriveCycleStatus,
  type Cycle,
} from './predictions';
import type { DayEntry } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function day(date: string, onPeriod: boolean, flow?: DayEntry['flow']): DayEntry {
  return { date, onPeriod, flow, symptoms: [], updatedAt: 0 };
}

/** Build a run of consecutive onPeriod=true days starting from startDate. */
function periodRun(startDate: string, length: number): DayEntry[] {
  return Array.from({ length }, (_, i) =>
    day(format(addDays(parseISO(startDate), i), 'yyyy-MM-dd'), true),
  );
}

/**
 * Build records for N period starts separated by cycleLength days, each period
 * lasting periodLength days. Returns a flat DayEntry[].
 */
function buildPeriods(
  firstStart: string,
  count: number,
  cycleLength: number,
  periodLength = 5,
): DayEntry[] {
  const records: DayEntry[] = [];
  for (let i = 0; i < count; i++) {
    const start = format(addDays(parseISO(firstStart), i * cycleLength), 'yyyy-MM-dd');
    records.push(...periodRun(start, periodLength));
  }
  return records;
}

/** Directly construct a completed Cycle (not ongoing) for stats tests. */
function makeCycle(
  startDate: string,
  lengthDays: number,
  periodLengthDays = 5,
): Cycle {
  const endDate = format(addDays(parseISO(startDate), lengthDays - 1), 'yyyy-MM-dd');
  return { startDate, endDate, lengthDays, periodLengthDays, isOngoing: false };
}

/** Directly construct an ongoing Cycle for stats tests. */
function makeOngoingCycle(
  startDate: string,
  currentLengthDays: number,
  periodLengthDays = 5,
): Cycle {
  const endDate = format(addDays(parseISO(startDate), currentLengthDays - 1), 'yyyy-MM-dd');
  return { startDate, endDate, lengthDays: currentLengthDays, periodLengthDays, isOngoing: true };
}

// ---------------------------------------------------------------------------
// detectCycles
// ---------------------------------------------------------------------------

describe('detectCycles', () => {
  it('empty records → no cycles', () => {
    expect(detectCycles([])).toEqual([]);
  });

  it('single onPeriod day → one ongoing cycle', () => {
    const cycles = detectCycles([day('2024-01-01', true)]);
    expect(cycles).toHaveLength(1);
    expect(cycles[0].startDate).toBe('2024-01-01');
    expect(cycles[0].isOngoing).toBe(true);
    expect(cycles[0].periodLengthDays).toBe(1);
  });

  it('two periods 28 days apart → two cycles, last is ongoing', () => {
    // Cycle 1: Jan 1–5 (5-day period), Cycle 2: Jan 29–31 (3-day period)
    const records = [
      ...periodRun('2024-01-01', 5),
      ...periodRun('2024-01-29', 3),
    ];
    const cycles = detectCycles(records);
    expect(cycles).toHaveLength(2);

    expect(cycles[0].startDate).toBe('2024-01-01');
    expect(cycles[0].isOngoing).toBe(false);
    expect(cycles[0].lengthDays).toBe(28); // Jan 1 → Jan 28 (28 days)

    expect(cycles[1].startDate).toBe('2024-01-29');
    expect(cycles[1].isOngoing).toBe(true);
  });

  it('10-day lookback: 1-day logging gap within a period is one cycle', () => {
    // Day 1, day 3 logged (day 2 absent) — still same cycle
    const records = [
      day('2024-01-01', true),
      day('2024-01-03', true),
    ];
    const cycles = detectCycles(records);
    expect(cycles).toHaveLength(1);
    expect(cycles[0].startDate).toBe('2024-01-01');
  });

  it('10-day lookback: 2-day logging gap within a period is still one cycle', () => {
    // Day 1, days 4–5 logged (days 2–3 absent) — still same cycle
    const records = [
      day('2024-01-01', true),
      day('2024-01-04', true),
      day('2024-01-05', true),
    ];
    const cycles = detectCycles(records);
    expect(cycles).toHaveLength(1);
    expect(cycles[0].startDate).toBe('2024-01-01');
  });

  it('mid-cycle spotting (onPeriod=false, flow=spotting) does NOT count as a cycle start', () => {
    const records = [
      ...periodRun('2024-01-01', 5),
      day('2024-01-15', false, 'spotting'), // mid-cycle spotting
      ...periodRun('2024-01-29', 5),
    ];
    const cycles = detectCycles(records);
    expect(cycles).toHaveLength(2);
    expect(cycles[0].startDate).toBe('2024-01-01');
    expect(cycles[1].startDate).toBe('2024-01-29');
  });

  it('tail-end period spotting (onPeriod=true, flow=spotting) IS counted as part of the period', () => {
    // 4 regular days + 1 spotting day with onPeriod=true
    const records = [
      ...periodRun('2024-01-01', 4),
      day('2024-01-05', true, 'spotting'),
    ];
    const cycles = detectCycles(records);
    expect(cycles).toHaveLength(1);
    expect(cycles[0].periodLengthDays).toBe(5);
  });

  it('period length: 5 consecutive onPeriod=true days → periodLengthDays = 5', () => {
    const records = periodRun('2024-01-01', 5);
    const cycles = detectCycles(records);
    expect(cycles[0].periodLengthDays).toBe(5);
  });

  it('period length: 5 onPeriod days, then 4-day gap, then another → periodLengthDays = 5', () => {
    // Days 1–5: onPeriod, days 6–9: absent, day 10: onPeriod — 3+ gap stops count at 5
    const records = [
      ...periodRun('2024-01-01', 5),
      day('2024-01-10', true),
    ];
    const cycles = detectCycles(records);
    // day 10 is within 10-day lookback of day 5, so still 1 cycle
    expect(cycles).toHaveLength(1);
    expect(cycles[0].periodLengthDays).toBe(5);
  });

  it('period length: onPeriod day, 1-day gap, onPeriod day → both counted (gap < 3)', () => {
    // Day 1: P, Day 2: absent, Day 3: P — gap of 1 does not stop counting
    const records = [
      day('2024-01-01', true),
      day('2024-01-03', true),
    ];
    const cycles = detectCycles(records);
    expect(cycles[0].periodLengthDays).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// computeCycleStats / getConfidenceLevel
// ---------------------------------------------------------------------------

describe('computeCycleStats + getConfidenceLevel', () => {
  it('0 cycles → confidence none, medians null', () => {
    const stats = computeCycleStats([]);
    expect(getConfidenceLevel(stats)).toBe('none');
    expect(stats.medianCycleLength).toBeNull();
    expect(stats.medianPeriodLength).toBeNull();
  });

  it('1 ongoing cycle only → confidence none (no completed cycles)', () => {
    const cycles = [makeOngoingCycle('2024-01-01', 14)];
    const stats = computeCycleStats(cycles);
    expect(getConfidenceLevel(stats)).toBe('none');
  });

  it('2 completed cycles → confidence low', () => {
    const cycles = [
      makeCycle('2024-01-01', 28),
      makeCycle('2024-01-29', 28),
      makeOngoingCycle('2024-02-26', 10),
    ];
    const stats = computeCycleStats(cycles);
    expect(getConfidenceLevel(stats)).toBe('low');
  });

  it('3 completed cycles → confidence low', () => {
    const cycles = [
      makeCycle('2024-01-01', 28),
      makeCycle('2024-01-29', 28),
      makeCycle('2024-02-26', 28),
      makeOngoingCycle('2024-03-25', 10),
    ];
    const stats = computeCycleStats(cycles);
    expect(getConfidenceLevel(stats)).toBe('low');
  });

  it('4 cycles all 28 days → stdDev 0, confidence normal', () => {
    const cycles = [
      makeCycle('2024-01-01', 28),
      makeCycle('2024-01-29', 28),
      makeCycle('2024-02-26', 28),
      makeCycle('2024-03-25', 28),
      makeOngoingCycle('2024-04-22', 10),
    ];
    const stats = computeCycleStats(cycles);
    expect(stats.cycleLengthStdDev).toBe(0);
    expect(getConfidenceLevel(stats)).toBe('normal');
  });

  it('4 cycles with one 40-day outlier → stdDev > 4, confidence approximate', () => {
    // lengths: 28, 28, 28, 40 → stdDev ≈ 5.196
    const cycles = [
      makeCycle('2024-01-01', 28),
      makeCycle('2024-01-29', 28),
      makeCycle('2024-02-26', 28),
      makeCycle('2024-03-25', 40),
      makeOngoingCycle('2024-05-04', 10),
    ];
    const stats = computeCycleStats(cycles);
    expect(stats.cycleLengthStdDev).toBeGreaterThan(4);
    expect(getConfidenceLevel(stats)).toBe('approximate');
  });

  it('12 completed cycles → uses all 12', () => {
    const cycles: Cycle[] = [];
    let start = '2024-01-01';
    for (let i = 0; i < 12; i++) {
      cycles.push(makeCycle(start, 28));
      start = format(addDays(parseISO(start), 28), 'yyyy-MM-dd');
    }
    cycles.push(makeOngoingCycle(start, 10));

    const stats = computeCycleStats(cycles);
    expect(stats.usableCycles).toHaveLength(12);
  });

  it('15 completed cycles → uses most recent 12', () => {
    const cycles: Cycle[] = [];
    let start = '2024-01-01';
    for (let i = 0; i < 15; i++) {
      cycles.push(makeCycle(start, 21));
      start = format(addDays(parseISO(start), 21), 'yyyy-MM-dd');
    }
    cycles.push(makeOngoingCycle(start, 10));

    const stats = computeCycleStats(cycles);
    expect(stats.usableCycles).toHaveLength(12);
    // The 12 most recent should be cycles[3]..cycles[14]
    expect(stats.usableCycles[0].startDate).toBe(cycles[3].startDate);
    expect(stats.usableCycles[11].startDate).toBe(cycles[14].startDate);
  });

  it('cycle with length outside [15, 90] is dropped from usable set', () => {
    const cycles = [
      makeCycle('2024-01-01', 28),
      makeCycle('2024-01-29', 100), // outside [15, 90] → dropped
      makeCycle('2024-05-08', 28),
      makeOngoingCycle('2024-06-05', 10),
    ];
    const stats = computeCycleStats(cycles);
    expect(stats.usableCycles).toHaveLength(2);
    expect(stats.usableCycles.every(c => c.lengthDays !== 100)).toBe(true);
  });

  it('cycle older than 365 days from most recent record is dropped', () => {
    // Most recent date = 2024-12-31. Cutoff = 2023-12-31 (365 days back from 2024-12-31).
    // Cycle starting 2023-12-30 is > 365 days before 2024-12-31 → dropped.
    const mostRecentDate = '2024-12-31';
    const cycles = [
      makeCycle('2023-12-30', 28),   // >365 days before mostRecent → dropped
      makeCycle('2024-02-01', 28),   // within 365 days → kept
      makeCycle('2024-03-01', 28),   // within 365 days → kept
      makeOngoingCycle(mostRecentDate, 1),
    ];
    const stats = computeCycleStats(cycles);
    expect(stats.usableCycles).toHaveLength(2);
    expect(stats.usableCycles.some(c => c.startDate === '2023-12-30')).toBe(false);
  });

  it('median of even-count cycles averages the two middle values', () => {
    // Lengths [26, 28, 30, 32] → sorted [26, 28, 30, 32] → median = (28+30)/2 = 29
    const cycles = [
      makeCycle('2024-01-01', 26),
      makeCycle('2024-01-27', 28),
      makeCycle('2024-02-24', 30),
      makeCycle('2024-03-25', 32),
      makeOngoingCycle('2024-04-26', 10),
    ];
    const stats = computeCycleStats(cycles);
    expect(stats.medianCycleLength).toBe(29);
  });
});

// ---------------------------------------------------------------------------
// predictNextPeriod
// ---------------------------------------------------------------------------

describe('predictNextPeriod', () => {
  it('no records → all null, confidence none', () => {
    const p = predictNextPeriod([]);
    expect(p.confidence).toBe('none');
    expect(p.nextPeriodStart).toBeNull();
    expect(p.predictedPeriodLength).toBeNull();
  });

  it('1 cycle only → all null, confidence none', () => {
    const p = predictNextPeriod(periodRun('2024-01-01', 5));
    expect(p.confidence).toBe('none');
    expect(p.nextPeriodStart).toBeNull();
  });

  it('4 regular 28-day cycles → nextPeriodStart = lastStart + 28, confidence normal', () => {
    // 5 cycle starts × 28-day spacing → 4 completed cycles + 1 ongoing = 'normal'
    // Starts: Jan 1, Jan 29, Feb 26, Mar 25, Apr 22 (ongoing). Predicted next = Apr 22 + 28 = May 20.
    const records = buildPeriods('2024-01-01', 5, 28, 5);
    const p = predictNextPeriod(records);
    expect(p.confidence).toBe('normal');
    expect(p.nextPeriodStart).toBe('2024-05-20');
    expect(p.predictedPeriodLength).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// deriveCycleStatus
// ---------------------------------------------------------------------------

describe('deriveCycleStatus', () => {
  it('no cycles → no-data, everything null', () => {
    const s = deriveCycleStatus([], '2024-06-01');
    expect(s.state).toBe('no-data');
    expect(s.cycleDay).toBeNull();
    expect(s.daysUntilNextPeriod).toBeNull();
    expect(s.periodDay).toBeNull();
  });

  it('today on an onPeriod=true day → state on-period, periodDay set correctly', () => {
    // 5 starts → 4 completed + 1 ongoing (Apr 22). Today = 3rd period day of cycle 5 (Apr 24).
    const records = buildPeriods('2024-01-01', 5, 28, 5);
    const today = '2024-04-24'; // 3rd day of ongoing cycle starting Apr 22
    const s = deriveCycleStatus(records, today);
    expect(s.state).toBe('on-period');
    expect(s.periodDay).toBe(3);
    expect(s.confidence).toBe('normal');
  });

  it('today before predicted start → pre-period, daysUntilNextPeriod positive', () => {
    // 5 starts → ongoing cycle starts Apr 22. Predicted next = Apr 22 + 28 = May 20.
    const records = buildPeriods('2024-01-01', 5, 28, 5);
    const today = '2024-05-10'; // 10 days before May 20
    const s = deriveCycleStatus(records, today);
    expect(s.state).toBe('pre-period');
    expect(s.daysUntilNextPeriod).toBe(10);
  });

  it('today on predicted start, not onPeriod → late, daysUntilNextPeriod 0', () => {
    const records = buildPeriods('2024-01-01', 5, 28, 5);
    const today = '2024-05-20'; // exactly predicted start (Apr 22 + 28), no period logged
    const s = deriveCycleStatus(records, today);
    expect(s.state).toBe('late');
    expect(s.daysUntilNextPeriod).toBe(0);
  });

  it('today after predicted start, not onPeriod → late, daysUntilNextPeriod negative', () => {
    const records = buildPeriods('2024-01-01', 5, 28, 5);
    const today = '2024-05-23'; // 3 days past May 20
    const s = deriveCycleStatus(records, today);
    expect(s.state).toBe('late');
    expect(s.daysUntilNextPeriod).toBe(-3);
  });
});
