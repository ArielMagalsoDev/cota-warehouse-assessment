"use client";

import { useEffect, useState } from "react";
import { buildPickList, type PickResult } from "@/lib/picking";
import type { PickRequest, WarehouseData } from "@/lib/types";
import { ArrowRight, Close, Plus, Route } from "./icons";

const storageKey = "cota-pick-draft-v1";
const starter: PickRequest[] = [
  { id: "starter-turtle", sku: "TURTLE-01", cases: "3" },
  { id: "starter-shark", sku: "SHARK-02", cases: "2" },
  { id: "starter-alien", sku: "ALIEN-04", cases: "1" },
];

function readDraft(): PickRequest[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return starter;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length <= 30 && parsed.every((row) => typeof row.id === "string" && typeof row.sku === "string" && typeof row.cases === "string")) return parsed;
  } catch { /* A malformed local draft should not stop the form. */ }
  return starter;
}

export default function PickListPanel({ data, refresh }: { data: WarehouseData; refresh: () => Promise<WarehouseData | null> }) {
  const [rows, setRows] = useState<PickRequest[]>(starter);
  const [hydrated, setHydrated] = useState(false);
  const [result, setResult] = useState<PickResult | null>(null);
  const [generatedAt, setGeneratedAt] = useState("");
  const [working, setWorking] = useState(false);
  const [refreshError, setRefreshError] = useState("");

  useEffect(() => { setRows(readDraft()); setHydrated(true); }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(storageKey, JSON.stringify(rows)); }, [rows, hydrated]);

  const edit = (id: string, patch: Partial<PickRequest>) => { setRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row)); setResult(null); setRefreshError(""); };
  const remove = (id: string) => { setRows((current) => current.filter((row) => row.id !== id)); setResult(null); setRefreshError(""); };
  const add = () => { setRows((current) => [...current, { id: crypto.randomUUID(), sku: "", cases: "1" }]); setResult(null); setRefreshError(""); };
  const resetSample = () => { setRows(starter.map((row) => ({ ...row }))); setResult(null); setRefreshError(""); };
  const generate = async () => {
    setWorking(true); setRefreshError(""); setResult(null);
    const fresh = await refresh();
    if (!fresh) setRefreshError("Could not refresh live inventory. Your request is saved; retry when connected.");
    else { setResult(buildPickList(rows, fresh.products, fresh.storage)); setGeneratedAt(new Date(fresh.fetchedAt).toLocaleString()); }
    setWorking(false);
  };

  const nameFor = (sku: string) => data.products.find((product) => product.sku === sku)?.name ?? "";

  return (
    <section aria-labelledby="picking-title">
      <div className="panel-head">
        <div>
          <h2 id="picking-title">Pick list</h2>
          <p>Enter case quantities. Live stock is checked before the walk is arranged.</p>
        </div>
      </div>

      <div className="pick-layout">
        <div className="card pick-card">
          <div className="card-title">
            <div><span className="card-label">Pick request</span><h3>Cases to collect</h3></div>
            <span className="count-pill">{rows.length} {rows.length === 1 ? "item" : "items"}</span>
          </div>
          <div className="pick-rows">
            {rows.map((row, index) => (
              <div className="pick-row" key={row.id}>
                <span className="row-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <label>
                  <span className="field-label">SKU</span>
                  <select value={row.sku} onChange={(event) => edit(row.id, { sku: event.target.value })} aria-label={`Row ${index + 1} SKU`}>
                    <option value="">Choose a SKU</option>
                    {data.products.map((product) => <option value={product.sku} key={product.sku}>{product.sku} · {product.name}</option>)}
                  </select>
                </label>
                <label>
                  <span className="field-label">Cases</span>
                  <input type="number" min="1" step="1" inputMode="numeric" value={row.cases} onChange={(event) => edit(row.id, { cases: event.target.value })} aria-label={`Row ${index + 1} cases`} />
                </label>
                <button type="button" className="icon-button" onClick={() => remove(row.id)} aria-label={`Remove row ${index + 1}`}><Close /></button>
              </div>
            ))}
          </div>
          <div className="pick-actions">
            <button type="button" className="text-button" onClick={add}><Plus /> Add another SKU</button>
            <button type="button" className="text-button text-button-muted" disabled={working || !hydrated} onClick={resetSample}>Reset sample request</button>
          </div>
          <button type="button" className="button button-dark button-block" disabled={working || !hydrated} onClick={() => void generate()}>
            {working ? "Checking live stock…" : "Generate pick list"}<ArrowRight />
          </button>
          <p className="footnote">Your request is saved in this browser and restored when you return. Generating a list refreshes live stock.</p>
        </div>

        <div className="card pick-card" aria-live="polite">
          <div className="card-title">
            <div><span className="card-label">Route output</span><h3>Picking sequence</h3></div>
            {result?.ok && <span className="count-pill">{result.lines.length} {result.lines.length === 1 ? "stop" : "stops"}</span>}
          </div>
          {refreshError ? (
            <div className="alert alert-error" role="alert">{refreshError}</div>
          ) : result?.ok ? (
            <>
              <p className="result-meta">Generated {generatedAt} · {result.totalCases} total cases</p>
              <ol className="route-list">
                {result.lines.map((line) => (
                  <li className="route-row" key={`${line.sku}-${line.location}`}>
                    <span className="route-seq"><span className="sr-only">Stop </span>{line.sequence}</span>
                    <div className="route-main"><strong>{line.location}</strong><small>{line.sku} · {nameFor(line.sku)}</small></div>
                    <div className="route-cases"><strong>{line.cases}</strong><small>{line.cases === 1 ? "case" : "cases"}</small></div>
                  </li>
                ))}
              </ol>
              <div className="alert alert-note">Unreserved proposal. Confirm stock at each location before picking.</div>
            </>
          ) : result && !result.ok ? (
            <div className="validation" role="alert">
              <strong>{result.shortages.length ? "Not enough stock for this pick request" : "Please correct the pick request"}</strong>
              {result.errors.map((message) => <p key={message}>{message}</p>)}
              {result.shortages.map((shortage) => <p key={shortage.sku}><b>{shortage.sku}:</b> You requested {shortage.requested} {shortage.requested === 1 ? "case" : "cases"}, but only {shortage.available} {shortage.available === 1 ? "is" : "are"} available. Reduce the total for this SKU to {shortage.available} or fewer, then generate again.</p>)}
              <p className="validation-foot">No pick list was generated, so nothing partial reaches the floor.</p>
            </div>
          ) : (
            <div className="result-placeholder">
              <span className="route-symbol" aria-hidden="true"><Route /></span>
              <strong>Your route starts here.</strong>
              <p>Generate a list to see locations in aisle order, with cases allocated at each stop.</p>
            </div>
          )}
        </div>
      </div>
      <p className="footnote">Locations are sorted by aisle, rack, then shelf. This reduces aisle backtracking; it is not a shortest-path optimizer.</p>
    </section>
  );
}
