select
  t.typname as enum_name,
  string_agg(
    e.enumlabel,
    ', '
    order by
      e.enumsortorder
  ) as enum_values
from
  pg_type t
  join pg_enum e on t.oid = e.enumtypid
where
  t.typnamespace = 'public' :: regnamespace
group by
  t.typname