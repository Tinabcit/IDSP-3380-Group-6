import { describe, expect, it } from 'vitest';
import { suggestTasks, toTaskInput } from './proposed-tasks';

const base = {
  fileName: 'mayors-bbq-sponsorship.pdf',
  eventName: "Mayor's BBQ",
  sponsorName: 'RBC',
  eventDate: '2026-06-20',
};

describe('suggestTasks', () => {
  it('gives every suggestion the event name and sponsor', () => {
    const tasks = suggestTasks(base);
    expect(tasks.length).toBeGreaterThan(0);
    for (const t of tasks) {
      expect(t.eventName).toBe("Mayor's BBQ");
      expect(t.sponsorName).toBe('RBC');
    }
  });

  it('puts every due date on or before the event date, earliest first', () => {
    const dates = suggestTasks(base).map((t) => t.dueDate);
    expect(dates.every((d) => d <= base.eventDate)).toBe(true);
    expect([...dates].sort()).toEqual(dates);
  });

  it('gives each suggestion a unique id, a title and a description', () => {
    const tasks = suggestTasks(base);
    expect(new Set(tasks.map((t) => t.id)).size).toBe(tasks.length);
    for (const t of tasks) {
      expect(t.title).not.toBe('');
      expect(t.description).not.toBe('');
    }
  });

  it('leaves the sponsor out of the wording when there is none', () => {
    const tasks = suggestTasks({ ...base, sponsorName: '' });
    expect(tasks.every((t) => t.sponsorName === '')).toBe(true);
    expect(tasks.some((t) => t.description.includes('undefined'))).toBe(false);
  });

  it('is the same every time for the same file', () => {
    expect(suggestTasks(base)).toEqual(suggestTasks(base));
  });
});

describe('toTaskInput', () => {
  it('turns a suggestion into a task for the store', () => {
    const [first] = suggestTasks(base);
    const input = toTaskInput(first, { assigneeId: 'u1', eventId: 'e1', sponsorId: 's1' });
    expect(input).toEqual({
      title: first.title,
      dueDate: first.dueDate,
      assigneeId: 'u1',
      eventId: 'e1',
      sponsorId: 's1',
      notes: first.description,
    });
  });
});
