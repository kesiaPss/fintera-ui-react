## 1. API integration

- [x] 1.1 Consume `historical_client` on users and `client_user_id` on historical sales
- [x] 1.2 Use `GET /users?historical=1` and the `historical` stats count
- [x] 1.3 Keep the deployment backfill documented

## 2. Admin Users

- [x] 2.1 Add the **HISTÓRICO** chip to historical clients
- [x] 2.2 Add the **Históricos** filter and count
- [x] 2.3 Show **No email** and hide the invite action for placeholder emails
- [x] 2.4 Add tests for the chip, filter and placeholder email

## 3. Reservations

- [x] 3.1 Mark historical clients in the search results and selected card
- [x] 3.2 Add a test that a historical client can be selected

## 4. Seller clients

- [x] 4.1 Merge historical and contract rows by `client_user_id`
- [x] 4.2 Keep the historical edit/validate actions on the merged row
- [x] 4.3 Add a merge test

## 5. Documentation

- [x] 5.1 Update the admin historical and users guides
- [x] 5.2 Update the reservations guide and the technical feature doc
- [x] 5.3 Document the deployment backfill

## 6. Verification

- [x] 6.1 Run `npm run verify`
- [x] 6.2 Run the FinteraAPI test suite
- [x] 6.3 Verify a historical client appears in Users and can be selected in a reservation
