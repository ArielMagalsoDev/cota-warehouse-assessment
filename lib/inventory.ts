import type { Product, StorageInventory, WarehouseData } from "./types.ts";

export function locationLabel(row: Pick<StorageInventory, "aisle" | "rack" | "shelf">): string {
  return `A${row.aisle}-R${row.rack}-S${row.shelf}`;
}

export function compareLocations(a: StorageInventory, b: StorageInventory): number {
  return a.aisle - b.aisle || a.rack - b.rack || a.shelf - b.shelf || a.sku.localeCompare(b.sku);
}

export function inventoryForSku(storage: StorageInventory[], sku: string): StorageInventory[] {
  return storage.filter((row) => row.sku === sku).sort(compareLocations);
}

export function totalCases(storage: StorageInventory[], sku: string): number {
  return storage.reduce((sum, row) => sum + (row.sku === sku ? row.cases : 0), 0);
}

export function totalUnits(product: Product, storage: StorageInventory[]): number {
  return totalCases(storage, product.sku) * product.units_per_case;
}

export function searchProducts(products: Product[], term: string): Product[] {
  const query = term.trim().toLocaleLowerCase();
  return products.filter((p) => `${p.sku} ${p.name}`.toLocaleLowerCase().includes(query));
}

export function countAllCases(data: WarehouseData): number {
  return data.storage.reduce((sum, row) => sum + row.cases, 0);
}
