import { describe, expect, it } from 'vitest';
import {
  describeRelativeDay,
  formatShortDate,
  isWithinISORange,
  shiftISODate,
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
