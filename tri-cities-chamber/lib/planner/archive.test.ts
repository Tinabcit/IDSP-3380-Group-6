import { describe, expect, it } from 'vitest';
import { countPeople, getCompletedTasks } from '@/lib/planner/archive';
import type { ChamberEvent, Sponsor, Task } from '@/lib/planner/types';

/** Builds a task with sensible defaults so each test only sets what it cares about. */
function task(over: Partial<Task>): Task {
  return {
    id: 't1',
    title: 'Task',
    dueDate: '2025-03-10',
    completed: true,
    assigneeId: 's1',
    createdAt: '2025-03-01T00:00:00.000Z',
    ...over,
  };
}

/** Builds an event with sensible defaults. */
function event(over: Partial<ChamberEvent>): ChamberEvent {
  return {
    id: 'e1',
    name: 'Event',
    startDate: '2025-03-01',
    endDate: '2025-03-01',
    pillarId: 'p1',
    isSignature: false,
    ...over,
  };
}

// Tests for the archive page helpers: pure functions, so no browser is needed.
describe('getCompletedTasks', () => {
  const eventsById = new Map<string, ChamberEvent>([['e1', event({ id: 'e1', name: 'Gala' })]]);
  const sponsorsById = new Map<string, Sponsor>([['sp1', { id: 'sp1', name: 'RBC' }]]);

  it('keeps only completed tasks, latest due date first', () => {
    const tasks = [
      task({ id: 'open', completed: false }),
      task({ id: 'early', dueDate: '2025-03-01' }),
      task({ id: 'late', dueDate: '2025-03-09' }),
    ];
    const result = getCompletedTasks(tasks, eventsById, sponsorsById);
    expect(result.map((t) => t.id)).toEqual(['late', 'early']);
  });

  it('searches the task title, event name and sponsor name', () => {
    const tasks = [
      task({ id: 'byTitle', title: 'Gala tickets' }),
      task({ id: 'byEvent', eventId: 'e1' }),
      task({ id: 'bySponsor', sponsorId: 'sp1' }),
      task({ id: 'none' }),
    ];
    expect(getCompletedTasks(tasks, eventsById, sponsorsById, 'gala').map((t) => t.id).sort()).toEqual([
      'byEvent',
      'byTitle',
    ]);
    expect(getCompletedTasks(tasks, eventsById, sponsorsById, 'rbc').map((t) => t.id)).toEqual(['bySponsor']);
  });

  it('filters by event and by sponsor; "all" means no filter', () => {
    const tasks = [
      task({ id: 'a', eventId: 'e1', sponsorId: 'sp1' }),
      task({ id: 'b', eventId: 'e2', sponsorId: 'sp1' }),
      task({ id: 'c', eventId: 'e1', sponsorId: 'sp2' }),
    ];
    expect(getCompletedTasks(tasks, eventsById, sponsorsById, '', 'e1').map((t) => t.id).sort()).toEqual(['a', 'c']);
    expect(getCompletedTasks(tasks, eventsById, sponsorsById, '', 'all', 'sp1').map((t) => t.id).sort()).toEqual([
      'a',
      'b',
    ]);
  });
});

describe('countPeople', () => {
  it('counts each distinct sponsor and assignee once', () => {
    const tasks = [
      task({ assigneeId: 's1', sponsorId: 'sp1' }),
      task({ assigneeId: 's1', sponsorId: 'sp2' }),
      task({ assigneeId: 's2' }),
    ];
    expect(countPeople(tasks)).toBe(4);
  });

  it('is 0 with no tasks', () => {
    expect(countPeople([])).toBe(0);
  });
});
