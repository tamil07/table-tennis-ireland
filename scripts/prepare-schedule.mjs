import { writeFileSync } from "node:fs";
const secret = process.env.CLUB_JOB_TOKEN;
if (!secret || !/^[a-f0-9]{64}$/.test(secret))
  throw new Error(
    "Run with --env-file=.env.server.local containing the generated CLUB_JOB_TOKEN.",
  );
const sql = `-- PRIVATE generated setup: stores the job token encrypted in Vault. Do not commit.\ncreate extension if not exists pg_cron;\ncreate extension if not exists pg_net;\nselect vault.create_secret('${secret}', 'ttclubs_job_token', 'Scheduled club operations');\nselect cron.schedule('ttclubs-quarter-hour', '*/15 * * * *', $$\nselect net.http_post(url := 'https://mkxqrkqwpvjtkjfjjckm.supabase.co/functions/v1/club-jobs', headers := jsonb_build_object('Content-Type','application/json','x-club-job-token',(select decrypted_secret from vault.decrypted_secrets where name='ttclubs_job_token' order by created_at desc limit 1)), body := '{}'::jsonb);\n$$);\n`;
writeFileSync("supabase/schedule.local.sql", sql, { mode: 0o600 });
console.log(
  "Created private ignored supabase/schedule.local.sql. Run once in SQL Editor after deploying club-jobs. Do not create duplicate schedules.",
);
