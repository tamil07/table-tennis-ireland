-- Actual RPC regression checks; run as postgres after migrations. All fixtures roll back.
begin;
insert into auth.users(id) values ('90000000-0000-4000-8000-000000000001'),('90000000-0000-4000-8000-000000000002');
insert into public.profiles(id,auth_user_id,display_name) values
 ('91000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001','Test staff'),
 ('91000000-0000-4000-8000-000000000002','90000000-0000-4000-8000-000000000002','Test player'),
 ('91000000-0000-4000-8000-000000000003',null,'Test child');
insert into public.clubs(id,slug,name,county,public_join_code) values ('92000000-0000-4000-8000-000000000001','qr-test','QR test','Cork','QRTEST');
insert into public.club_roles(club_id,user_id,role) values
 ('92000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001','coach'),
 ('92000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000002','player');
insert into public.guardian_links(club_id,guardian_id,junior_id) values ('92000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000002','91000000-0000-4000-8000-000000000003');
insert into public.session_occurrences(id,club_id,starts_at,ends_at,status) values ('93000000-0000-4000-8000-000000000001','92000000-0000-4000-8000-000000000001',now()-interval '1 hour',now()+interval '1 hour','open');
insert into public.clubs(id,slug,name,county,public_join_code) values ('92000000-0000-4000-8000-000000000002','qr-other','Other club','Dublin','QROTHER');
insert into public.session_occurrences(id,club_id,starts_at,ends_at,status) values ('93000000-0000-4000-8000-000000000002','92000000-0000-4000-8000-000000000002',now()-interval '1 hour',now()+interval '1 hour','open');
insert into public.memberships(club_id,user_id,state,starts_on,ends_on) values
 ('92000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000002','active',current_date-1,current_date+30),
 ('92000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000003','expired',current_date-30,current_date-1);
create function pg_temp.must_fail(statement text) returns void language plpgsql as $$
begin
 begin execute statement; exception when others then return; end;
 raise exception 'Expected refusal: %',statement;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000001',true);
select set_config('test.qr',public.issue_venue_qr('93000000-0000-4000-8000-000000000001')->>'token',true);
select pg_temp.must_fail($s$select public.issue_venue_qr('93000000-0000-4000-8000-000000000002')$s$);
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000002',true);
select pg_temp.must_fail($s$select public.issue_venue_qr('93000000-0000-4000-8000-000000000001')$s$);
select pg_temp.must_fail($s$select public.check_in_venue_qr(current_setting('test.qr'),'91000000-0000-4000-8000-000000000001')$s$);
select pg_temp.must_fail($s$select public.venue_qr_context('invalid')$s$);
do $$ begin
 if public.check_in_venue_qr(current_setting('test.qr'),'91000000-0000-4000-8000-000000000002')->>'status' <> 'checked_in' then raise exception 'Check-in failed'; end if;
 if public.check_in_venue_qr(current_setting('test.qr'),'91000000-0000-4000-8000-000000000002')->>'status' <> 'already_checked_in' then raise exception 'Duplicate failed'; end if;
end $$;
select public.check_in_venue_qr(current_setting('test.qr'),'91000000-0000-4000-8000-000000000003');
reset role;
do $$ begin
 if (select count(*) from public.attendance where club_id='92000000-0000-4000-8000-000000000001') <> 2 then raise exception 'Attendance count'; end if;
 if (select count(*) from public.admin_work_items where club_id='92000000-0000-4000-8000-000000000001') <> 1 then raise exception 'Alert count'; end if;
 if (select count(*) from public.audit_events where club_id='92000000-0000-4000-8000-000000000001') <> 2 then raise exception 'Audit count'; end if;
 if not exists(select 1 from public.attendance where user_id='91000000-0000-4000-8000-000000000002' and membership_state_at_checkin='active' and not needs_membership_follow_up) then raise exception 'Active classification'; end if;
 if not exists(select 1 from public.attendance where user_id='91000000-0000-4000-8000-000000000003' and membership_state_at_checkin='expired' and needs_membership_follow_up) then raise exception 'Expired classification'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000001',true);
select public.check_in_venue_qr(current_setting('test.qr'),'91000000-0000-4000-8000-000000000001');
reset role;
do $$ begin
 if not exists(select 1 from public.attendance where user_id='91000000-0000-4000-8000-000000000001' and membership_state_at_checkin is null and needs_membership_follow_up) then raise exception 'No membership classification'; end if;
end $$;
select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000002',true);
update public.guardian_links set status='revoked' where club_id='92000000-0000-4000-8000-000000000001';
set local role authenticated;
select pg_temp.must_fail($s$select public.check_in_venue_qr(current_setting('test.qr'),'91000000-0000-4000-8000-000000000003')$s$);
reset role;
update public.session_occurrences set status='cancelled' where id='93000000-0000-4000-8000-000000000001';
set local role authenticated;
select pg_temp.must_fail($s$select public.venue_qr_context(current_setting('test.qr'))$s$);
reset role;
update public.session_occurrences set status='open' where id='93000000-0000-4000-8000-000000000001';
update public.venue_qr_challenges set expires_at=now()-interval '1 second';
set local role authenticated;
select pg_temp.must_fail($s$select public.venue_qr_context(current_setting('test.qr'))$s$);
select set_config('request.jwt.claim.sub','',true);
select pg_temp.must_fail($s$select public.venue_qr_context(current_setting('test.qr'))$s$);
reset role;
rollback;
