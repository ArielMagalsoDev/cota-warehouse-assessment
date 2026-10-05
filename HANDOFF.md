# CoTa Warehouse — handoff for site refinement

This file is for a developer or coding assistant taking over the visual and UX refinement of the assessment site. The application is already implemented, deployed, and backed by a public read-only Supabase demo database. Keep the working warehouse calculations and client deliverables intact while improving presentation and usability.

## Start here

- Live application: https://cota-warehouse-assessment.vercel.app/
- Client-facing plan and deliverables: https://cota-warehouse-assessment.vercel.app/project
- Public read-only API: https://cota-warehouse-assessment.vercel.app/api/inventory
- Public repository: https://github.com/ArielMagalsoDev/cota-warehouse-assessment
- Production branch: `main`
- Hosting: Vercel project `cota-warehouse-assessment` under `ariel-m-projects`
- Database: Supabase project `test project` in the Armflare organization, project ref `uukcorwbjfpjayqcjxsp`

The client should be able to receive only the live application URL. The homepage links prominently to `/project`, which contains the working URL, repository and README links, setup, database description, architecture, full Part 4 and Part 5 responses, and assumptions and limitations.

## Requested refinement

Polish the existing Next.js site for a client review. Aim for a clean, credible, mobile-friendly warehouse operations interface. The current visual direction uses warm off-white surfaces, restrained green accents, DM Sans body text, Space Grotesk headings, and simple cards. You may improve hierarchy, spacing, typography, responsive behavior, copy clarity, and interaction feedback. Keep the three operational workflows and the `/project` handoff easy to find and understand.

Suggested review order:

1. Review the homepage at desktop and mobile widths, including loading, unavailable-data, search, replenishment, successful pick, and stock-shortage states.
2. Refine the `/project` page so a client can scan deliverables quickly and still read the complete written responses comfortably.
3. Check keyboard navigation, focus states, labels, contrast, long text wrapping, and mobile overflow.
4. Run the existing checks, then verify the live site and API after deployment.

These are polish priorities, not permission to change the warehouse business rules or represent proposed features as implemented.

## Current functionality and acceptance examples

- **Inventory search:** Matches product name or SKU without case sensitivity. It shows all storage locations and aggregate cases and units. `TURTLE-01` has 18 cases at A1-R2-S1 and 7 at A4-R1-S2: 25 cases, 300 units.
- **Shelf replenishment:** Uses complete cases. The supplied turtle shelf has capacity 60 units and currently holds 17; it needs 43 units. Four 12-unit cases supply 48 units, leaving 5 units outside the shelf. The UI also reports a storage shortage when applicable.
- **Pick list:** Validates known SKUs and positive whole case counts, combines repeated SKUs, blocks the entire proposal on a shortage, allocates cases from storage locations in numeric aisle/rack/shelf order, and displays the route in that order. The sample request is turtle 3, shark 2, alien 1, producing A1 → A2 → A3. Requests are proposals and do not reserve or deduct stock.
- **Saved draft:** A pick request is saved in the current browser under `cota-pick-draft-v1`. A previous reviewer entered 5 alien cases while only 4 exist; the resulting shortage was expected validation, not an application outage. The pick screen now explains shortages and offers **Reset sample request**.
- **Freshness:** Generating a pick list first reloads live inventory. If the refresh fails, no new route is generated. The last-loaded time and stale-data state are shown.
- **API:** `GET /api/inventory` returns current demo products, locations, case/unit totals, and configured shelf quantities as JSON. It is public and read-only.

## Code map

| Path | Role |
| --- | --- |
| `app/page.tsx` | Homepage entry point |
| `components/warehouse-app.tsx` | Main shell, workflow tabs, data loading, refresh and connection state |
| `components/inventory-search.tsx` | Search and inventory cards |
| `components/replenishment-panel.tsx` | Shelf refill interface |
| `components/pick-list-panel.tsx` | Pick request, saved draft, validation and route output |
| `app/project/page.tsx` | Client-facing plan, deliverables and written responses |
| `app/api/inventory/route.ts` | Public read-only JSON route |
| `app/globals.css` | Global visual system and responsive styles; currently compact and suitable for cleanup |
| `lib/data.ts` | Loads and validates Supabase data |
| `lib/inventory.ts`, `lib/replenishment.ts`, `lib/picking.ts` | Pure warehouse calculations |
| `lib/types.ts` | Shared data types |
| `docs/ai-video-design.md`, `docs/offline-reliability.md` | Canonical Part 4 and Part 5 responses |
| `supabase/schema.sql`, `supabase/seed.sql` | Reproducible database schema and demo seed |
| `tests/warehouse.test.ts` | Arithmetic, replenishment, ordering and shortage tests |

The `/project` page reads the two Markdown response files at build time. If their wording changes, rebuild and redeploy the site so the public page reflects it.

## Architecture and data safety

The site uses Next.js App Router, React, TypeScript, and Supabase JS. Client components read three Supabase tables in parallel: `products`, `storage_inventory`, and `open_shelves`. The tables contain public demonstration data. Row level security is enabled, with explicit SELECT policies for anonymous and authenticated users and no client write grants. The JSON route returns the same public demo inventory. No route or workflow performs stock transactions.

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are configured through the environment. A publishable key is designed for browser use; a Supabase secret or service-role key must never be added to a `NEXT_PUBLIC_` variable, source file, API response, screenshot, or public repository. `.env.local`, `.env.*.local`, `.vercel`, and `node_modules` are Git-ignored. Use `.env.example` for variable names and placeholders only. Do not paste real keys into this handoff.

Part 4 describes a *future* video-assisted observation and human-review workflow. Part 5 describes the existing local draft and a *future* offline stock-transaction queue. Video upload, AI recognition, offline write synchronization, employee authentication, and stock mutation are not implemented. Keep that distinction clear on the public site.

## Local setup and validation

```text
pnpm install
cp .env.example .env.local
# Fill the two NEXT_PUBLIC_SUPABASE_* variables in .env.local.
pnpm dev
pnpm test
pnpm typecheck
pnpm build
```

Open `http://localhost:3000` for the application and `/project` for the client handoff. For a fresh Supabase project, run `supabase/schema.sql` followed by `supabase/seed.sql` in the SQL Editor. Do not rerun seed SQL against the shared live project as a routine styling step.

The repository is already public and the Vercel project is already linked in the original checkout. Publishing a change requires pushing to `main` and deploying the linked Vercel project, then checking the production URL. A fresh clone will need its own local Vercel link and appropriate access; the ignored `.vercel` directory is not in Git. The Vercel CLI can be run with `pnpm dlx vercel@62.2.0 deploy --prod --yes --scope ariel-m-projects` from a linked, authenticated checkout.

## Known limits

- Warehouse stock may change after a proposal is generated, so employees must confirm cases at each location.
- Pick routing is numeric aisle/rack/shelf ordering, not shortest-path optimization.
- Drafts live only in one browser/device and do not sync across devices.
- Only `TURTLE-01` has supplied open-shelf configuration.
- The demo database is publicly readable. Real warehouse data would need authentication, authorization, auditability, and transaction handling.
- The current automated tests cover calculation rules; add focused browser checks for visual or interaction changes when useful.

Before handing the refined site back, confirm that the homepage, `/project`, and `/api/inventory` are publicly reachable; the starter pick produces three stops; a five-case alien request gives a clear shortage; and no credentials are in tracked files or rendered output.
