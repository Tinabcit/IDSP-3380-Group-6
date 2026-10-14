import { describe, expect, it } from 'vitest';
import {
  amountPaid,
  buildDemoSummary,
  filterContracts,
  formatCurrency,
  groupContracts,
  isContractOverdue,
  nextDueDate,
  simulateExtraction,
  sortContracts,
} from '@/lib/planner/contracts';
import type { ContractLookups } from '@/lib/planner/contracts';
import { EMPTY_FILTERS } from '@/lib/planner/types';
import type { ChamberEvent, Contract, Pillar, Sponsor } from '@/lib/planner/types';

const TODAY = '2025-03-10';

const pillars: Pillar[] = [{ id: 'p1', name: 'Business' }];
const sponsors: Sponsor[] = [
  { id: 'sp1', name: 'Acme Bank' },
  { id: 'sp2', name: 'Zed Foods' },
];
const events: ChamberEvent[] = [
  { id: 'e1', name: 'Gala Night', startDate: TODAY, endDate: TODAY, pillarId: 'p1', isSignature: true },
  { id: 'e2', name: 'Mixer', startDate: TODAY, endDate: TODAY, pillarId: 'p1', isSignature: false },
];
const lookups: ContractLookups = {
  eventsById: new Map(events.map((e) => [e.id, e])),
  pillarsById: new Map(pillars.map((p) => [p.id, p])),
  sponsorsById: new Map(sponsors.map((s) => [s.id, s])),
};

/** Builds a contract with sensible defaults so each test only sets what it cares about. */
function makeContract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: 'c1',
    title: 'Gala Sponsorship',
    sponsorId: 'sp1',
    eventId: 'e1',
    amount: 5000,
    status: 'active',
    payments: [],
    deliverables: [],
    createdAt: '2025-03-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('formatCurrency', () => {
  it('writes whole Canadian dollars', () => {
    expect(formatCurrency(5000)).toMatch(/5,000/);
    expect(formatCurrency(5000)).not.toMatch(/\.00/);
  });
});

describe('amountPaid', () => {
  it('adds up only the payments marked paid', () => {
    const c = makeContract({
      payments: [
        { id: 'a', label: 'Deposit', dueDate: '2025-03-01', amount: 2500, paid: true },
        { id: 'b', label: 'Balance', dueDate: '2025-04-01', amount: 2500, paid: false },
      ],
    });
    expect(amountPaid(c)).toBe(2500);
  });
});

describe('nextDueDate and isContractOverdue', () => {
  const c = makeContract({
    payments: [
      { id: 'a', label: 'Deposit', dueDate: '2025-03-01', amount: 100, paid: true },
      { id: 'b', label: 'Balance', dueDate: '2025-03-20', amount: 100, paid: false },
    ],
    deliverables: [{ id: 'd', label: 'Logo on banner', dueDate: '2025-03-05', done: false }],
  });

  it('picks the earliest unpaid or unfinished item and ignores finished ones', () => {
    expect(nextDueDate(c)).toBe('2025-03-05');
  });

  it('is null when nothing is outstanding', () => {
    expect(nextDueDate(makeContract())).toBeNull();
  });

  it('is overdue when the next item is before today, unless the contract is completed', () => {
    expect(isContractOverdue(c, TODAY)).toBe(true);
    expect(isContractOverdue({ ...c, status: 'completed' }, TODAY)).toBe(false);
    expect(isContractOverdue(makeContract(), TODAY)).toBe(false);
  });
});

describe('filterContracts', () => {
  const contracts = [
    makeContract({ id: 'a', title: 'Gala Sponsorship', sponsorId: 'sp1', eventId: 'e1' }),
    makeContract({ id: 'b', title: 'Mixer Drinks', sponsorId: 'sp2', eventId: 'e2', notes: 'bring banner' }),
    makeContract({ id: 'c', title: 'General Support', sponsorId: 'sp2', eventId: undefined }),
  ];

  it('returns everything with no filters or search', () => {
    expect(filterContracts(contracts, EMPTY_FILTERS, '', lookups)).toHaveLength(3);
  });

  it('filters by signature event and by partner', () => {
    expect(filterContracts(contracts, { ...EMPTY_FILTERS, signatureOnly: true }, '', lookups).map((c) => c.id)).toEqual(['a']);
    expect(filterContracts(contracts, { ...EMPTY_FILTERS, sponsorId: 'sp2' }, '', lookups).map((c) => c.id)).toEqual(['b', 'c']);
  });

  it('searches title, partner, event and notes, ignoring case and spaces around the text', () => {
    expect(filterContracts(contracts, EMPTY_FILTERS, '  zed ', lookups).map((c) => c.id)).toEqual(['b', 'c']);
    expect(filterContracts(contracts, EMPTY_FILTERS, 'GALA', lookups).map((c) => c.id)).toEqual(['a']);
    expect(filterContracts(contracts, EMPTY_FILTERS, 'banner', lookups).map((c) => c.id)).toEqual(['b']);
  });
});

describe('sortContracts', () => {
  const contracts = [
    makeContract({ id: 'noWork', title: 'A', amount: 100, sponsorId: 'sp2' }),
    makeContract({
      id: 'late',
      title: 'B',
      amount: 900,
      sponsorId: 'sp1',
      payments: [{ id: 'p', label: 'x', dueDate: '2025-05-01', amount: 1, paid: false }],
    }),
    makeContract({
      id: 'soon',
      title: 'C',
      amount: 500,
      sponsorId: 'sp1',
      payments: [{ id: 'q', label: 'x', dueDate: '2025-03-15', amount: 1, paid: false }],
    }),
  ];
  const ids = (list: Contract[]) => list.map((c) => c.id);

  it('sorts by next due date with contracts that have nothing left last', () => {
    expect(ids(sortContracts(contracts, 'nextDue', lookups))).toEqual(['soon', 'late', 'noWork']);
  });

  it('sorts by amount (largest first), title and partner', () => {
    expect(ids(sortContracts(contracts, 'amount', lookups))).toEqual(['late', 'soon', 'noWork']);
    expect(ids(sortContracts(contracts, 'title', lookups))).toEqual(['noWork', 'late', 'soon']);
    expect(ids(sortContracts(contracts, 'partner', lookups))).toEqual(['late', 'soon', 'noWork']);
  });
});

describe('groupContracts', () => {
  const contracts = [
    makeContract({ id: 'a', eventId: 'e2', sponsorId: 'sp2' }),
    makeContract({ id: 'b', eventId: 'e1', sponsorId: 'sp1' }),
    makeContract({ id: 'c', eventId: undefined, sponsorId: 'sp1' }),
  ];

  it('returns one unlabeled group for "none"', () => {
    const groups = groupContracts(contracts, 'none', lookups);
    expect(groups).toHaveLength(1);
    expect(groups[0].contracts).toHaveLength(3);
  });

  it('groups by event with a catch-all group, sorted by label', () => {
    const groups = groupContracts(contracts, 'event', lookups);
    expect(groups.map((g) => g.label)).toEqual(['Gala Night', 'Mixer', 'Not tied to an event']);
  });

  it('groups by pillar and by partner', () => {
    expect(groupContracts(contracts, 'pillar', lookups).map((g) => g.label)).toEqual(['Business', 'No pillar']);
    expect(groupContracts(contracts, 'partner', lookups).map((g) => g.label)).toEqual(['Acme Bank', 'Zed Foods']);
  });
});

describe('buildDemoSummary', () => {
  it('mentions the partner, event and instalment count', () => {
    const summary = buildDemoSummary(
      {
        title: 'Gala Sponsorship',
        amount: 5000,
        payments: [{ id: 'a', label: 'Deposit', dueDate: '2025-03-01', amount: 2500, paid: false }],
        deliverables: [{ id: 'd', label: 'Logo on banner', dueDate: '2025-03-05', done: false }],
      },
      'Acme Bank',
      'Gala Night'
    );
    expect(summary.overview).toContain('Acme Bank');
    expect(summary.overview).toContain('for Gala Night');
    expect(summary.overview).toContain('1 instalment.');
    expect(summary.keyTerms).toHaveLength(2);
    expect(summary.watchouts).toEqual([]);
  });

  it('warns when there is no payment schedule', () => {
    const summary = buildDemoSummary({ title: 'T', amount: 1, payments: [], deliverables: [] }, 'Acme Bank');
    expect(summary.watchouts).toEqual(['No payment schedule recorded yet']);
  });
});

describe('simulateExtraction', () => {
  it('guesses the partner and event from the file name and proposes two payments', () => {
    const result = simulateExtraction('acme-gala_agreement.pdf', sponsors, events, {
      today: TODAY,
      deposit: '2025-03-17',
      balance: '2025-04-10',
    });
    expect(result.title).toBe('acme gala agreement');
    expect(result.sponsorId).toBe('sp1');
    expect(result.eventId).toBe('e1');
    expect(result.payments).toHaveLength(2);
    expect(result.payments?.reduce((sum, p) => sum + p.amount, 0)).toBe(result.amount);
  });

  it('leaves partner and event empty when nothing in the file name matches', () => {
    const result = simulateExtraction('scan0001.pdf', sponsors, events, {
      today: TODAY,
      deposit: TODAY,
      balance: TODAY,
    });
    expect(result.sponsorId).toBeUndefined();
    expect(result.eventId).toBeUndefined();
  });
});
