import { describe, expect, it } from 'vitest';

import type { CompTicket } from '@/components/partners/give-comp-tickets-dialog';
import type { Event, Profile, SponsorCompTicket } from '@/lib/generated/prisma/client';
import { newId } from '@/lib/planner/ids';
import type { ChamberEvent } from '@/lib/planner/types';

import {
  eventCompTicketRows,
  eventData,
  profileSettingsData,
  sponsorCompTicketData,
  toChamberEvent,
  toProfileSettings,
  toSponsorCompTicket,
} from './mappers';

/** An event row with every 0002 column empty, like an event saved before them. */
function eventRow(overrides: Partial<Event> = {}): Event {
  return {
    id: newId(),
    name: 'Gala',
    startDate: new Date('2026-12-01T00:00:00.000Z'),
    endDate: new Date('2026-12-01T00:00:00.000Z'),
    startTime: null,
    endTime: null,
    pillarId: null,
    isSignature: false,
    location: null,
    description: null,
    category: null,
    sponsorName: null,
    contactEmail: null,
    contactPhone: null,
    address: null,
    fileName: null,
    attendees: null,
    picture: null,
    deadline: null,
    priority: null,
    labels: [],
    reminders: [],
    guests: [],
    tickets: [],
    sponsorNames: [],
    status: 'planning',
    recurringSeriesId: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('event extras', () => {
  it('leaves the extras out when the columns are empty', () => {
    const event = toChamberEvent(eventRow());
    for (const key of ['picture', 'deadline', 'priority', 'labels', 'reminders', 'guests', 'tickets', 'compTickets', 'sponsorNames'] as const) {
      expect(event[key]).toBeUndefined();
    }
  });

  it('round-trips every extra field and the comp ticket list', () => {
    const event: ChamberEvent = {
      id: newId(),
      name: 'Gala',
      startDate: '2026-12-01',
      endDate: '2026-12-01',
      pillarId: '',
      isSignature: true,
      sponsorName: 'Acme, Beta Co',
      sponsorNames: ['Acme', 'Beta Co'],
      picture: 'poster.png',
      deadline: '2026-11-20',
      priority: 2,
      labels: ['Design', 'Urgent'],
      reminders: ['day-before', 'on-date'],
      guests: ['Mayor'],
      tickets: ['General Admission', 'VIP Access'],
      compTickets: [
        { id: newId(), recipient: 'Alice Ross', ticketType: 'VIP Access', quantity: 2, status: 'Issued' },
        { id: newId(), recipient: 'Marcus Reed', ticketType: 'Press Pass', quantity: 1, status: 'Draft' },
      ],
    };
    const data = eventData(event);
    const rows = eventCompTicketRows(event.id, event).map((r) => ({ ...r, createdAt: new Date() }));
    // Store the rows out of order to check the list order comes from position.
    const back = toChamberEvent({ ...eventRow({ id: event.id }), ...data, compTickets: [rows[1], rows[0]] });
    expect(back).toMatchObject(event);
  });

  it('ignores a priority or reminder the app does not know', () => {
    const event = toChamberEvent(eventRow({ priority: 9, reminders: ['day-before', 'monthly'] }));
    expect(event.priority).toBeUndefined();
    expect(event.reminders).toEqual(['day-before']);
  });
});

describe('Partners page comp tickets', () => {
  it('round-trips a ticket', () => {
    const ticket: CompTicket = {
      id: newId(),
      recipient: '',
      sponsorName: 'Acme',
      quantity: 3,
      ticketType: 'General Admission',
      eventName: 'Gala',
      location: 'Town Hall',
      plusOne: true,
      vipLounge: false,
      backstage: true,
      notes: '',
      status: 'Draft',
    };
    const row: SponsorCompTicket = { ...sponsorCompTicketData(ticket, null), createdAt: new Date() };
    expect(row.notes).toBeNull();
    expect(toSponsorCompTicket(row)).toEqual(ticket);
  });
});

describe('Settings page profile', () => {
  const profile: Profile = {
    id: newId(),
    email: 'signin@example.com',
    fullName: null,
    role: 'staff',
    sponsorId: null,
    authUserId: null,
    contactEmail: null,
    avatarUrl: null,
    createdAt: new Date(),
  };

  it('shows the sign-in email until a display email is saved', () => {
    expect(toProfileSettings(profile)).toEqual({ username: '', email: 'signin@example.com', photo: '' });
    expect(toProfileSettings({ ...profile, contactEmail: 'me@example.com' }).email).toBe('me@example.com');
  });

  it('never writes the sign-in email', () => {
    const data = profileSettingsData({ username: ' Sam ', email: 'me@example.com', photo: '' });
    expect(data).toEqual({ fullName: 'Sam', contactEmail: 'me@example.com', avatarUrl: null });
    expect(data).not.toHaveProperty('email');
  });
});
