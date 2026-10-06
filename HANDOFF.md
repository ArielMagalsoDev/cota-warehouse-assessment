# CoTa Warehouse — developer handoff

This file is for a developer or coding assistant picking up the CoTa Warehouse assessment site. The application already works, is deployed, and reads from a public, read-only Supabase demo database. **Your job is presentation and usability.** The warehouse calculations and client deliverables are finished and verified, so don't change them.

## At a glance

| | |
| --- | --- |
| Live application | https://cota-warehouse-assessment.vercel.app/ |
| Client handoff page | https://cota-warehouse-assessment.vercel.app/project |
| Read-only API | https://cota-warehouse-assessment.vercel.app/api/inventory |
| Repository | https://github.com/ArielMagalsoDev/cota-warehouse-assessment (public, production branch `main`) |
| Hosting | Vercel project `cota-warehouse-assessment`, scope `ariel-m-projects` |
| Database | Supabase project `test project` (Armflare organization), ref `uukcorwbjfpjayqcjxsp`, region `ap-southeast-1` |

The client may receive only the live URL. The homepage links prominently to `/project`. That page holds the repository and README links, setup steps, database and architecture notes, the full Part 4 and Part 5 responses, and the assumptions and limits.

## What the brief asks for

CoTa's *AI Automation & Applications Developer Assessment* has five parts: inventory search, open-shelf replenishment, a pick list, and two written responses. Its explicit values shape every decision here:

- About **three hours** of work. A *complete, reliable, understandable* result beats extra features or decorative design.
- **"We value simplicity. Do not over-engineer."** The candidate must be able to demo the app, explain the code, and say what they would improve next.
- Part 4 is **at most 750 words** and Part 5 **at most 250 words**. `/project` shows the live word count against each limit (currently 583 and 222).

| Brief requirement | Where it is met |
| --- | --- |
| Part 1: search by SKU or name. Show SKU, name, units/case, every location with its cases, total cases, total units | Inventory search tab (`components/inventory-search.tsx`, `lib/inventory.ts`) |
| Part 2: units needed, complete cases to pull, a clear explanation including the full-case consequence | Shelf replenishment tab. The black answer card states the 5 leftover units and why they can't go on the shelf (`lib/replenishment.ts`) |
| Part 3: enter the sample request. Output SKU, location, cases and sequence; avoid backtracking; handle shortages clearly | Pick list tab (`lib/picking.ts`). Aisle → rack → shelf order. A shortage blocks the list and explains the fix |
| Part 4: video → SKU / location / visible count design | `docs/ai-video-design.md`, rendered on `/project#part-4` |
| Part 5: offline reliability | `docs/offline-reliability.md`, rendered on `/project#part-5` |
| Deliverables: URL, repo, README, schema, architecture, Parts 4 and 5, assumptions | One card each on `/project#deliverables`, in the brief's order |

## Ground rules

1. **Don't change business rules.** The `lib/` calculation modules and their tests are the source of truth. If a UI change seems to need different arithmetic, stop and ask.
2. **Never present a proposal as implemented.** Video upload, AI recognition, offline write sync, employee sign-in and stock changes are *not* built. Parts 4 and 5 are design proposals, and the site must keep saying so.
3. **No secrets anywhere public.** Only the Supabase *publishable* key belongs in `NEXT_PUBLIC_*`. Never put a secret or service-role key in source, an API response, a screenshot or this repository. `.env.local`, `.env.*.local`, `.vercel` and `node_modules` are Git-ignored. `.env.example` holds variable names only.
4. **Don't reseed the shared database** as part of styling work. `supabase/seed.sql` is for fresh projects only.

## Visual direction

The site uses the design language of the Hanzo Framer template (https://hanzo.framer.website/), but none of its copy, imagery or branding. The decoration is deliberately light, because the brief rewards clarity. The workspace sits directly under the hero, and every decorative element (headline tiles, tilted cards) is `aria-hidden` or purely presentational.

| Element | Treatment |
| --- | --- |
| Canvas | Neutral grey (`#d9d9d9`) with a soft white light glow; no brand colour fills |
| Type | Inter Tight (stand-in for Inter Display) set tight. Large 500-weight headlines whose second clause is grey. Instrument Serif italic for small section labels, flanked by hairlines |
| Surfaces | White cards, 16px radius, an 8px translucent white "halo" ring and a soft offset shadow. Larger glass panels at 50–75% white |
| Actions | Black pill primary buttons with an arrow; white pill secondary buttons and tags |
| Navigation | Floating pill nav: brand on the left, project link on the right |
| Footer | Black block with a large call to action toward `/project` |
| Status colour | Green dot for live data. Orange-red only for shortages and errors |

Accessibility is part of the brief, not decoration. Body text must reach at least 4.5:1 contrast and large grey headline text at least 3:1. Every control needs a visible focus state. The workflow switcher is an ARIA tablist with arrow-key support. Nothing may scroll horizontally at 375px.

## Behaviour to preserve (acceptance examples)

| Workflow | Must still hold |
| --- | --- |
| Inventory search | Matches product name or SKU, case-insensitive. Lists every storage location with aggregate cases and units. `TURTLE-01` → 18 cases at A1-R2-S1 + 7 at A4-R1-S2 = **25 cases, 300 units** |
| Shelf replenishment | Complete cases only. Turtle shelf 17 / 60 units needs **43 units → 4 cases (48 units) → 5 units kept outside the shelf**. Reports a storage shortage when there is one |
| Pick list | Validates known SKUs and positive whole case counts and combines repeated SKUs. A shortage blocks the entire proposal. Cases are allocated in numeric aisle/rack/shelf order and the route is shown in that order. Sample turtle 3, shark 2, alien 1 → **A1 → A2 → A3** (3 stops). Proposals never reserve or deduct stock |
| Saved draft | Stored in the browser under `cota-pick-draft-v1`. Alien 5 (only 4 exist) is an *expected* shortage message, not an outage. **Reset sample request** restores the starter |
| Freshness | Generating a pick list reloads live inventory first. If that refresh fails, no route is produced. The last-loaded time and stale-data state are visible |
| API | `GET /api/inventory` returns products, locations, case and unit totals, and shelf configuration as public JSON. It is read-only |

## Code map

| Path | Role |
| --- | --- |
| `app/layout.tsx` | Root layout, metadata, fonts via `next/font/google` (Inter Tight, Instrument Serif) |
| `app/page.tsx` → `components/warehouse-app.tsx` | Homepage: hero with live-stock pill, ARIA tablist workspace, data loading, refresh and connection state, "How it works" cards |
| `components/site-chrome.tsx` | Shared floating nav, serif section label, black footer CTA, and repo/site URL constants |
| `components/inventory-search.tsx` | Search field and product cards |
| `components/replenishment-panel.tsx` | Shelf refill view |
| `components/pick-list-panel.tsx` | Pick request form, saved draft, validation, route output |
| `app/project/page.tsx` | Client handoff page. Reads `docs/*.md` at build time, so rebuild and redeploy after editing them |
| `app/api/inventory/route.ts` | Public read-only JSON route |
| `app/globals.css` | Design tokens and all styles, grouped by section |
| `lib/data.ts` | Loads and validates the three Supabase tables |
| `lib/inventory.ts`, `lib/replenishment.ts`, `lib/picking.ts` | Pure warehouse calculations (**do not change for design work**) |
| `lib/types.ts` | Shared types |
| `docs/ai-video-design.md`, `docs/offline-reliability.md` | Canonical Part 4 and Part 5 responses |
| `supabase/schema.sql`, `supabase/seed.sql` | Reproducible schema (RLS, SELECT-only grants) and demo seed |
| `tests/warehouse.test.ts` | Arithmetic, replenishment, ordering and shortage tests |

## Architecture and data safety

Next.js 16 App Router, React 19, TypeScript and Supabase JS. Client components read `products`, `storage_inventory` and `open_shelves` in parallel. The tables hold public demonstration data, with row level security enabled, explicit SELECT policies for anonymous and authenticated roles, and no client write grants. The JSON route serves the same data. No route or workflow performs a stock transaction.

## Local setup and checks

Requires Node 22.6 or newer, because the tests use `--experimental-strip-types`.

```bash
pnpm install
cp .env.example .env.local   # then fill both NEXT_PUBLIC_SUPABASE_* values
pnpm dev                      # http://localhost:3000 and /project
pnpm test && pnpm typecheck && pnpm build
```

Without pnpm, the same scripts run directly: `node node_modules/next/dist/bin/next dev`, `node --experimental-strip-types --test tests/*.test.ts`, `node node_modules/typescript/bin/tsc --noEmit`.

For a fresh Supabase project, run `supabase/schema.sql` and then `supabase/seed.sql` in the SQL Editor.

## Releasing

1. Run the three checks above, then click through the acceptance list below locally at desktop and phone widths.
2. Push to `main`.
3. Deploy from a linked, authenticated checkout: `pnpm dlx vercel@62.2.0 deploy --prod --yes --scope ariel-m-projects`. A fresh clone needs its own `vercel link`, because `.vercel` is not in Git.
4. Recheck the production URLs.

## Before handing back

- [ ] `/`, `/project` and `/api/inventory` load publicly in production.
- [ ] Searching `turtle` shows 25 cases / 300 units across two locations.
- [ ] Turtle refill shows 43 needed, 4 cases, 5 left over.
- [ ] The starter pick produces three stops, A1 → A2 → A3.
- [ ] Alien 5 cases gives a clear shortage, and **Reset sample request** recovers.
- [ ] Loading, unavailable-data and stale-data states read clearly.
- [ ] Keyboard-only use works end to end, with focus always visible.
- [ ] There is no horizontal scroll at 375px and long text wraps.
- [ ] Parts 4 and 5 are still labelled as proposals.
- [ ] No credentials appear in tracked files or rendered output.

## Known limits

- Stock can change after a proposal is generated, so employees confirm cases at each location.
- Routing is numeric aisle/rack/shelf order, not shortest-path optimization.
- Drafts live in one browser on one device and don't sync.
- Only `TURTLE-01` has open-shelf configuration.
- The demo database is publicly readable. Real warehouse data would need authentication, authorization, auditability and transactional writes.
- Automated tests cover the calculation rules only. Add focused browser checks when interaction behaviour changes.
