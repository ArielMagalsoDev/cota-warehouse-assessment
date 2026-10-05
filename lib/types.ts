export type Product = {
  sku: string;
  name: string;
  units_per_case: number;
};

export type StorageInventory = {
  id: number;
  sku: string;
  aisle: number;
  rack: number;
  shelf: number;
  cases: number;
  updated_at: string;
};

export type OpenShelf = {
  sku: string;
  capacity_units: number;
  current_units: number;
  updated_at: string;
};

export type WarehouseData = {
  products: Product[];
  storage: StorageInventory[];
  shelves: OpenShelf[];
  fetchedAt: string;
};

export type PickRequest = { id: string; sku: string; cases: string };
export type PickLine = { sequence: number; sku: string; location: string; cases: number };
export type Shortage = { sku: string; requested: number; available: number; missing: number };
