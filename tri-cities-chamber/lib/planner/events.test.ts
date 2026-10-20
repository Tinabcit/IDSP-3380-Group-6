import { describe, expect, it } from 'vitest';
import { buildMockEvents } from './mock-data';
import {
  EVENT_CATEGORIES,
  categoryLabel,
  categoryOf,
  compareEvents,
  formatEventTime,
  isValidISODate,
  isValidTime,
  validateEventInput,
} from './events';
import type { ChamberEvent } from './types';

/** A minimal event to build test cases from. */
const base: ChamberEvent = {
  id: 'e',
  name: 'Event',
  startDate: '2025-03-01',
  endDate: '2025-03-01',
  pillarId: 'p',
  isSignature: false,
};

describe('isValidTime', () => {
  it('accepts 24-hour HH:mm and rejects anything else', () => {
    expect(isValidTime('00:00')).toBe(true);
    expect(isValidTime('23:59')).toBe(true);
    expect(isValidTime('24:00')).toBe(false);
    expect(isValidTime('9:30')).toBe(false);
    expect(isValidTime('12:60')).toBe(false);
    expect(isValidTime('')).toBe(false);
  });
});

describe('isValidISODate', () => {
  it('accepts real dates including leap days and rejects impossible ones', () => {
    expect(isValidISODate('2024-02-29')).toBe(true);
    expect(isValidISODate('2025-02-29')).toBe(false);
    expect(isValidISODate('2025-99-99')).toBe(false);
    expect(isValidISODate('2025-3-1')).toBe(false);
    expect(isValidISODate('nonsense')).toBe(false);
  });
});

describe('formatEventTime', () => {
  it('says "All day" with no start time', () => {
    expect(formatEventTime(base)).toBe('All day');
  });
  it('shows a start time, and a range when there is an end time', () => {
    expect(formatEventTime({ ...base, startTime: '09:05' })).toBe('9:05 AM');
    expect(formatEventTime({ ...base, startTime: '13:00', endTime: '15:30' })).toBe('1:00 PM - 3:30 PM');
    expect(formatEventTime({ ...base, startTime: '00:00' })).toBe('12:00 AM');
    expect(formatEventTime({ ...base, startTime: '12:00' })).toBe('12:00 PM');
  });
  it('ignores an end time when there is no start time', () => {
    expect(formatEventTime({ ...base, endTime: '15:30' })).toBe('All day');
  });
});

describe('compareEvents', () => {
  it('puts all-day events first, then orders by start time, then name', () => {
    const allDay = { ...base, id: 'a', name: 'B all day' };
    const early = { ...base, id: 'b', name: 'Early', startTime: '08:00' };
    const lateA = { ...base, id: 'c', name: 'A late', startTime: '17:00' };
    const lateB = { ...base, id: 'd', name: 'B late', startTime: '17:00' };
    const sorted = [lateB, early, lateA, allDay].sort(compareEvents).map((e) => e.id);
    expect(sorted).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('categoryOf', () => {
  it('falls back to "other" for events saved without a category', () => {
    expect(categoryOf(base)).toBe('other');
    expect(categoryOf({ ...base, category: 'workshop' })).toBe('workshop');
  });
});

describe('validateEventInput', () => {
  it('returns null for a good event', () => {
    expect(validateEventInput({ ...base, startTime: '09:00', endTime: '10:00' })).toBeNull();
  });
  it('needs a name', () => {
    expect(validateEventInput({ ...base, name: '  ' })).toMatch(/name/i);
  });
  it('rejects an end date before the start date, including across a year end', () => {
    expect(validateEventInput({ ...base, startDate: '2025-01-02', endDate: '2025-01-01' })).toMatch(/end date/i);
    expect(validateEventInput({ ...base, startDate: '2024-12-31', endDate: '2025-01-01' })).toBeNull();
  });
  it('rejects bad times and an end time before the start on a one-day event', () => {
    expect(validateEventInput({ ...base, startTime: '25:00' })).toMatch(/time/i);
    expect(validateEventInput({ ...base, startTime: '10:00', endTime: '09:00' })).toMatch(/end time/i);
    expect(validateEventInput({ ...base, startDate: '2025-03-01', endDate: '2025-03-02', startTime: '10:00', endTime: '09:00' })).toBeNull();
  });
});

describe('validateEventInput: remaining branches', () => {
  it('names which field is wrong', () => {
    expect(validateEventInput({ ...base, startDate: '2025-02-30' })).toBe('Pick a valid start date.');
    expect(validateEventInput({ ...base, endDate: 'nope' })).toBe('Pick a valid end date.');
    expect(validateEventInput({ ...base, startTime: '09:00', endTime: '9' })).toBe('Enter a valid end time.');
    expect(validateEventInput({ ...base, startTime: '25:00' })).toBe('Enter a valid start time.');
  });
  it('allows an end time equal to the start time', () => {
    expect(validateEventInput({ ...base, startTime: '10:00', endTime: '10:00' })).toBeNull();
  });
});

describe('categories', () => {
  it('has a label for every category and falls back to Other', () => {
    for (const c of EVENT_CATEGORIES) expect(categoryLabel(c.value)).toBe(c.label);
    expect(categoryLabel('nope' as never)).toBe('Other');
    expect(EVENT_CATEGORIES.map((c) => c.value)).toContain('other');
  });
});

describe('demo events', () => {
  it('are all valid event inputs', () => {
    for (const event of buildMockEvents('2025-03-10')) {
      expect(validateEventInput(event), event.name).toBeNull();
    }
  });
});
