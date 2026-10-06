import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { repoUrl as repo, SectionLabel, SiteFooter, SiteNav, siteUrl as site } from "@/components/site-chrome";
import { ArrowRight, ArrowUpRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "Project plan & deliverables | CoTa Warehouse",
  description: "The CoTa Warehouse assessment plan, deliverables, architecture, schema, written responses, and limitations.",
};

async function responseParagraphs(filename: string) {
  const source = await readFile(path.join(process.cwd(), "docs", filename), "utf8");
  const paragraphs = source
    .replace(/^# .*\r?\n/, "")
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.replace(/\*([^*]+)\*/g, "$1").replace(/`/g, ""));
  const words = paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
  return { paragraphs, words };
}

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

const deliverables: { label: string; title: string; detail: string; href: string; external?: boolean }[] = [
  { label: "Working application", title: "Open live site", detail: site.replace("https://", ""), href: "/" },
  { label: "Git repository", title: "Browse source", detail: "github.com/ArielMagalsoDev/cota-warehouse-assessment", href: repo, external: true },
  { label: "README", title: "Setup instructions", detail: "Installation, validation, and demo walkthrough", href: `${repo}/blob/main/README.md`, external: true },
  { label: "Database / schema", title: "Data model", detail: "Three tables, constraints, grants, and RLS policies", href: "#database" },
  { label: "Architecture", title: "How it fits together", detail: "Browser → Supabase → pure calculation modules", href: "#architecture" },
  { label: "Written responses", title: "Parts 4 and 5", detail: "Video-assisted counting and intermittent connectivity", href: "#part-4" },
  { label: "Assumptions", title: "Known limitations", detail: "What the demo does not do, stated plainly", href: "#assumptions" },
  { label: "Read-only API", title: "Inventory JSON", detail: "Public demo data; no credentials in the response", href: "/api/inventory", external: true },
];

const nav: [string, string][] = [
  ["deliverables", "Deliverables"], ["plan", "Plan & scope"], ["setup", "Setup"], ["database", "Database"],
  ["architecture", "Architecture"], ["part-4", "Part 4"], ["part-5", "Part 5"], ["assumptions", "Assumptions"],
];

export default async function ProjectPage() {
  const [part4, part5] = await Promise.all([
    responseParagraphs("ai-video-design.md"),
    responseParagraphs("offline-reliability.md"),
  ]);

  return (
    <>
      <SiteNav page="project" />
      <main className="page">
        <section className="hero project-hero">
          <p className="pill hero-pill"><span className="status-dot" aria-hidden="true" />Client handoff — CoTa developer assessment</p>
          <h1><span className="hero-line">Project plan</span><span className="hero-line"><span className="tone">& deliverables</span></span></h1>
          <p className="hero-lede">Everything needed to review the assessment: the live application, source, setup, data model, design decisions, written responses, and known limits.</p>
          <div className="hero-actions">
            <Link className="button button-dark" href="/">Open working application <ArrowRight /></Link>
            <a className="button button-light" href={repo} {...external}>View Git repository <ArrowUpRight /></a>
          </div>
        </section>

        <div className="project-layout">
          <nav className="project-nav" aria-label="Project sections">
            <span className="project-nav-label">On this page</span>
            {nav.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
          </nav>

          <div className="project-content">
            <section className="project-section" id="deliverables" aria-labelledby="deliverables-title">
              <SectionLabel>Handoff</SectionLabel>
              <h2 id="deliverables-title">Deliverables</h2>
              <p className="section-intro">Each item the brief asks for, in order. The application and this page are public; source files link to their exact location in the repository.</p>
              <div className="deliverable-grid">
                {deliverables.map((item) => (
                  <a className="deliverable-card" key={item.label} href={item.href} {...(item.external ? external : {})}>
                    <span className="card-label">{item.label}</span>
                    <strong>{item.title}</strong>
                    <small>{item.detail}</small>
                    <span className="deliverable-arrow" aria-hidden="true">{item.external ? <ArrowUpRight /> : <ArrowRight />}</span>
                  </a>
                ))}
              </div>
            </section>

            <section className="project-section" id="plan" aria-labelledby="plan-title">
              <SectionLabel>Delivery plan</SectionLabel>
              <h2 id="plan-title">Plan <span className="tone">and scope</span></h2>
              <p className="section-intro">Parts 1–3 are implemented and tested. Video recognition and offline stock transactions are design proposals for a later phase.</p>
              <ol className="plan-list">
                <PlanStep n="01" title="Inventory foundation" done>Model products, case storage, and open shelves in Supabase. Seed the supplied examples and expose demo reads through RLS.</PlanStep>
                <PlanStep n="02" title="Warehouse workflows" done>Mobile-friendly search (Part 1), full-case replenishment with a plain-language explanation (Part 2), and a shortage-checked pick list ordered by aisle, rack, and shelf (Part 3).</PlanStep>
                <PlanStep n="03" title="Validation and release" done>Test stock arithmetic and pick rules, publish the source, deploy to Vercel, and expose a read-only inventory API and this handoff.</PlanStep>
                <PlanStep n="04" title="Future evaluation">Pilot video-assisted observations in one aisle, then assess an offline transaction queue only if the workflow expands to recording stock changes.</PlanStep>
              </ol>
            </section>

            <section className="project-section" id="setup" aria-labelledby="setup-title">
              <SectionLabel>Reproduce</SectionLabel>
              <h2 id="setup-title">Setup <span className="tone">instructions</span></h2>
              <div className="card step-card">
                <ol className="project-steps">
                  <li>Clone the <a href={repo} {...external}>repository</a> and run <code>pnpm install</code>.</li>
                  <li>Create a local <code>.env.local</code> with <code>SUPABASE_URL</code> and <code>SUPABASE_PUBLISHABLE_KEY</code> from your Supabase project. Set the same names as private environment variables on your host.</li>
                  <li>For a new project, run <a href={`${repo}/blob/main/supabase/schema.sql`} {...external}>schema.sql</a> and then <a href={`${repo}/blob/main/supabase/seed.sql`} {...external}>seed.sql</a> in the SQL Editor.</li>
                  <li>Run <code>pnpm dev</code> and open <code>http://localhost:3000</code>. Validate with <code>pnpm test</code>, <code>pnpm typecheck</code>, and <code>pnpm build</code>.</li>
                </ol>
              </div>
              <p className="callout"><span className="status-dot" aria-hidden="true" /><span>The server reads Supabase with a publishable key. No key is included in browser assets or API responses. Local environment files are Git-ignored.</span></p>
            </section>

            <section className="project-section" id="database" aria-labelledby="database-title">
              <SectionLabel>Data model</SectionLabel>
              <h2 id="database-title">Database <span className="tone">and schema</span></h2>
              <p className="section-intro">Supabase Postgres stores three related tables. Products identify SKUs and case sizes; storage rows locate complete cases; open shelves track unit capacity and current units.</p>
              <div className="schema-grid">
                <div className="card"><code>products</code><p><code>sku</code> primary key, <code>name</code>, and positive <code>units_per_case</code>.</p></div>
                <div className="card"><code>storage_inventory</code><p>Foreign-key <code>sku</code>, numeric aisle / rack / shelf, nonnegative <code>cases</code>, unique per SKU and location.</p></div>
                <div className="card"><code>open_shelves</code><p>One row per configured SKU; <code>current_units</code> never exceeds <code>capacity_units</code>.</p></div>
              </div>
              <p className="section-intro">Row level security is enabled on all three tables. Anonymous and authenticated clients get SELECT and explicit read policies for this public demonstration — no write grants. <a href={`${repo}/blob/main/supabase/schema.sql`} {...external}>View the complete schema SQL <ArrowUpRight /></a></p>
            </section>

            <section className="project-section" id="architecture" aria-labelledby="architecture-title">
              <SectionLabel>Design</SectionLabel>
              <h2 id="architecture-title">Architecture</h2>
              <p className="section-intro">Next.js App Router serves the interface on Vercel. A server route reads the three Supabase tables and returns public inventory to the browser without exposing a key. Pure modules in <code>lib/</code> calculate totals, replenishment, and pick allocation. A separate read-only API exposes product totals and locations.</p>
              <div className="architecture-flow" aria-label="Application architecture">
                <span>Employee browser<small>Next.js UI</small></span>
                <b aria-hidden="true"><ArrowRight /></b>
                <span>Next.js API<small>Server-side Supabase reads</small></span>
                <b aria-hidden="true"><ArrowRight /></b>
                <span>Supabase<small>3 read-only tables</small></span>
              </div>
              <p className="section-intro">A draft pick request stays in versioned browser storage. Before generating a route, the app refreshes inventory and blocks the proposal if that refresh fails or stock is insufficient. Recommendations never reserve or change stock.</p>
            </section>

            <Response id="part-4" label="Written response" title="Part 4" tone="Process and AI design" status="Design proposal — video processing is not part of the implemented application." limit={750} body={part4} file="ai-video-design.md" />
            <Response id="part-5" label="Written response" title="Part 5" tone="Intermittent connectivity" status="Describes the current draft protection, plus a proposed design for future offline stock transactions." limit={250} body={part5} file="offline-reliability.md" />

            <section className="project-section" id="assumptions" aria-labelledby="assumptions-title">
              <SectionLabel>Review notes</SectionLabel>
              <h2 id="assumptions-title">Assumptions <span className="tone">and known limits</span></h2>
              <ul className="assumption-list">
                <li>Storage inventory counts complete cases; open-shelf quantities count individual units.</li>
                <li>Pick routes and refill amounts are proposals. They do not reserve, deduct, or update inventory.</li>
                <li>Numeric aisle order approximates walking order; rack and shelf break ties. This is not shortest-path routing.</li>
                <li>Only TURTLE-01 has supplied open-shelf settings. Other SKUs show that no shelf is configured.</li>
                <li>Leftover units from an opened case are reported, but full-case storage counts cannot track a partial case.</li>
                <li>Pick drafts persist only in the same browser and device, with no cross-device sync.</li>
                <li>Public demo reads are intentional. Employee authentication, permissions, stock transactions, and video processing are outside the implemented scope.</li>
                <li>A proposal can become stale after generation if warehouse stock changes; workers must confirm quantities at each location.</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter page="project" />
    </>
  );
}

function PlanStep({ n, title, done = false, children }: { n: string; title: string; done?: boolean; children: React.ReactNode }) {
  return (
    <li>
      <span className="plan-step">{n}</span>
      <div><strong>{title}</strong><p>{children}</p></div>
      <span className={`status-pill ${done ? "" : "is-proposed"}`}><span className="status-dot" aria-hidden="true" />{done ? "Complete" : "Proposed"}</span>
    </li>
  );
}

function Response({ id, label, title, tone, status, limit, body, file }: { id: string; label: string; title: string; tone: string; status: string; limit: number; body: { paragraphs: string[]; words: number }; file: string }) {
  return (
    <section className="project-section" id={id} aria-labelledby={`${id}-title`}>
      <SectionLabel>{label}</SectionLabel>
      <h2 id={`${id}-title`}>{title} — <span className="tone">{tone}</span></h2>
      <article className="card prose-card">
        <p className="callout is-proposed"><span className="status-dot" aria-hidden="true" /><span>{status}</span></p>
        {body.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        <div className="prose-foot">
          <span>{body.words} words · limit {limit}</span>
          <a href={`${repo}/blob/main/docs/${file}`} {...external}>Read in the repository <ArrowUpRight /></a>
        </div>
      </article>
    </section>
  );
}
