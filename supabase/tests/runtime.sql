-- Isolated plain Postgres tests; no live account or hosted endpoint required.
begin;
insert into public.clubs(id,slug,name,county,public_join_code) values ('80000000-0000-4000-8000-000000000001','runtime-test','Runtime test','Cork','RUNTIME-TEST');
insert into public.club_runtime(club_id,state) values ('80000000-0000-4000-8000-000000000001','{"club":"80000000-0000-4000-8000-000000000001","schema":1,"version":0,"owner":"owner","people":[]}');
set local role authenticated;
do $$ begin
  begin perform state from public.club_runtime; raise exception 'Authenticated raw read was allowed'; exception when insufficient_privilege then null; end;
  begin perform public.commit_club_runtime('80000000-0000-4000-8000-000000000001',0,'{}'); raise exception 'Authenticated state write was allowed'; exception when insufficient_privilege then null; end;
  begin perform public.reserve_club_email(current_date,1); raise exception 'Authenticated mail-budget write was allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role service_role;
select public.commit_club_runtime('80000000-0000-4000-8000-000000000001',0,'{"club":"80000000-0000-4000-8000-000000000001","schema":1,"version":1,"owner":"owner","people":[]}');
do $$ begin
  begin perform public.commit_club_runtime('80000000-0000-4000-8000-000000000001',0,'{"club":"80000000-0000-4000-8000-000000000001","schema":1,"version":1,"owner":"owner","people":[]}'); raise exception 'Stale revision was accepted'; exception when serialization_failure then null; end;
  begin perform public.commit_club_runtime('80000000-0000-4000-8000-000000000001',1,'{"club":"80000000-0000-4000-8000-000000000001","schema":1,"version":2,"owner":"attacker","people":[]}'); raise exception 'Owner was replaced'; exception when serialization_failure then null; end;
  begin perform public.commit_club_runtime('80000000-0000-4000-8000-000000000001',1,'{"club":"80000000-0000-4000-8000-000000000001","schema":1,"version":2,"owner":"owner","people":[],"board":{"requests":[{"sessionId":"s","playerId":"p","tableId":1,"place":0,"status":"confirmed"},{"sessionId":"s","playerId":"p","tableId":1,"place":1,"status":"confirmed"}]}}'); raise exception 'Duplicate player reservation was accepted'; exception when check_violation then null; end;
  if (select revision from public.club_runtime where club_id='80000000-0000-4000-8000-000000000001') <> 1 then raise exception 'Failed commits modified the row'; end if;
  if not public.reserve_club_email(current_date,1) then raise exception 'First budget reservation denied'; end if;
  if public.reserve_club_email(current_date,1) then raise exception 'Daily budget exceeded'; end if;
  if (select count(*) from public.club_runtime_members where club_id='80000000-0000-4000-8000-000000000001' and user_id='owner') <> 1 then raise exception 'Identity directory not derived'; end if;
end $$;
reset role;
rollback;
