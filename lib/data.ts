import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { OpenShelf, Product, StorageInventory, WarehouseData } from "./types";

let cachedClient: SupabaseClient | null = null;

export async function loadWarehouseData(): Promise<WarehouseData> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured on the server.");

  // One client per runtime; creating one per refresh triggers Supabase's duplicate-auth-client warning.
  const client = cachedClient ??= createClient(url, key, { auth: { persistSession: false } });
  const [productsResult, storageResult, shelvesResult] = await Promise.all([
    client.from("products").select("sku,name,units_per_case").order("sku"),
    client.from("storage_inventory").select("id,sku,aisle,rack,shelf,cases,updated_at"),
    client.from("open_shelves").select("sku,capacity_units,current_units,updated_at"),
  ]);

  const error = productsResult.error || storageResult.error || shelvesResult.error;
  if (error) throw new Error(`Could not load inventory: ${error.message}`);

  return {
    products: (productsResult.data ?? []) as Product[],
    storage: (storageResult.data ?? []) as StorageInventory[],
    shelves: (shelvesResult.data ?? []) as OpenShelf[],
    fetchedAt: new Date().toISOString(),
  };
}
