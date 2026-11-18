## 1. Backend: commissions report (FinteraAPI)

- [x] 1.1 Add a paging helper that clamps `per_page` and `credits_per_page` to 20, defaults them to 20, treats `page` below 1 as 1, and returns `pagination` values; verify with unit tests in `internal/handlers` for default, clamp, page 0 and page past the end.
- [x] 1.2 Add a totals helper that computes `commission`, `amount`, `paid`, `pending`, `paid_count`, `average_rate` and `net_pending` over the filtered items; verify with a unit test whose expected values match a hand-computed fixture.
- [x] 1.3 Add the `seller_id` query filter in `ReportHandler.Commissions` (exclude items without `SellerID`); verify with a handler test for a seller with and without matching rows.
- [x] 1.4 Build the `sellers` list (`id`, `name`, sorted by name) from the period before the seller filter; verify the list does not shrink when `seller_id` is set.
- [x] 1.5 Call `CommissionCredits` with the selected seller id when present, paginate credits with `credits_page` and `credits_per_page`, and keep `pending_credits` over all credits; verify with a handler test on two pages of credits.
- [x] 1.6 Return the new response shape (`commissions`, `pagination`, `totals`, `sellers`, `credits`, `credits_pagination`, `pending_credits`, `net_pending`); verify with a handler test that decodes every key.
- [x] 1.7 Confirm `GenerateCommissions`, `commissions_report.go` and the export handler are unchanged; verify `go test ./...` passes and the export tests still pass.
- [x] 1.8 Update Swagger annotations for the new query parameters and response; verify with `make swagger` and a clean `git diff` in `docs/`.
- [x] 1.9 Update `docs/architecture/api-and-auth.md` (or the reports section) with the new parameters; verify the doc mentions `seller_id`, the 20-row cap and the response keys.

## 2. Frontend: commissions page (FinteraUI)

- [x] 2.1 Extend `commissionsApi.list` in `src/features/commissions/api.js` to accept `{ page, perPage, sellerId, creditsPage, creditsPerPage }`; verify with a unit test that the query string contains each parameter.
- [x] 2.2 Replace client-side seller filtering and totals in `src/features/commissions/pages/index.jsx` with the server `totals`, `sellers` and `pagination`; verify with `index.test.jsx` mocking the new response.
- [x] 2.3 Add `<Pagination perPage={20}>` to the commissions table and its mobile card list; verify the range text and page changes in a test.
- [x] 2.4 Reset `page` to 1 when period or seller changes; verify with a test that changes the seller after page 2.
- [x] 2.5 Store the selected seller as an id and populate the seller selector from `sellers`; verify the selector lists sellers that are not on the current page.
- [x] 2.6 Refetch the current page after "Marcar pagada" so row, totals and KPIs update; verify with a test that asserts a second request after payout.
- [x] 2.7 Keep the average rate formula equal to `commission / amount * 100` from the server; verify the KPI text in a test with a known fixture.
- [x] 2.8 Paginate `CommissionCreditsCard` with `Pagination` at 20 per page and use the server `credits_pagination`; verify with a test that shows page 2 of credits.
- [x] 2.9 Clear the seller filter when the selected seller is absent from the response's `sellers` list, so changing the period never leaves an invisible `seller_id` filter; verify with a test that changes the period after selecting a seller and asserts the next request has no `sellerId`.
- [x] 2.10 Add `{ sellerId }` to `commissionsApi.download(start, end, format, options)` so the export query carries `seller_id`, and omit it without a seller; verify with `commissions/api.test.js` for both cases plus the period-only call.
- [x] 2.11 Forward the visible `sellerId` from `handleExport` in `src/features/commissions/pages/index.jsx`; verify with the page test "sends the visible seller filter to the export" and the updated format test.

## 2b. Frontend: seller dashboard (FinteraUI)

- [x] 2b.1 Read the seller dashboard commission KPIs, average rate and tab count from the server `totals` and `pagination.total` instead of summing the rows of `src/features/seller/pages/index.jsx`; verify with `index.test.jsx` (seller) "reads the KPIs from the server totals when the page holds one commission".
- [x] 2b.2 Paginate the seller commissions tab with `<Pagination perPage={20}>` driven by `pagination`, requesting each page with `commissionsApi.list(start, end, { page, perPage: 20 })`; verify "requests the next page and keeps the totals unchanged".
- [x] 2b.3 Keep the seller credits card on the server `pending_credits` and page its credits; verify "pages the credits card and uses the server pending credits total".
- [x] 2b.4 Return the seller commission list to page 1 when the tab or the search changes; verify "returns the commission list to page 1 when the search changes".
- [ ] 2b.5 Return the seller commission list to page 1 when the month changes. Not verified: the seller dashboard has no month selector (the period is always the current month), so there is no user action to test. Keep open until a month selector exists or the requirement is removed.
- [x] 2b.6 Debounce the seller dashboard search (300 ms, `useDebounce`), send it as `search` only on the commissions tab, and remove the client-side commission filter; verify with "sends the search term to the server and keeps the returned page unfiltered".
- [x] 2b.7 Show the commissions tab count from `pagination.period_total` with `pagination.total` as fallback; verify with "shows the period total in the commissions tab label".
- [x] 2b.8 Keep the page-1 reset while searching and include the term in the request; verify with "returns the commission list to page 1 when the search changes" asserting `page: 1` and `search`.

## 3. Frontend: analytics project selector

- [x] 3.1 Create `ProjectSelect` in `src/shared/ui/ProjectSelect.jsx` with search (400 ms debounce via `useDebounce`), 20 items per page and a "load more" control; verify with a Testing Library test for search and load more.
- [x] 3.2 Keep the selected project name visible when it is outside the loaded page by loading it with `projectsApi.get`; verify with a test that starts with a preselected id not in the first page.
- [x] 3.3 Export `ProjectSelect` from `src/shared/ui/index.js`; verify the import path `@/shared/ui` works in a test.
- [x] 3.4 Replace the native project select in `src/features/analytics/pages/index.jsx` (and the trend filter option list) with `ProjectSelect`; remove the `per_page: 100` fetch; verify with the existing analytics tests plus a test that no request asks for 100 projects.
- [x] 3.5 Add en and es strings for the new controls to `src/locales/en.json` and `src/locales/es.json`; verify with `npm run test:run` that no missing-key warning appears for the new keys.
- [x] 3.6 Remove the unused `listProjects` from `src/features/commissions/api.js`; verify with `grep` that no references remain.
- [x] 3.7 Add keyboard navigation to `ProjectSelect`: ArrowDown/ArrowUp between options (including "All projects"), Home/End to the first/last option, Enter/Space to select, Escape to close, and ArrowDown/ArrowUp from the search input to the first/last option; verify with `ProjectSelect.test.jsx` covering arrow movement, Home/End, Enter, Space and Escape.

## 4. Shared list rule

- [x] 4.3 Add a shared pagination helper that reads `total_pages`, the legacy `pages` key, and computes pages from `total`; verify with unit tests in `src/shared/utils/pagination.test.js`.
- [x] 4.4 Use the helper in the payments, projects and reservation user lists so their controls appear when there is more than one page; verify in the browser with 444 payments and 28 projects (20 per page, page 2 reachable).

- [x] 4.1 Mark the contract ledger tab and contract detail table as documented exceptions in `documentation/features/generic-list.md`; verify the doc lists both and the shortcuts dialog.
- [x] 4.2 Document the 20-row rule and the pagination reset behavior in `documentation/features/generic-list.md`; verify the section exists and links to this change.

## 5. Verification and release

- [x] 5.1 Run `npm run verify` in FinteraUI (lint, tests, build) and confirm it passes; this is required before reporting done.
- [x] 5.2 Run `go build ./...`, `go test ./...` and `make lint` in FinteraAPI; verify all pass.
- [ ] 5.3 Compare totals for one month on staging between the old page (before deploy) and the new response; verify every total matches to the cent.
- [ ] 5.4 Check `https://fintera-staging.securexapp.com/commissions` after deploy: 20 rows per page, pagination text, seller list complete, totals unchanged across pages; verify manually and record the result.
- [x] 5.5 Validate the change with `openspec validate paginate-commissions` in FinteraUI and confirm no errors.
- [x] 5.6 Re-run `npm run verify` after the seller search, export seller filter and project selector keyboard tasks; verify lint, tests and build pass and report the test count and any new warnings.
