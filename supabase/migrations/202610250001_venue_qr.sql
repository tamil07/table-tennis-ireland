-- Rotating venue QR: only hashes are stored; possession never replaces identity checks.
alter table public.attendance drop constraint attendance_source_check;
alter table public.attendance add constraint attendance_source_check
  check (source in ('nfc','printed_qr','digital_qr','manual','trial','venue_qr'));
create table public.venue_qr_challenges (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id),
  occurrence_id uuid not null references public.session_occurrences(id),
  secret_hash text not null unique,
  expires_at timestamptz not null,
  created_by uuid not null references public.profiles(id)
);
alter table public.venue_qr_challenges enable row level security;
create unique index venue_membership_alert_once on public.admin_work_items
  (club_id, subject_user_id, (detail->>'occurrence_id')) where kind = 'venue_membership';

create function public.issue_venue_qr(occurrence uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s public.session_occurrences; token text; expiry timestamptz; actor uuid;
begin
  select * into s from public.session_occurrences where id = occurrence for share;
  if not found or not public.has_club_role(s.club_id, array['admin','coach','scanner_operator']::public.club_role[]) then
    raise exception 'Staff access required';
  end if;
  if s.status <> 'open' or now() < s.starts_at or s.ends_at is null or now() >= s.ends_at then
    raise exception 'Session is not open for attendance';
  end if;
  select id into actor from public.profiles where auth_user_id = auth.uid();
  token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  expiry := least(now() + interval '90 seconds', s.ends_at);
  -- Retain the previous code until its own expiry to allow an in-flight scan.
  delete from public.venue_qr_challenges where expires_at <= now();
  insert into public.venue_qr_challenges(club_id, occurrence_id, secret_hash, expires_at, created_by)
  values(s.club_id, s.id, encode(sha256(token::bytea),'hex'), expiry, actor);
  return jsonb_build_object('token', token, 'expires_at', expiry);
end $$;

create function public.venue_qr_context(token text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare c public.venue_qr_challenges; s public.session_occurrences; actor uuid; people jsonb;
begin
  select id into actor from public.profiles where auth_user_id = auth.uid();
  if actor is null then raise exception 'Sign in with a linked player profile first'; end if;
  select * into c from public.venue_qr_challenges where secret_hash = encode(sha256(token::bytea),'hex') and expires_at > now();
  if not found then raise exception 'QR expired or invalid. Scan the current club display'; end if;
  select * into s from public.session_occurrences where id = c.occurrence_id for share;
  if s.club_id <> c.club_id or s.status <> 'open' or now() < s.starts_at or s.ends_at is null or now() >= s.ends_at then
    raise exception 'Session is not open for attendance';
  end if;
  select jsonb_agg(jsonb_build_object('id', p.id, 'name', p.display_name)) into people
  from public.profiles p where
    (p.id = actor and exists(select 1 from public.club_roles r where r.club_id = c.club_id and r.user_id = actor and r.revoked_at is null and r.role in ('player','coach','admin')))
    or exists(select 1 from public.guardian_links g where g.club_id = c.club_id and g.guardian_id = actor and g.junior_id = p.id and g.status = 'active');
  return jsonb_build_object('club', (select name from public.clubs where id = c.club_id),
    'session', coalesce((select title from public.session_definitions where id = s.session_definition_id), 'Club session'),
    'expires_at', c.expires_at, 'participants', coalesce(people, '[]'::jsonb));
end $$;

create function public.check_in_venue_qr(token text, participant uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare context jsonb; c public.venue_qr_challenges; actor uuid; m public.memberships;
  attendance_id uuid; membership public.membership_state; follow_up boolean; local_day date;
begin
  context := public.venue_qr_context(token);
  if not exists(select 1 from jsonb_array_elements(context->'participants') p where p->>'id' = participant::text) then
    raise exception 'You cannot check in this participant';
  end if;
  select * into c from public.venue_qr_challenges where secret_hash = encode(sha256(token::bytea),'hex') and expires_at > now();
  if not found then raise exception 'QR expired. Scan the current club display'; end if;
  select id into actor from public.profiles where auth_user_id = auth.uid();
  local_day := (now() at time zone (select timezone from public.clubs where id = c.club_id))::date;
  select * into m from public.memberships where club_id = c.club_id and user_id = participant
    and state = 'active' and starts_on <= local_day and ends_on >= local_day order by ends_on desc limit 1;
  if found then membership := 'active';
  elsif exists(select 1 from public.memberships where club_id = c.club_id and user_id = participant
      and state in ('active','expired') and ends_on < local_day) then membership := 'expired';
  else membership := null; end if;
  -- Trial/no-current-membership attendance is retained for staff review, never grants entitlements.
  follow_up := membership is distinct from 'active'::public.membership_state;
  insert into public.attendance(club_id, occurrence_id, user_id, source, membership_state_at_checkin,
    needs_membership_follow_up, recorded_by, idempotency_key)
  values(c.club_id, c.occurrence_id, participant, 'venue_qr', membership, follow_up, actor,
    'venue:' || c.occurrence_id || ':' || participant)
  on conflict (occurrence_id, user_id) do nothing returning id into attendance_id;
  if attendance_id is null then return jsonb_build_object('status','already_checked_in'); end if;
  if follow_up then
    insert into public.admin_work_items(club_id, kind, subject_user_id, title, detail)
    values(c.club_id,'venue_membership',participant,'Attendance requires membership review',
      jsonb_build_object('occurrence_id',c.occurrence_id,'membership_state',membership)) on conflict do nothing;
  end if;
  insert into public.audit_events(club_id,actor_id,action,entity_type,entity_id,after_data)
  values(c.club_id,actor,'venue_qr_check_in','attendance',attendance_id::text,
    jsonb_build_object('participant',participant,'confirmed_at',now()));
  return jsonb_build_object('status','checked_in','needs_membership_follow_up',follow_up);
end $$;

create function public.venue_qr_sessions() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'name',c.name || ' · ' || coalesce(d.title,'Club session'))), '[]'::jsonb)
  from public.session_occurrences s join public.clubs c on c.id = s.club_id
  left join public.session_definitions d on d.id = s.session_definition_id
  where s.status = 'open' and s.starts_at <= now() and s.ends_at > now()
    and public.has_club_role(s.club_id,array['admin','coach','scanner_operator']::public.club_role[]);
$$;
revoke all on function public.issue_venue_qr(uuid), public.venue_qr_context(text), public.check_in_venue_qr(text,uuid), public.venue_qr_sessions() from public;
grant execute on function public.issue_venue_qr(uuid), public.venue_qr_context(text), public.check_in_venue_qr(text,uuid), public.venue_qr_sessions() to authenticated;
