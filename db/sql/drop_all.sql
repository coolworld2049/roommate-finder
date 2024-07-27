-- drop all tables
do
  $$ declare
    r record;
begin
    for r in (select tablename from pg_tables where schemaname = 'public') loop
        execute 'drop table if exists ' || quote_ident(r.tablename) || ' cascade';
        execute 'drop view if exists ' || quote_ident(r.tablename) || ' cascade';
    end loop;
end $$;

-- drop all functions
do
  $$ declare
    r record;
begin
    for r in (select proname from pg_proc where pronamespace = 'public'::regnamespace) loop
        execute 'drop function if exists ' || quote_ident(r.proname) || ' cascade';
    end loop;
end $$;

-- drop all triggers
do
  $$ declare
    r record;
begin
    for r in (select tgname from pg_trigger where tgrelid in (select oid from pg_class where relnamespace = 'public'::regnamespace)) loop
        execute 'drop trigger if exists ' || quote_ident(r.tgname) || ' on ' || quote_ident((select relname from pg_class where oid = tgrelid)) || ' cascade';
    end loop;
end $$;

-- drop all enums
do
  $$ declare
    r record;
begin
    for r in (select enumtypid::regtype::text as enum_name from pg_enum where enumtypid::regtype::text in (select typname from pg_type where typnamespace = 'public'::regnamespace)) loop
        execute 'drop type if exists ' || quote_ident(r.enum_name) || ' cascade';
    end loop;
end $$;