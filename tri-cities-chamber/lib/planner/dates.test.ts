import { describe, expect, it } from 'vitest';
import {
  describeRelativeDay,
  formatShortDate,
  fromISODate,
  getMonthGrid,
  isWithinISORange,
  shiftISODate,
  toISODate,
} from '@/lib/planner/dates';

// Tests for the date helpers: they are pure functions, so they are the easiest place to start.
describe('dates', () => {
  it('shifts a date forward and back, across a month end', () => {
    expect(shiftISODate('2025-03-31', 1)).toBe('2025-04-01');
    expect(shiftISODate('2025-03-01', -1)).toBe('2025-02-28');
  });

  it('formats a short date', () => {
    expect(formatShortDate('2025-03-07')).toBe('Mar 7');
  });

  it('describes today, tomorrow and yesterday in words', () => {
    expect(describeRelativeDay('2025-03-07', '2025-03-07')).toBe('Today');
    expect(describeRelativeDay('2025-03-08', '2025-03-07')).toBe('Tomorrow');
    expect(describeRelativeDay('2025-03-06', '2025-03-07')).toBe('Yesterday');
    expect(describeRelativeDay('2025-03-14', '2025-03-07')).toBe('Fri, Mar 14');
  });

  it('checks a date is inside a range, including both ends', () => {
    expect(isWithinISORange('2025-03-07', '2025-03-07', '2025-03-09')).toBe(true);
    expect(isWithinISORange('2025-03-09', '2025-03-07', '2025-03-09')).toBe(true);
    expect(isWithinISORange('2025-03-10', '2025-03-07', '2025-03-09')).toBe(false);
  });
});

describe('year boundaries and local dates', () => {
  it('toISODate and fromISODate round-trip without drifting a day', () => {
    for (const value of ['2024-12-31', '2025-01-01', '2024-02-29', '2025-03-09']) {
      expect(toISODate(fromISODate(value))).toBe(value);
    }
  });

  it('shiftISODate crosses a year end in both directions', () => {
    expect(shiftISODate('2024-12-31', 1)).toBe('2025-01-01');
    expect(shiftISODate('2025-01-01', -1)).toBe('2024-12-31');
  });

  it('getMonthGrid fills whole Sunday-to-Saturday weeks and spans the year end for December', () => {
    const grid = getMonthGrid(fromISODate('2024-12-15')).map(toISODate);
    expect(grid.length % 7).toBe(0);
    expect(grid[0]).toBe('2024-12-01');
    expect(grid[grid.length - 1]).toBe('2025-01-04');
  });

  it('getMonthGrid for February in a leap year includes the 29th', () => {
    expect(getMonthGrid(fromISODate('2024-02-10')).map(toISODate)).toContain('2024-02-29');
  });
});
