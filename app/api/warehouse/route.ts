import { NextResponse } from "next/server";
import { loadWarehouseData } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await loadWarehouseData(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to load warehouse data from Neon", error);
    return NextResponse.json(
      { error: "Inventory is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
