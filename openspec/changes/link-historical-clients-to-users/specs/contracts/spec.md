## ADDED Requirements

### Requirement: Historical clients in the reservation search

The reservation client search SHALL include historical clients because they are
active customer accounts. Results SHALL identify them with a **HISTÓRICO**
marker, and selecting one SHALL reuse the existing account.

#### Scenario: Select a historical client

- **WHEN** an admin or seller searches for a historical client in the reservation wizard
- **THEN** the client appears in the results with the historical marker
- **AND** selecting it fills the client data and uses its user id for the contract

#### Scenario: Placeholder email

- **WHEN** the selected historical client has a placeholder email
- **THEN** the wizard shows **No email**
- **AND** the reservation can still be created
