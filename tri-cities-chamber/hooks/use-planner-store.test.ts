import { describe, expect, it } from 'vitest';
import { reducer } from '@/hooks/use-planner-store';
import type { Action, PlannerState } from '@/hooks/use-planner-store';
import type { Contract, Task } from '@/lib/planner/types';

/** An empty, ready store to start each test from. */
function emptyState(overrides: Partial<PlannerState> = {}): PlannerState {
  return {
    status: 'ready',
    events: [],
    tasks: [],
    sponsors: [],
    contracts: [],
    activity: [],
    currentUserId: 'staff-1',
    ...overrides,
  };
}

/** A contract with one unpaid payment (item "pay1") and one open deliverable (item "del1"). */
const contract: Contract = {
  id: 'c1',
  title: 'Gala Sponsorship',
  sponsorId: 'sp1',
  amount: 5000,
  status: 'active',
  payments: [{ id: 'pay1', label: 'Deposit', dueDate: '2025-03-15', amount: 2500, paid: false }],
  deliverables: [{ id: 'del1', label: 'Logo on banner', dueDate: '2025-03-20', done: false }],
  createdAt: '2025-03-01T00:00:00.000Z',
};

/** The two reminder tasks the store makes for the contract above. */
const mirroredTasks: Task[] = [
  {
    id: 't-pay',
    title: 'Gala Sponsorship: Deposit',
    dueDate: '2025-03-15',
    completed: false,
    assigneeId: 'staff-1',
    contractId: 'c1',
    contractItemId: 'pay1',
    createdAt: '2025-03-01T00:00:00.000Z',
  },
  {
    id: 't-del',
    title: 'Logo on banner',
    dueDate: '2025-03-20',
    completed: false,
    assigneeId: 'staff-1',
    contractId: 'c1',
    contractItemId: 'del1',
    createdAt: '2025-03-01T00:00:00.000Z',
  },
];

/** A store that already holds the contract and its mirrored tasks. */
function stateWithContract(): PlannerState {
  return reducer(emptyState(), { type: 'addContract', contract, tasks: mirroredTasks, logId: 'log1' });
}

describe('reducer: contracts and tasks stay in sync', () => {
  it('adding a contract saves its reminder tasks and writes a history line', () => {
    const state = stateWithContract();
    expect(state.contracts).toHaveLength(1);
    expect(state.tasks).toHaveLength(2);
    expect(state.activity[0]).toMatchObject({ id: 'log1', contractId: 'c1', userId: 'staff-1' });
  });

  it('ticking a mirrored task also marks the payment as paid, and unticking reverses it', () => {
    const ticked = reducer(stateWithContract(), { type: 'toggleTask', id: 't-pay', logId: 'log2' });
    expect(ticked.tasks.find((t) => t.id === 't-pay')?.completed).toBe(true);
    expect(ticked.contracts[0].payments[0].paid).toBe(true);
    expect(ticked.contracts[0].deliverables[0].done).toBe(false);

    const unticked = reducer(ticked, { type: 'toggleTask', id: 't-pay', logId: 'log3' });
    expect(unticked.contracts[0].payments[0].paid).toBe(false);
  });

  it('ticking a deliverable on the contract also completes its task', () => {
    const state = reducer(stateWithContract(), {
      type: 'toggleContractItem',
      contractId: 'c1',
      itemId: 'del1',
      logId: 'log2',
    });
    expect(state.contracts[0].deliverables[0].done).toBe(true);
    expect(state.tasks.find((t) => t.id === 't-del')?.completed).toBe(true);
    expect(state.tasks.find((t) => t.id === 't-pay')?.completed).toBe(false);
    expect(state.activity[0].message).toContain('done');
  });

  it('ticking a payment on the contract also completes its task', () => {
    const state = reducer(stateWithContract(), {
      type: 'toggleContractItem',
      contractId: 'c1',
      itemId: 'pay1',
      logId: 'log2',
    });
    expect(state.contracts[0].payments[0].paid).toBe(true);
    expect(state.tasks.find((t) => t.id === 't-pay')?.completed).toBe(true);
    expect(state.activity[0].message).toContain('paid');
  });

  it('deleting a contract deletes its tasks but leaves other tasks alone', () => {
    const other: Task = { ...mirroredTasks[0], id: 'other', contractId: undefined, contractItemId: undefined };
    const start = { ...stateWithContract() };
    start.tasks = [...start.tasks, other];
    const state = reducer(start, { type: 'deleteContract', id: 'c1', logId: 'log2' });
    expect(state.contracts).toHaveLength(0);
    expect(state.tasks.map((t) => t.id)).toEqual(['other']);
  });

  it('deleting a mirrored task keeps the contract', () => {
    const state = reducer(stateWithContract(), { type: 'deleteTask', id: 't-pay', logId: 'log2' });
    expect(state.tasks).toHaveLength(1);
    expect(state.contracts).toHaveLength(1);
  });
});

describe('reducer: other actions', () => {
  it('ignores actions for ids that do not exist', () => {
    const state = stateWithContract();
    const actions: Action[] = [
      { type: 'toggleTask', id: 'nope', logId: 'l' },
      { type: 'deleteTask', id: 'nope', logId: 'l' },
      { type: 'deleteContract', id: 'nope', logId: 'l' },
      { type: 'toggleContractItem', contractId: 'c1', itemId: 'nope', logId: 'l' },
      { type: 'setContractStatus', id: 'nope', status: 'completed', logId: 'l' },
    ];
    for (const action of actions) {
      expect(reducer(state, action)).toBe(state);
    }
  });

  it('changes a contract status and logs it', () => {
    const state = reducer(stateWithContract(), { type: 'setContractStatus', id: 'c1', status: 'completed', logId: 'l2' });
    expect(state.contracts[0].status).toBe('completed');
    expect(state.activity[0].message).toBe('Set Gala Sponsorship to completed');
  });

  it('adds, edits and removes a plain task', () => {
    const task: Task = { ...mirroredTasks[0], id: 'plain', contractId: undefined, contractItemId: undefined };
    let state = reducer(emptyState(), { type: 'addTask', task, logId: 'l1' });
    expect(state.tasks).toHaveLength(1);

    state = reducer(state, {
      type: 'updateTask',
      id: 'plain',
      input: { title: 'Renamed', dueDate: '2025-04-01', assigneeId: 'staff-1' },
      logId: 'l2',
    });
    expect(state.tasks[0]).toMatchObject({ title: 'Renamed', dueDate: '2025-04-01' });

    state = reducer(state, { type: 'deleteTask', id: 'plain', logId: 'l3' });
    expect(state.tasks).toHaveLength(0);
  });

  it('keeps only the latest 200 history lines, newest first', () => {
    let state = emptyState();
    for (let i = 0; i < 205; i++) {
      state = reducer(state, {
        type: 'addEvent',
        event: { id: `e${i}`, name: `Event ${i}`, startDate: '2025-03-01', endDate: '2025-03-01', pillarId: 'p', isSignature: false },
        logId: `log${i}`,
      });
    }
    expect(state.activity).toHaveLength(200);
    expect(state.activity[0].id).toBe('log204');
  });

  it('hydrate loads data, marks the store ready and keeps the user unless one is given', () => {
    const loading = emptyState({ status: 'loading' });
    const data = { events: [], tasks: [], sponsors: [], contracts: [contract], activity: [] };
    expect(reducer(loading, { type: 'hydrate', data })).toMatchObject({ status: 'ready', currentUserId: 'staff-1' });
    expect(reducer(loading, { type: 'hydrate', data, currentUserId: 'staff-2' }).currentUserId).toBe('staff-2');
  });
});
