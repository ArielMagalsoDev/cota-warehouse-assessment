import { NextResponse } from "next/server";
import { loadWarehouseData } from "@/lib/data";
import { inventoryForSku, locationLabel, totalCases, totalUnits } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await loadWarehouseData();
    const products = data.products.map((product) => {
      const shelf = data.shelves.find((item) => item.sku === product.sku);
      return {
        sku: product.sku,
        name: product.name,
        units_per_case: product.units_per_case,
        locations: inventoryForSku(data.storage, product.sku).map((row) => ({
          location: locationLabel(row),
          cases: row.cases,
        })),
        total_cases: totalCases(data.storage, product.sku),
        total_units: totalUnits(product, data.storage),
        open_shelf: shelf ? { capacity_units: shelf.capacity_units, current_units: shelf.current_units } : null,
      };
    });

    return NextResponse.json(
      { fetched_at: data.fetchedAt, products },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to load inventory from Neon", error);
    return NextResponse.json(
      { error: "Inventory is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
