import { describe, expect, it } from 'vitest';

import { isUuid } from '@/lib/planner/ids';

import { buildDemoData, demoId } from './demo-seed';

describe('demoId', () => {
  it('turns the same readable id into the same UUID every time', () => {
    expect(demoId('event-gala')).toBe(demoId('event-gala'));
    expect(isUuid(demoId('event-gala'))).toBe(true);
  });

  it('gives different ids different UUIDs', () => {
    expect(demoId('event-gala')).not.toBe(demoId('event-golf'));
  });
});

describe('buildDemoData', () => {
  const pillars = new Map([
    ['Advocacy', 'a0000000-0000-4000-8000-000000000001'],
    ['Networking', 'a0000000-0000-4000-8000-000000000002'],
    ['Education', 'a0000000-0000-4000-8000-000000000003'],
    ['Community', 'a0000000-0000-4000-8000-000000000004'],
  ]);
  const demo = buildDemoData('2026-11-13', pillars);

  it('uses the pillars from the database, matched by name', () => {
    for (const event of demo.events) expect([...pillars.values()]).toContain(event.pillarId);
  });

  it('only links to rows that are part of the demo data', () => {
    const ids = (list: { id: string }[]) => new Set(list.map((x) => x.id));
    const sponsors = ids(demo.sponsors);
    const events = ids(demo.events);
    const staff = ids(demo.staff);
    const contracts = ids(demo.contracts);
    for (const c of demo.contracts) {
      expect(sponsors.has(c.sponsorId)).toBe(true);
      if (c.eventId) expect(events.has(c.eventId)).toBe(true);
    }
    for (const t of demo.tasks) {
      expect(staff.has(t.assigneeId)).toBe(true);
      if (t.eventId) expect(events.has(t.eventId)).toBe(true);
      if (t.contractId) expect(contracts.has(t.contractId)).toBe(true);
    }
    for (const a of demo.activity) expect(staff.has(a.userId)).toBe(true);
  });

  it('makes every id a UUID so it fits the database', () => {
    const all = [
      ...demo.sponsors, ...demo.events, ...demo.contracts, ...demo.tasks, ...demo.activity,
      ...demo.contracts.flatMap((c) => [...c.payments, ...c.deliverables]),
    ];
    for (const row of all) expect(isUuid(row.id)).toBe(true);
  });
});
