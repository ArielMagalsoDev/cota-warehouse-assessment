import { createClient } from "@supabase/supabase-js";
import type { OpenShelf, Product, StorageInventory, WarehouseData } from "./types";

export async function loadWarehouseData(): Promise<WarehouseData> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured. Set the public URL and publishable key.");

  const client = createClient(url, key);
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
