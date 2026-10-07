import { describe, expect, it } from 'vitest';
import {
  eventsOnDate,
  filterEvents,
  filterTasks,
  getTaskStatus,
  hasActiveFilters,
  sortTasks,
  summarizeByDate,
  upcomingTasks,
} from '@/lib/planner/selectors';
import { EMPTY_FILTERS } from '@/lib/planner/types';
import type { ChamberEvent, Task } from '@/lib/planner/types';

const TODAY = '2025-03-10';

/** Builds a task with sensible defaults so each test only sets what it cares about. */
function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
    title: 'Task',
    dueDate: TODAY,
    completed: false,
    assigneeId: 's1',
    createdAt: '2025-03-01T00:00:00.000Z',
    ...overrides,
  };
}

/** Builds an event with sensible defaults. */
function makeEvent(overrides: Partial<ChamberEvent> = {}): ChamberEvent {
  return {
    id: 'e1',
    name: 'Gala',
    startDate: TODAY,
    endDate: TODAY,
    pillarId: 'p1',
    isSignature: false,
    ...overrides,
  };
}

describe('getTaskStatus', () => {
  it('is completed when ticked, even if past due', () => {
    expect(getTaskStatus(makeTask({ completed: true, dueDate: '2025-03-01' }), TODAY)).toBe('completed');
  });

  it('is overdue only when the due date is before today', () => {
    expect(getTaskStatus(makeTask({ dueDate: '2025-03-09' }), TODAY)).toBe('overdue');
    expect(getTaskStatus(makeTask({ dueDate: TODAY }), TODAY)).toBe('pending');
  });
});

describe('hasActiveFilters', () => {
  it('is false for empty filters and true when any one is on', () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, signatureOnly: true })).toBe(true);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, pillarId: 'p1' })).toBe(true);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, sponsorId: 'sp1' })).toBe(true);
  });
});

describe('filterEvents', () => {
  const events = [
    makeEvent({ id: 'e1', isSignature: true, pillarId: 'p1' }),
    makeEvent({ id: 'e2', isSignature: false, pillarId: 'p2' }),
  ];

  it('returns everything with no filters', () => {
    expect(filterEvents(events, EMPTY_FILTERS, [])).toHaveLength(2);
  });

  it('filters by signature and by pillar', () => {
    expect(filterEvents(events, { ...EMPTY_FILTERS, signatureOnly: true }, []).map((e) => e.id)).toEqual(['e1']);
    expect(filterEvents(events, { ...EMPTY_FILTERS, pillarId: 'p2' }, []).map((e) => e.id)).toEqual(['e2']);
  });

  it('filters by sponsor only when a task links that sponsor to the event', () => {
    const tasks = [makeTask({ eventId: 'e2', sponsorId: 'sp1' })];
    expect(filterEvents(events, { ...EMPTY_FILTERS, sponsorId: 'sp1' }, tasks).map((e) => e.id)).toEqual(['e2']);
  });
});

describe('filterTasks', () => {
  const eventsById = new Map([
    ['e1', makeEvent({ id: 'e1', isSignature: true, pillarId: 'p1' })],
    ['e2', makeEvent({ id: 'e2', isSignature: false, pillarId: 'p2' })],
  ]);
  const tasks = [
    makeTask({ id: 'a', eventId: 'e1', sponsorId: 'sp1' }),
    makeTask({ id: 'b', eventId: 'e2' }),
    makeTask({ id: 'c' }),
  ];

  it('keeps tasks without an event when no event filter is on', () => {
    expect(filterTasks(tasks, EMPTY_FILTERS, eventsById)).toHaveLength(3);
  });

  it('hides tasks without an event when the signature or pillar filter is on', () => {
    expect(filterTasks(tasks, { ...EMPTY_FILTERS, signatureOnly: true }, eventsById).map((t) => t.id)).toEqual(['a']);
    expect(filterTasks(tasks, { ...EMPTY_FILTERS, pillarId: 'p2' }, eventsById).map((t) => t.id)).toEqual(['b']);
  });

  it('filters by sponsor', () => {
    expect(filterTasks(tasks, { ...EMPTY_FILTERS, sponsorId: 'sp1' }, eventsById).map((t) => t.id)).toEqual(['a']);
  });
});

describe('eventsOnDate', () => {
  it('includes a multi-day event on every day of its range', () => {
    const events = [makeEvent({ startDate: '2025-03-10', endDate: '2025-03-12' })];
    expect(eventsOnDate(events, '2025-03-10')).toHaveLength(1);
    expect(eventsOnDate(events, '2025-03-11')).toHaveLength(1);
    expect(eventsOnDate(events, '2025-03-12')).toHaveLength(1);
    expect(eventsOnDate(events, '2025-03-13')).toHaveLength(0);
  });
});

describe('sortTasks', () => {
  it('orders overdue, then pending, then completed, then by due date and title', () => {
    const tasks = [
      makeTask({ id: 'done', completed: true, dueDate: '2025-03-01' }),
      makeTask({ id: 'pendingLate', dueDate: '2025-03-20' }),
      makeTask({ id: 'pendingB', dueDate: '2025-03-12', title: 'B' }),
      makeTask({ id: 'pendingA', dueDate: '2025-03-12', title: 'A' }),
      makeTask({ id: 'overdue', dueDate: '2025-03-05' }),
    ];
    expect(sortTasks(tasks, TODAY).map((t) => t.id)).toEqual([
      'overdue',
      'pendingA',
      'pendingB',
      'pendingLate',
      'done',
    ]);
  });

  it('does not change the original list', () => {
    const tasks = [makeTask({ id: 'b', dueDate: '2025-03-20' }), makeTask({ id: 'a', dueDate: '2025-03-11' })];
    sortTasks(tasks, TODAY);
    expect(tasks.map((t) => t.id)).toEqual(['b', 'a']);
  });
});

describe('upcomingTasks', () => {
  it('keeps overdue and next-7-days tasks, and drops completed and far-off ones', () => {
    const tasks = [
      makeTask({ id: 'overdue', dueDate: '2025-03-01' }),
      makeTask({ id: 'edge', dueDate: '2025-03-17' }),
      makeTask({ id: 'far', dueDate: '2025-03-18' }),
      makeTask({ id: 'done', dueDate: TODAY, completed: true }),
    ];
    expect(upcomingTasks(tasks, TODAY).map((t) => t.id)).toEqual(['overdue', 'edge']);
  });
});

describe('summarizeByDate', () => {
  it('counts overdue, pending and completed tasks per day and ignores days off screen', () => {
    const tasks = [
      makeTask({ id: '1', dueDate: '2025-03-09' }),
      makeTask({ id: '2', dueDate: TODAY }),
      makeTask({ id: '3', dueDate: TODAY, completed: true }),
      makeTask({ id: '4', dueDate: '2025-04-01' }),
    ];
    const map = summarizeByDate([makeEvent()], tasks, ['2025-03-09', TODAY], TODAY);
    expect(map.get('2025-03-09')).toMatchObject({ overdue: 1, pending: 0, completed: 0 });
    expect(map.get(TODAY)).toMatchObject({ overdue: 0, pending: 1, completed: 1 });
    expect(map.get(TODAY)?.events).toHaveLength(1);
    expect(map.has('2025-04-01')).toBe(false);
  });
});
