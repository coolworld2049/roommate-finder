alter role
  authenticator
set
  pgrst.db_aggregates_enabled = 'true';

notify
  pgrst,
  'reload config';

create extension
  if not exists moddatetime schema extensions;

drop extension
  if exists pg_cron;

create extension
  pg_cron
with
  schema extensions;

grant
  usage on schema cron to postgres;

grant
  all privileges on all tables in schema cron to postgres;