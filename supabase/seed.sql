-- Safe synthetic local-development seed. Never place live member data here.
insert into public.clubs (id, slug, name, county, public_join_code, is_active, branding, settings)
values
  ('00000000-0000-4000-8000-000000000001', 'leeside', 'Leeside Table Tennis Club', 'Cork', 'LEESIDE', true,
   '{"primary":"#103a2e","accent":"#d7ff55"}',
   '{"renewal_reminders":[10,3],"daily_digest_time":"21:30"}'),
  ('00000000-0000-4000-8000-000000000002', 'dublin-demo', 'Dublin Demo Table Tennis Club', 'Dublin', 'DUBLIN-DEMO', false,
   '{"primary":"#182b52","accent":"#ffcf5c"}', '{}')
on conflict (id) do nothing;

insert into public.club_domains (club_id, hostname, verified_at, is_primary)
values ('00000000-0000-4000-8000-000000000001', 'leesidett.example', now(), true)
on conflict (hostname) do nothing;

insert into public.membership_types (club_id, name, description, price_cents, duration_days)
values
  ('00000000-0000-4000-8000-000000000001', 'Full membership', 'Access according to Leeside full-membership rules.', null, 365),
  ('00000000-0000-4000-8000-000000000001', 'Partial membership', 'Access according to Leeside partial-membership rules.', null, 365),
  ('00000000-0000-4000-8000-000000000001', 'Pay as you go', 'Attendance paid outside the platform.', null, 1)
on conflict (club_id, name) do nothing;
