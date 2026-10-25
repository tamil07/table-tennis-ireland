-- CI-only auth stubs for plain Postgres. Never apply to a Supabase project.
create schema auth;
create role authenticated;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
grant usage on schema auth, public to authenticated;
grant execute on function auth.uid() to authenticated;
