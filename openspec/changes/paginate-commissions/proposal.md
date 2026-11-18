## Why

The admin commissions page downloads every commission in the selected period and
renders them in one table. Totals, the seller filter and the seller list are all
computed in the browser from that full array. Large periods make the page slow
and the response heavy, and the rest of the admin UI already limits lists to 20
rows per page, so this page is the outlier.

The same pattern appears in the analytics project selector, which loads the first
100 projects and silently drops the rest, and in the commission credits card,
which renders every credit at once.

## What Changes

- The commissions list is paginated with 20 rows per page, served by
  `GET /api/v1/reports/commissions` with `page` and `per_page` (maximum 20).
- Totals (`commission`, `amount`, `paid`, `pending`, `paid_count`, `net_pending`)
  are computed by the server over the full filtered set, not over the visible page.
- The seller filter is applied on the server by `seller_id`, not by seller name.
- The seller selector is populated from a `sellers` list returned by the same
  response, covering the whole period, so it does not depend on the current page.
- Commission credits are paginated (20 per page) with their own `credits_page`
  and `credits_per_page` parameters.
- The analytics project filter becomes a searchable selector that loads 20
  projects at a time, uses the existing `search_term` on `/api/v1/projects`, and
  never truncates silently.
- A cross-cutting rule: every table or list in the admin UI shows at most 20 rows
  per page and has pagination controls. The contract ledger tab and the contract
  detail table are explicitly excluded by decision and documented as exceptions.
- The commission calculation stays in Go. Moving it to SQL is out of scope.
- **BREAKING** for API consumers of `GET /api/v1/reports/commissions`: the
  response gains `pagination`, `totals`, `sellers` and `credits_pagination`, and
  `commissions` and `credits` return one page instead of all rows. The
  `commissions_export` endpoint is unchanged.

## Capabilities

### New Capabilities

- `list-pagination`: the cross-cutting rule for admin lists (20 rows per page,
  pagination controls, documented exceptions).

### Modified Capabilities

- `commissions`: admin review is paginated, totals and the seller list are
  server-computed, the seller filter uses `seller_id`, and credits are paginated.
- `analytics`: the project filter is a paged, searchable selector instead of a
  100-item native select.

## Impact

- **FinteraAPI** (`/Users/sergioperalta/Documents/Source/FinteraAPI`):
  `internal/handlers/resource_handlers.go` (`ReportHandler.Commissions`),
  `internal/services/report_service.go` (totals and paging helpers, reusing
  `GenerateCommissions` unchanged), and Swagger annotations in `docs/`.
  `GenerateCommissions` and `commissions_report.go` stay unchanged so the export
  keeps its current output.
- **FinteraUI**: `src/features/commissions/` (page, `api.js`, credits card, tests),
  `src/features/analytics/pages/index.jsx`, a new shared `ProjectSelect` in
  `src/shared/ui/` exported from `index.js`, and strings in `src/locales/`.
- **Coordination**: `FinteraAPI/openspec/changes/improve-analytics-exports` also
  touches the commissions report area (export only). No requirement overlaps, but
  both changes should land in the same release window to avoid confusion.
- **Performance**: the server still loads all contracts per request, as today.
  Egress per request drops because the response carries one page. CPU and database
  work do not change in this change.
- **Documentation**: `documentation/features/generic-list.md` gets the 20-row rule
  and the exceptions; the API docs under `documentation/` get the new parameters.
