import { compareLocations, locationLabel, totalCases } from "./inventory.ts";
import type { PickLine, PickRequest, Product, Shortage, StorageInventory } from "./types.ts";

export type PickResult =
  | { ok: true; lines: PickLine[]; totalCases: number }
  | { ok: false; errors: string[]; shortages: Shortage[] };

export function buildPickList(requests: PickRequest[], products: Product[], storage: StorageInventory[]): PickResult {
  const known = new Set(products.map((p) => p.sku));
  const errors: string[] = [];
  const totals = new Map<string, number>();

  if (requests.length === 0) errors.push("Add at least one product.");

  for (const [index, row] of requests.entries()) {
    const sku = row.sku.trim().toUpperCase();
    const rawCases = row.cases.trim();
    if (!known.has(sku)) errors.push(`Row ${index + 1}: choose a known SKU.`);
    if (!/^[1-9]\d*$/.test(rawCases) || !Number.isSafeInteger(Number(rawCases))) {
      errors.push(`Row ${index + 1}: enter a positive whole number of cases.`);
    }
    if (known.has(sku) && /^[1-9]\d*$/.test(rawCases) && Number.isSafeInteger(Number(rawCases))) {
      totals.set(sku, (totals.get(sku) ?? 0) + Number(rawCases));
    }
  }

  const shortages: Shortage[] = [];
  for (const [sku, requested] of totals) {
    const available = totalCases(storage, sku);
    if (requested > available) shortages.push({ sku, requested, available, missing: requested - available });
  }
  if (errors.length || shortages.length) return { ok: false, errors, shortages };

  const allocated: Omit<PickLine, "sequence">[] = [];
  for (const [sku, requested] of totals) {
    let remaining = requested;
    for (const row of storage.filter((item) => item.sku === sku).sort(compareLocations)) {
      const cases = Math.min(remaining, row.cases);
      if (cases > 0) allocated.push({ sku, location: locationLabel(row), cases });
      remaining -= cases;
      if (remaining === 0) break;
    }
  }

  const locationByLabel = new Map(storage.map((row) => [locationLabel(row), row]));
  allocated.sort((a, b) => compareLocations(locationByLabel.get(a.location)!, locationByLabel.get(b.location)!) || a.sku.localeCompare(b.sku));
  return {
    ok: true,
    lines: allocated.map((row, index) => ({ ...row, sequence: index + 1 })),
    totalCases: [...totals.values()].reduce((sum, cases) => sum + cases, 0),
  };
}
