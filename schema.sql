create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  faculty text,
  year int,
  bio text not null default '',
  color text not null default '#2f6bff',
  created_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('member','admin'))
);

create table public.app_settings (key text primary key, value text not null);
insert into public.app_settings values ('admin_code', 'CHANGE-ME-2026');

create table public.events (
  id bigint generated always as identity primary key,
  title text not null,
  event_date date not null,
  event_time time not null,
  room text not null,
  description text not null default '',
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_by_name text,
  created_at timestamptz not null default now()
);

create table public.event_attendees (
  event_id bigint references public.events(id) on delete cascade,
  user_id uuid default auth.uid() references auth.users(id) on delete cascade,
  primary key (event_id, user_id)
);

create table public.friendships (
  user_id uuid default auth.uid() references auth.users(id) on delete cascade,
  friend_id uuid references auth.users(id) on delete cascade,
  primary key (user_id, friend_id)
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin');
$$;

-- signs up, create their profile + member role automatically
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, faculty, year)
  values (new.id,
          coalesce(nullif(new.raw_user_meta_data->>'name',''), 'Student'),
          new.email,
          new.raw_user_meta_data->>'faculty',
          nullif(new.raw_user_meta_data->>'year','')::int);
  insert into public.user_roles (user_id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users for each row execute function public.handle_new_user();

-- sign up as admin: only works with the right secret code
create or replace function public.claim_admin(code text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  if code = (select value from public.app_settings where key = 'admin_code') then
    update public.user_roles set role = 'admin' where user_id = auth.uid();
    return true;
  end if;
  return false;
end $$;

-- only an admin can change someone's role
create or replace function public.set_role(target uuid, new_role text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Only admins can change roles'; end if;
  if new_role not in ('member','admin') then raise exception 'Bad role'; end if;
  update public.user_roles set role = new_role where user_id = target;
end $$;

revoke execute on function public.claim_admin(text) from public, anon;
revoke execute on function public.set_role(uuid, text) from public, anon;
grant execute on function public.claim_admin(text) to authenticated;
grant execute on function public.set_role(uuid, text) to authenticated;

alter table public.profiles        enable row level security;
alter table public.user_roles      enable row level security;
alter table public.app_settings    enable row level security; 
alter table public.events          enable row level security;
alter table public.event_attendees enable row level security;
alter table public.friendships     enable row level security;

create policy "signed-in users read profiles" on public.profiles for select to authenticated using (true);
create policy "edit only my profile" on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "signed-in users read roles" on public.user_roles for select to authenticated using (true);

create policy "everyone reads events" on public.events for select using (true);
create policy "admins create events" on public.events for insert to authenticated with check (public.is_admin());
create policy "admins edit events"   on public.events for update to authenticated using (public.is_admin());
create policy "admins delete events" on public.events for delete to authenticated using (public.is_admin());

create policy "everyone reads attendance" on public.event_attendees for select using (true);
create policy "join as myself"  on public.event_attendees for insert to authenticated with check (auth.uid() = user_id);
create policy "leave as myself" on public.event_attendees for delete to authenticated using (auth.uid() = user_id);

create policy "see my friends"  on public.friendships for select to authenticated using (auth.uid() = user_id);
create policy "add my friends"  on public.friendships for insert to authenticated with check (auth.uid() = user_id);
create policy "remove my friends" on public.friendships for delete to authenticated using (auth.uid() = user_id);

-- EVENTS (optional) -------------------------------------------
insert into public.events (title, event_date, event_time, room, description, created_by_name) values
 ('Open Day',         '2026-12-10', '11:00', '1:Barrel E',  'Meet the faculties and tour the labs.', 'SDU Admin'),
 ('Career Fair',      '2026-12-15', '14:00', '1:Canteen',   'Companies from Almaty are hiring interns and graduates.', 'SDU Admin'),
 ('Chess Tournament', '2026-12-20', '16:30', '2:Barrel F',  'Open tournament for students of every year.', 'SDU Admin');
