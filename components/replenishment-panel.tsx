"use client";

import { useMemo, useState } from "react";
import { totalCases } from "@/lib/inventory";
import { calculateReplenishment } from "@/lib/replenishment";
import type { WarehouseData } from "@/lib/types";

export default function ReplenishmentPanel({ data }: { data: WarehouseData }) {
  const [sku, setSku] = useState("TURTLE-01");
  const product = useMemo(() => data.products.find((item) => item.sku === sku), [data.products, sku]);
  const shelf = data.shelves.find((item) => item.sku === sku);
  const result = product && shelf ? calculateReplenishment(product, shelf, totalCases(data.storage, sku)) : null;
  const percent = shelf && shelf.capacity_units > 0 ? Math.min(100, Math.round((shelf.current_units / shelf.capacity_units) * 100)) : 0;

  return <section aria-labelledby="replenishment-title">
    <div className="section-heading"><div><p className="eyebrow">02 / FILL THE SHELF</p><h2 id="replenishment-title">Shelf replenishment</h2><p>Pull complete cases, then place only the units that fit.</p></div></div>
    <div className="form-card"><label className="field-label" htmlFor="replenish-sku">PRODUCT</label><select id="replenish-sku" value={sku} onChange={(event) => setSku(event.target.value)}>{data.products.map((item) => <option value={item.sku} key={item.sku}>{item.sku} — {item.name}</option>)}</select></div>
    {!shelf || !result ? <div className="empty-state"><strong>Shelf configuration unavailable</strong><p>There is no open-shelf capacity or current quantity for this SKU.</p></div> : <div className="replenish-grid">
      <div className="shelf-card"><div className="card-label">OPEN SHELF / {sku}</div><div className="shelf-numbers"><strong>{shelf.current_units}</strong><span> / {shelf.capacity_units} units</span></div><div className="progress-track"><div style={{ width: `${percent}%` }} /></div><div className="shelf-capacity"><span>Current quantity</span><span>{percent}% full</span></div><div className="divider" /><div className="shelf-foot"><span>Storage available</span><strong>{result.availableCases} cases</strong></div></div>
      <div className="recommend-card"><div className="card-label">PULL RECOMMENDATION</div><div className="recommend-number">{result.casesToPull}<span> complete {result.casesToPull === 1 ? "case" : "cases"}</span></div><p className="recommend-lede">{result.unitsNeeded === 0 ? "The shelf is already full." : `The shelf needs ${result.unitsNeeded} units. ${result.casesToPull} ${result.casesToPull === 1 ? "case contains" : "cases contain"} ${result.unitsPulled} units.`}</p><div className="recommend-breakdown"><div><small>PLACE ON SHELF</small><strong>{result.unitsNeeded} units</strong></div><div><small>RETAIN OUTSIDE SHELF</small><strong>{result.leftoverUnits} units</strong></div></div>{result.shortCases > 0 ? <div className="alert alert-error">Storage is short by {result.shortCases} {result.shortCases === 1 ? "case" : "cases"}. This recommendation cannot be fully completed.</div> : result.leftoverUnits > 0 ? <div className="alert alert-note">Keep {result.leftoverUnits} extra {result.leftoverUnits === 1 ? "unit" : "units"} outside the shelf. Placing all pulled units would exceed its capacity.</div> : null}</div>
    </div>}
    <p className="footnote">Planning only. No inventory is reserved or changed.</p>
  </section>;
}
