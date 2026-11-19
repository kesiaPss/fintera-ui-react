## Context

`historical_sales` stores client data as free text. The reservation wizard and
the admin Users list both query `users`, so historical clients never appear in
either place. The seller list already combines contracts and historical sales,
which can show the same person twice once a contract exists.

## Decisions

### Customer account as the source of truth

- `historical_sales.client_user_id` links to `users`.
- `users.historical_client = true` marks accounts created by the migration.
- Resolution order: identity, then email. An existing customer account is reused.
- Staff identities (admin/seller) are rejected with a conflict instead of being
  linked as clients.

### Placeholder accounts

- Accounts created from a historical record do not send a welcome email.
- They use a random password, `must_change_password = true`,
  `email_notifications = false` and no RTN.
- Missing emails become `historico+<identity>@fintera.local`. The UI shows
  **No email** and hides the invite action.
- A real email already used by another identity is not stolen; the new account
  keeps a placeholder.

### Backfill

- `cmd/backfill-historical-clients` processes `client_user_id IS NULL` in id
  order and is idempotent.
- The Docker start command runs the backfill after migrations and seeds:
  `make migrate-up && make seed && ./historical-clients-backfill && ./main`.
- Per-record conflicts are logged and skipped; the next deployment retries them.

### UI

- Users list: **HISTÓRICO** chip, **Históricos** filter and a separate stats
  count.
- Reservation search: historical results keep the normal search and show the
  chip; selecting one reuses the account.
- Seller clients: rows merge by `client_user_id`, keeping the contract data and
  the historical chip/edit action.

## Risks

- Creating placeholder accounts increases the Users list; the historical flag
  and filter isolate them.
- A real customer with a different identity but the same email gets a new
  placeholder account instead of being merged.
- Rejected historical records keep their linked account; an admin can deactivate
  or edit it.
