## ADDED Requirements

### Requirement: Assignment visibility

The contract detail SHALL show the current seller, assignment origin, status,
dates and commission state.

#### Scenario: Assigned contract

- **WHEN** an admin opens a contract with an assigned seller
- **THEN** the overview shows the seller, origin, status and commission
- **AND** admins see a reassignment action
- **AND** sellers see the card without the action

#### Scenario: Unassigned contract

- **WHEN** a contract has no seller
- **THEN** the card shows "Sin vendedor asignado"
- **AND** invites the admin to reassign it

### Requirement: Admin reassignment

An admin SHALL be able to reassign a contract to an active seller or let the
system choose one.

#### Scenario: Choose a seller

- **WHEN** the admin selects a seller and confirms
- **THEN** the dialog submits `mode=seller` with the seller id
- **AND** the detail refreshes with the new seller and history

#### Scenario: Automatic

- **WHEN** the admin keeps automatic mode and confirms
- **THEN** the dialog submits `mode=automatic`
- **AND** can exclude the current seller

#### Scenario: Paid commission

- **WHEN** the commission was already paid
- **THEN** the dialog warns that a pending credit is created for the previous
  seller
- **AND** the reassignment is still allowed

### Requirement: Commission seller label

The commissions table SHALL render an unassigned reservation as
"Sin vendedor" rather than the API placeholder `Unknown`.

#### Scenario: Unknown seller row

- **WHEN** the report returns `Unknown` or an empty seller
- **THEN** the table shows the localized unassigned label
- **AND** the contract id links to the contract detail
