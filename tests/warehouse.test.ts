import assert from "node:assert/strict";
import test from "node:test";
import { compareLocations, totalCases, totalUnits } from "../lib/inventory.ts";
import { buildPickList } from "../lib/picking.ts";
import { calculateReplenishment } from "../lib/replenishment.ts";
import type { OpenShelf, PickRequest, Product, StorageInventory } from "../lib/types.ts";

const products: Product[] = [
  { sku: "TURTLE-01", name: "Sea Turtle Plush", units_per_case: 12 },
  { sku: "SHARK-02", name: "Shark Plush", units_per_case: 8 },
  { sku: "ALIEN-04", name: "Alien Plush", units_per_case: 12 },
];
const storage: StorageInventory[] = [
  { id: 1, sku: "TURTLE-01", aisle: 1, rack: 2, shelf: 1, cases: 18, updated_at: "" },
  { id: 2, sku: "TURTLE-01", aisle: 4, rack: 1, shelf: 2, cases: 7, updated_at: "" },
  { id: 3, sku: "SHARK-02", aisle: 2, rack: 3, shelf: 1, cases: 14, updated_at: "" },
  { id: 4, sku: "ALIEN-04", aisle: 3, rack: 4, shelf: 2, cases: 4, updated_at: "" },
];
const request = (sku: string, cases: string): PickRequest => ({ id: `${sku}-${cases}`, sku, cases });

test("aggregates stock across locations", () => {
  assert.equal(totalCases(storage, "TURTLE-01"), 25);
  assert.equal(totalUnits(products[0], storage), 300);
});

test("explains complete-case replenishment and leftover units", () => {
  const shelf: OpenShelf = { sku: "TURTLE-01", capacity_units: 60, current_units: 17, updated_at: "" };
  assert.deepEqual(calculateReplenishment(products[0], shelf, 25), {
    unitsNeeded: 43, casesToPull: 4, unitsPulled: 48, leftoverUnits: 5, availableCases: 25, shortCases: 0,
  });
});

test("sorts the supplied pick by aisle", () => {
  const result = buildPickList([request("TURTLE-01", "3"), request("SHARK-02", "2"), request("ALIEN-04", "1")], products, storage);
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.lines.map(({ sku, location, cases }) => ({ sku, location, cases })), [
    { sku: "TURTLE-01", location: "A1-R2-S1", cases: 3 },
    { sku: "SHARK-02", location: "A2-R3-S1", cases: 2 },
    { sku: "ALIEN-04", location: "A3-R4-S2", cases: 1 },
  ]);
});

test("splits a large pick and rejects combined shortages", () => {
  const split = buildPickList([request("TURTLE-01", "20")], products, storage);
  assert.equal(split.ok, true);
  if (split.ok) assert.deepEqual(split.lines.map((line) => line.cases), [18, 2]);

  const shortage = buildPickList([request("ALIEN-04", "3"), request("ALIEN-04", "2")], products, storage);
  assert.equal(shortage.ok, false);
  if (!shortage.ok) assert.deepEqual(shortage.shortages, [{ sku: "ALIEN-04", requested: 5, available: 4, missing: 1 }]);
});

test("rejects invalid quantities and sorts numeric aisles", () => {
  assert.equal(buildPickList([request("SHARK-02", "1.5")], products, storage).ok, false);
  assert.ok(compareLocations({ ...storage[0], aisle: 2 }, { ...storage[0], aisle: 10 }) < 0);
});
