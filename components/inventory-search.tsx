"use client";

import { useMemo, useState } from "react";
import { inventoryForSku, locationLabel, searchProducts, totalCases, totalUnits } from "@/lib/inventory";
import type { WarehouseData } from "@/lib/types";
import { Close } from "./icons";

export default function InventorySearch({ data }: { data: WarehouseData }) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => searchProducts(data.products, query), [data.products, query]);
  return (
    <section aria-labelledby="inventory-title">
      <div className="panel-head">
        <div>
          <h2 id="inventory-title">Inventory search</h2>
          <p>Search a SKU or product name to see every storage location.</p>
        </div>
        <span className="count-pill" aria-live="polite">{matches.length} {matches.length === 1 ? "result" : "results"}</span>
      </div>

      <label className="search-field">
        <SearchIcon />
        <span className="sr-only">Search by SKU or product name</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by SKU or product name…" autoComplete="off" />
        {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><Close /></button>}
      </label>

      {matches.length === 0 ? (
        <div className="empty-state"><strong>No products found</strong><p>Try a different SKU or product name.</p></div>
      ) : (
        <div className="product-grid">
          {matches.map((product) => {
            const rows = inventoryForSku(data.storage, product.sku);
            return (
              <article className="card product-card" key={product.sku}>
                <div className="product-card-head">
                  <div><span className="tag">{product.sku}</span><h3>{product.name}</h3></div>
                  <span className="case-size">{product.units_per_case}<small>units / case</small></span>
                </div>
                <div className="location-heading"><span>Storage location</span><span>Cases</span></div>
                <ul className="location-list">
                  {rows.length
                    ? rows.map((row) => <li className="location-row" key={row.id}><span>{locationLabel(row)}</span><strong>{row.cases}</strong></li>)
                    : <li className="location-row muted">No storage locations</li>}
                </ul>
                <div className="product-totals">
                  <div><small>Total cases</small><strong>{totalCases(data.storage, product.sku)}</strong></div>
                  <div><small>Total units</small><strong>{totalUnits(product, data.storage).toLocaleString()}</strong></div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function SearchIcon() {
  return (
    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
    </svg>
  );
}
