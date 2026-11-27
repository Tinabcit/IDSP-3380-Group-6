import { describe, expect, it } from 'vitest';
import { summarizeEvent } from './event-detail';
import type { ChamberEvent, Contract, Sponsor, Task } from './types';

const TODAY = '2025-03-10';

const event: ChamberEvent = {
  id: 'e1',
  name: 'Spring Gala',
  startDate: '2025-04-01',
  endDate: '2025-04-01',
  pillarId: 'p1',
  isSignature: true,
};

const sponsors: Sponsor[] = [
  { id: 'rbc', name: 'RBC' },
  { id: 'bcit', name: 'BCIT' },
];

/** A contract for the event, changed by overrides. */
function contract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: 'c1',
    title: 'Gala Sponsorship',
    sponsorId: 'rbc',
    eventId: 'e1',
    amount: 5000,
    status: 'active',
    payments: [],
    deliverables: [],
    createdAt: '2025-03-01T00:00:00.000Z',
    ...overrides,
  };
}

/** A task for the event, changed by overrides. */
function task(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
    title: 'Task',
    dueDate: '2025-03-20',
    completed: false,
    assigneeId: 's1',
    eventId: 'e1',
    createdAt: '2025-03-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('summarizeEvent', () => {
  it('adds up only this event\'s contracts and what has been paid', () => {
    const contracts = [
      contract({
        id: 'a',
        amount: 4000,
        payments: [
          { id: 'p1', label: 'First', dueDate: '2025-03-01', amount: 1000, paid: true },
          { id: 'p2', label: 'Second', dueDate: '2025-04-01', amount: 3000, paid: false },
        ],
      }),
      contract({ id: 'b', sponsorId: 'bcit', amount: 1000 }),
      contract({ id: 'other', eventId: 'e2', amount: 9999 }),
    ];
    const s = summarizeEvent(event, contracts, [], sponsors, TODAY);
    expect(s.contracts.map((c) => c.id)).toEqual(['a', 'b']);
    expect(s.total).toBe(5000);
    expect(s.received).toBe(1000);
    expect(s.percent).toBe(20);
  });

  it('shows 0% when there is no money yet', () => {
    expect(summarizeEvent(event, [], [], sponsors, TODAY).percent).toBe(0);
  });

  it('lists contract sponsors first, then typed names with no contract, without repeats', () => {
    const typed = { ...event, sponsorNames: ['rbc', 'Telus', ' '] };
    const s = summarizeEvent(typed, [contract()], [], sponsors, TODAY);
    expect(s.sponsors.map((l) => [l.name, l.contract?.id])).toEqual([
      ['RBC', 'c1'],
      ['Telus', undefined],
    ]);
  });

  it('falls back to the old single sponsor name field', () => {
    const old = { ...event, sponsorName: 'Telus' };
    expect(summarizeEvent(old, [], [], sponsors, TODAY).sponsors).toEqual([{ name: 'Telus' }]);
  });

  it('lists unfinished tasks for this event, earliest first, and counts overdue ones', () => {
    const tasks = [
      task({ id: 'late', dueDate: '2025-03-01' }),
      task({ id: 'soon', dueDate: '2025-03-15' }),
      task({ id: 'done', dueDate: '2025-03-02', completed: true }),
      task({ id: 'elsewhere', eventId: 'e2' }),
    ];
    const s = summarizeEvent(event, [], tasks, sponsors, TODAY);
    expect(s.openTasks.map((t) => t.id)).toEqual(['late', 'soon']);
    expect(s.overdue).toBe(1);
  });
});
