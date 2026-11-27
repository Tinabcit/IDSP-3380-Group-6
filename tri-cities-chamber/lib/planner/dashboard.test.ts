import { describe, expect, it } from 'vitest';
import { getTasksPerDay, getUploadedDocuments, getUpcomingTasks, formatTrackerValue } from '@/lib/planner/dashboard';
import type { Contract, Task } from '@/lib/planner/types';

/** Builds a task with sensible defaults so each test only sets what it cares about. */
function task(over: Partial<Task>): Task {
  return {
    id: 't1',
    title: 'Task',
    dueDate: '2025-03-10',
    completed: false,
    assigneeId: 's1',
    createdAt: '2025-03-01T00:00:00.000Z',
    ...over,
  };
}

// Tests for the dashboard helpers: pure functions, so no browser is needed.
describe('getTasksPerDay', () => {
  it('returns 10 days by default, starting on the given date', () => {
    const days = getTasksPerDay([], '2025-03-10');
    expect(days).toHaveLength(10);
    expect(days[0].date).toBe('2025-03-10');
    expect(days[9].date).toBe('2025-03-19');
  });

  it('gives a count of 0 for days with no tasks', () => {
    const days = getTasksPerDay([], '2025-03-10');
    expect(days.every((d) => d.count === 0)).toBe(true);
  });

  it('counts several tasks due on the same day', () => {
    const tasks = [
      task({ id: 'a', dueDate: '2025-03-11' }),
      task({ id: 'b', dueDate: '2025-03-11' }),
      task({ id: 'c', dueDate: '2025-03-12' }),
    ];
    const days = getTasksPerDay(tasks, '2025-03-10');
    expect(days[1].count).toBe(2);
    expect(days[2].count).toBe(1);
    expect(days[0].count).toBe(0);
  });

  it('ignores tasks outside the range', () => {
    const tasks = [task({ dueDate: '2025-03-09' }), task({ dueDate: '2025-03-20' })];
    const days = getTasksPerDay(tasks, '2025-03-10');
    expect(days.every((d) => d.count === 0)).toBe(true);
  });
});

/** Builds a contract with sensible defaults so each test only sets what it cares about. */
function contract(over: Partial<Contract>): Contract {
  return {
    id: 'c1',
    title: 'Contract',
    sponsorId: 's1',
    amount: 1000,
    status: 'active',
    payments: [],
    deliverables: [],
    createdAt: '2025-03-01T10:00:00.000Z',
    ...over,
  };
}

describe('getUploadedDocuments', () => {
  it('only includes contracts that have an uploaded file', () => {
    const docs = getUploadedDocuments([
      contract({ id: 'a', fileName: 'A.pdf' }),
      contract({ id: 'b' }),
    ]);
    expect(docs.map((d) => d.id)).toEqual(['a']);
  });

  it('gives the file name, upper-case type and the date it was added', () => {
    const [doc] = getUploadedDocuments([
      contract({ id: 'a', fileName: 'Mayor-BBQ.pdf', createdAt: '2025-03-05T08:30:00.000Z' }),
    ]);
    expect(doc).toEqual({ id: 'a', fileName: 'Mayor-BBQ.pdf', type: 'PDF', addedOn: '2025-03-05' });
  });

  it('lists the newest first', () => {
    const docs = getUploadedDocuments([
      contract({ id: 'old', fileName: 'old.pdf', createdAt: '2025-01-01T00:00:00.000Z' }),
      contract({ id: 'new', fileName: 'new.pdf', createdAt: '2025-06-01T00:00:00.000Z' }),
    ]);
    expect(docs.map((d) => d.id)).toEqual(['new', 'old']);
  });

  it('shows FILE when the name has no extension', () => {
    const [doc] = getUploadedDocuments([contract({ fileName: 'scan' })]);
    expect(doc.type).toBe('FILE');
  });
});

describe('getUpcomingTasks', () => {
  const tasks = [
    task({ id: 'past', dueDate: '2025-03-09' }),
    task({ id: 'done', dueDate: '2025-03-11', completed: true }),
    task({ id: 'late', dueDate: '2025-03-15', eventId: 'e1', sponsorId: 's1' }),
    task({ id: 'soon', dueDate: '2025-03-10', eventId: 'e2', sponsorId: 's2' }),
    task({ id: 'edge', dueDate: '2025-03-17' }),
    task({ id: 'far', dueDate: '2025-03-18' }),
  ];

  it('keeps every open task due today or later, however far away, earliest first', () => {
    const ids = getUpcomingTasks(tasks, '2025-03-10').map((t) => t.id);
    expect(ids).toEqual(['soon', 'late', 'edge', 'far']);
  });

  it('filters by event', () => {
    const ids = getUpcomingTasks(tasks, '2025-03-10', 'e1').map((t) => t.id);
    expect(ids).toEqual(['late']);
  });

  it('filters by sponsor', () => {
    const ids = getUpcomingTasks(tasks, '2025-03-10', 'all', 's2').map((t) => t.id);
    expect(ids).toEqual(['soon']);
  });
});

describe('formatTrackerValue', () => {
  it('formats numbers with thousands separators and keeps zero', () => {
    expect(formatTrackerValue(1234, '-')).toBe('1,234');
    expect(formatTrackerValue(0, '-')).toBe('0');
  });

  it('trims text and uses the fallback when it is blank', () => {
    expect(formatTrackerValue('  9 open  ', '-')).toBe('9 open');
    expect(formatTrackerValue('   ', '-')).toBe('-');
  });

  it('uses the fallback for missing or non-finite values', () => {
    expect(formatTrackerValue(null, 'n/a')).toBe('n/a');
    expect(formatTrackerValue(undefined, 'n/a')).toBe('n/a');
    expect(formatTrackerValue(NaN, 'n/a')).toBe('n/a');
    expect(formatTrackerValue(Infinity, 'n/a')).toBe('n/a');
  });
});
