-- Roommate App schema
-- Run this once in your Supabase project's SQL Editor (Database > SQL Editor > New query).
-- Safe to re-run only if you drop the tables first; this is a fresh-install script.

-- ============ profiles ============
-- One row per tenant, 1:1 with auth.users. Also doubles as the
-- check-in/checkout status row, since a person only ever has one current status.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  is_home boolean not null default true,
  status_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles readable by authenticated"
  on public.profiles for select to authenticated using (true);

create policy "users update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Auto-create a profile row whenever someone signs up. Capped at 10 roommates
-- per household (per Supabase project) — raising here aborts the whole
-- auth.users insert too, so signup fails cleanly rather than leaving an
-- orphaned auth user with no profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (select count(*) from public.profiles) >= 10 then
    raise exception 'This household is full (10 roommate maximum).';
  end if;
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Read-only roommate count, callable by anyone (including signed-out
-- visitors on the signup page) without exposing full profile rows, which
-- normally require being authenticated to read.
create or replace function public.profile_count()
returns integer
language sql
security definer set search_path = public
stable
as $$
  select count(*)::integer from public.profiles;
$$;

grant execute on function public.profile_count() to anon, authenticated;

-- ============ day_status (weekly calendar) ============
create table public.day_status (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  status text not null default 'home' check (status in ('home', 'away')),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);
create index on public.day_status (date);

alter table public.day_status enable row level security;
create policy "day_status readable" on public.day_status for select to authenticated using (true);
create policy "own day_status insert" on public.day_status for insert to authenticated with check (user_id = auth.uid());
create policy "own day_status update" on public.day_status for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own day_status delete" on public.day_status for delete to authenticated using (user_id = auth.uid());

-- ============ supply_items (shared supply/shopping list) ============
create table public.supply_items (
  id uuid primary key default gen_random_uuid(),
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
create policy "supply_items readable" on public.supply_items for select to authenticated using (true);
create policy "supply_items insert" on public.supply_items for insert to authenticated with check (added_by = auth.uid());
create policy "supply_items update" on public.supply_items for update to authenticated using (true) with check (true);
create policy "supply_items delete" on public.supply_items for delete to authenticated using (true);

-- ============ contacts ============
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
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
create policy "contacts readable" on public.contacts for select to authenticated using (true);
create policy "contacts insert" on public.contacts for insert to authenticated with check (created_by = auth.uid());
create policy "contacts update" on public.contacts for update to authenticated using (true) with check (true);
create policy "contacts delete" on public.contacts for delete to authenticated using (true);

-- ============ requests ============
create table public.requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done')),
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.requests (status);

alter table public.requests enable row level security;
create policy "requests readable" on public.requests for select to authenticated using (true);
create policy "requests insert" on public.requests for insert to authenticated with check (created_by = auth.uid());
create policy "requests update" on public.requests for update to authenticated using (true) with check (true);
create policy "requests delete" on public.requests for delete to authenticated using (true);

-- ============ bills (monthly utilities / rent / other costs) ============
create table public.bills (
  id uuid primary key default gen_random_uuid(),
  category text not null,        -- e.g. Rent, Electricity, Internet, Water, Gas, Other
  amount numeric(10, 2) not null check (amount >= 0),
  month date not null,           -- always the 1st of the month, e.g. 2026-07-01
  notes text,
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now()
);
create index on public.bills (month);

alter table public.bills enable row level security;
create policy "bills readable" on public.bills for select to authenticated using (true);
create policy "bills insert" on public.bills for insert to authenticated with check (created_by = auth.uid());
create policy "bills update" on public.bills for update to authenticated using (true) with check (true);
create policy "bills delete" on public.bills for delete to authenticated using (true);

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

-- ============ Realtime ============
-- Lets the app subscribe to live changes for the check-in board, supply list,
-- and requests without polling.
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.supply_items;
alter publication supabase_realtime add table public.requests;
