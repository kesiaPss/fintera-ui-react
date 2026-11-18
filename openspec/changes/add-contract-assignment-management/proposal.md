# Add Contract Assignment Management

## Why

Admins could not see who a reservation was assigned to, why it had no seller,
or correct an assignment after creation. Commission rows with no seller showed
the raw API value `Unknown`.

## What Changes

- Add a "Seller and assignment" card to the contract detail overview.
- Add an admin reassignment dialog with automatic or specific-seller modes.
- Show assignment history and the pending commission status.
- Warn that reassigning a paid commission creates a credit for the previous
  seller.
- Display "Sin vendedor" instead of `Unknown` in the commissions table and link
  the row to the contract detail.
- Keep the assignment card read-only for sellers.

## Capabilities

### New Capabilities

- `contract-assignment-management`: admin visibility and reassignment of the
  contract seller.

## Impact

- `src/features/contracts/api.js`
- `src/features/contracts/components/AssignmentCard.jsx` (new)
- `src/features/contracts/components/ReassignDialog.jsx` (new)
- `src/features/contracts/pages/detail/index.jsx`
- `src/features/commissions/pages/index.jsx`
- `src/locales/{es,en}.json`
- Depends on the FinteraAPI reassignment endpoints.
