-- 0001: make the Supabase tables hold everything the app already uses.
-- Run once in the Supabase SQL editor (safe to run again).
--
-- 1. Adds the three columns the app stores that the tables were missing.
-- 2. Lets the text "status" style columns accept the values the app uses
--    (it drops any old CHECK on those columns and adds one that allows both
--    the old values and the app's values, so existing rows stay valid).

begin;

-- 1. Missing columns -------------------------------------------------------

-- Events: how many people are expected (the event form's Attendees field).
alter table public.events add column if not exists attendees integer;

-- Tasks: optional start / end time (the task form's time fields).
alter table public.tasks add column if not exists start_time time without time zone;
alter table public.tasks add column if not exists end_time time without time zone;

-- 2. Allowed values ---------------------------------------------------------

-- Drop whatever CHECK constraints exist on these columns (their names vary).
do $$
declare
  r record;
begin
  for r in
    select c.conrelid::regclass as tbl, c.conname
    from pg_constraint c
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
    where c.contype = 'c'
      and c.connamespace = 'public'::regnamespace
      and (c.conrelid::regclass::text || '.' || a.attname) in (
        'sponsors.status', 'sponsors.level', 'sponsor_agreements.status',
        'profiles.role', 'events.category', 'events.attendees'
      )
  loop
    execute format('alter table %s drop constraint if exists %I', r.tbl, r.conname);
  end loop;
end $$;

alter table public.sponsors add constraint sponsors_status_check
  check (status in ('draft', 'active', 'inactive', 'prospective'));

alter table public.sponsors add constraint sponsors_level_check
  check (level is null or level in ('platinum', 'gold', 'silver', 'bronze'));

alter table public.sponsor_agreements add constraint sponsor_agreements_status_check
  check (status in ('draft', 'active', 'completed', 'pending_renewal', 'expired', 'cancelled'));

alter table public.profiles add constraint profiles_role_check
  check (role in ('admin', 'staff', 'guest'));

alter table public.events add constraint events_category_check
  check (category is null or category in ('networking', 'workshop', 'meeting', 'fundraiser', 'other'))
  not valid; -- not valid: older rows with other categories are left alone

alter table public.events add constraint events_attendees_check
  check (attendees is null or attendees >= 0);

commit;
