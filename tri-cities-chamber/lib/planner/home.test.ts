import { describe, expect, it } from 'vitest';
import {
  eventBadge,
  paginate,
  searchTasks,
  sortByDueDate,
  splitEvents,
} from '@/lib/planner/home';
import type { ChamberEvent, Sponsor, Task } from '@/lib/planner/types';

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

/** Builds an event with sensible defaults. */
function event(over: Partial<ChamberEvent>): ChamberEvent {
  return {
    id: 'e1',
    name: 'Event',
    startDate: '2025-03-10',
    endDate: '2025-03-10',
    pillarId: 'p1',
    isSignature: false,
    ...over,
  };
}

// Tests for the home page helpers: pure functions, so no browser is needed.
describe('home helpers', () => {
  describe('paginate', () => {
    const items = [1, 2, 3, 4, 5, 6, 7];

    it('returns the requested page and the page count', () => {
      expect(paginate(items, 0, 3)).toEqual({ items: [1, 2, 3], page: 0, pageCount: 3 });
      expect(paginate(items, 2, 3)).toEqual({ items: [7], page: 2, pageCount: 3 });
    });

    it('clamps a page that is out of range', () => {
      expect(paginate(items, 9, 3).page).toBe(2);
      expect(paginate(items, -1, 3).page).toBe(0);
    });

    it('has one empty page for an empty list', () => {
      expect(paginate([], 0, 3)).toEqual({ items: [], page: 0, pageCount: 1 });
    });
  });

  describe('searchTasks', () => {
    const events = new Map([['e1', event({ id: 'e1', name: "Mayor's BBQ" })]]);
    const sponsors = new Map<string, Sponsor>([['sp1', { id: 'sp1', name: 'RBC' }]]);
    const tasks = [
      task({ id: 'a', title: 'Comp Tickets', eventId: 'e1' }),
      task({ id: 'b', title: 'Sign deal', sponsorId: 'sp1' }),
      task({ id: 'c', title: 'Other' }),
    ];

    it('returns everything for an empty or blank search', () => {
      expect(searchTasks(tasks, '  ', events, sponsors)).toHaveLength(3);
    });

    it('matches the title, event name or sponsor name, ignoring case', () => {
      expect(searchTasks(tasks, 'comp', events, sponsors).map((t) => t.id)).toEqual(['a']);
      expect(searchTasks(tasks, 'BBQ', events, sponsors).map((t) => t.id)).toEqual(['a']);
      expect(searchTasks(tasks, 'rbc', events, sponsors).map((t) => t.id)).toEqual(['b']);
    });
  });

  describe('sortByDueDate', () => {
    const tasks = [
      task({ id: 'b', dueDate: '2025-03-12' }),
      task({ id: 'a', dueDate: '2025-03-10' }),
      task({ id: 'c', dueDate: '2025-03-11' }),
    ];

    it('sorts oldest first for "asc" and newest first for "desc"', () => {
      expect(sortByDueDate(tasks, 'asc').map((t) => t.id)).toEqual(['a', 'c', 'b']);
      expect(sortByDueDate(tasks, 'desc').map((t) => t.id)).toEqual(['b', 'c', 'a']);
    });

    it('does not change the list it was given', () => {
      sortByDueDate(tasks, 'asc');
      expect(tasks.map((t) => t.id)).toEqual(['b', 'a', 'c']);
    });
  });

  describe('splitEvents', () => {
    const today = '2025-03-10';
    const events = [
      event({ id: 'sig', isSignature: true, startDate: '2025-04-01', endDate: '2025-04-01' }),
      event({ id: 'one', isSignature: false, startDate: '2025-04-02', endDate: '2025-04-02' }),
      event({ id: 'old', isSignature: true, startDate: '2025-02-01', endDate: '2025-02-02' }),
      event({ id: 'now', isSignature: false, startDate: '2025-03-09', endDate: '2025-03-10' }),
    ];

    it('puts finished events in archived, whatever their type', () => {
      expect(splitEvents(events, today).archived.map((e) => e.id)).toEqual(['old']);
    });

    it('splits the rest into repeat (signature) and one-off events', () => {
      const { repeat, oneOff } = splitEvents(events, today);
      expect(repeat.map((e) => e.id)).toEqual(['sig']);
      expect(oneOff.map((e) => e.id)).toEqual(['now', 'one']);
    });
  });

  describe('eventBadge', () => {
    const today = '2025-03-10';

    it('says "in 1 week" (danger) for an event starting 7 days away', () => {
      const badge = eventBadge(event({ startDate: '2025-03-17' }), 2, today);
      expect(badge).toEqual({ text: 'in 1 week', tone: 'danger' });
    });

    it('says "today" or "in N days" (danger) when it starts sooner', () => {
      expect(eventBadge(event({ startDate: '2025-03-10' }), 0, today).text).toBe('today');
      expect(eventBadge(event({ startDate: '2025-03-11' }), 0, today).text).toBe('in 1 day');
      expect(eventBadge(event({ startDate: '2025-03-12' }), 0, today).text).toBe('in 2 days');
    });

    it('says "N tasks" (info) when it is further away but has open tasks', () => {
      const badge = eventBadge(event({ startDate: '2025-05-01' }), 5, today);
      expect(badge).toEqual({ text: '5 tasks', tone: 'info' });
      expect(eventBadge(event({ startDate: '2025-05-01' }), 1, today).text).toBe('1 task');
    });

    it('says "low priority" (dark) when nothing is open and it is far away', () => {
      const badge = eventBadge(event({ startDate: '2025-05-01' }), 0, today);
      expect(badge).toEqual({ text: 'low priority', tone: 'dark' });
    });
  });
});
