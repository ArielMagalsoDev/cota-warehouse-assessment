import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "./icons";

export const repoUrl = "https://github.com/ArielMagalsoDev/cota-warehouse-assessment";
export const siteUrl = "https://cota-warehouse-assessment.vercel.app";

export function SiteNav({ page }: { page: "app" | "project" }) {
  return (
    <header className="site-nav">
      <Link className="nav-pill nav-brand" href="/" aria-label="CoTa Warehouse home">
        <span className="brand-mark" aria-hidden="true">C</span>
        <span>CoTa<span className="brand-muted"> Warehouse</span></span>
      </Link>
      {page === "app"
        ? <Link className="nav-pill" href="/project">Project plan <ArrowUpRight /></Link>
        : <Link className="nav-pill" href="/"><ArrowLeft /> Open application</Link>}
    </header>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="section-label"><em>{children}</em></p>;
}

export function SiteFooter({ page }: { page: "app" | "project" }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <span className="pill pill-dark"><span className="status-dot" aria-hidden="true" />Read-only demo · no stock is changed</span>
        {page === "app" ? <>
          <h2>Review the <span className="tone">full handoff</span></h2>
          <p>Deliverables, setup, data model, architecture, the Part 4 and Part 5 written responses, and known limits — on one page.</p>
          <div className="footer-actions">
            <Link className="button button-light" href="/project">Project plan & deliverables <ArrowRight /></Link>
            <a className="button button-ghost" href="/api/inventory" target="_blank" rel="noopener noreferrer">Inventory API <ArrowUpRight /></a>
          </div>
        </> : <>
          <h2>Try the <span className="tone">working tool</span></h2>
          <p>Search stock, plan a shelf refill, and generate an aisle-ordered pick list against the live demo database.</p>
          <div className="footer-actions">
            <Link className="button button-light" href="/">Open application <ArrowRight /></Link>
            <a className="button button-ghost" href={repoUrl} target="_blank" rel="noopener noreferrer">GitHub repository <ArrowUpRight /></a>
          </div>
        </>}
        <div className="footer-meta"><span>© CoTa Warehouse assessment, 2026</span><span>Next.js · Neon · Vercel</span></div>
      </div>
    </footer>
  );
}
