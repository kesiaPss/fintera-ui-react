## Why

Historical clients are created with the global default rate even when the seller
has a per-seller exception, the rate and amount cannot be corrected after saving,
and admins cannot find the validation action because it only exists inside the
seller workspace. The result is a record that is stuck "pending validation" with
the wrong commission and no discoverable way to fix or approve it.

The design now includes an editable historical rate (`12i`), an "Editar" action
on pending historical rows (`12b`), and an admin validation tab in commissions
(`11d`). This change makes that flow shippable.

## What Changes

- **Effective historical rate**: `GET /api/v1/commissions/rules` SHALL expose the
  seller's effective historical rate (seller exception → global default) so the
  historical form can preload the correct value. The seller SHALL be able to
  override the rate for one record.
- **Consistent rate and amount**: changing the rate or the sale price recalculates
  the commission amount; changing the amount recalculates the effective rate.
  The stored record SHALL keep both values consistent.
- **Edit pending historical records**: sellers can edit their own pending records;
  admins can edit any pending record. Validated records stay immutable for
  sellers. A new `GET /api/v1/historical_sales/:id` supports loading the record
  for the edit form.
- **Discoverable admin validation**: a "Históricos por validar" tab in
  `/commissions` lists pending records with totals, seller/search filters and
  Validar / Rechazar / Editar actions. Validating or rejecting never creates a
  reservation or blocks a lot.
- **CSV mapping**: the historical import template and field mapping include the
  rate and commission amount, so bulk migrations can set them too.

## Capabilities

### New Capabilities

- `historical-sales`: rate override, consistent commission, editing pending
  records and the admin validation queue.

### Modified Capabilities

- `commissions`: the admin review area gains the "Históricos por validar" tab and
  the seller-facing rules response exposes the effective historical rate.

## Impact

- UI: `src/features/seller/pages/clients/historical/**`,
  `src/features/seller/pages/index.jsx`, `src/features/commissions/pages/**`,
  `src/features/seller/api.js`, `src/features/seller/components/HistoricalImportSheet.jsx`,
  `src/features/seller/utils/historicalCsv.js`, `src/Router.jsx`,
  `src/locales/{en,es}.json`, `documentation/design/seller-flow-changes.md`.
- API: FinteraAPI `complete-historical-client-flow` change (rules response,
  historical show endpoint and validation/filter behavior).
- Data: no schema change; `historical_sales.rate` and `commission_amount` are
  already stored.
