## Purpose

Defines the shared rule for admin lists in FinteraUI: how many rows a list shows
per page, which controls it offers, and which lists are explicitly excluded from
the rule, so that long datasets never render in a single unbounded table.

## ADDED Requirements

### Requirement: Admin lists show at most 20 rows per page

The admin UI SHALL show at most 20 rows per page in every list and table, and
SHALL provide pagination controls that show the current range and the total number
of items.

#### Scenario: Table with more rows than one page

- **WHEN** a list has more than 20 items
- **THEN** only the first 20 are rendered
- **AND** pagination controls show the range and total

#### Scenario: Pagination resets on filter change

- **WHEN** the user changes a filter or search term on a paginated list
- **THEN** the list returns to page 1

### Requirement: Lists request only the page they show

Paginated lists SHALL request the page they display from the server and SHALL NOT
download every item to paginate in the browser.

#### Scenario: Page request

- **WHEN** the user opens page 2 of a list
- **THEN** the request asks the server for page 2 with the page size in use

### Requirement: Documented exceptions

The following SHALL be excluded from the 20-row rule and SHALL keep their current
behavior until a separate change addresses them: the contract ledger entries tab,
the contract detail table, and static reference content such as the keyboard
shortcuts dialog. Selectors for projects are governed by the analytics project
selector requirement, not by this rule.

#### Scenario: Contract ledger is unchanged

- **WHEN** an admin opens the ledger tab of a contract
- **THEN** the entries are shown as they are today, without this change's pagination
