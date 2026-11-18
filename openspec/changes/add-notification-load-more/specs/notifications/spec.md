## ADDED Requirements

### Requirement: Bell loads older notifications on demand

The notifications bell SHALL request notifications in cursor-paged batches of
20 and SHALL append older notifications when the user chooses "Load more".

#### Scenario: Loading more notifications

- **WHEN** the first response has `has_more` true and a `next_cursor`
- **THEN** the bell shows a "Load more" button
- **WHEN** the user clicks "Load more"
- **THEN** the bell requests the next page with that cursor
- **AND** appends the returned notifications below the existing items
- **AND** hides the button when the response has `has_more` false

#### Scenario: No more notifications

- **WHEN** the first response has `has_more` false
- **THEN** the bell does not show a "Load more" button

### Requirement: Unread count comes from the server

The bell SHALL display the `unread_count` returned by the API instead of
counting only the loaded rows.

#### Scenario: Unread count exceeds one page

- **WHEN** the API reports `unread_count` 40 while the first page contains 20
  notifications
- **THEN** the bell badge shows "40"

#### Scenario: Marking all as read

- **WHEN** the user marks all notifications as read successfully
- **THEN** the badge count becomes zero

### Requirement: Unread filter is fetched from the server

The "No leídas" filter SHALL request `status=unread` and reset the cursor before
loading the filtered list.

#### Scenario: Switching to unread

- **WHEN** the user selects "No leídas"
- **THEN** the bell requests notifications with `status=unread` and no cursor
- **AND** replaces the current list with the filtered first page
