-- Canonical command-service state. Existing normalized tables remain legacy QR/schema
-- foundations; new portal operations use this one versioned store across both clients.
-- Only the Edge service may read/write it. Clients never submit authoritative state.
create table public.club_runtime (
  club_id uuid primary key references public.clubs(id) on delete restrict,
  revision bigint not null default 0,
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  updated_at timestamptz not null default now()
);
alter table public.club_runtime enable row level security;
revoke all on public.club_runtime from public, authenticated;
-- service_role exists in Supabase; the isolated CI fixture creates it for tests.
grant select, insert, update on public.club_runtime to service_role;

-- Derived identity directory: list a person's clubs without reading every club blob.
create table public.club_runtime_members (
  club_id uuid not null references public.club_runtime(club_id) on delete cascade,
  user_id text not null,
  primary key (club_id,user_id)
);
create index club_runtime_members_user_idx on public.club_runtime_members(user_id);
alter table public.club_runtime_members enable row level security;
revoke all on public.club_runtime_members from public, authenticated;
grant select on public.club_runtime_members to service_role;
create function public.sync_runtime_directory() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.club_runtime_members where club_id=new.club_id;
  insert into public.club_runtime_members(club_id,user_id)
    select new.club_id,new.state->>'owner'
    union select new.club_id,p->>'id' from jsonb_array_elements(new.state->'people') p;
  return new;
end $$;
revoke all on function public.sync_runtime_directory() from public,authenticated;
create trigger sync_club_runtime_directory after insert or update of state on public.club_runtime
for each row execute function public.sync_runtime_directory();

create function public.commit_club_runtime(p_club uuid, expected_revision bigint, next_state jsonb)
returns bigint language plpgsql security definer set search_path = '' as $$
declare committed bigint;
begin
  if next_state->>'club' is distinct from p_club::text
    or (next_state->>'version')::bigint <> expected_revision + 1
    or jsonb_typeof(next_state->'people') <> 'array'
    or next_state->>'schema' <> '1' then raise exception 'Invalid club state'; end if;
  if exists (
    select 1 from jsonb_array_elements(next_state#>'{board,requests}') r
    where r->>'status'='confirmed' or (r->>'status'='pending' and (r->>'holdUntil')::numeric > extract(epoch from clock_timestamp())*1000)
    group by r->>'sessionId',r->>'playerId' having count(*)>1
  ) or exists (
    select 1 from jsonb_array_elements(next_state#>'{board,requests}') r
    where r->>'status'='confirmed' or (r->>'status'='pending' and (r->>'holdUntil')::numeric > extract(epoch from clock_timestamp())*1000)
    group by r->>'sessionId',r->>'tableId',r->>'place' having count(*)>1
  ) or exists (
    select 1 from jsonb_array_elements(next_state#>'{board,requests}') r
    where (r->>'place')::integer not between 0 and 3
  ) then raise exception 'Conflicting player-place inventory' using errcode='23514'; end if;
  update public.club_runtime set state = next_state, revision = expected_revision + 1, updated_at = now()
  where club_id = p_club and revision = expected_revision
    and state->>'owner' = next_state->>'owner'
  returning revision into committed;
  if committed is null then raise exception 'Conflict: refresh and retry the operation' using errcode = '40001'; end if;
  return committed;
end $$;
revoke all on function public.commit_club_runtime(uuid,bigint,jsonb) from public, authenticated;
grant execute on function public.commit_club_runtime(uuid,bigint,jsonb) to service_role;

-- Default reminder correction; old migrations remain immutable.
alter table public.memberships alter column renewal_reminders set default array[]::smallint[];

-- Conservative application email budget shared by all clubs, independent of Auth SMTP.
create table public.club_email_usage(day date primary key, attempts integer not null check(attempts >= 0));
alter table public.club_email_usage enable row level security;
revoke all on public.club_email_usage from public,authenticated;
grant select on public.club_email_usage to service_role;
create function public.reserve_club_email(p_day date,p_limit integer) returns boolean
language plpgsql security definer set search_path = '' as $$
declare reserved integer;
begin
  if p_limit < 1 or p_limit > 100000 then raise exception 'Invalid delivery budget'; end if;
  insert into public.club_email_usage(day,attempts) values(p_day,1)
  on conflict(day) do update set attempts=public.club_email_usage.attempts+1
    where public.club_email_usage.attempts < p_limit
  returning attempts into reserved;
  return reserved is not null;
end $$;
revoke all on function public.reserve_club_email(date,integer) from public,authenticated;
grant execute on function public.reserve_club_email(date,integer) to service_role;

create function public.club_for_join(p_code text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('id',c.id,'name',c.name) from public.clubs c
  where c.is_active and upper(c.public_join_code)=upper(trim(p_code)) limit 1;
$$;
revoke all on function public.club_for_join(text) from public,authenticated;
grant execute on function public.club_for_join(text) to service_role;
