"use client";

import { useMemo, useState } from "react";
import { totalCases } from "@/lib/inventory";
import { calculateReplenishment } from "@/lib/replenishment";
import type { WarehouseData } from "@/lib/types";

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

export default function ReplenishmentPanel({ data }: { data: WarehouseData }) {
  const [sku, setSku] = useState("TURTLE-01");
  const product = useMemo(() => data.products.find((item) => item.sku === sku), [data.products, sku]);
  const shelf = data.shelves.find((item) => item.sku === sku);
  const result = product && shelf ? calculateReplenishment(product, shelf, totalCases(data.storage, sku)) : null;
  const percent = shelf && shelf.capacity_units > 0 ? Math.min(100, Math.round((shelf.current_units / shelf.capacity_units) * 100)) : 0;

  return (
    <section aria-labelledby="replenishment-title">
      <div className="panel-head">
        <div>
          <h2 id="replenishment-title">Shelf replenishment</h2>
          <p>Pull complete cases, then place only the units that fit.</p>
        </div>
        <label className="select-field">
          <span className="sr-only">Product</span>
          <select id="replenish-sku" value={sku} onChange={(event) => setSku(event.target.value)}>
            {data.products.map((item) => <option value={item.sku} key={item.sku}>{item.sku} — {item.name}</option>)}
          </select>
        </label>
      </div>

      {!shelf || !result || !product ? (
        <div className="empty-state"><strong>Shelf configuration unavailable</strong><p>There is no open-shelf capacity or current quantity for {sku}. Only TURTLE-01 has a configured shelf in this demo.</p></div>
      ) : (
        <div className="replenish-grid">
          <div className="card shelf-card">
            <span className="card-label">Open shelf · {sku}</span>
            <div className="big-figure">{shelf.current_units}<span> / {shelf.capacity_units} units</span></div>
            <div className="progress-track" role="progressbar" aria-label="Shelf fill" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><div style={{ width: `${percent}%` }} /></div>
            <div className="split-row"><span>Current quantity</span><span>{percent}% full</span></div>
            <div className="split-row split-row-rule"><span>Units needed to fill</span><strong>{result.unitsNeeded} units</strong></div>
            <div className="split-row"><span>Storage available</span><strong>{plural(result.availableCases, "case", "cases")} × {product.units_per_case}</strong></div>
          </div>

          <div className="card answer-card" aria-live="polite">
            <span className="card-label">Pull from storage</span>
            <div className="big-figure">{result.casesToPull}<span> complete {result.casesToPull === 1 ? "case" : "cases"}</span></div>
            <p className="answer-lede">
              {result.unitsNeeded === 0
                ? "The shelf is already full. Nothing needs to be pulled."
                : `The shelf needs ${result.unitsNeeded} units. Cases hold ${product.units_per_case}, so ${plural(result.casesToPull, "case", "cases")} (${result.unitsPulled} units) is the smallest full-case pull that fills it.`}
            </p>
            <div className="answer-breakdown">
              <div><small>Place on shelf</small><strong>{result.unitsNeeded} units</strong></div>
              <div><small>Left over</small><strong>{result.leftoverUnits} units</strong></div>
            </div>
            {result.shortCases > 0 ? (
              <div className="alert alert-error">Storage is short by {plural(result.shortCases, "case", "cases")}. Pull what is available and report the gap — the shelf cannot be filled completely.</div>
            ) : result.leftoverUnits > 0 ? (
              <div className="alert alert-dark">
                <strong>Operational consequence:</strong> only {result.unitsNeeded} of the {result.unitsPulled} units fit, so one case is opened and {plural(result.leftoverUnits, "loose unit is", "loose units are")} left over. Keep them off the shelf — placing them would exceed its {shelf.capacity_units}-unit capacity — and store them as a partial case, which full-case storage counts do not track.
              </div>
            ) : null}
          </div>
        </div>
      )}
      <p className="footnote">Planning only. No inventory is reserved or changed.</p>
    </section>
  );
}
