<!--
CHANGELOG.md
Records user-visible changes for each independently pushed build iteration.
Connects to: Git history, releases, and README.md.
Created: 2026-06-18
-->

# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Added

- Card duplication with preserved labels and duplicate placement near the source card.
- Card labels with persistence, display chips, and label-aware search.
- Search summary counts now use a compact inline separator for easier reading.
- Search summary with per-column match counts and empty-result feedback.
- Search summary service and tests for visible match counting.
- Live board search across card titles and descriptions.
- Search service and tests for matching cards by query.
- Keyboard shortcuts for session undo and redo.
- Session-based undo and redo controls for recent board changes.
- Board history service and tests for recording, undoing, and redoing state snapshots.
- File-based board backup import from the existing import dialog.
- Board backup import and export controls with JSON validation.
- Backup service and tests for serializing and restoring board state.
- Contribution guide covering setup, checks, pull requests, deployment, and releases.
- Pull request template requiring validation and documentation evidence.

### Changed

- Package version bumped to 1.12.0 for the card-duplication release.
- Package version bumped to 1.11.0 for the card-labels release.
- Package version bumped to 1.10.1 for the search-summary polish release.
- Package version bumped to 1.10.0 for the search-summary release.
- README now documents the branch-based development workflow.
- Browser tests now scope column assertions to an exact `data-column-id` target.

## [1.12.0] - 2026-06-18

### Added

- Card duplication button on each card.
- Browser coverage for duplicated cards and preserved labels.

## [1.11.0] - 2026-06-18

### Added

- Card labels with persistence, label chips, and label-aware search.
- Browser coverage for card labels and label search.

## [1.10.1] - 2026-06-18

### Changed

- Search summary counts now use a compact inline separator for easier reading.

## [1.10.0] - 2026-06-18

### Added

- Search summary panel with per-column counts and no-results messaging.
- Browser coverage for the search summary panel.

## [1.9.0] - 2026-06-18

### Added

- Live filtering of cards by search term.
- Browser coverage for filtering and clearing the search field.

## [1.8.0] - 2026-06-18

### Added

- Keyboard shortcuts for undo and redo in the browser app.
- Browser coverage for undo/redo keyboard shortcuts.

## [1.7.0] - 2026-06-18

### Added

- Undo and redo buttons for session-only board history.
- Browser coverage for undoing and redoing a card change.

## [1.6.0] - 2026-06-18

### Added

- File-based import for JSON board backups.
- Browser coverage for restoring a backup from a `.json` file.

## [1.5.0] - 2026-06-18

### Added

- JSON board backup import/export in the browser.
- Browser coverage for importing a backup through the public dialog workflow.

## [1.4.0] - 2026-06-18

### Added

- Playwright end-to-end tests for desktop and mobile Chromium.
- Axe accessibility scans for serious and critical WCAG violations.
- Browser coverage for card CRUD, persistence, keyboard ordering, and mouse dragging.
- Vercel deployment configuration with restrictive security headers.
- CI installation and execution of browser tests.

### Changed

- Test documentation now includes browser installation and end-to-end commands.
- Generated Playwright artifacts are excluded from Git and deployments.

## [1.3.0] - 2026-06-18

### Added

- Exact card ordering within each column.
- Touch and pen dragging through a dedicated card handle.
- Keyboard-accessible up and down ordering controls.
- Visible insertion indicators during drag operations.
- Unit tests for cross-column placement, reordering, and invalid targets.

### Changed

- Desktop drops now preserve the selected insertion position.
- Drag gesture handling now lives in a dedicated service.

## [1.2.0] - 2026-06-18

### Added

- Accessible card editor for creating and editing cards.
- Card deletion with explicit confirmation.
- Column selection and validated title and description limits.
- Pure, immutable card create, update, and delete model operations.
- Unit tests covering card management and invalid input.

### Changed

- Card controls now include an edit action.
- Documentation now covers complete card management.

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
