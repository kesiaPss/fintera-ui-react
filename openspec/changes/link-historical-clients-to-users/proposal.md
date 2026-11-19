## Why

Historical clients exist only in `historical_sales`, so they are invisible in
the admin Users list and cannot be selected in the reservation search. The admin
can only find them inside the Commissions tab, and a new sale for the same
person would create a duplicate customer account.

## What Changes

- Link every historical sale to a real `user` with `role = user` through
  `historical_sales.client_user_id`.
- Add `users.historical_client` so the admin can identify and filter migrated
  accounts.
- Create or reuse the customer by identity on create/update/import, with a
  non-deliverable placeholder email when the record has no email and no welcome
  email.
- Show historical clients in **Users → Clients** with a **HISTÓRICO** chip and a
  **Históricos** filter.
- Make historical clients selectable in the reservation search (they are normal
  active users).
- Merge the historical row with the contract row in the seller clients list when
  they share `client_user_id`.
- Backfill existing records during deployment with an idempotent command.

## Capabilities

### Modified Capabilities

- `historical-sales`: historical clients get a linked customer account.
- `users`: historical clients appear in the admin list and stats; placeholder
  emails are labelled and not invitable.
- `contracts`: the reservation search can select a historical client as an
  existing customer.

## Impact

- UI: `src/features/users/**`, `src/features/projects/pages/reserve/**`,
  `src/features/seller/pages/index.jsx`, `src/locales/{en,es}.json`, docs.
- API: FinteraAPI `link-historical-clients-to-users` change (migration,
  resolver, backfill command, Docker CMD, Swagger).
- Data: existing `historical_sales` rows are linked by the deployment backfill.
