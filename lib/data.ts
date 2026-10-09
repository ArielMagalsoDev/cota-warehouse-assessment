import { neon } from "@neondatabase/serverless";
import type { OpenShelf, Product, StorageInventory, WarehouseData } from "./types";

let cachedSql: ReturnType<typeof neon> | null = null;

function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Neon is not configured on the server.");
  return cachedSql ??= neon(url);
}

export async function loadWarehouseData(): Promise<WarehouseData> {
  const sql = database();
  const [productsResult, storageResult, shelvesResult] = await Promise.all([
    sql`select sku, name, units_per_case from products order by sku`,
    sql`select id, sku, aisle, rack, shelf, cases, updated_at from storage_inventory`,
    sql`select sku, capacity_units, current_units, updated_at from open_shelves`,
  ]);

  return {
    products: productsResult as Product[],
    storage: storageResult as StorageInventory[],
    shelves: shelvesResult as OpenShelf[],
    fetchedAt: new Date().toISOString(),
  };
}
