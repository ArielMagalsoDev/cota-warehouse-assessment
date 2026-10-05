# CoTa Warehouse Assessment

A mobile-friendly Next.js application for finding inventory, planning open-shelf replenishment, and generating a case pick list in aisle order. The application reads live demonstration inventory from Supabase. Recommendations do not reserve or change stock.

**Application:** https://cota-warehouse-assessment.vercel.app  
**Client handoff and project plan:** https://cota-warehouse-assessment.vercel.app/project

**Repository:** https://github.com/ArielMagalsoDev/cota-warehouse-assessment

**Developer handoff for further refinement:** [HANDOFF.md](HANDOFF.md)

**Read-only API:** https://cota-warehouse-assessment.vercel.app/api/inventory

The API returns JSON with each product, all storage locations, total cases and units, and configured open-shelf quantities. It contains the public assessment inventory only. No API key or database credential is included in its response. For example, TURTLE-01 returns `total_cases: 25` and `total_units: 300`.

## Live setup

The assessment uses the Supabase project `test project` in Armflare's organization, region `ap-southeast-1`. Its project ref is `uukcorwbjfpjayqcjxsp`.

1. Install dependencies: `pnpm install`.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from Supabase Project Settings → API Keys.
3. For a new Supabase project, run `supabase/schema.sql` and then `supabase/seed.sql` in its SQL Editor.
4. Start locally: `pnpm dev` and open `http://localhost:3000`.
5. Validate: `pnpm test`, `pnpm typecheck`, and `pnpm build`.

The publishable key is safe in browser code because the three public tables use row level security and expose SELECT only. Never put a Supabase secret or service-role key in a `NEXT_PUBLIC_` variable. `.env.local` is ignored by Git.

## Architecture

The Next.js App Router serves a single page. Client Components load the three Supabase tables in parallel and handle employee interactions. Calculation modules in `lib/` contain inventory aggregation, replenishment, and pick allocation. This keeps warehouse arithmetic separate from rendering. Draft pick requests are stored in the browser under a versioned local-storage key. Generating a pick list refreshes Supabase data first and blocks output if the refresh fails.

| Table | Purpose |
| --- | --- |
| `products` | SKU, product name, and units per case |
| `storage_inventory` | Complete cases at numeric aisle, rack, and shelf coordinates |
| `open_shelves` | Unit capacity and current unit quantity for configured shelves |

Database checks enforce positive case sizes and locations, nonnegative stock, and shelf quantity no greater than capacity. A unique SKU/location constraint prevents duplicate location rows. The schema grants anonymous and authenticated clients SELECT only and enables RLS with explicit read policies. The demonstration data is public; production warehouse data would require authentication and access controls.

## Business rules

Search matches a SKU or product name without case sensitivity. Total cases sum all locations for a SKU; total units multiply that sum by units per case.

Replenishment computes units needed as `max(0, capacity - current)`, cases to pull as the ceiling of `units needed / units per case`, and leftovers as `cases × units per case - units needed`. For TURTLE-01, a 60-unit shelf with 17 units needs 43 units. Four cases provide 48 units, so five units remain outside the shelf. The app also reports if storage has too few cases.

Pick requests require known SKUs and positive whole-number case quantities. Repeated SKUs are combined before stock validation. A shortage blocks the complete list and shows requested, available, and missing quantities. Valid picks allocate from locations sorted numerically by aisle, rack, and shelf, then sort all stops by the same order. This reduces aisle backtracking; it does not solve the shortest-route problem. The output is an unreserved proposal, so employees should confirm stock at each location.

## Demo walkthrough

1. Search for `turtle`. Confirm 18 cases in A1-R2-S1, 7 in A4-R1-S2, 25 total cases, and 300 total units.
2. Open Shelf replenishment for TURTLE-01. Confirm 43 units needed, four cases pulled, and five leftover units.
3. Open Pick list. Generate the prefilled request: TURTLE-01 three cases, SHARK-02 two cases, ALIEN-04 one case. Confirm the A1 → A2 → A3 sequence.
4. Change ALIEN-04 to five cases and generate again. Confirm the shortage prevents a pick list.

## Written design responses

- [Part 4: Video-assisted inventory observations](docs/ai-video-design.md)
- [Part 5: Intermittent connectivity](docs/offline-reliability.md)

## Assumptions and limitations

- Storage is measured in complete cases; open-shelf stock is measured in units.
- A pick list and replenishment recommendation do not reserve, deduct, or update inventory.
- Numeric aisle order approximates physical progression. Rack and shelf order break ties.
- Only the turtle SKU has supplied shelf settings; other products show that configuration is unavailable.
- Local storage preserves an unfinished pick request on the same browser and device. It does not synchronize drafts across devices.
- The demonstration database allows public reads. Employee sign-in, warehouse-specific permissions, stock transactions, and video processing are beyond this implemented scope.
- A proposed pick can become stale immediately after generation if another employee changes stock; employees must confirm stock while picking.
