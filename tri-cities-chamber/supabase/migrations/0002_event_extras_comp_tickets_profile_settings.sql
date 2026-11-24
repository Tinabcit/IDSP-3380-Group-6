-- 0002: store the data that main added after the move to Supabase.
-- Run once in the Supabase SQL editor, after 0001 (safe to run again).
--
-- 1. events: the extra fields from the Add Event page / edit pop-up
--    (picture, deadline, priority, labels, reminders, guests, tickets and the
--    full list of sponsor names).
-- 2. event_comp_tickets: the comp ticket list inside an event.
-- 3. sponsor_comp_tickets: the tickets made with "Give Comp Tickets" on the
--    Partners page (until now they only lived in the page and were lost on reload).
-- 4. profiles: the Settings page's display email and profile picture.

begin;

-- 1. Event extras -----------------------------------------------------------

alter table public.events add column if not exists picture text;
alter table public.events add column if not exists deadline date;
alter table public.events add column if not exists priority smallint;
alter table public.events add column if not exists labels text[] not null default '{}';
alter table public.events add column if not exists reminders text[] not null default '{}';
alter table public.events add column if not exists guests text[] not null default '{}';
alter table public.events add column if not exists tickets text[] not null default '{}';
alter table public.events add column if not exists sponsor_names text[] not null default '{}';

alter table public.events drop constraint if exists events_priority_check;
alter table public.events add constraint events_priority_check
  check (priority is null or priority between 1 and 6);

alter table public.events drop constraint if exists events_reminders_check;
alter table public.events add constraint events_reminders_check
  check (reminders <@ array['day-before', 'week-before', 'on-date']::text[]);

-- 2. Comp tickets inside an event ---------------------------------------------

create table if not exists public.event_comp_tickets (
    id uuid primary key default gen_random_uuid(),
    event_id uuid not null
        references public.events(id) on delete cascade,
    recipient text not null,
    ticket_type text not null,
    quantity integer not null check (quantity >= 1),
    status text not null default 'Issued'
        check (status in ('Draft', 'Issued')),
    position integer not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists idx_event_comp_tickets_event
    on public.event_comp_tickets(event_id);

-- 3. Comp tickets from the Partners page ---------------------------------------

create table if not exists public.sponsor_comp_tickets (
    id uuid primary key default gen_random_uuid(),
    -- The name typed in the dialog (free text, like the app). sponsor_id is
    -- filled in when the name matches a sponsor, so the row can be joined.
    sponsor_name text not null,
    sponsor_id uuid
        references public.sponsors(id) on delete set null,
    recipient text not null default '',
    quantity integer not null check (quantity >= 1),
    ticket_type text not null,
    event_name text not null default '',
    location text not null default '',
    plus_one boolean not null default false,
    vip_lounge boolean not null default false,
    backstage boolean not null default false,
    notes text,
    status text not null default 'Draft'
        check (status in ('Draft', 'Issued')),
    created_at timestamptz not null default now()
);

create index if not exists idx_sponsor_comp_tickets_sponsor
    on public.sponsor_comp_tickets(sponsor_id);

-- 4. Settings page profile fields ------------------------------------------------

-- Kept apart from profiles.email, which is the sign-in email the app uses to
-- find the profile; changing that would make the next sign-in create a new one.
alter table public.profiles add column if not exists contact_email text;
-- The uploaded picture as a data: URL (the page limits it to 1 MB).
alter table public.profiles add column if not exists avatar_url text;

-- Same as the other tables: RLS on. The app talks to the database through
-- Prisma on the server, which is not affected by RLS.
alter table public.event_comp_tickets enable row level security;
alter table public.sponsor_comp_tickets enable row level security;

commit;
