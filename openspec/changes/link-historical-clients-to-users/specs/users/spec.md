## MODIFIED Requirements

### Requirement: User list with search and pagination

The users page SHALL list users with search, filtering, sorting, and pagination.
Customers created from historical sales SHALL carry a **HISTÓRICO** marker and
SHALL be filterable with a **Históricos** filter. Their placeholder email SHALL
be displayed as **No email** and the invite action SHALL be hidden until a real
email is set.

#### Scenario: Search users

- **WHEN** the user enters a search term
- **THEN** the list shows matching users for the current page

#### Scenario: Filter historical clients

- **WHEN** an admin selects the Historical filter
- **THEN** only customer accounts created from historical sales are listed
- **AND** the historical count is shown next to the filter

#### Scenario: Placeholder email

- **WHEN** a historical client has a placeholder email
- **THEN** the list shows **No email**
- **AND** the invite action is not offered
