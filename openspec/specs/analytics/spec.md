# Analytics

## Purpose

Provide financial and sales analytics with charts, filters, seller performance,
and export options.

## Requirements

### Requirement: Analytics overview

The analytics page SHALL show summary statistics, revenue trends, distribution,
monthly performance, and seller performance for the selected filters.

#### Scenario: Load analytics

- **WHEN** an authenticated user opens `/analytics`
- **THEN** the analytics charts and summary statistics are displayed

### Requirement: Filtering and export

The analytics page SHALL support project and date filters and SHALL let the
user download each financial report (operations, commissions, revenue flow and
overdue payments) in CSV, Excel (XLSX) and PDF.

#### Scenario: Export data

- **WHEN** the user chooses a report and a format
- **THEN** that report is downloaded in the selected format

#### Scenario: Export formats are visible

- **WHEN** the export menu is open
- **THEN** every report shows the three available formats (CSV, Excel and PDF)
  as explicit download actions

#### Scenario: Overdue snapshot

- **WHEN** the user downloads the overdue payments report
- **THEN** no date range is required because the report is a point-in-time
  snapshot

### Requirement: Comparison deltas are guarded

The analytics page SHALL NOT show a fabricated percentage when the previous
period has no data, and SHALL show a neutral message instead.

#### Scenario: No previous period

- **WHEN** the previous period has no data for a statistic
- **THEN** the comparison shows "sin datos del mes anterior" instead of a percentage

### Requirement: Charts are accessible

The analytics page SHALL give every chart an accessible name and a text
alternative.

#### Scenario: Chart has an accessible name

- **WHEN** a chart renders
- **THEN** it exposes an accessible name and a data-table alternative

### Requirement: Overdue summary links to payments

The analytics page SHALL surface a mora card that links to the overdue payments
filter.

#### Scenario: Mora card links out

- **WHEN** the user selects the mora card
- **THEN** they land on the payments list filtered to overdue
