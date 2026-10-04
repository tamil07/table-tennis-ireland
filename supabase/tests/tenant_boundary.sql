-- Run with `supabase test db` after adding local auth fixtures.
-- OpenSpec traceability: identity-and-access / club data boundary.
begin;

select plan(4);

select has_table('public', 'club_roles', 'club roles exist');
select is(
  (select relrowsecurity from pg_class where oid = 'public.club_roles'::regclass),
  true,
  'club roles are protected by RLS'
);

select has_table('public', 'profile_contacts', 'profile contact methods exist separately');
select is(
  (select relrowsecurity from pg_class where oid = 'public.profile_contacts'::regclass),
  true,
  'profile contacts are protected by RLS'
);

select * from finish();
rollback;
