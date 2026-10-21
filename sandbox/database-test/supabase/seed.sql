-- ---------------------------------------------------------------------------
-- Sponsorship sandbox: dummy data
-- Run AFTER the schema (Supabase SQL editor, or: psql "$DIRECT_URL" -f seed.sql)
--
-- * Dates are relative to now(), so there are always upcoming, due-soon and
--   overdue items no matter when you run it.
-- * Fixed UUID prefixes make it safe to re-run and easy to remove:
--     a1… sponsors        b1… event_series        c1… events
--     d1… agreements      e1… sponsor_events      f1… advertising
--     f2… sponsor_advertising
-- * profiles is not seeded: each row must match a real auth.users id.
-- ---------------------------------------------------------------------------

begin;

insert into public.sponsors (id, name, rank, status) values
  ('a1000000-0000-0000-0000-000000000001', 'Harborline Credit Union', 'pillar',         'active'),
  ('a1000000-0000-0000-0000-000000000002', 'Copper Kettle Brewing',   'annual_partner', 'active'),
  ('a1000000-0000-0000-0000-000000000003', 'Cedar & Pine Realty',     'event_only',     'active'),
  ('a1000000-0000-0000-0000-000000000004', 'Brightsmile Dental',      'annual_partner', 'active'),
  ('a1000000-0000-0000-0000-000000000005', 'Riverside Auto Group',    'event_only',     'inactive'),
  ('a1000000-0000-0000-0000-000000000006', 'Summit Outdoor Supply',   'event_only',     'prospective')
on conflict do nothing;

insert into public.event_series (id, name, recurrence) values
  ('b1000000-0000-0000-0000-000000000001', 'Summer Night Market',  'annual'),
  ('b1000000-0000-0000-0000-000000000002', 'Charity Golf Classic', 'annual'),
  ('b1000000-0000-0000-0000-000000000003', 'Holiday Gala',         'annual')
on conflict do nothing;

insert into public.events (id, name, start_at, end_at, status, recurring_series_id) values
  ('c1000000-0000-0000-0000-000000000001', 'Charity Golf Classic',
     date_trunc('day', now()) - interval '200 days' + interval '15 hours',
     date_trunc('day', now()) - interval '200 days' + interval '23 hours',
     'completed', 'b1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000002', 'Summer Night Market',
     date_trunc('day', now()) - interval '100 days' + interval '18 hours',
     date_trunc('day', now()) - interval '100 days' + interval '23 hours',
     'completed', 'b1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000003', 'Fall Harvest Festival',
     date_trunc('day', now()) + interval '10 days' + interval '16 hours',
     date_trunc('day', now()) + interval '10 days' + interval '22 hours',
     'open', null),
  ('c1000000-0000-0000-0000-000000000004', 'Holiday Gala',
     date_trunc('day', now()) + interval '50 days' + interval '18 hours',
     date_trunc('day', now()) + interval '50 days' + interval '23 hours',
     'planning', 'b1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000005', 'Charity Golf Classic',
     date_trunc('day', now()) + interval '165 days' + interval '15 hours',
     date_trunc('day', now()) + interval '165 days' + interval '23 hours',
     'planning', 'b1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000006', 'Spring Business Mixer',
     date_trunc('day', now()) + interval '30 days' + interval '17 hours',
     date_trunc('day', now()) + interval '30 days' + interval '20 hours',
     'cancelled', null)
on conflict do nothing;

insert into public.sponsor_agreements
  (id, sponsor_id, start_date, end_date, renewal_contact_due_at, renewal_deadline, status, notes) values
  ('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
     current_date - 120, current_date + 245, now() + interval '185 days', now() + interval '215 days',
     'active', 'Three-year pillar agreement, year one.'),
  ('d1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002',
     current_date - 330, current_date + 35, now() - interval '5 days', now() + interval '20 days',
     'pending_renewal', 'Asked for updated pricing before renewing.'),
  ('d1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004',
     current_date - 400, current_date - 35, null, null,
     'expired', 'Previous term.'),
  ('d1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004',
     current_date - 34, current_date + 331, now() + interval '270 days', now() + interval '300 days',
     'active', null)
on conflict do nothing;

insert into public.sponsor_events
  (id, sponsor_id, event_id, sponsorship_level, status, first_right_to_renew,
   renewal_contact_due_at, renewal_deadline, comped_tickets, notes) values
  -- past events
  ('e1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001',
     'Title', 'completed', true, now() + interval '105 days', now() + interval '135 days', 8,
     'Has first right to renew title for next year''s Classic.'),
  ('e1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002',
     'Gold', 'completed', false, null, null, 4, null),
  -- Fall Harvest Festival (open)
  ('e1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003',
     'Title', 'confirmed', false, null, null, 10, 'Send tickets to their marketing lead.'),
  ('e1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003',
     'Beverage partner', 'confirmed', false, null, null, 6, null),
  ('e1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003',
     'Silver', 'confirmed', false, null, null, 2, null),
  -- Holiday Gala (planning)
  ('e1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004',
     'Title', 'confirmed', true, null, null, 12, 'Reserved table of 12.'),
  ('e1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000004',
     'Silver', 'offered', false, null, null, 2, 'Waiting on signature.'),
  ('e1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004',
     'Gold', 'confirmed', false, null, null, 4, null),
  ('e1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000004',
     null, 'prospective', false, null, null, 0, 'Intro meeting booked.'),
  -- next Golf Classic (planning)
  ('e1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000005',
     'Gold', 'prospective', false, null, null, 4, null),
  -- cancelled mixer
  ('e1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000006',
     'Bronze', 'declined', false, null, null, 0, null)
on conflict do nothing;

insert into public.advertising (id, name, description, active) values
  ('f1000000-0000-0000-0000-000000000001', 'Event banner logo',      'Logo on entrance and main-stage banners',            true),
  ('f1000000-0000-0000-0000-000000000002', 'Social media post',      'Dedicated sponsor post on Instagram and Facebook',   true),
  ('f1000000-0000-0000-0000-000000000003', 'Newsletter feature',     'Sponsor spotlight in the monthly newsletter',        true),
  ('f1000000-0000-0000-0000-000000000004', 'Website logo placement', 'Logo on the partners page for the agreement term',   true),
  ('f1000000-0000-0000-0000-000000000005', 'Booth space',            '10x10 booth at the event',                           true),
  ('f1000000-0000-0000-0000-000000000006', 'Radio spot',             '30-second community radio mention (retired)',        false)
on conflict do nothing;

insert into public.sponsor_advertising
  (id, sponsor_id, advertising_id, event_id, quantity, due_at, status, completed_at, notes) values
  -- open: these drive the "Advertising" view
  ('f2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001',
     'c1000000-0000-0000-0000-000000000003', 1, now() + interval '3 days',  'upcoming', null, 'Print vendor needs a vector logo.'),
  ('f2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000002',
     'c1000000-0000-0000-0000-000000000003', 3, now() - interval '1 day',   'due',      null, 'One post a week leading up to the festival.'),
  ('f2000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000004',
     null,                                   1, now() + interval '20 days', 'upcoming', null, null),
  ('f2000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002',
     'c1000000-0000-0000-0000-000000000003', 2, now() + interval '2 days',  'due',      null, null),
  ('f2000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000005',
     'c1000000-0000-0000-0000-000000000003', 1, now() + interval '9 days',  'upcoming', null, 'Needs a power hookup.'),
  ('f2000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000003',
     'c1000000-0000-0000-0000-000000000003', 1, now() - interval '4 days',  'due',      null, null),
  ('f2000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000001',
     'c1000000-0000-0000-0000-000000000004', 1, now() + interval '40 days', 'upcoming', null, null),
  ('f2000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000003',
     null,                                   1, null,                       'upcoming', null, 'Date to be agreed with sponsor.'),
  -- closed: should NOT appear in the open list
  ('f2000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001',
     'c1000000-0000-0000-0000-000000000001', 1, now() - interval '205 days', 'completed', now() - interval '206 days', null),
  ('f2000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000003',
     'c1000000-0000-0000-0000-000000000002', 1, now() - interval '110 days', 'completed', now() - interval '112 days', null),
  ('f2000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000002',
     'c1000000-0000-0000-0000-000000000006', 1, now() + interval '25 days', 'cancelled', null, 'Sponsor declined.')
on conflict do nothing;

commit;

-- ---------------------------------------------------------------------------
-- Remove all dummy data (sponsors cascade to agreements, sponsor_events and
-- sponsor_advertising, so delete them first):
--
-- delete from public.sponsors     where id::text like 'a1000000-%';
-- delete from public.events       where id::text like 'c1000000-%';
-- delete from public.event_series where id::text like 'b1000000-%';
-- delete from public.advertising  where id::text like 'f1000000-%';
-- ---------------------------------------------------------------------------
