# Design

## Decisions

- The assignment card lives in the contract detail overview, after the client
  card, matching the `04 - Reserva` "Vendedor asignado" summary.
- History is fetched only for admins from
  `GET /contracts/{guid}/assignments`; sellers keep the current assignment from
  the contract response.
- The reassignment dialog reuses `sellerApi.listSellers` and the shared seller
  normalizers instead of duplicating the picker.
- For `pending` and `submitted` contracts the admin can create a normal pending
  offer or assign directly. For any other status the assignment is forced
  direct so the commission does not depend on a late acceptance.
- A paid commission is not a blocker. The dialog warns that the previous seller
  receives a pending credit and the commission moves to the new seller.
- The commissions table maps the API placeholder `Unknown` to the localized
  "Sin vendedor" label and links the contract id to the detail page so the
  admin can repair it.

## Risks

- Seller data loaded in the dialog can become stale. The API validates the
  seller and returns `SELLER_INACTIVE`.
- Reassignment on a paid contract changes two sellers' balances. The credit is
  visible in the commissions credits card and the action is audited.
