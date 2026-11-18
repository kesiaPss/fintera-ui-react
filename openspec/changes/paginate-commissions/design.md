## Context

See proposal.md - Why.

Commissions are produced by `ReportService.GenerateCommissions`
(`FinteraAPI/internal/services/report_service.go`). It loads every approved or closed
contract with `PerPage = 0`, derives the commission date, seller, project, rate and
status in Go, appends historical sales, and returns one slice. The handler
`ReportHandler.Commissions` (`internal/handlers/resource_handlers.go`) returns that
slice plus credits from `CommissionCredits` and `pending_credits`. The UI
(`src/features/commissions/pages/index.jsx`) then filters by seller name and sums
totals in the browser.

The calculation is intentionally kept in Go. Pagination therefore happens after the
full set is computed. This reduces bytes sent to the browser; it does not reduce the
database or CPU work of the request.

The export endpoint (`commissions_report.go`, `reports/commissions_export`) reuses the
same service and must keep its current output.

## Goals / Non-Goals

**Goals:**
- Return one page of commissions and one page of credits per request, at most 20 rows each.
- Return totals, average rate, net pending and the seller list over the full filtered period.
- Filter by seller id on the server.
- Make the analytics project selector load on demand with search, without truncation.

**Non-Goals:**
- Moving the commission calculation to SQL (explicitly out of scope).
- Changing the commission rules, the commission date, or the historical-sales logic.
- Changing the export endpoint or its PDF/CSV/XLSX output.
- Paginating the contract ledger tab or the contract detail table (documented exception).

## Decisions

**1. Paginate in Go after computing the full set.**
Alternative considered: SQL `LIMIT/OFFSET` with a parallel aggregate query. Rejected
for this change because it duplicates the commission rules in SQL. Trade-off: the
request still loads all contracts. A later change can move the calculation to SQL
behind the same response contract, because the response shape does not change.

**2. Totals are computed from the full filtered slice, before paging.**
The `totals` object is built with the same arithmetic the UI uses today:
- `commission`, `amount`, `paid`, `pending`, `paid_count` as sums over the filtered items.
- `average_rate` = `commission / amount * 100` over the filtered items (weighted,
  same formula as `averageRate` in the page). Returns `0` when `amount` is `0`.
- `net_pending` = pending total minus `pending_credits` for the same filters.

**3. Seller filter by `seller_id`.**
The query parameter `seller_id` filters items where `SellerID` equals the value.
Items without a seller id are excluded when a seller is selected. The `sellers` list
is built from the full period before the seller filter is applied, so the selector
never shrinks when a seller is chosen. Each entry is `{ id, name }`, sorted by name.
Items without seller id do not appear in `sellers`.

For users whose role is not admin, `seller_id` is ignored. The server always filters
by the authenticated user's id, so a seller never receives another seller's rows,
credits or `net_pending`. No 400 or 403 is returned for that case; only an admin
request with an invalid or zero `seller_id` returns 400.

**4. Credits are filtered with the same seller id.**
When `seller_id` is present, `CommissionCredits` is called for that seller so that
`pending_credits` and `net_pending` match the visible commissions. Without
`seller_id`, behavior is unchanged from today. The credits list is paginated with
`credits_page` and `credits_per_page`.

**5. Page size handling.**
`per_page` and `credits_per_page` default to 20 and are clamped to a maximum of 20
(values above are not an error). `page` and `credits_page` below 1 are treated as 1.
A page past the end returns an empty list with correct pagination. This keeps
existing callers working while enforcing the 20-row rule.

**6. Response shape.**
```
{
  "commissions": [...],               // one page
  "pagination": { page, per_page, total, total_pages },
  "totals": { commission, amount, paid, pending, paid_count, average_rate, net_pending },
  "sellers": [{ id, name }],
  "credits": [...],                   // one page
  "credits_pagination": { page, per_page, total, total_pages },
  "pending_credits": number,
  "net_pending": number               // kept for compatibility, same as totals.net_pending
}
```
`net_pending` stays at the top level so existing consumers do not break.

**7. Frontend data flow.**
- A single `load` call sends `start_date`, `end_date`, `seller_id`, `page`, `per_page=20`,
  `credits_page`, `credits_per_page=20`.
- Changing period or seller resets `page` to 1.
- After "Marcar pagada", the current page is refetched so the row, totals and KPIs
  come from the server.
- The seller selector is populated from `sellers`. The seller state holds the id.
- After a period change, if the selected seller is not in the response's `sellers`
  list, the filter resets to all sellers. The `sellers` list describes the period,
  so an invisible filter would otherwise return an empty page while the selector
  appears to show "all sellers".

**8. Shared project selector.**
A new `ProjectSelect` in `src/shared/ui/` replaces the native select in analytics.
It takes `value`, `onChange`, and loads through `projectsApi.list({ page, per_page: 20, search_term })`
with a 400 ms debounce on typing (`useDebounce`). "Load more" increments the page.
If `value` is not in the loaded page, it loads that project with `projectsApi.get(id)`
only to display its name. The component is reused by the trend filter. The options
are real buttons, so focus moves between them with ArrowDown/ArrowUp, Home/End,
Enter/Space select and Escape closes the popover; from the search input, ArrowDown
focuses the first option and ArrowUp the last one. No `aria-activedescendant` is
needed because the DOM focus is the option itself.

**9. Pagination component.**
Use the existing `Pagination` component (`src/shared/ui/Pagination.jsx`) with
`perPage={20}`, `total`, `pageCount` from the server response, consistent with the
payments, audits and projects lists.

**10. Seller dashboard uses the same contract.**
The seller dashboard (`src/features/seller/pages/index.jsx`) is a second consumer of
`GET /api/v1/reports/commissions` for the current month. It reads the KPIs, the
average rate and the tab count from `totals` and `pagination.total`, not from the
rows it received. Its commissions tab pages the list with `pagination` and
`perPage={20}`, requesting `{ page, perPage: 20 }` from the server. A page change
refreshes the list (and returns the same totals); a tab or search change returns to
page 1. The credits card uses the server `pending_credits` and pages its credits
with `credits_pagination`. The shared `commissionsApi.list` keeps the period-only
call working for callers that omit the third argument.

**11. Seller dashboard search is server-side.**
The dashboard search box used to filter the loaded page in the browser, so it only
matched the current 20 rows. The term is now debounced (300 ms, `useDebounce`) and
sent as `search`, which the server applies to `commissions` and to
`pagination.total`/`total_pages`. `totals`, `sellers`, `pending_credits` and
`net_pending` keep describing the full period, so the KPIs never change while the
seller searches. The response adds `pagination.period_total` (total before `search`)
so the "Comisiones" tab label can keep showing the period total while the list shows
the filtered pagination. The client-side `filteredCommissions` is removed. The term
is only sent while the commissions tab is active, and changing tabs clears the box
and returns the list to page 1.
Alternative considered: keep filtering in the browser and search across every page.
Rejected because it needs the full period in memory, which is exactly what this
change removes.

**12. Export accepts the seller filter.**
`GET /api/v1/reports/commissions_export` gains `seller_id`, matching the report
endpoint. `commissionsApi.download(start, end, format, { sellerId })` appends it to
the query, and the page's `handleExport` passes the seller currently selected, so the
CSV/XLSX/PDF matches the visible table. Without a seller the parameter is omitted and
the file keeps the previous behavior.

## Risks / Trade-offs

- **[Heavy computation per request]** The server still loads all contracts for every
  page request. → Mitigation: documented trade-off; the response shape is designed so
  the SQL migration can happen later without UI changes. Egress drops; CPU does not.
- **[Divergent totals between UI and API]** Totals move from the browser to the server.
  → Mitigation: Go tests comparing totals with a fixture; manual comparison on staging
  for one period before release.
- **[Seller name vs id]** Some commissions may have a seller name but no `seller_id`.
  → Mitigation: those rows appear in the unfiltered list and are excluded only when a
  seller is selected; reported in the release notes.
- **[Seller reading another seller's data]** A non-admin could pass another user's
  `seller_id`. → Mitigation: the parameter is ignored for non-admin roles and the
  server uses the caller's id for rows and credits; covered by a handler test.
- **[Credits scope change]** Credits are now filtered by seller id when a seller is
  selected. The UI currently filters credits by name. → Mitigation: same rule as
  items; covered by a test that compares visible credits with `pending_credits`.
- **[Breaking response for API clients]** `commissions` and `credits` now return one
  page. → Mitigation: the only in-repo consumer is the commissions page; the export
  endpoint is unchanged. Check other clients before deploy.
- **[Seller dashboard search]** The dashboard search was client-side over the loaded
  page. → Mitigation: the term is now sent to the server with a 300 ms debounce, and
  the period KPIs stay on the server totals; the tab label reads `period_total`.
- **[Export mismatch]** An export without `seller_id` while a seller is selected
  would download other sellers' rows. → Mitigation: the page always forwards the
  visible `sellerId`; without one the parameter is omitted.
- **[Concurrent change]** `FinteraAPI/openspec/changes/improve-analytics-exports`
  touches the commissions export area. → Mitigation: no shared requirement; release
  both in the same window.

## Migration Plan

1. Backend: add paging, totals, sellers and seller id filter to the handler and
   service helpers; keep `GenerateCommissions` and the export untouched; update Swagger.
2. Backend tests and staging check of totals against the current UI numbers for one month.
3. Frontend: switch the commissions page to server totals and pages; update the API client.
4. Frontend: add `ProjectSelect` and use it in analytics.
5. Frontend: add the 20-row rule to the commissions credits card and document exceptions.
6. Release backend and frontend together. The old frontend against the new API would
   show only the first page and page-one totals as if they were complete, and the new
   frontend needs `pagination`, `totals` and `sellers`, so it does not work against the
   old API. Neither order is safe on its own.

**Rollback:** redeploy the previous frontend and backend images. No database migration
is involved.

## Open Questions

None that change specs or tasks. Remaining checks are verification steps in tasks.md.
