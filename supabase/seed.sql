insert into public.products (sku, name, units_per_case) values
  ('TURTLE-01', 'Sea Turtle Plush', 12),
  ('SHARK-02', 'Shark Plush', 8),
  ('MOOSE-03', 'Moose Plush', 6),
  ('ALIEN-04', 'Alien Plush', 12)
on conflict (sku) do update set name = excluded.name, units_per_case = excluded.units_per_case;

insert into public.storage_inventory (sku, aisle, rack, shelf, cases) values
  ('TURTLE-01', 1, 2, 1, 18),
  ('TURTLE-01', 4, 1, 2, 7),
  ('SHARK-02', 2, 3, 1, 14),
  ('MOOSE-03', 5, 1, 1, 9),
  ('ALIEN-04', 3, 4, 2, 4)
on conflict (sku, aisle, rack, shelf) do update set cases = excluded.cases, updated_at = now();

insert into public.open_shelves (sku, capacity_units, current_units) values
  ('TURTLE-01', 60, 17)
on conflict (sku) do update set capacity_units = excluded.capacity_units, current_units = excluded.current_units, updated_at = now();
