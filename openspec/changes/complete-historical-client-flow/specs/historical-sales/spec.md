## ADDED Requirements

### Requirement: Historical commission rate

The historical form SHALL preload the seller's effective historical rate,
resolved as the per-seller exception when present, otherwise the global default.
The seller SHALL be able to override the rate for one record. The system SHALL
keep the rate and the commission amount consistent: changing the rate or the sale
price recalculates the amount, and changing the amount recalculates the effective
rate.

#### Scenario: Seller exception is preloaded

- **WHEN** a seller with a 6% exception opens the historical form
- **THEN** the rate field shows 6%
- **AND** the seller can change it for this record

#### Scenario: Rate override recalculates the amount

- **WHEN** the seller enters a sale price and changes the rate to 7%
- **THEN** the amount is recalculated as 7% of the sale price
- **AND** the saved record stores both values

#### Scenario: Amount override recalculates the rate

- **WHEN** the seller edits the commission amount manually
- **THEN** the effective rate is recalculated from the amount and the sale price
- **AND** the saved record does not keep a mismatched rate

### Requirement: Edit pending historical records

A seller SHALL be able to edit their own pending historical record. An admin
SHALL be able to edit any pending historical record. Validated records SHALL
remain immutable for sellers. The edit form SHALL load the existing record and
submit the update through `PUT /api/v1/historical_sales/:id`.

#### Scenario: Seller edits a pending record

- **WHEN** the seller opens Editar on a pending historical client
- **THEN** the form is populated with the stored values
- **AND** saving updates the record without creating a reservation or blocking a lot

#### Scenario: Admin edits any pending record

- **WHEN** an admin opens Editar on a pending historical record
- **THEN** the form is populated even if another user created the record
- **AND** the update keeps the record pending until it is validated

#### Scenario: Validated record is immutable for the seller

- **WHEN** a seller tries to edit a validated historical record
- **THEN** the API rejects the update

### Requirement: Admin validates from commissions

The admin commissions area SHALL provide a "Históricos por validar" tab with the
pending count, totals for pending, validated and rejected records, filters by
seller and status, search, and Validar, Rechazar and Editar row actions.
Validating or rejecting SHALL never create a reservation or block a lot.

#### Scenario: Admin opens the historical tab

- **WHEN** an admin selects "Históricos por validar" in `/commissions`
- **THEN** the pending historical records are listed
- **AND** the tab shows the pending, validated and rejected totals

#### Scenario: Admin validates a record

- **WHEN** an admin clicks Validar on a pending historical record
- **THEN** its status becomes `validated`
- **AND** it leaves the pending list after the refresh
- **AND** no reservation or lot block is created

#### Scenario: Admin rejects a record

- **WHEN** an admin clicks Rechazar on a pending historical record
- **THEN** its status becomes `rejected`
- **AND** it leaves the pending list after the refresh
