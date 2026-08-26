-- Roommate App schema
-- Run this once in your Supabase project's SQL Editor (Database > SQL Editor > New query).
-- Safe to re-run only if you drop the tables first; this is a fresh-install script.
-- (If you're upgrading an existing pre-households database, use the migration
-- snippet you were given instead of this file — this is the fresh-install version.)

-- ============ households ============
create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code text not null unique,
  address text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  created_by uuid,
  created_at timestamptz not null default now()
);

-- No insert/update/delete policy for `authenticated` on purpose — every
-- mutation goes through create_household()/join_household() below, which run
-- as security definer and enforce their own rules (one household per person,
-- 10-roommate cap on join, etc).
alter table public.households enable row level security;

-- ============ profiles ============
-- One row per tenant, 1:1 with auth.users. Also doubles as the
-- check-in/checkout status row, since a person only ever has one current status.
-- household_id starts null: a new signup isn't in a household until they
-- create or join one.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  household_id uuid references public.households(id),
  display_name text not null,
  is_home boolean not null default true,
  status_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.households add constraint households_created_by_fkey
  foreign key (created_by) references public.profiles(id);

alter table public.profiles enable row level security;

-- Always readable by yourself (so the app can see your household_id is null
-- and route you to onboarding); readable by household-mates once joined.
create policy "profiles readable by self or household"
  on public.profiles for select to authenticated
  using (id = auth.uid() or household_id = public.current_household_id());

create policy "users update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Looks up the caller's own household_id. security definer so it can read
-- profiles without recursing through the RLS policy that calls it.
create or replace function public.current_household_id()
returns uuid
language sql
security definer set search_path = public
stable
as $$
  select household_id from public.profiles where id = auth.uid();
$$;

-- Auto-create a profile row whenever someone signs up. household_id is left
-- null; they pick "create" or "join" on first login.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Generates a random, human-typeable join code (excludes ambiguous
-- characters like 0/O and 1/I), retrying on the rare collision.
create or replace function public.generate_join_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  taken boolean;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    end loop;
    select exists(select 1 from public.households where join_code = code) into taken;
    exit when not taken;
  end loop;
  return code;
end;
$$;

-- Creates a new household and makes the caller its first member.
create or replace function public.create_household(household_name text)
returns public.households
language plpgsql
security definer set search_path = public
as $$
declare
  new_household public.households;
begin
  if (select household_id from public.profiles where id = auth.uid()) is not null then
    raise exception 'You are already in a household.';
  end if;
  if trim(household_name) = '' then
    raise exception 'Household name cannot be empty.';
  end if;

  insert into public.households (name, join_code, created_by)
  values (trim(household_name), public.generate_join_code(), auth.uid())
  returning * into new_household;

  update public.profiles set household_id = new_household.id where id = auth.uid();

  return new_household;
end;
$$;

grant execute on function public.create_household(text) to authenticated;

-- Joins the caller to an existing household by its join code. Enforces the
-- 10-roommate cap per household.
create or replace function public.join_household(code text)
returns public.households
language plpgsql
security definer set search_path = public
as $$
declare
  target public.households;
  member_count integer;
begin
  if (select household_id from public.profiles where id = auth.uid()) is not null then
    raise exception 'You are already in a household.';
  end if;

  select * into target from public.households where join_code = upper(trim(code));
  if target.id is null then
    raise exception 'No household found with that code.';
  end if;

  select count(*) into member_count from public.profiles where household_id = target.id;
  if member_count >= 10 then
    raise exception 'This household is full (10 roommate maximum).';
  end if;

  update public.profiles set household_id = target.id where id = auth.uid();

  return target;
end;
$$;

grant execute on function public.join_household(text) to authenticated;

-- Lets any member set/update the household's address + geocoded
-- coordinates (used for weather). Kept as an RPC, like the other household
-- mutations, rather than an open UPDATE policy on the table.
create or replace function public.update_household_address(new_address text, new_latitude numeric, new_longitude numeric)
returns public.households
language plpgsql
security definer set search_path = public
as $$
declare
  updated public.households;
begin
  if public.current_household_id() is null then
    raise exception 'You are not in a household.';
  end if;

  update public.households
  set address = new_address, latitude = new_latitude, longitude = new_longitude
  where id = public.current_household_id()
  returning * into updated;

  return updated;
end;
$$;

grant execute on function public.update_household_address(text, numeric, numeric) to authenticated;

-- Now that current_household_id() exists, the households table can allow
-- members to read their own household's name/join code.
create policy "households readable by members" on public.households
  for select to authenticated using (id = public.current_household_id());

-- ============ day_status (weekly calendar) ============
create table public.day_status (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default public.current_household_id() references public.households(id),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  status text not null default 'home' check (status in ('home', 'away')),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);
create index on public.day_status (date);

alter table public.day_status enable row level security;
create policy "day_status readable" on public.day_status for select to authenticated using (household_id = public.current_household_id());
create policy "own day_status insert" on public.day_status for insert to authenticated with check (user_id = auth.uid() and household_id = public.current_household_id());
create policy "own day_status update" on public.day_status for update to authenticated using (user_id = auth.uid() and household_id = public.current_household_id()) with check (user_id = auth.uid() and household_id = public.current_household_id());
create policy "own day_status delete" on public.day_status for delete to authenticated using (user_id = auth.uid() and household_id = public.current_household_id());

-- ============ supply_items (shared supply/shopping list) ============
create table public.supply_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default public.current_household_id() references public.households(id),
  name text not null,
  quantity integer not null default 1 check (quantity > 0),
  added_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  purchased boolean not null default false,
  purchased_by uuid references public.profiles(id),
  purchased_at timestamptz
);
create index on public.supply_items (purchased);

alter table public.supply_items enable row level security;
create policy "supply_items readable" on public.supply_items for select to authenticated using (household_id = public.current_household_id());
create policy "supply_items insert" on public.supply_items for insert to authenticated with check (added_by = auth.uid() and household_id = public.current_household_id());
create policy "supply_items update" on public.supply_items for update to authenticated using (household_id = public.current_household_id()) with check (household_id = public.current_household_id());
create policy "supply_items delete" on public.supply_items for delete to authenticated using (household_id = public.current_household_id());

-- ============ contacts ============
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default public.current_household_id() references public.households(id),
  name text not null,
  role text,
  phone text,
  email text,
  notes text,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contacts enable row level security;
create policy "contacts readable" on public.contacts for select to authenticated using (household_id = public.current_household_id());
create policy "contacts insert" on public.contacts for insert to authenticated with check (created_by = auth.uid() and household_id = public.current_household_id());
create policy "contacts update" on public.contacts for update to authenticated using (household_id = public.current_household_id()) with check (household_id = public.current_household_id());
create policy "contacts delete" on public.contacts for delete to authenticated using (household_id = public.current_household_id());

-- ============ requests ============
create table public.requests (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default public.current_household_id() references public.households(id),
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done')),
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.requests (status);

alter table public.requests enable row level security;
create policy "requests readable" on public.requests for select to authenticated using (household_id = public.current_household_id());
create policy "requests insert" on public.requests for insert to authenticated with check (created_by = auth.uid() and household_id = public.current_household_id());
create policy "requests update" on public.requests for update to authenticated using (household_id = public.current_household_id()) with check (household_id = public.current_household_id());
create policy "requests delete" on public.requests for delete to authenticated using (household_id = public.current_household_id());

-- ============ events (one-off events + yearly-recurring birthdays) ============
-- recurs_yearly events (birthdays, anniversaries) are matched by month+day
-- only, regardless of event_date's year, so they don't need re-entering
-- every year — event_date just anchors the month/day (and, for a birthday,
-- doubles as a record of the actual birth year if entered accurately).
create table public.events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default public.current_household_id() references public.households(id),
  title text not null,
  event_date date not null,
  recurs_yearly boolean not null default false,
  notes text,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.events (event_date);

alter table public.events enable row level security;
create policy "events readable" on public.events for select to authenticated using (household_id = public.current_household_id());
create policy "events insert" on public.events for insert to authenticated with check (created_by = auth.uid() and household_id = public.current_household_id());
create policy "events update" on public.events for update to authenticated using (household_id = public.current_household_id()) with check (household_id = public.current_household_id());
create policy "events delete" on public.events for delete to authenticated using (household_id = public.current_household_id());

-- ============ bills (monthly utilities / rent / other costs) ============
create table public.bills (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default public.current_household_id() references public.households(id),
  category text not null,        -- e.g. Rent, Electricity, Internet, Water, Gas, Other
  amount numeric(10, 2) not null check (amount >= 0),
  month date not null,           -- always the 1st of the month, e.g. 2026-07-01
  due_date date,                 -- optional specific due day, used for "upcoming bills" reminders
  notes text,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now()
);
create index on public.bills (month);
create index on public.bills (due_date);

alter table public.bills enable row level security;
create policy "bills readable" on public.bills for select to authenticated using (household_id = public.current_household_id());
create policy "bills insert" on public.bills for insert to authenticated with check (created_by = auth.uid() and household_id = public.current_household_id());
create policy "bills update" on public.bills for update to authenticated using (household_id = public.current_household_id()) with check (household_id = public.current_household_id());
create policy "bills delete" on public.bills for delete to authenticated using (household_id = public.current_household_id());

-- ============ stays (rotation schedule — who has the house when) ============
create table public.stays (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default public.current_household_id() references public.households(id),
  label text not null,           -- e.g. "Tony & Natalie" — free text, not tied to one profile
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  notes text,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.stays (household_id, start_date);

alter table public.stays enable row level security;
create policy "stays readable" on public.stays for select to authenticated using (household_id = public.current_household_id());
create policy "stays insert" on public.stays for insert to authenticated with check (created_by = auth.uid() and household_id = public.current_household_id());
create policy "stays update" on public.stays for update to authenticated using (household_id = public.current_household_id()) with check (household_id = public.current_household_id());
create policy "stays delete" on public.stays for delete to authenticated using (household_id = public.current_household_id());

-- ============ house_guide (wifi, codes, house rules, local tips — one row per household) ============
create table public.house_guide (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null unique default public.current_household_id() references public.households(id),
  wifi_network text,
  wifi_password text,
  door_code text,
  house_rules text,
  local_tips text,
  emergency_info text,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

alter table public.house_guide enable row level security;
create policy "house_guide readable" on public.house_guide for select to authenticated using (household_id = public.current_household_id());
create policy "house_guide insert" on public.house_guide for insert to authenticated with check (household_id = public.current_household_id());
create policy "house_guide update" on public.house_guide for update to authenticated using (household_id = public.current_household_id()) with check (household_id = public.current_household_id());

-- ============ handoff_notes (heads-up notes for the next arriving crew) ============
create table public.handoff_notes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default public.current_household_id() references public.households(id),
  note text not null,
  resolved boolean not null default false,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now()
);
create index on public.handoff_notes (resolved);

alter table public.handoff_notes enable row level security;
create policy "handoff_notes readable" on public.handoff_notes for select to authenticated using (household_id = public.current_household_id());
create policy "handoff_notes insert" on public.handoff_notes for insert to authenticated with check (created_by = auth.uid() and household_id = public.current_household_id());
create policy "handoff_notes update" on public.handoff_notes for update to authenticated using (household_id = public.current_household_id()) with check (household_id = public.current_household_id());
create policy "handoff_notes delete" on public.handoff_notes for delete to authenticated using (household_id = public.current_household_id());

-- ============ journal_entries (shared house guestbook) ============
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null default public.current_household_id() references public.households(id),
  body text not null,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now()
);
create index on public.journal_entries (created_at);

alter table public.journal_entries enable row level security;
create policy "journal_entries readable" on public.journal_entries for select to authenticated using (household_id = public.current_household_id());
create policy "journal_entries insert" on public.journal_entries for insert to authenticated with check (created_by = auth.uid() and household_id = public.current_household_id());
create policy "journal_entries update" on public.journal_entries for update to authenticated using (household_id = public.current_household_id()) with check (household_id = public.current_household_id());
create policy "journal_entries delete" on public.journal_entries for delete to authenticated using (household_id = public.current_household_id());

-- ============ updated_at triggers ============
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger contacts_set_updated_at before update on public.contacts
  for each row execute function public.set_updated_at();
create trigger requests_set_updated_at before update on public.requests
  for each row execute function public.set_updated_at();
create trigger day_status_set_updated_at before update on public.day_status
  for each row execute function public.set_updated_at();
create trigger events_set_updated_at before update on public.events
  for each row execute function public.set_updated_at();
create trigger stays_set_updated_at before update on public.stays
  for each row execute function public.set_updated_at();
create trigger house_guide_set_updated_at before update on public.house_guide
  for each row execute function public.set_updated_at();

-- ============ Realtime ============
-- Lets the app subscribe to live changes for the check-in board, supply list,
-- and requests without polling. Supabase Realtime enforces each subscriber's
-- SELECT RLS policy, so this stays household-scoped automatically.
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.supply_items;
alter publication supabase_realtime add table public.requests;
