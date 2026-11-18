## MODIFIED Requirements

### Requirement: Filtering and export

The analytics page SHALL support project and date filters and SHALL let the
user download each financial report (operations, commissions, revenue flow and
overdue payments) in CSV, Excel (XLSX) and PDF. The project filter SHALL be a
searchable selector that loads projects on demand.

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

## ADDED Requirements

### Requirement: Project selector loads on demand

The project filter SHALL load 20 projects at a time, SHALL search by name, address
or project identifier as the user types, and SHALL offer a control to load more
projects. The filter SHALL NOT silently omit projects.

#### Scenario: Large project catalog

- **WHEN** the catalog has more than 20 projects
- **THEN** the filter shows the first 20 and a "load more" control
- **AND** choosing "load more" appends the next 20

#### Scenario: Search narrows the list

- **WHEN** the user types a search term in the project filter
- **THEN** the list shows only matching projects, requested from the server after a short pause in typing

#### Scenario: Selected project outside the loaded page

- **WHEN** the selected project is not in the loaded page
- **THEN** its name is still shown in the filter

#### Scenario: All projects

- **WHEN** the user selects "All projects"
- **THEN** the analytics data is shown without a project filter

### Requirement: Project selector keyboard navigation

The project selector SHALL be operable with the keyboard: the arrow keys SHALL move
the real focus between the options (including "All projects"), Home and End SHALL
focus the first and last option, Enter and Space SHALL select the focused option, and
Escape SHALL close the popover. From the search input, ArrowDown SHALL focus the
first option and ArrowUp the last one.

#### Scenario: Arrow keys move between options

- **WHEN** the project selector is open and the user presses ArrowDown or ArrowUp
- **THEN** focus moves to the next or previous option, including "All projects"

#### Scenario: Home and End jump to the edges

- **WHEN** the user presses Home or End inside the option list
- **THEN** focus moves to the first or last option

#### Scenario: Selecting from the keyboard

- **WHEN** an option has focus and the user presses Enter or Space
- **THEN** that project is selected and the popover closes

#### Scenario: Arrow keys from the search field

- **WHEN** the search input has focus and the user presses ArrowDown or ArrowUp
- **THEN** focus moves to the first or last option respectively

#### Scenario: Closing with Escape

- **WHEN** the popover is open and the user presses Escape
- **THEN** the popover closes without changing the selection
