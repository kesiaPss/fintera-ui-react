## Context

The historical-sale flow already stores `rate`, `commission_amount`,
`validation_status` and the creator. The API allows a seller to update their own
pending record and an admin to update any record. What is missing is the UI and
the resolver wiring: the form always sends the default rate, no edit route
exists, and the validation action is only reachable from the seller workspace.

## Decisions

### Effective rate is resolved by the API

- `GET /api/v1/commissions/rules` returns the global rules for admins and adds
  `seller_rate` for sellers, resolved as: per-seller exception → global default.
- The form preloads `seller_rate` (falling back to the default) and sends the
  value the user sees. If the user does not touch the field, the effective rate
  is still correct.
- The backend keeps accepting `rate` per record; this is the per-record override.

### Rate and amount stay consistent

- Editing `sale_price` or `rate` recomputes `amount = price × rate / 100`.
- Editing `amount` recomputes `rate = amount / price × 100` (rounded to two
  decimals) when `price > 0`.
- The payload always sends both fields. The backend stores both and never
  recalculates a provided amount against a different rate.

### Editing pending records

- A single form is reused at `/vendedor/clientes/historicos/:id` (and
  `/vendedor/clientes/historicos` for create).
- The form loads `GET /api/v1/historical_sales/:id`, checks permissions, and
  submits `PUT /api/v1/historical_sales/:id`.
- Sellers may edit their own pending records; admins may edit any pending record.
  Validated records remain immutable for sellers.
- The seller clients list and the admin validation tab both link to this route.

### Admin validation lives in commissions

- `/commissions` gets two tabs: "Comisiones" and "Históricos por validar (N)".
- The historical tab fetches filtered lists with `status` and `seller_id` and
  shows totals for pending, validated and rejected records.
- Row actions: **Validar**, **Rechazar** and **Editar**. Validate/reject call the
  existing admin endpoints and refresh the list. Edit opens the shared form.
- The tab is the primary discoverability path; no new navigation section is
  introduced.

### CSV

- The template adds `tasa` and `comision` columns and the importer maps them to
  `rate` and `commission_amount`, matching the API support that already exists.

## Risks

- Two parallel commission-rate fields (`user.commission_rate_override` and the
  exception table) can disagree. The API resolver is the single source of truth;
  the form no longer reads the user field directly.
- The historical tab needs totals without a dedicated stats endpoint. It uses
  small `per_page=1` requests for each status plus the filtered page request.
- Existing pending records keep their stored rate until someone edits them; no
  automatic backfill is performed.
