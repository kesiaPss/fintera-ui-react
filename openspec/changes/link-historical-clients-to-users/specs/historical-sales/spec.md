## ADDED Requirements

### Requirement: Historical client customer account

Every historical sale SHALL link to a `users` row with `role = user` through
`historical_sales.client_user_id`. The system SHALL reuse an existing customer
by identity before creating a new one. The account SHALL be marked with
`historical_client = true` and SHALL NOT trigger a welcome email.

#### Scenario: Create a historical client account

- **WHEN** a seller saves a historical sale with an identity that has no user
- **THEN** a customer account is created and linked
- **AND** the account is visible in the admin Users list
- **AND** no welcome email is sent

#### Scenario: Reuse an existing customer

- **WHEN** a historical sale uses an identity that already belongs to a customer
- **THEN** the existing user is linked
- **AND** no duplicate account is created

#### Scenario: Missing email

- **WHEN** a historical sale has no email
- **THEN** the account uses a non-deliverable placeholder address
- **AND** the admin UI labels it as **No email**

### Requirement: Historical client backfill

The deployment SHALL link historical sales created before this change. The
backfill SHALL be idempotent and SHALL skip already linked records.

#### Scenario: Deployment backfill

- **WHEN** the API container starts after the migration
- **THEN** unlinked historical sales are linked to customer accounts
- **AND** a second run makes no changes
