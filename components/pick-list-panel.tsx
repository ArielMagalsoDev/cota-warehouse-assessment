"use client";

import { useEffect, useState } from "react";
import { buildPickList, type PickResult } from "@/lib/picking";
import type { PickRequest, WarehouseData } from "@/lib/types";

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

  const edit = (id: string, patch: Partial<PickRequest>) => { setRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row)); setResult(null); };
  const remove = (id: string) => { setRows((current) => current.filter((row) => row.id !== id)); setResult(null); };
  const add = () => { setRows((current) => [...current, { id: crypto.randomUUID(), sku: "", cases: "1" }]); setResult(null); };
  const generate = async () => {
    setWorking(true); setRefreshError(""); setResult(null);
    const fresh = await refresh();
    if (!fresh) setRefreshError("Could not refresh live inventory. Your request is saved; retry when connected.");
    else { setResult(buildPickList(rows, fresh.products, fresh.storage)); setGeneratedAt(new Date(fresh.fetchedAt).toLocaleString()); }
    setWorking(false);
  };

  return <section aria-labelledby="picking-title">
    <div className="section-heading"><div><p className="eyebrow">03 / PLAN THE ROUTE</p><h2 id="picking-title">Pick list</h2><p>Enter case quantities. We will check stock before arranging the walk.</p></div></div>
    <div className="pick-layout"><div className="pick-form"><div className="form-title"><div><span className="card-label">PICK REQUEST</span><h3>Cases to collect</h3></div><span className="form-count">{rows.length} items</span></div>
      <div className="pick-rows">{rows.map((row, index) => <div className="pick-row" key={row.id}><span className="row-num">{String(index + 1).padStart(2, "0")}</span><label><span className="field-label">SKU</span><select value={row.sku} onChange={(event) => edit(row.id, { sku: event.target.value })}><option value="">Choose a SKU</option>{data.products.map((product) => <option value={product.sku} key={product.sku}>{product.sku} · {product.name}</option>)}</select></label><label className="cases-field"><span className="field-label">CASES</span><input type="number" min="1" step="1" inputMode="numeric" value={row.cases} onChange={(event) => edit(row.id, { cases: event.target.value })} /></label><button type="button" className="remove-button" onClick={() => remove(row.id)} aria-label={`Remove row ${index + 1}`}>×</button></div>)}</div>
      <button type="button" className="add-button" onClick={add}>+ Add another SKU</button>
      <button type="button" className="button button-primary generate-button" disabled={working || !hydrated} onClick={() => void generate()}>{working ? "Checking live stock…" : "Generate pick list"}<span>→</span></button>
      <p className="draft-note">Your request is saved in this browser. Generating a list refreshes live stock.</p>
    </div>
    <div className="pick-result" aria-live="polite"><div className="form-title"><div><span className="card-label">ROUTE OUTPUT</span><h3>Picking sequence</h3></div>{result?.ok && <span className="form-count">{result.lines.length} STOPS</span>}</div>
      {refreshError ? <div className="alert alert-error" role="alert">{refreshError}</div> : result?.ok ? <><p className="result-meta">Generated {generatedAt} · {result.totalCases} total cases</p><div className="route-list">{result.lines.map((line) => <div className="route-row" key={`${line.sku}-${line.location}`}><div className="route-seq">{String(line.sequence).padStart(2, "0")}</div><div className="route-main"><strong>{line.location}</strong><small>{line.sku}</small></div><div className="route-cases"><strong>{line.cases}</strong><small>CASES</small></div></div>)}</div><div className="alert alert-note">Unreserved proposal. Confirm stock at each location before picking.</div></> : result && !result.ok ? <div className="validation"><strong>Cannot generate a valid pick list</strong>{result.errors.map((message) => <p key={message}>{message}</p>)}{result.shortages.map((shortage) => <p key={shortage.sku}><b>{shortage.sku}:</b> requested {shortage.requested}, available {shortage.available}, missing {shortage.missing} {shortage.missing === 1 ? "case" : "cases"}.</p>)}</div> : <div className="result-placeholder"><span className="route-symbol">↗</span><strong>Your route starts here.</strong><p>Generate a list to see locations in aisle order, with cases allocated at each stop.</p></div>}
    </div></div>
    <p className="footnote">Locations are sorted by aisle, rack, then shelf. This reduces aisle backtracking; it is not a shortest-path optimizer.</p>
  </section>;
}
