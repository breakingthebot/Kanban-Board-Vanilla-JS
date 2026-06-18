<!--
CHANGELOG.md
Records user-visible changes for each independently pushed build iteration.
Connects to: Git history, releases, and README.md.
Created: 2026-06-18
-->

# Changelog

All notable changes to this project are documented here.

## [1.1.0] - 2026-06-18

### Added

- GitHub Actions checks for pushes and pull requests on Node.js 22.
- Project-wide JavaScript syntax validation.
- Tests for malformed saved state, missing card fields, and blocked storage.
- Content Security Policy for the browser application.

### Changed

- Card moves and resets now remain usable for the current session when browser storage fails.
- Repository text files are normalized to LF across platforms.

## [1.0.0] - 2026-06-18

### Added

- Responsive three-column Kanban board with sample cards.
- Native drag-and-drop and keyboard-accessible move controls.
- Versioned browser persistence with invalid-data recovery.
- Reset control, loading feedback, error messages, and empty-column states.
- Unit tests for state and storage behavior.
- Dependency-free local development server.
- Project setup, architecture documentation, and MIT license.
