"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { loadWarehouseData } from "@/lib/data";
import { countAllCases } from "@/lib/inventory";
import type { WarehouseData } from "@/lib/types";
import InventorySearch from "./inventory-search";
import ReplenishmentPanel from "./replenishment-panel";
import PickListPanel from "./pick-list-panel";

type Tab = "inventory" | "replenishment" | "picking";
const tabs: { id: Tab; label: string; short: string }[] = [
  { id: "inventory", label: "Inventory search", short: "01" },
  { id: "replenishment", label: "Shelf replenishment", short: "02" },
  { id: "picking", label: "Pick list", short: "03" },
];

export default function WarehouseApp() {
  const [tab, setTab] = useState<Tab>("inventory");
  const [data, setData] = useState<WarehouseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [stale, setStale] = useState(false);

  const refresh = useCallback(async (initial = false): Promise<WarehouseData | null> => {
    if (initial) setLoading(true);
    else setRefreshing(true);
    try {
      const latest = await loadWarehouseData();
      setData(latest);
      setError("");
      setStale(false);
      return latest;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Inventory could not be loaded.");
      setStale(true);
      return null;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void refresh(true); }, [refresh]);
  const total = useMemo(() => data ? countAllCases(data) : 0, [data]);

  return (
    <main className="shell">
      <div className="topbar">
        <div className="brand" aria-label="CoTa Warehouse"><span className="brand-mark">C</span><span>CoTa<span className="brand-muted"> / Warehouse</span></span></div>
        <div className="topbar-right"><span className="topbar-dot" /> OPERATIONS DESK <span className="topbar-divider" /> <span className="topbar-version">ASSESSMENT BUILD</span></div>
      </div>

      <header className="page-heading">
        <div>
          <p className="eyebrow">WAREHOUSE OPERATIONS / 01</p>
          <h1>Inventory, <em>in view.</em></h1>
          <p className="intro">Find stock, plan a shelf refill, and build a route your team can follow.</p>
        </div>
        <div className="live-card" aria-live="polite">
          <div className="live-card-top"><span className={`status-pill ${error ? "status-error" : ""}`}><span className="status-dot" />{error ? "CONNECTION ISSUE" : loading ? "CONNECTING" : "LIVE INVENTORY"}</span></div>
          <div className="live-number">{data ? total : "—"}<span> cases</span></div>
          <div className="live-meta">{data?.products.length ?? "—"} SKUs across {data?.storage.length ?? "—"} locations</div>
        </div>
      </header>

      <div className="workspace">
        <nav className="tabs" aria-label="Warehouse workflows">
          {tabs.map((item) => <button key={item.id} type="button" className={`tab ${tab === item.id ? "tab-active" : ""}`} aria-current={tab === item.id ? "page" : undefined} onClick={() => setTab(item.id)}><span className="tab-index">{item.short}</span>{item.label}<span className="tab-arrow">↗</span></button>)}
        </nav>

        <div className="work-area">
          <div className="data-bar"><span>{loading ? "Loading inventory…" : data ? `Updated ${new Date(data.fetchedAt).toLocaleString()}` : "Inventory unavailable"}{stale && data ? " · Showing previous data" : ""}</span><button type="button" onClick={() => void refresh()} disabled={loading || refreshing}>{refreshing ? "Refreshing…" : "↻ Refresh data"}</button></div>
          {error && <div className="alert alert-error" role="alert">{error} {data && "Current results may be outdated."}</div>}
          {loading && !data ? <div className="loading-state"><span className="spinner" />Loading warehouse data</div> : !data ? <div className="empty-state"><strong>Inventory is unavailable</strong><p>Check the connection or project configuration, then try again.</p><button className="button button-primary" type="button" onClick={() => void refresh()}>Try again</button></div> : (
            <>
              {tab === "inventory" && <InventorySearch data={data} />}
              {tab === "replenishment" && <ReplenishmentPanel data={data} />}
              {tab === "picking" && <PickListPanel data={data} refresh={refresh} />}
            </>
          )}
        </div>
      </div>
      <footer className="footer"><span>CoTa Warehouse / Operational planning tool</span><span><a href="/api/inventory" target="_blank" rel="noopener noreferrer">View inventory API ↗</a> · Read-only inventory · No stock is changed</span></footer>
    </main>
  );
}
