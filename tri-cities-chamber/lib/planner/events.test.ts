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
  cleanSponsors,
  compTicketStats,
  extrasFromEvent,
  extrasToInput,
  initialsOf,
  toggleItem,
  validateEventForm,
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

  it('accepts a whole-number attendee count and rejects negative or fractional ones', () => {
    expect(validateEventInput({ ...base, attendees: 0 })).toBeNull();
    expect(validateEventInput({ ...base, attendees: 25 })).toBeNull();
    expect(validateEventInput({ ...base, attendees: -1 })).toMatch(/attendees/i);
    expect(validateEventInput({ ...base, attendees: 2.5 })).toMatch(/attendees/i);
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

describe('validateEventForm', () => {
  const full = {
    title: 'Mayors BBQ',
    sponsors: ['RBC'],
    date: '2025-03-01',
    isSignature: false,
    category: '',
    address: '123 Main st',
  };

  it('returns no errors when every needed field is valid', () => {
    expect(validateEventForm(full)).toEqual({});
  });

  it('does not ask for a category on a normal event', () => {
    expect(validateEventForm({ ...full, category: '' }).category).toBeUndefined();
  });

  it('asks for a category on a signature event', () => {
    expect(validateEventForm({ ...full, isSignature: true }).category).toBe('Field Required');
    expect(validateEventForm({ ...full, isSignature: true, category: 'networking' })).toEqual({});
  });

  it('accepts as many sponsors as are added, and needs at least one', () => {
    expect(validateEventForm({ ...full, sponsors: ['RBC', 'BCIT', 'Telus'] })).toEqual({});
    expect(validateEventForm({ ...full, sponsors: [' ', ''] }).sponsors).toBe('Field Required');
    expect(validateEventForm({ ...full, sponsors: [] }).sponsors).toBe('Field Required');
  });

  it('marks every empty field as required', () => {
    const errors = validateEventForm({
      title: '', sponsors: [''], date: '', isSignature: false, category: '', address: '',
    });
    expect(Object.keys(errors).sort()).toEqual(['address', 'date', 'sponsors', 'title']);
    expect(errors.title).toBe('Field Required');
  });

  it('rejects a bad date', () => {
    const errors = validateEventForm({ ...full, date: '2025-99-99' });
    expect(errors.date).toBeDefined();
    expect(errors.title).toBeUndefined();
  });
});

describe('cleanSponsors', () => {
  it('trims names, drops blanks and repeats', () => {
    expect(cleanSponsors([' RBC ', '', 'rbc', 'BCIT'])).toEqual(['RBC', 'BCIT']);
  });
});

describe('toggleItem', () => {
  it('adds a missing item and removes a present one', () => {
    expect(toggleItem(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleItem(['a', 'b'], 'a')).toEqual(['b']);
  });
});

describe('initialsOf', () => {
  it('uses the first letters of the first two words', () => {
    expect(initialsOf('Alice Ross')).toBe('AR');
    expect(initialsOf('Marcus')).toBe('M');
    expect(initialsOf('  ')).toBe('');
  });
});

describe('event extras', () => {
  it('starts empty for a new event', () => {
    const extras = extrasFromEvent(undefined);
    expect(extras.labels).toEqual([]);
    expect(extras.priority).toBeNull();
    expect(extras.deadline).toBe('');
  });

  it('round-trips through an event, leaving blanks out of the input', () => {
    const empty = extrasToInput(extrasFromEvent(undefined));
    expect(empty.description).toBeUndefined();
    expect(empty.labels).toBeUndefined();
    expect(empty.priority).toBeUndefined();
    const extras = {
      ...extrasFromEvent(undefined),
      description: '  Big night ',
      deadline: '2025-02-20',
      priority: 2 as const,
      labels: ['Design'],
      guests: ['Alice Ross'],
    };
    const input = extrasToInput(extras);
    expect(input).toMatchObject({ description: 'Big night', deadline: '2025-02-20', priority: 2 });
    const back = extrasFromEvent({ ...base, ...input });
    expect(back.labels).toEqual(['Design']);
    expect(back.guests).toEqual(['Alice Ross']);
  });
});

describe('validateEventInput for the extra fields', () => {
  it('rejects a bad deadline, priority or comp ticket quantity', () => {
    expect(validateEventInput({ ...base, deadline: '2025-13-40' })).toMatch(/deadline/i);
    expect(validateEventInput({ ...base, priority: 9 as never })).toMatch(/priority/i);
    expect(
      validateEventInput({
        ...base,
        compTickets: [{ id: 'c', recipient: 'A', ticketType: 'VIP Access', quantity: 0, status: 'Issued' }],
      }),
    ).toMatch(/ticket/i);
  });

  it('accepts valid extras', () => {
    expect(
      validateEventInput({ ...base, deadline: '2025-02-20', priority: 3, labels: ['Urgent'] }),
    ).toBeNull();
  });
});

describe('compTicketStats', () => {
  it('counts recipients, issued tickets and tickets per type', () => {
    const stats = compTicketStats([
      { id: '1', recipient: 'Alice Ross', ticketType: 'General Admission', quantity: 2, status: 'Issued' },
      { id: '2', recipient: 'Marcus Reed', ticketType: 'VIP Access', quantity: 1, status: 'Issued' },
      { id: '3', recipient: 'Marcus Reed', ticketType: 'VIP Access', quantity: 1, status: 'Draft' },
    ]);
    expect(stats.recipients).toBe(2);
    expect(stats.issued).toBe(3);
    expect(stats.byType['General Admission']).toBe(2);
    expect(stats.byType['VIP Access']).toBe(1);
  });
});
