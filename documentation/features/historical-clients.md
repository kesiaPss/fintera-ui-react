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

## Customer account linkage

Every historical sale is linked to a `users` row with `role = user` and
`users.historical_client = true` through `historical_sales.client_user_id`. This
makes the client visible in the admin Users list and selectable in the
reservation wizard.

- The resolver looks up the identity first, then the email, and reuses an
  existing customer account when possible.
- New accounts are created without sending a welcome email, with a random
  password, `must_change_password = true`, `email_notifications = false` and no
  RTN.
- When the historical record has no email, the account uses a non-deliverable
  `historico+<identity>@fintera.local` address. The UI shows **No email** and
  hides the invite action until an admin adds a real address.
- Edits to a pending sale keep the linked account and refresh its name, phone
  and real email when applicable.
- Existing records are linked by `make backfill-historical-clients`; the Docker
  deployment runs `./historical-clients-backfill` after migrations and seeds.

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

`GET /users?historical=1` lists customer accounts created from historical sales.
`GET /users/stats` returns a separate `historical` count. The response includes
`historical_client` on users and `client_user_id` on historical sales.

## Frontend

- **Create/edit form:** `src/features/seller/pages/clients/historical/index.jsx`,
  mounted at `/vendedor/clientes/historicos` and
  `/vendedor/clientes/historicos/:id`.
- **Seller list actions:** `src/features/seller/pages/index.jsx` shows
  `Historical · pending validation` and an **Edit** action for pending records.
  Admins also get **Validate** and **Reject**. When a historical client already
  has a contract, the rows merge by `client_user_id`.
- **Admin queue:** `src/features/commissions/components/HistoricalValidationTab.jsx`,
  rendered from `/commissions?tab=historical` with KPIs, seller/status/search
  filters and Edit / Validate / Reject actions.
- **Admin Users:** `src/features/users/pages/index.jsx` shows the
  **HISTÓRICO** chip, the **Históricos** filter and a friendly **No email**
  label for placeholder accounts.
- **Reservations:** `src/features/projects/pages/reserve/ReserveWizard.jsx`
  searches the same `users` endpoint and marks historical results with the
  **HISTÓRICO** chip.
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
- OpenSpec changes: `openspec/changes/complete-historical-client-flow/` and
  `openspec/changes/link-historical-clients-to-users/` (FinteraUI) plus the
  matching FinteraAPI change.
