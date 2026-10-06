import type { WarehouseData } from "./types";

export async function loadWarehouseData(): Promise<WarehouseData> {
  const response = await fetch("/api/warehouse", { cache: "no-store" });
  if (!response.ok) throw new Error("Inventory is temporarily unavailable. Please refresh and try again.");
  return response.json() as Promise<WarehouseData>;
}
