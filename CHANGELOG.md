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

- Contribution guide covering setup, checks, pull requests, deployment, and releases.
- Pull request template requiring validation and documentation evidence.

### Changed

- README now documents the branch-based development workflow.

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
