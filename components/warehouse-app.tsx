"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { loadWarehouseData } from "@/lib/data";
import { countAllCases } from "@/lib/inventory";
import type { WarehouseData } from "@/lib/types";
import InventorySearch from "./inventory-search";
import ReplenishmentPanel from "./replenishment-panel";
import PickListPanel from "./pick-list-panel";
import { SectionLabel, SiteFooter, SiteNav } from "./site-chrome";
import { ArrowRight, ArrowUpRight, Refresh } from "./icons";

type Tab = "inventory" | "replenishment" | "picking";
const tabs: { id: Tab; label: string; compact: string; short: string }[] = [
  { id: "inventory", label: "Inventory search", compact: "Search", short: "01" },
  { id: "replenishment", label: "Shelf replenishment", compact: "Refill", short: "02" },
  { id: "picking", label: "Pick list", compact: "Pick list", short: "03" },
];

const rules: { tab: Tab; title: string; body: string }[] = [
  { tab: "inventory", title: "Locate stock", body: "Search any SKU or product name. Every storage location is listed with total cases and units — TURTLE-01 holds 25 cases (300 units) across two aisles." },
  { tab: "replenishment", title: "Fill the shelf", body: "Pull complete cases only. A 60-unit shelf holding 17 needs 43 units: four 12-unit cases, with the 5 extra units kept off the shelf." },
  { tab: "picking", title: "Plan the route", body: "Stock is re-checked live first. Any shortage blocks the whole list, and stops follow aisle, rack, then shelf order. Nothing is reserved." },
];

export default function WarehouseApp() {
  const [tab, setTab] = useState<Tab>("inventory");
  const [data, setData] = useState<WarehouseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [stale, setStale] = useState(false);
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ inventory: null, replenishment: null, picking: null });

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

  const selectTab = (next: Tab, focus = false) => {
    setTab(next);
    if (focus) tabRefs.current[next]?.focus();
  };
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = tabs.findIndex((item) => item.id === tab);
    const moves: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    selectTab(tabs[(moves[event.key] + tabs.length) % tabs.length].id, true);
  };
  const openWorkflow = (next: Tab) => {
    selectTab(next);
    document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => tabRefs.current[next]?.focus({ preventScroll: true }), 350);
  };

  const status = error ? "Connection issue" : loading ? "Connecting to inventory" : "Live inventory";
  const statusDetail = data ? ` — ${total} cases across ${data.storage.length} locations` : "";

  return (
    <>
      <SiteNav page="app" />
      <main className="page">
        <section className="hero">
          <p className={`pill hero-pill ${error ? "is-error" : ""}`} aria-live="polite">
            <span className="status-dot" aria-hidden="true" />{status}{statusDetail}
          </p>
          <h1>
            <span className="hero-line">Inventory <span className="hero-tile tile-light" aria-hidden="true"><CrateIcon /></span> <span className="tone">in view,</span></span>
            <span className="hero-line"><span className="tone">routes</span> <span className="hero-tile tile-dark" aria-hidden="true"><RouteIcon /></span> in order.</span>
          </h1>
          <p className="hero-lede">Find stock, plan a shelf refill, and build a pick route your team can follow — straight from the live warehouse data.</p>
          <div className="hero-actions">
            <a className="button button-dark" href="#workspace">Open the workspace <ArrowRight /></a>
            <Link className="button button-light" href="/project">Project plan & deliverables <ArrowUpRight /></Link>
          </div>
        </section>

        <section className="workspace-section" id="workspace" aria-labelledby="workspace-title">
          <SectionLabel>Operations desk</SectionLabel>
          <h2 className="section-title" id="workspace-title">Three workflows, <span className="tone">one view</span></h2>

          <div className="glass-panel">
            <div className="workspace-head">
              <div className="tablist" role="tablist" aria-label="Warehouse workflows">
                {tabs.map((item) => (
                  <button
                    key={item.id}
                    ref={(node) => { tabRefs.current[item.id] = node; }}
                    type="button"
                    role="tab"
                    id={`tab-${item.id}`}
                    aria-selected={tab === item.id}
                    aria-controls={`panel-${item.id}`}
                    tabIndex={tab === item.id ? 0 : -1}
                    className="tab"
                    onClick={() => selectTab(item.id)}
                    onKeyDown={onTabKey}
                  >
                    <span className="tab-index" aria-hidden="true">{item.short}</span><span className="tab-long">{item.label}</span><span className="tab-compact">{item.compact}</span>
                  </button>
                ))}
              </div>
              <div className="data-bar">
                <span>{loading ? "Loading inventory…" : data ? `Updated ${new Date(data.fetchedAt).toLocaleString()}` : "Inventory unavailable"}{stale && data ? " · showing previous data" : ""}</span>
                <button type="button" className="chip-button" onClick={() => void refresh()} disabled={loading || refreshing}>
                  <Refresh className={refreshing ? "spin" : ""} /> {refreshing ? "Refreshing…" : "Refresh data"}
                </button>
              </div>
            </div>

            {error && <div className="alert alert-error" role="alert">{error} {data && "Current results may be outdated."}</div>}

            <div className="tab-panel" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
              {loading && !data ? (
                <div className="loading-state"><span className="spinner" aria-hidden="true" />Loading warehouse data</div>
              ) : !data ? (
                <div className="empty-state">
                  <strong>Inventory is unavailable</strong>
                  <p>Check the connection or project configuration, then try again.</p>
                  <button className="button button-dark" type="button" onClick={() => void refresh()}>Try again <Refresh /></button>
                </div>
              ) : (
                <>
                  {tab === "inventory" && <InventorySearch data={data} />}
                  {tab === "replenishment" && <ReplenishmentPanel data={data} />}
                  {tab === "picking" && <PickListPanel data={data} refresh={refresh} />}
                </>
              )}
            </div>
          </div>
        </section>

        <section className="process-section" aria-labelledby="process-title">
          <SectionLabel>The rules, explained</SectionLabel>
          <h2 className="section-title" id="process-title">Here&apos;s how <span className="tone">it works</span></h2>
          <ol className="process-grid">
            {rules.map((rule, index) => (
              <li className="process-card" key={rule.tab}>
                <span className="process-num" aria-hidden="true">{index + 1}</span>
                <div>
                  <h3>{rule.title}</h3>
                  <p>{rule.body}</p>
                  <button type="button" className="text-button" onClick={() => openWorkflow(rule.tab)}>Try it <ArrowRight /></button>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <SiteFooter page="app" />
    </>
  );
}

function CrateIcon() {
  return (
    <svg viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
      <rect x="6" y="22" width="24" height="20" rx="3" />
      <rect x="34" y="22" width="24" height="20" rx="3" />
      <rect x="20" y="4" width="24" height="18" rx="3" />
      <path d="M14 22v6h8v-6M42 22v6h8v-6M28 4v6h8V4" />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="36" r="5" />
      <circle cx="32" cy="14" r="5" />
      <circle cx="52" cy="34" r="5" />
      <path d="M16 32l12-14M36 18l12 12" strokeDasharray="3 4" />
    </svg>
  );
}
