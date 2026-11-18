## MODIFIED Requirements

### Requirement: Admin can review commissions

The system SHALL provide an admin-only `/commissions` area with KPIs (commissions
for the period, paid, pending, average rate) and a paginated table filterable by
period and seller, backed by `GET /api/v1/reports/commissions`. The KPIs SHALL
come from the server totals for the full filtered period, not from the rows on
the current page.

#### Scenario: Admin filters by seller

- **WHEN** an admin selects a seller in the commissions area
- **THEN** only that seller's commissions are shown in the table and KPIs
- **AND** the table returns to page 1

#### Scenario: Average rate is shown

- **WHEN** an admin opens the commissions area
- **THEN** the average commission rate for the full period is displayed as a KPI

## ADDED Requirements

### Requirement: Commission list is paginated

The system SHALL show at most 20 commission rows per page and SHALL show
pagination controls with the current range and the total number of commissions
for the period.

#### Scenario: Default page

- **WHEN** an admin opens the commissions area for a period with more than 20 commissions
- **THEN** the first 20 commissions are shown
- **AND** the pagination shows the range and the total

#### Scenario: Changing page

- **WHEN** an admin selects page 2
- **THEN** the next 20 commissions of the same period and filters are shown

#### Scenario: Page size is capped

- **WHEN** a client requests more than 20 rows per page from `GET /api/v1/reports/commissions`
- **THEN** the server returns at most 20 rows

#### Scenario: Page beyond the last page

- **WHEN** a client requests a page after the last page
- **THEN** the server returns an empty `commissions` list with the correct `pagination` and `total`

### Requirement: Commission totals are computed for the full period

The system SHALL compute the commission totals (`commission`, `amount`, `paid`,
`pending`, `paid_count`, `average_rate`, `net_pending`) over every commission that
matches the period and seller filters, not only over the returned page. The totals
SHALL be returned in the `totals` object of the same response.

#### Scenario: Totals do not change between pages

- **WHEN** the admin moves between pages of the same period and filters
- **THEN** the `totals` values are identical on every page

#### Scenario: Net pending subtracts credits

- **WHEN** the period has pending commission credits
- **THEN** `totals.net_pending` equals the pending commission total minus the pending credits

### Requirement: Seller filter and seller list

The system SHALL filter commissions by `seller_id` on the server and SHALL return
a `sellers` list with the `id` and `name` of every seller that has a commission in
the selected period, regardless of the seller filter and the current page. The
seller selector SHALL be populated from that list.

#### Scenario: Seller list does not depend on the page

- **WHEN** the admin opens the commissions area and the first page contains only one seller
- **THEN** the seller selector still lists every seller with commissions in the period

#### Scenario: Seller filter uses the seller id

- **WHEN** an admin selects a seller
- **THEN** the request includes that seller's `seller_id`
- **AND** commissions without a seller id are not included

#### Scenario: Seller filter clears when the seller leaves the period

- **WHEN** the selected seller has no commissions in a newly selected period
- **THEN** the seller filter resets to all sellers
- **AND** the list shows the period's commissions without a seller filter

#### Scenario: Seller ignores foreign seller_id

- **WHEN** a non-admin user requests `GET /api/v1/reports/commissions` with a `seller_id` that is not their own
- **THEN** the server ignores the parameter and returns only that user's commissions and credits
- **AND** `totals.net_pending` equals that user's pending commissions minus their pending credits
- **AND** the response is not an error

### Requirement: Commission credits are paginated

The system SHALL show commission credits 20 per page, with pagination controls, and
SHALL request them with `credits_page` and `credits_per_page` (maximum 20) on the
same endpoint. The pending credits total SHALL be computed over all credits, not
only the returned page.

#### Scenario: Credits page

- **WHEN** a seller or admin has more than 20 commission credits
- **THEN** the credits card shows the first 20 and pagination controls

#### Scenario: Pending credits total is complete

- **WHEN** the credits card shows page 2
- **THEN** `pending_credits` still equals the total pending across all credits

### Requirement: Totals stay correct after payout

The system SHALL refresh the current page and the server totals after an admin marks
a commission as paid, so the KPIs and the row status stay consistent.

#### Scenario: Payout updates the KPIs

- **WHEN** an admin marks a pending commission as paid
- **THEN** the row shows "Pagada"
- **AND** the paid and pending KPIs reflect the change without a page reload

### Requirement: Seller dashboard uses server totals

The seller dashboard commissions view SHALL show its KPIs, average rate and tab count
from the server `totals` and `pagination` of the current month, not from the rows it
has loaded. Its commission list SHALL show 20 rows per page with pagination controls,
and changing page SHALL NOT change the totals.

#### Scenario: KPIs do not depend on the loaded page

- **WHEN** a seller opens the commissions view and the month has more commissions than fit on the first page
- **THEN** the commission KPIs, the average rate and the tab count show the totals for the whole month
- **AND** the list shows the first 20 commissions with pagination controls

#### Scenario: Seller changes page

- **WHEN** a seller selects page 2 of the commission list
- **THEN** the next 20 commissions are requested with `page` 2 and `per_page` 20
- **AND** the KPIs and the average rate show the same values as on page 1

#### Scenario: Seller credits are paginated

- **WHEN** a seller has more than 20 commission credits
- **THEN** the credits card shows the first 20 with pagination controls
- **AND** the pending credit total is the server total over all credits

#### Scenario: Tab or search change returns to page 1

- **WHEN** a seller changes the search term or the tab while on page 2 of the commission list
- **THEN** the commission list returns to page 1

### Requirement: Seller dashboard searches commissions on the server

The seller dashboard SHALL send the search term to `GET /api/v1/reports/commissions`
as the `search` parameter instead of filtering the loaded page in the browser, after
a short typing pause. The `commissions` list and `pagination.total`/`total_pages`
SHALL be filtered by that term, while `totals`, `sellers`, `pending_credits` and
`net_pending` SHALL keep describing the full period.

#### Scenario: Search filters the list and its pagination

- **WHEN** a seller types a term in the commissions search box
- **THEN** the request includes that term as `search`
- **AND** the table shows the rows returned by the server without client-side filtering
- **AND** the pagination range and page count use the filtered `pagination`

#### Scenario: Search does not change the period KPIs

- **WHEN** the seller dashboard commissions list is filtered by a search term
- **THEN** the commission KPIs, the average rate and the pending credits keep the period values returned in `totals`
- **AND** the commissions tab label shows `pagination.period_total`, falling back to `pagination.total`

#### Scenario: Search does not apply on other tabs

- **WHEN** the seller types in the search box of another tab
- **THEN** the commissions request does not send a `search` term
- **AND** switching tabs clears the search box and returns the commission list to page 1

#### Scenario: Empty search result

- **WHEN** the server returns no commissions for the search term
- **THEN** the tab shows the "no results" empty state instead of the period empty state

### Requirement: Commission export respects the seller filter

The commissions report export (`GET /api/v1/reports/commissions_export`) SHALL accept
a `seller_id` parameter, and the commissions page SHALL send the visible seller filter
when exporting so the file matches the table.

#### Scenario: Export with a seller selected

- **WHEN** an admin selects a seller and exports the commissions report
- **THEN** the download request includes that seller's `seller_id`
- **AND** the file contains only that seller's commissions

#### Scenario: Export without a seller filter

- **WHEN** no seller is selected and the commissions report is exported
- **THEN** the download request does not include `seller_id`
- **AND** the file contains the commissions of every seller in the period
