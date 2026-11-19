## MODIFIED Requirements

### Requirement: Admin can review commissions

The system SHALL provide an admin-only `/commissions` area with KPIs (commissions
for the period, paid, pending, average rate) and a table filterable by period and
seller, backed by `GET /api/v1/reports/commissions`. The table SHALL show the
seller's acceptance score badge and SHALL include historical commissions in the
period KPIs using their real sale date. The area SHALL also provide a
"Históricos por validar" tab with the pending count and the historical validation
queue.

#### Scenario: Admin filters by seller

- **WHEN** an admin selects a seller in the commissions area
- **THEN** only that seller's commissions are shown in the table and KPIs

#### Scenario: Historical commissions count

- **WHEN** a seller has historical commissions with a sale date inside the
  selected period
- **THEN** those amounts are included in the period KPIs
- **AND** they remain identifiable by origin

#### Scenario: Average rate is shown

- **WHEN** an admin opens the commissions area
- **THEN** the average commission rate is displayed as a KPI

#### Scenario: Historical validation tab is available

- **WHEN** an admin opens `/commissions`
- **THEN** a "Históricos por validar" tab shows the pending historical count
- **AND** selecting it opens the validation queue

#### Scenario: Historical tab honors filters

- **WHEN** an admin filters the historical queue by seller or status
- **THEN** the table and totals reflect the selected filters

### Requirement: Seller commissions are read-only

The system SHALL show a seller their own commissions with period total, pending
amount and paid amount, and an `ORIGEN` column (Enlace / Directo / Histórico),
without any payout action. Historical rows SHALL show their validation state.

#### Scenario: Seller sees the origin

- **WHEN** a seller views `/vendedor/comisiones`
- **THEN** each row shows its origin
- **AND** no "Marcar pagada" action is available

#### Scenario: Seller cannot pay a commission

- **WHEN** a seller opens their commissions
- **THEN** the payout action is not rendered

#### Scenario: Historical validation state is visible

- **WHEN** a seller views a historical commission
- **THEN** the row identifies it as historical
- **AND** shows whether it is pending validation
