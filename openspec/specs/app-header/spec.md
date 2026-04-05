# app-header Specification

## Purpose
TBD - created by archiving change add-app-header-logo. Update Purpose after archive.
## Requirements
### Requirement: App header displays logo and title
The app SHALL render a persistent header at the top of the page containing the app logo image and the app title text "Kanba-Flight-Sim". The header SHALL appear above the simulation controls bar and all boards.

#### Scenario: Logo is visible on load
- **WHEN** the application is loaded in a browser
- **THEN** an `<img>` element sourced from `logo-kanban-flight-sim.svg` SHALL be visible in the header

#### Scenario: Title is visible on load
- **WHEN** the application is loaded in a browser
- **THEN** the text "Kanba-Flight-Sim" SHALL be visible in the header, rendered adjacent to the logo

#### Scenario: Header appears before controls and boards
- **WHEN** the application renders its root layout
- **THEN** the logo-and-title header SHALL be the first visible element, rendered above the simulation controls bar and above all kanban boards

