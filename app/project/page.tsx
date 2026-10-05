import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";

const repo = "https://github.com/ArielMagalsoDev/cota-warehouse-assessment";
const site = "https://cota-warehouse-assessment.vercel.app";

export const metadata: Metadata = {
  title: "Project plan & deliverables | CoTa Warehouse",
  description: "The CoTa Warehouse assessment plan, deliverables, architecture, schema, written responses, and limitations.",
};

async function responseParagraphs(filename: string) {
  const source = await readFile(path.join(process.cwd(), "docs", filename), "utf8");
  return source
    .replace(/^# .*\r?\n/, "")
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.replace(/\*([^*]+)\*/g, "$1").replace(/`/g, ""));
}

export default async function ProjectPage() {
  const [part4, part5] = await Promise.all([
    responseParagraphs("ai-video-design.md"),
    responseParagraphs("offline-reliability.md"),
  ]);

  return (
    <main className="shell project-shell">
      <div className="topbar">
        <Link className="brand brand-link" href="/" aria-label="CoTa Warehouse home"><span className="brand-mark">C</span><span>CoTa<span className="brand-muted"> / Warehouse</span></span></Link>
        <Link className="topbar-project-link" href="/">← Open application</Link>
      </div>

      <header className="project-hero">
        <p className="eyebrow">CLIENT HANDOFF / ASSESSMENT</p>
        <h1>Project plan <em>& deliverables.</em></h1>
        <p>Everything needed to review the working assessment is here: the live application, source, setup, data model, design decisions, written responses, and known limits.</p>
        <div className="project-actions">
          <Link className="project-button project-button-primary" href="/">Open working application <span aria-hidden="true">↗</span></Link>
          <a className="project-button project-button-secondary" href={repo} target="_blank" rel="noopener noreferrer">View Git repository <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <div className="project-layout">
        <nav className="project-nav" aria-label="Project sections">
          <span className="project-nav-label">ON THIS PAGE</span>
          <a href="#deliverables">Deliverables</a>
          <a href="#plan">Project plan</a>
          <a href="#setup">Setup</a>
          <a href="#database">Database & schema</a>
          <a href="#architecture">Architecture</a>
          <a href="#part-4">Part 4 response</a>
          <a href="#part-5">Part 5 response</a>
          <a href="#assumptions">Assumptions & limits</a>
        </nav>

        <div className="project-content">
          <section className="project-section" id="deliverables">
            <p className="eyebrow">01 / HANDOFF</p>
            <h2>Deliverables</h2>
            <p>The application and this handoff page are publicly accessible. Source files are linked to the exact locations in the repository.</p>
            <div className="deliverable-grid">
              <a className="deliverable-card" href={site}><span>WORKING APPLICATION</span><strong>Open live site ↗</strong><small>{site}</small></a>
              <a className="deliverable-card" href={repo} target="_blank" rel="noopener noreferrer"><span>GIT REPOSITORY</span><strong>Browse source ↗</strong><small>github.com/ArielMagalsoDev/cota-warehouse-assessment</small></a>
              <a className="deliverable-card" href={`${repo}/blob/main/README.md`} target="_blank" rel="noopener noreferrer"><span>README & SETUP</span><strong>Read setup guide ↗</strong><small>Installation, validation, and demo walkthrough</small></a>
              <a className="deliverable-card" href={`${repo}/blob/main/supabase/schema.sql`} target="_blank" rel="noopener noreferrer"><span>DATABASE SCHEMA</span><strong>Inspect SQL ↗</strong><small>Tables, constraints, grants, and RLS policies</small></a>
              <a className="deliverable-card" href={`${site}/api/inventory`} target="_blank" rel="noopener noreferrer"><span>READ-ONLY API</span><strong>View inventory JSON ↗</strong><small>Public demo data; no credentials in the response</small></a>
            </div>
          </section>

          <section className="project-section" id="plan">
            <p className="eyebrow">02 / DELIVERY PLAN</p>
            <h2>Plan and scope</h2>
            <p>The assessment was implemented in three completed stages. Video recognition and offline stock transactions are design proposals for a later phase.</p>
            <ol className="plan-list">
              <li><span className="plan-step">01</span><div><strong>Inventory foundation <span className="complete-pill">COMPLETE</span></strong><p>Model products, case storage, and open shelves in Supabase. Seed the supplied examples and expose demo reads through RLS.</p></div></li>
              <li><span className="plan-step">02</span><div><strong>Warehouse workflows <span className="complete-pill">COMPLETE</span></strong><p>Build mobile-friendly search, full-case replenishment calculations, and a shortage-checked pick list ordered by aisle, rack, and shelf.</p></div></li>
              <li><span className="plan-step">03</span><div><strong>Validation and release <span className="complete-pill">COMPLETE</span></strong><p>Test stock arithmetic and pick rules, publish the source, deploy to Vercel, and expose a read-only inventory API and reviewer handoff.</p></div></li>
              <li><span className="plan-step">04</span><div><strong>Future evaluation <span className="future-pill">PROPOSED</span></strong><p>Pilot video-assisted observations in one aisle, then assess an offline transaction queue only if the workflow expands to recording stock changes.</p></div></li>
            </ol>
          </section>

          <section className="project-section" id="setup">
            <p className="eyebrow">03 / REPRODUCE</p>
            <h2>Setup instructions</h2>
            <ol className="project-steps">
              <li>Clone the <a href={repo} target="_blank" rel="noopener noreferrer">repository</a> and run <code>pnpm install</code>.</li>
              <li>Copy <code>.env.example</code> to <code>.env.local</code>. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> for a Supabase project.</li>
              <li>For a new project, run <a href={`${repo}/blob/main/supabase/schema.sql`} target="_blank" rel="noopener noreferrer">schema.sql</a> and then <a href={`${repo}/blob/main/supabase/seed.sql`} target="_blank" rel="noopener noreferrer">seed.sql</a> in the SQL Editor.</li>
              <li>Run <code>pnpm dev</code> and open <code>http://localhost:3000</code>. Validate with <code>pnpm test</code>, <code>pnpm typecheck</code>, and <code>pnpm build</code>.</li>
            </ol>
            <p className="project-note">Use a publishable key for this public demo. Never place a secret or service-role key in a <code>NEXT_PUBLIC_</code> variable. Local environment files are Git-ignored.</p>
          </section>

          <section className="project-section" id="database">
            <p className="eyebrow">04 / DATA MODEL</p>
            <h2>Database and schema</h2>
            <p>Supabase Postgres stores three related tables. Products identify SKUs and case sizes; storage rows locate complete cases; open shelves track unit capacity and current units.</p>
            <div className="schema-list">
              <div><code>products</code><p><code>sku</code> primary key, <code>name</code>, and positive <code>units_per_case</code>.</p></div>
              <div><code>storage_inventory</code><p>Foreign-key <code>sku</code>, numeric aisle/rack/shelf coordinates, nonnegative <code>cases</code>, and a unique SKU/location constraint.</p></div>
              <div><code>open_shelves</code><p>One row per configured SKU with nonnegative <code>current_units</code> no greater than <code>capacity_units</code>.</p></div>
            </div>
            <p>Row level security is enabled on all three tables. Anonymous and authenticated clients receive SELECT permission and explicit read policies for this public demonstration; they have no write grants. <a href={`${repo}/blob/main/supabase/schema.sql`} target="_blank" rel="noopener noreferrer">View the complete schema SQL ↗</a></p>
          </section>

          <section className="project-section" id="architecture">
            <p className="eyebrow">05 / DESIGN</p>
            <h2>Architecture</h2>
            <p>Next.js App Router serves the interface on Vercel. The client loads the three Supabase tables, then pure modules in <code>lib/</code> calculate totals, replenishment, and pick allocation. A server route exposes the same public inventory as read-only JSON.</p>
            <div className="architecture-flow" aria-label="Application architecture"><span>Employee browser<br /><small>Next.js UI</small></span><b aria-hidden="true">→</b><span>Supabase<br /><small>3 read-only tables</small></span><b aria-hidden="true">→</b><span>Calculation modules<br /><small>Totals · refills · picks</small></span></div>
            <p>A draft pick request stays in versioned browser local storage. Before generating a route, the app refreshes inventory and blocks the proposal if that refresh fails or stock is insufficient. Recommendations do not reserve or change stock.</p>
          </section>

          <section className="project-section" id="part-4">
            <p className="eyebrow">06 / WRITTEN RESPONSE</p>
            <h2>Part 4 — Process and AI design</h2>
            <p className="response-status">Design proposal; video processing is not part of the implemented application.</p>
            <div className="response-prose">{part4.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
            <a href={`${repo}/blob/main/docs/ai-video-design.md`} target="_blank" rel="noopener noreferrer">Read Part 4 in the repository ↗</a>
          </section>

          <section className="project-section" id="part-5">
            <p className="eyebrow">07 / WRITTEN RESPONSE</p>
            <h2>Part 5 — Intermittent connectivity</h2>
            <p className="response-status">Current draft protection plus a proposed design for future offline stock transactions.</p>
            <div className="response-prose">{part5.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
            <a href={`${repo}/blob/main/docs/offline-reliability.md`} target="_blank" rel="noopener noreferrer">Read Part 5 in the repository ↗</a>
          </section>

          <section className="project-section" id="assumptions">
            <p className="eyebrow">08 / REVIEW NOTES</p>
            <h2>Assumptions and known limitations</h2>
            <ul className="project-bullets">
              <li>Storage inventory counts complete cases; open-shelf quantities count individual units.</li>
              <li>Pick routes and refill amounts are proposals. They do not reserve, deduct, or update inventory.</li>
              <li>Numeric aisle order approximates walking order; rack and shelf break ties. This is not shortest-path routing.</li>
              <li>Only TURTLE-01 has supplied open-shelf settings. Other SKUs show that no shelf is configured.</li>
              <li>Pick drafts persist only in the same browser and device, with no cross-device sync.</li>
              <li>Public demo reads are intentional. Employee authentication, permissions, stock transactions, and video processing are outside the implemented scope.</li>
              <li>A proposal can become stale after generation if warehouse stock changes; workers must confirm quantities at each location.</li>
            </ul>
          </section>
        </div>
      </div>
      <footer className="footer"><span>CoTa Warehouse / Project handoff</span><span><Link href="/">Return to application ↗</Link> · <a href={repo} target="_blank" rel="noopener noreferrer">GitHub repository ↗</a></span></footer>
    </main>
  );
}
