-- Initial multi-club schema for the launch-cork-club-platform OpenSpec change.
-- Every operational record is explicitly club-scoped. Client-provided club IDs
-- are never authorization by themselves; RLS resolves access from club_roles.

create extension if not exists pgcrypto;

create type public.club_role as enum ('player', 'guardian', 'coach', 'admin', 'scanner_operator');
create type public.membership_state as enum ('pending', 'trial', 'active', 'expired', 'cancelled');
create type public.payment_state as enum ('unpaid', 'partially_paid', 'paid', 'waived');
create type public.match_state as enum ('in_progress', 'awaiting_opponent_review', 'changes_requested', 'confirmed', 'auto_approved', 'incomplete');
create type public.tournament_state as enum ('draft', 'published', 'in_progress', 'completed', 'cancelled');
create type public.tournament_format as enum ('round_robin', 'single_elimination');
create type public.work_state as enum ('open', 'claimed', 'resolved');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  display_name text not null check (length(trim(display_name)) between 1 and 120),
  date_of_birth date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profile_contacts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('email', 'mobile')),
  value text not null,
  normalized_value text not null,
  is_primary boolean not null default false,
  is_login_identifier boolean not null default false,
  notification_consent boolean not null default false,
  verified_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (profile_id, kind, normalized_value)
);
create unique index profile_contacts_one_primary_idx
  on public.profile_contacts (profile_id)
  where is_primary and revoked_at is null;
create unique index profile_contacts_unique_login_idx
  on public.profile_contacts (kind, normalized_value)
  where is_login_identifier and revoked_at is null;

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  county text not null,
  timezone text not null default 'Europe/Dublin',
  public_join_code text not null unique,
  is_active boolean not null default false,
  branding jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.club_domains (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  hostname text not null unique,
  verified_at timestamptz,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.club_roles (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.club_role not null,
  granted_by uuid references public.profiles(id),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (club_id, user_id, role)
);

create table public.guardian_links (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  guardian_id uuid not null references public.profiles(id) on delete cascade,
  junior_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('pending', 'active', 'revoked')),
  created_at timestamptz not null default now(),
  unique (club_id, guardian_id, junior_id)
);

create table public.website_pages (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  kind text not null check (kind in ('page', 'news', 'policy', 'event', 'contact')),
  slug text not null,
  title text not null,
  summary text,
  body jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  published_at timestamptz,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now(),
  unique (club_id, kind, slug)
);

create table public.membership_types (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  name text not null,
  description text,
  price_cents integer check (price_cents >= 0),
  duration_days integer check (duration_days > 0),
  attendance_rules jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  unique (club_id, name)
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  membership_type_id uuid references public.membership_types(id),
  state public.membership_state not null default 'pending',
  payment_state public.payment_state not null default 'unpaid',
  starts_on date,
  ends_on date,
  renewal_reminders smallint[] not null default array[10, 3]::smallint[],
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on),
  check (renewal_reminders <@ array[10, 3]::smallint[])
);
create index memberships_club_user_idx on public.memberships (club_id, user_id, created_at desc);

create table public.manual_payments (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  membership_id uuid not null references public.memberships(id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'EUR' check (currency = 'EUR'),
  received_on date not null,
  method text,
  external_reference text,
  note text,
  recorded_by uuid not null references public.profiles(id),
  recorded_at timestamptz not null default now()
);

create table public.session_definitions (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  title text not null,
  audience text,
  weekday smallint check (weekday between 0 and 6),
  starts_at time,
  ends_at time,
  venue text,
  capacity integer check (capacity > 0),
  is_active boolean not null default true
);

create table public.session_occurrences (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  session_definition_id uuid references public.session_definitions(id),
  starts_at timestamptz not null,
  ends_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled', 'open', 'completed', 'cancelled')),
  capacity integer check (capacity > 0)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  occurrence_id uuid not null references public.session_occurrences(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  booked_by uuid not null references public.profiles(id),
  status text not null default 'booked' check (status in ('booked', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (occurrence_id, user_id)
);

create table public.attendance_credentials (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('nfc', 'printed_qr', 'digital_qr', 'trial')),
  secret_hash text not null unique,
  expires_at timestamptz,
  revoked_at timestamptz,
  issued_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  occurrence_id uuid not null references public.session_occurrences(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  source text not null check (source in ('nfc', 'printed_qr', 'digital_qr', 'manual', 'trial')),
  membership_state_at_checkin public.membership_state,
  needs_membership_follow_up boolean not null default false,
  recorded_by uuid references public.profiles(id),
  idempotency_key text not null unique,
  unique (occurrence_id, user_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  occurrence_id uuid references public.session_occurrences(id),
  tournament_id uuid,
  state public.match_state not null default 'in_progress',
  event_type text not null check (event_type in ('singles', 'doubles')),
  best_of smallint not null check (best_of in (1, 3, 5, 7)),
  table_number text,
  submitted_at timestamptz,
  review_deadline timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.match_participants (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  side smallint not null check (side in (1, 2)),
  position smallint not null check (position in (1, 2)),
  user_id uuid references public.profiles(id),
  guest_name text,
  check ((user_id is null) <> (guest_name is null)),
  unique (match_id, side, position)
);

create table public.match_games (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  game_number smallint not null check (game_number > 0),
  side_one_score smallint not null check (side_one_score >= 0),
  side_two_score smallint not null check (side_two_score >= 0),
  unique (match_id, game_number)
);

create table public.match_reviews (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id),
  decision text not null check (decision in ('approved', 'changes_requested', 'coach_resolved')),
  reason text,
  created_at timestamptz not null default now()
);

create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  name text not null,
  format public.tournament_format not null,
  event_type text not null check (event_type in ('singles', 'doubles')),
  state public.tournament_state not null default 'draft',
  occurrence_id uuid references public.session_occurrences(id),
  rules jsonb not null default '{}'::jsonb,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);
alter table public.matches add constraint matches_tournament_fk foreign key (tournament_id) references public.tournaments(id);

create table public.tournament_entries (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  seed smallint,
  participant_data jsonb not null,
  checked_in_at timestamptz
);

create table public.tournament_delegations (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  granted_by uuid not null references public.profiles(id),
  expires_at timestamptz,
  revoked_at timestamptz,
  unique (tournament_id, user_id)
);

create table public.coach_notes (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  player_id uuid not null references public.profiles(id) on delete cascade,
  coach_id uuid not null references public.profiles(id),
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.development_summaries (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  player_id uuid not null references public.profiles(id) on delete cascade,
  strengths text not null,
  improvements text not null,
  goals text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_by uuid references public.profiles(id),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  recipient_user_id uuid references public.profiles(id),
  recipient_email text not null,
  kind text not null,
  deduplication_key text not null unique,
  payload jsonb not null,
  state text not null default 'pending' check (state in ('pending', 'sending', 'sent', 'failed')),
  attempts integer not null default 0,
  send_after timestamptz not null default now(),
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create table public.admin_work_items (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  kind text not null,
  state public.work_state not null default 'open',
  subject_user_id uuid references public.profiles(id),
  assigned_to uuid references public.profiles(id),
  title text not null,
  detail jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  club_id uuid not null references public.clubs(id) on delete restrict,
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_data jsonb,
  after_data jsonb,
  occurred_at timestamptz not null default now()
);

create or replace function public.has_club_role(requested_club uuid, requested_roles public.club_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.club_roles cr
    where cr.club_id = requested_club
      and cr.user_id = (select p.id from public.profiles p where p.auth_user_id = auth.uid())
      and cr.role = any(requested_roles)
      and cr.revoked_at is null
  );
$$;

revoke all on function public.has_club_role(uuid, public.club_role[]) from public;
grant execute on function public.has_club_role(uuid, public.club_role[]) to authenticated;

alter table public.profiles enable row level security;
alter table public.profile_contacts enable row level security;
alter table public.clubs enable row level security;
alter table public.club_domains enable row level security;
alter table public.club_roles enable row level security;
alter table public.guardian_links enable row level security;
alter table public.website_pages enable row level security;
alter table public.membership_types enable row level security;
alter table public.memberships enable row level security;
alter table public.manual_payments enable row level security;
alter table public.session_definitions enable row level security;
alter table public.session_occurrences enable row level security;
alter table public.bookings enable row level security;
alter table public.attendance_credentials enable row level security;
alter table public.attendance enable row level security;
alter table public.matches enable row level security;
alter table public.match_participants enable row level security;
alter table public.match_games enable row level security;
alter table public.match_reviews enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_entries enable row level security;
alter table public.tournament_delegations enable row level security;
alter table public.coach_notes enable row level security;
alter table public.development_summaries enable row level security;
alter table public.notification_outbox enable row level security;
alter table public.admin_work_items enable row level security;
alter table public.audit_events enable row level security;

create policy "public reads active clubs" on public.clubs for select using (is_active);
create policy "public reads verified domains" on public.club_domains for select using (verified_at is not null);
create policy "public reads published website pages" on public.website_pages for select using (is_published);
create policy "public reads active membership types" on public.membership_types for select using (is_active);
create policy "public reads active session definitions" on public.session_definitions for select using (is_active);

create policy "users read own profile" on public.profiles for select using (auth_user_id = auth.uid());
create policy "users update own profile" on public.profiles for update using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());
create policy "users read own contacts" on public.profile_contacts for select using (profile_id = (select p.id from public.profiles p where p.auth_user_id = auth.uid()));
create policy "users manage own contacts" on public.profile_contacts for all using (profile_id = (select p.id from public.profiles p where p.auth_user_id = auth.uid())) with check (profile_id = (select p.id from public.profiles p where p.auth_user_id = auth.uid()));
create policy "users read own roles" on public.club_roles for select using (user_id = (select p.id from public.profiles p where p.auth_user_id = auth.uid()) or public.has_club_role(club_id, array['admin']::public.club_role[]));
create policy "admins manage roles" on public.club_roles for all using (public.has_club_role(club_id, array['admin']::public.club_role[])) with check (public.has_club_role(club_id, array['admin']::public.club_role[]));
create policy "users read own memberships" on public.memberships for select using (user_id = (select p.id from public.profiles p where p.auth_user_id = auth.uid()) or public.has_club_role(club_id, array['admin']::public.club_role[]));
create policy "admins manage memberships" on public.memberships for all using (public.has_club_role(club_id, array['admin']::public.club_role[])) with check (public.has_club_role(club_id, array['admin']::public.club_role[]));
create policy "users read own attendance" on public.attendance for select using (user_id = (select p.id from public.profiles p where p.auth_user_id = auth.uid()) or public.has_club_role(club_id, array['coach','admin']::public.club_role[]));
create policy "staff manage attendance" on public.attendance for all using (public.has_club_role(club_id, array['coach','admin','scanner_operator']::public.club_role[])) with check (public.has_club_role(club_id, array['coach','admin','scanner_operator']::public.club_role[]));
create policy "club members read matches" on public.matches for select using (public.has_club_role(club_id, array['player','guardian','coach','admin']::public.club_role[]));
create policy "club players create matches" on public.matches for insert with check (created_by = (select p.id from public.profiles p where p.auth_user_id = auth.uid()) and public.has_club_role(club_id, array['player','coach','admin']::public.club_role[]));
create policy "club members read tournaments" on public.tournaments for select using (state <> 'draft' or public.has_club_role(club_id, array['coach','admin']::public.club_role[]));
create policy "staff manage tournaments" on public.tournaments for all using (public.has_club_role(club_id, array['coach','admin']::public.club_role[])) with check (public.has_club_role(club_id, array['coach','admin']::public.club_role[]));
create policy "players read published development" on public.development_summaries for select using ((player_id = (select p.id from public.profiles p where p.auth_user_id = auth.uid()) and status = 'published') or public.has_club_role(club_id, array['coach','admin']::public.club_role[]));
create policy "coaches manage development" on public.development_summaries for all using (public.has_club_role(club_id, array['coach','admin']::public.club_role[])) with check (public.has_club_role(club_id, array['coach','admin']::public.club_role[]));
create policy "coaches manage private notes" on public.coach_notes for all using (public.has_club_role(club_id, array['coach','admin']::public.club_role[])) with check (public.has_club_role(club_id, array['coach','admin']::public.club_role[]));
create policy "admins read work items" on public.admin_work_items for select using (public.has_club_role(club_id, array['admin']::public.club_role[]));
create policy "admins manage work items" on public.admin_work_items for all using (public.has_club_role(club_id, array['admin']::public.club_role[])) with check (public.has_club_role(club_id, array['admin']::public.club_role[]));
create policy "admins read audit" on public.audit_events for select using (public.has_club_role(club_id, array['admin']::public.club_role[]));

-- Remaining table-specific write policies are intentionally added alongside each
-- feature implementation. With RLS enabled and no policy, access is denied by default.
