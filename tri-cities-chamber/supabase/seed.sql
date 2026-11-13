-- Starting data the app needs. Run once in the Supabase SQL editor after
-- migrations/0001_match_app_fields.sql. Safe to run again.
--
-- Only the chamber's four pillars are seeded: every event belongs to one and
-- the app has no screen to add them. Staff profiles are created automatically
-- the first time each person signs in with Google. Everything else (partners,
-- events, contracts, tasks) is entered in the app.

insert into public.pillars (id, name, created_at)
select gen_random_uuid(), p.name, now() + (p.ord * interval '1 millisecond')
from (values (1, 'Advocacy'), (2, 'Networking'), (3, 'Education'), (4, 'Community')) as p(ord, name)
where not exists (select 1 from public.pillars x where x.name = p.name);
