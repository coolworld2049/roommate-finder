insert into
  storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('properties', 'properties', true),
  ('rooms', 'rooms', true),
  ('room_tenants', 'room_tenants', true),
  ('profiles', 'profiles', true) on conflict(id)
do
  nothing;

truncate
  preferences cascade;

insert into
  preferences (category, name, options)
values
  (
    'property',
    'share_with',
    (
      select
        enum_range(null :: share_with)
    )
  ),
  (
    'property',
    'property_type',
    (
      select
        enum_range(null :: property_type)
    )
  ),
  (
    'property',
    'stay_duration',
    (
      select
        enum_range(null :: stay_duration)
    )
  ),
  (
    'roommate',
    'get up',
    '{"before 6am","6am-8am","8am-10am","10am-12am","after 12pm"}'
  ),
  (
    'roommate',
    'go to bed',
    '{"before 8pm","8pm-10pm","10pm-12pm","12pm-2pm","after 2pm"}'
  ),
  (
    'roommate',
    'cleanliness',
    '{"clean","average","messy"}'
  ),
  (
    'roommate',
    'smoker',
    '{"yes","no","outside only"}'
  ),
  ('roommate', 'alcohol', '{"yes","no"}'),
  (
    'roommate',
    'food choice',
    '{"any","vegan","vegetarian"}'
  ),
  (
    'roommate',
    'noise level',
    '{"any","average","quiet"}'
  ),
  (
    'roommate',
    'pets',
    '{"no pets","dogs","cats","birds","fish","reptiles","small pets"}'
  );