# Historical clients

Historical clients migrate sales that happened before the team started using
Fintera. They are stored in `historical_sales`, not as reservations, so they
never touch projects, lots, availability, or the seller acceptance score.

## Behavior

- Creating a historical record sets `validation_status = pending`.
- The commission is stored with the real sale date and
  `commission_origin = historical`.
- The record creates no reservation, blocks no lot, changes no availability and
  does not affect the seller score.
- Pending records appear in **My clients** as `Historical · pending validation`.
- Validated records leave the pending queue but stay historical sales.
- Rejected records are excluded from commission totals.

## Effective commission rate

The historical form preloads the seller's effective rate:

1. Per-seller exception (`seller_commission_rates`).
2. Otherwise, the global default rate (`GET /commissions/rules`).

`GET /commissions/rules` returns `seller_rate` for sellers only. Admins keep the
global rules response. The form sends the rate it shows, so the record stores
the effective value, not an implicit default.

The rate and the amount stay consistent in the form:

- Changing the rate or the sale price recalculates the amount.
- Changing the amount recalculates the effective rate.
- Both values are sent on create/update.

Validation does not recompute the commission. An admin or the seller can correct
it while the record is pending.

## Endpoints

| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/historical_sales` | seller (own), admin (all) | List/filter the queue |
| `GET` | `/api/v1/historical_sales/:id` | seller (own), admin (any) | Load the edit form |
| `POST` | `/api/v1/historical_sales` | seller, admin | Create a record |
| `PUT` | `/api/v1/historical_sales/:id` | owner or admin, pending for sellers | Update a record |
| `POST` | `/api/v1/historical_sales/:id/validate` | admin | Validate |
| `POST` | `/api/v1/historical_sales/:id/reject` | admin | Reject |
| `POST` | `/api/v1/historical_sales/import` | seller, admin | CSV import |

`GET /historical_sales` accepts `status`, `seller_id` (admin), `search_term`,
`page`, `per_page` and `sort` (for example `sale_date-desc`).

## Frontend

- **Create/edit form:** `src/features/seller/pages/clients/historical/index.jsx`,
  mounted at `/vendedor/clientes/historicos` and
  `/vendedor/clientes/historicos/:id`.
- **Seller list actions:** `src/features/seller/pages/index.jsx` shows
  `Historical · pending validation` and an **Edit** action for pending records.
  Admins also get **Validate** and **Reject**.
- **Admin queue:** `src/features/commissions/components/HistoricalValidationTab.jsx`,
  rendered from `/commissions?tab=historical` with KPIs, seller/status/search
  filters and Edit / Validate / Reject actions.
- **CSV:** `src/features/seller/utils/historicalCsv.js` and
  `src/features/seller/components/HistoricalImportSheet.jsx`. The template
  includes `tasa` and `comision`, mapped to `rate` and `commission_amount`.

## Permissions and audit

- Sellers can edit only their own pending records.
- Admins can edit any pending record and validate or reject any record.
- Validated records are immutable for sellers.
- Create, update, validate and reject write audit events
  (`HISTORICAL_CREATE`, `HISTORICAL_UPDATE`, `HISTORICAL_VALIDATE`,
  `HISTORICAL_REJECT`).

## Related

- [Seller flow changes](../design/seller-flow-changes.md)
- [User documentation (in-app guide)](user-documentation.md)
- OpenSpec change: `openspec/changes/complete-historical-client-flow/`
