-- Create a trigger to sync auth.users -> public.profiles
-- Run this in Supabase SQL Editor

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, null, null)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Ensure the function is owned by a superuser so the trigger on auth.users can execute
alter function public.handle_new_user() owner to postgres;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- One-time backfill for existing users (idempotent)
insert into public.profiles (id, display_name, avatar_url)
select u.id,
       coalesce((u.raw_user_meta_data->>'full_name'), null) as display_name,
       coalesce((u.raw_user_meta_data->>'avatar_url'), null) as avatar_url
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;


