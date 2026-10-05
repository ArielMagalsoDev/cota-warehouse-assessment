"use client";

import { useMemo, useState } from "react";
import { inventoryForSku, locationLabel, searchProducts, totalCases, totalUnits } from "@/lib/inventory";
import type { WarehouseData } from "@/lib/types";

export default function InventorySearch({ data }: { data: WarehouseData }) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => searchProducts(data.products, query), [data.products, query]);
  return (
    <section aria-labelledby="inventory-title">
      <div className="section-heading"><div><p className="eyebrow">01 / LOCATE STOCK</p><h2 id="inventory-title">Inventory search</h2><p>Search a SKU or product name to see every storage location.</p></div><span className="section-count">{matches.length} {matches.length === 1 ? "RESULT" : "RESULTS"}</span></div>
      <label className="search-wrap"><span className="search-icon" aria-hidden="true">⌕</span><span className="sr-only">Search by SKU or product name</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by SKU or product name…" autoComplete="off" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>}</label>
      {matches.length === 0 ? <div className="empty-state"><strong>No products found</strong><p>Try a different SKU or product name.</p></div> : <div className="product-grid">{matches.map((product) => {
        const rows = inventoryForSku(data.storage, product.sku);
        return <article className="product-card" key={product.sku}>
          <div className="product-card-head"><div><span className="sku-badge">{product.sku}</span><h3>{product.name}</h3></div><span className="case-size">{product.units_per_case}<small>UNITS / CASE</small></span></div>
          <div className="location-heading"><span>STORAGE LOCATIONS</span><span>CASES</span></div>
          <div className="location-list">{rows.length ? rows.map((row) => <div className="location-row" key={row.id}><span><span className="location-icon">⌖</span>{locationLabel(row)}</span><strong>{row.cases}</strong></div>) : <div className="location-row muted">No storage locations</div>}</div>
          <div className="product-totals"><div><small>TOTAL CASES</small><strong>{totalCases(data.storage, product.sku)}</strong></div><div><small>TOTAL UNITS</small><strong>{totalUnits(product, data.storage).toLocaleString()}</strong></div></div>
        </article>;
      })}</div>}
    </section>
  );
}
