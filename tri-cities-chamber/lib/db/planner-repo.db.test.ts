import { PrismaPg } from '@prisma/adapter-pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { PrismaClient } from '@/lib/generated/prisma/client';
import { newId } from '@/lib/planner/ids';
import type { ActivityEntry, ChamberEvent, Contract, Sponsor, Task } from '@/lib/planner/types';

import * as repo from './planner-repo';

/**
 * Runs the real database code against a Postgres database.
 * Skipped unless TEST_DATABASE_URL is set. Point it at a THROWAWAY database
 * that has the Supabase tables (plus supabase/migrations and supabase/seed.sql),
 * never at the real one: the test adds rows.
 *
 *   TEST_DATABASE_URL=postgresql://... npm test
 */
const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)('planner-repo against a database', () => {
  let db: PrismaClient;
  let actorId: string;
  const person = { email: `test-${newId()}@example.com`, name: 'Test Person' };

  /** A history line written by the test user. */
  const entry = (message: string, contractId?: string): ActivityEntry => ({
    id: newId(),
    at: new Date().toISOString(),
    userId: actorId,
    message,
    contractId,
  });

  /** Loads everything the way the app does. */
  const load = () => repo.loadPlannerSnapshot(db, person);

  beforeAll(async () => {
    db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url! }) });
    actorId = await repo.ensureProfile(db, person);
  });

  afterAll(async () => {
    await db?.$disconnect();
  });

  it('creates a profile on first sign in and reuses it after', async () => {
    expect(await repo.ensureProfile(db, { ...person, email: person.email.toUpperCase() })).toBe(actorId);
    const snap = await load();
    expect(snap.currentProfileId).toBe(actorId);
    expect(snap.staff.find((s) => s.id === actorId)).toEqual({ id: actorId, name: 'Test Person', initials: 'TP' });
    expect(snap.pillars.length).toBeGreaterThan(0);
  });

  it('saves the whole flow: sponsor, event, contract, tasks, toggles and deletes', async () => {
    const pillarId = (await load()).pillars[0].id;

    // Sponsor with to dos, then an edit that replaces them.
    const sponsor: Sponsor = {
      id: newId(),
      name: 'Coastline Credit Union',
      contactEmail: 'alicia@example.com',
      level: 'gold',
      status: 'draft',
      todos: [
        { id: newId(), title: 'Send agreement', done: false },
        { id: newId(), title: 'Request logo', done: true },
      ],
    };
    await repo.createSponsor(db, actorId, sponsor);
    const edited = { ...sponsor, status: 'active' as const, todos: [{ id: newId(), title: 'Only one', done: false }] };
    await repo.updateSponsor(db, actorId, sponsor.id, edited, entry('Edited sponsor'));

    // Event with times and attendees (date columns must not shift in a non-UTC time zone).
    const event: ChamberEvent = {
      id: newId(),
      name: 'Business Excellence Gala',
      startDate: '2026-12-31',
      endDate: '2027-01-01',
      pillarId,
      isSignature: true,
      startTime: '18:00',
      endTime: '23:30',
      category: 'fundraiser',
      attendees: 120,
      email: 'events@example.com',
    };
    await repo.createEvent(db, actorId, event, entry('Added event'));

    // Contract with one payment and one deliverable, plus their mirror tasks.
    const contract: Contract = {
      id: newId(),
      title: 'Gala Presenting Sponsor',
      sponsorId: sponsor.id,
      eventId: event.id,
      amount: 15000.5,
      status: 'active',
      signedDate: '2026-11-01',
      expirationDate: '2027-11-01',
      payments: [{ id: newId(), label: 'Deposit', dueDate: '2026-11-20', amount: 7500.25, paid: false }],
      deliverables: [{ id: newId(), label: 'Logo files', dueDate: '2026-11-25', done: false }],
      summary: { overview: 'Presenting sponsor', keyTerms: ['Logo on print'], watchouts: ['Vector logo'] },
      createdAt: new Date().toISOString(),
    };
    const base = { assigneeId: actorId, sponsorId: sponsor.id, eventId: event.id, contractId: contract.id, completed: false };
    const payTask: Task = { ...base, id: newId(), title: 'Pay', dueDate: '2026-11-20', contractItemId: contract.payments[0].id, createdAt: contract.createdAt };
    const delTask: Task = { ...base, id: newId(), title: 'Logo', dueDate: '2026-11-25', contractItemId: contract.deliverables[0].id, createdAt: contract.createdAt };
    await repo.createContract(db, actorId, contract, [payTask, delTask], entry('Added contract', contract.id));

    // A normal task with a time, then an edit.
    const task: Task = { id: newId(), title: 'Call caterer', dueDate: '2026-11-14', completed: false, assigneeId: actorId, eventId: event.id, startTime: '09:15', endTime: '10:00', createdAt: new Date().toISOString() };
    await repo.createTask(db, actorId, task, entry('Added task'));
    await repo.updateTask(db, actorId, task.id, { ...task, title: 'Call caterer again', notes: 'Ask about vegan' }, entry('Edited task'));

    let snap = await load();
    expect(snap.data.sponsors.find((s) => s.id === sponsor.id)).toEqual({ ...edited, contactName: undefined, contactPhone: undefined, website: undefined, notes: undefined });
    expect(snap.data.events.find((e) => e.id === event.id)).toMatchObject(event);
    expect(snap.data.contracts.find((c) => c.id === contract.id)).toMatchObject({ ...contract, createdAt: expect.any(String) });
    expect(snap.data.tasks.find((t) => t.id === payTask.id)).toMatchObject(payTask);
    expect(snap.data.tasks.find((t) => t.id === task.id)).toMatchObject({ title: 'Call caterer again', notes: 'Ask about vegan', startTime: '09:15', endTime: '10:00', dueDate: '2026-11-14' });

    // Ticking the payment task pays the payment; ticking the deliverable ticks its task.
    await repo.setTaskCompleted(db, actorId, payTask.id, true, entry('Paid'));
    await repo.setContractItemDone(db, actorId, contract.id, contract.deliverables[0].id, true, entry('Done', contract.id));
    await repo.setContractStatus(db, actorId, contract.id, 'completed', entry('Completed', contract.id));
    snap = await load();
    const saved = snap.data.contracts.find((c) => c.id === contract.id)!;
    expect(saved.payments[0].paid).toBe(true);
    expect(saved.deliverables[0].done).toBe(true);
    expect(saved.status).toBe('completed');
    expect(snap.data.tasks.find((t) => t.id === delTask.id)!.completed).toBe(true);

    // A history line from an unknown person is saved as the signed-in person.
    const stranger = { ...entry('From stranger'), userId: newId() };
    await repo.deleteTask(db, actorId, task.id, stranger);
    snap = await load();
    expect(snap.data.tasks.some((t) => t.id === task.id)).toBe(false);
    expect(snap.data.activity.find((a) => a.id === stranger.id)!.userId).toBe(actorId);

    // Deleting the event keeps the contract and tasks, unlinked.
    await repo.deleteEvent(db, actorId, event.id, entry('Deleted event'));
    snap = await load();
    expect(snap.data.events.some((e) => e.id === event.id)).toBe(false);
    expect(snap.data.contracts.find((c) => c.id === contract.id)!.eventId).toBeUndefined();
    expect(snap.data.tasks.find((t) => t.id === payTask.id)!.eventId).toBeUndefined();

    // Deleting the contract removes its tasks; its old history stays, unlinked.
    await repo.deleteContract(db, actorId, contract.id, entry('Deleted contract'));
    snap = await load();
    expect(snap.data.contracts.some((c) => c.id === contract.id)).toBe(false);
    expect(snap.data.tasks.some((t) => t.contractId === contract.id)).toBe(false);
    expect(snap.data.activity.some((a) => a.message === 'Added contract' && a.contractId === undefined)).toBe(true);
  });

  it('saves the event extras and replaces the comp ticket list on edit', async () => {
    const event: ChamberEvent = {
      id: newId(),
      name: 'Extras Gala',
      startDate: '2026-12-05',
      endDate: '2026-12-05',
      pillarId: '',
      isSignature: true,
      sponsorName: 'Acme, Beta',
      sponsorNames: ['Acme', 'Beta'],
      picture: 'poster.png',
      deadline: '2026-11-28',
      priority: 1,
      labels: ['Urgent'],
      reminders: ['week-before'],
      guests: ['Mayor'],
      tickets: ['VIP Access'],
      compTickets: [
        { id: newId(), recipient: 'Alice Ross', ticketType: 'VIP Access', quantity: 2, status: 'Issued' },
        { id: newId(), recipient: 'Marcus Reed', ticketType: 'Press Pass', quantity: 1, status: 'Draft' },
      ],
    };
    await repo.createEvent(db, actorId, event, entry('Added event'));
    let saved = (await load()).data.events.find((e) => e.id === event.id);
    expect(saved).toMatchObject(event);

    const { id, ...input } = event;
    const edited = { ...input, priority: undefined, labels: undefined, compTickets: [event.compTickets![1]] };
    await repo.updateEvent(db, actorId, id, edited, entry('Edited event'));
    saved = (await load()).data.events.find((e) => e.id === id);
    expect(saved?.priority).toBeUndefined();
    expect(saved?.labels).toBeUndefined();
    expect(saved?.compTickets).toEqual([event.compTickets![1]]);

    // Deleting the event removes its comp tickets with it.
    await repo.deleteEvent(db, actorId, id, entry('Deleted event'));
    expect(await db.eventCompTicket.count({ where: { eventId: id } })).toBe(0);
  });

  it('saves and deletes Partners page comp tickets, linking the sponsor by name', async () => {
    const sponsor: Sponsor = { id: newId(), name: `Ticket Sponsor ${newId()}`, todos: [] };
    await repo.createSponsor(db, actorId, sponsor);
    const ticket = {
      id: newId(),
      recipient: 'Sarah Jenkins',
      sponsorName: sponsor.name.toUpperCase(),
      quantity: 4,
      ticketType: 'General Admission',
      eventName: 'Gala',
      location: 'Town Hall',
      plusOne: true,
      vipLounge: true,
      backstage: false,
      notes: 'Front row',
      status: 'Issued' as const,
    };
    await repo.createSponsorCompTicket(db, ticket);
    expect((await repo.listSponsorCompTickets(db)).find((t) => t.id === ticket.id)).toEqual(ticket);
    expect((await db.sponsorCompTicket.findUnique({ where: { id: ticket.id } }))?.sponsorId).toBe(sponsor.id);

    await repo.deleteSponsorCompTicket(db, ticket.id);
    expect((await repo.listSponsorCompTickets(db)).some((t) => t.id === ticket.id)).toBe(false);
  });

  it('saves the Settings page profile without touching the sign-in email', async () => {
    const photo = 'data:image/png;base64,AAAA';
    await repo.saveProfileSettings(db, actorId, { username: 'Renamed Person', email: 'display@example.com', photo });
    expect(await repo.getProfileSettings(db, actorId)).toEqual({
      username: 'Renamed Person',
      email: 'display@example.com',
      photo,
    });
    // Signing in again still finds the same profile.
    expect(await repo.ensureProfile(db, person)).toBe(actorId);
    await expect(
      repo.saveProfileSettings(db, actorId, { username: '', email: '', photo: 'javascript:alert(1)' })
    ).rejects.toThrow('Invalid profile picture');
  });

  it('refuses ids that are not UUIDs', async () => {
    await expect(repo.deleteTask(db, actorId, 'task-1')).rejects.toThrow('Invalid task id');
  });
});
