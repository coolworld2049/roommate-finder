drop policy
  if exists "authenticated can insert" on storage.objects;

create policy
  "authenticated can insert" on storage.objects for
insert
  to authenticated
with
  check (
    bucket_id in ('avatars', 'properties', 'rooms', 'room_tenants', 'profiles')
    and storage."extension"(name) in ('jpg', 'jpeg', 'png')
  );

drop policy
  if exists "authenticated can update" on storage.objects;

create policy
  "authenticated can update" on storage.objects for
update
  to authenticated using (
    bucket_id in ('avatars', 'properties', 'rooms', 'room_tenants', 'profiles')
    and storage."extension"(name) in ('jpg', 'jpeg', 'png')
  );

drop policy
  if exists "authenticated can select" on storage.objects;

create policy
  "authenticated can select" on storage.objects for
select
  to authenticated using (
    bucket_id in ('avatars', 'properties', 'rooms', 'room_tenants', 'profiles')
    and storage."extension"(name) in ('jpg', 'jpeg', 'png')
  );

drop policy
  if exists "authenticated can delete" on storage.objects;

create policy
  "authenticated can delete" on storage.objects for
delete
  to authenticated using (
    bucket_id in ('avatars', 'properties', 'rooms', 'room_tenants', 'profiles')
    and storage."extension"(name) in ('jpg', 'jpeg', 'png')
  );