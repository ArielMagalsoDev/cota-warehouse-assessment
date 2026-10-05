-- Run in the SQL Editor of a dedicated Supabase project.
create table if not exists public.products (
  sku text primary key,
  name text not null,
  units_per_case integer not null check (units_per_case > 0)
);

create table if not exists public.storage_inventory (
  id bigint generated always as identity primary key,
  sku text not null references public.products(sku) on delete cascade,
  aisle integer not null check (aisle > 0),
  rack integer not null check (rack > 0),
  shelf integer not null check (shelf > 0),
  cases integer not null check (cases >= 0),
  updated_at timestamptz not null default now(),
  unique (sku, aisle, rack, shelf)
);

create table if not exists public.open_shelves (
  sku text primary key references public.products(sku) on delete cascade,
  capacity_units integer not null check (capacity_units >= 0),
  current_units integer not null check (current_units >= 0 and current_units <= capacity_units),
  updated_at timestamptz not null default now()
);

create index if not exists storage_inventory_walk_idx on public.storage_inventory (aisle, rack, shelf);

alter table public.products enable row level security;
alter table public.storage_inventory enable row level security;
alter table public.open_shelves enable row level security;

revoke all on public.products, public.storage_inventory, public.open_shelves from anon, authenticated;
grant select on public.products, public.storage_inventory, public.open_shelves to anon, authenticated;

create policy "Public can read demo products" on public.products for select to anon, authenticated using (true);
create policy "Public can read demo storage" on public.storage_inventory for select to anon, authenticated using (true);
create policy "Public can read demo shelves" on public.open_shelves for select to anon, authenticated using (true);
