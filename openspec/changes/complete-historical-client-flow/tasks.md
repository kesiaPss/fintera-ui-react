## 1. API contract

- [x] 1.1 Expose `seller_rate` on `GET /commissions/rules` for sellers, resolved as exception → default
- [x] 1.2 Add `GET /historical_sales/:id` with seller-own/admin-any authorization
- [x] 1.3 Keep `PUT /historical_sales/:id` limited to pending records and add coverage for rate/amount consistency
- [x] 1.4 Add API tests for the rules response, show endpoint and admin historical filters

## 2. Historical form

- [x] 2.1 Load the effective rate from the rules response and make the rate field editable
- [x] 2.2 Keep rate and amount consistent in both directions (rate/price → amount, amount → rate)
- [x] 2.3 Support edit mode at `/vendedor/clientes/historicos/:id` (load, validate permissions, PUT, success/error copy)
- [x] 2.4 Add the edit route in `src/Router.jsx`
- [x] 2.5 Add tests for the create payload with an overridden rate, the amount-rate recalculation and edit mode

## 3. Seller clients

- [x] 3.1 Show "Histórico · por validar" in the seller clients list
- [x] 3.2 Add an Editar action for pending historical rows (desktop and mobile)
- [x] 3.3 Keep admin Validar/Rechazar actions alongside Editar
- [x] 3.4 Update `clientsRows` tests for the new actions

## 4. Admin validation tab

- [x] 4.1 Add the "Comisiones / Históricos por validar" tabs to `/commissions`
- [x] 4.2 Implement the historical tab: KPIs, status/seller filters, search and table
- [x] 4.3 Wire Validar, Rechazar and Editar with toasts and refresh
- [x] 4.4 Add the tab and empty/error/loading states with tests

## 5. CSV

- [x] 5.1 Add `tasa` and `comision` to the template and field mapping
- [x] 5.2 Cover the mapping and import payload in tests

## 6. Internationalization and docs

- [x] 6.1 Add ES/EN keys for the new labels, hints, states and toasts
- [x] 6.2 Update `documentation/design/seller-flow-changes.md` and the seller docs where the flow is described
- [x] 6.3 Add the admin-only in-app article "Validating historical clients" and the technical feature doc

## 7. Verification

- [x] 7.1 Run `npm run verify` in FinteraUI
- [x] 7.2 Run the FinteraAPI test suite for the changed packages
- [x] 7.3 Check `12i`, `12b`, `11` and `11d` at 1440; the 390 layout is covered by the responsive tables/mobile cards in the tab tests (the design has no 390 frames for these screens)
