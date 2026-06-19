<!--
README.md
Documents setup, operation, testing, and architecture for the Kanban board.
Connects to: the complete project and its development workflow.
Created: 2026-06-18
-->

# Kanban Board

A responsive, dependency-free Kanban board for creating, editing, deleting, moving, searching, backing up, and undoing cards with browser persistence.

## Stack

- HTML5
- CSS3
- Vanilla JavaScript with ES modules
- Node.js built-in test runner
- Playwright browser testing with Axe accessibility scanning
- GitHub Actions continuous integration
- Browser `localStorage`
- JSON backup import/export in the browser, including file-based restore
- Session-based undo and redo controls
- Keyboard shortcuts for undo and redo
- Live search across card titles and descriptions

No database or runtime framework is required.

## Setup

1. Install Node.js 20 or newer.
2. Clone the repository.
3. Open a terminal in the project directory.
4. Run `npm install` to validate the package metadata.

## Environment Variables

No environment variables are currently required. See `.env.example` for the canonical template.

## Running Locally

Run the dependency-free local static server:

```powershell
npm start
```

Open the local URL printed by the server. Do not open `index.html` directly because ES modules require an HTTP server in some browsers.

## Testing

Run all unit tests:

```powershell
npm test
```

Run JavaScript syntax validation and tests together:

```powershell
npm run check
```

Install the Chromium test browser once, then run end-to-end tests:

```powershell
npm run test:e2e:install
npm run test:e2e
```

GitHub Actions runs the same command on every push and pull request using Node.js 22.

Export the current board from the header controls to download a JSON backup. Use the import control to paste a backup back into the board, or load a `.json` file, and replace the current saved state. Use the undo and redo controls or the keyboard shortcuts to step through recent board changes during the current browser session. Use search to filter cards by words in the title or description.

## Development Workflow

Create focused branches from `main`, run unit and browser checks before pushing, and open pull requests for review instead of committing directly to `main`. See [CONTRIBUTING.md](CONTRIBUTING.md) for branch, commit, pull request, and release requirements.

## Deployed

Production deployment is managed through the Vercel CLI. The deployed URL is added after the first successful production release.

## Architecture Notes

The app is a small browser board with three clear layers. Configuration defines the columns and starter cards. Pure model functions validate, order, and move cards without touching the page, while storage owns serialization to one versioned `localStorage` key. A separate backup service turns the current board state into JSON and validates backups before they replace the active state. A lightweight history service tracks session-only undo and redo points so users can reverse recent edits without changing the saved schema, and the controller also listens for keyboard shortcuts so the same history works without buttons. A small search service filters cards in memory by title or description without mutating board state. UI components create DOM elements with `textContent`; a dedicated drag service translates mouse, touch, and pen gestures into placements; and the controller coordinates state, rendering, persistence, feedback, backup actions, history, and search. Unit tests cover isolated rules, while Playwright exercises complete desktop and mobile workflows and Axe checks WCAG-impacting accessibility failures.

## Usage

- Drag a card to an exact position with a mouse on desktop.
- Drag from the card handle with touch or pen input.
- Use the up, down, left, and right buttons for keyboard-accessible ordering.
- Select **Create card** to add validated work to any column.
- Use **Import board** to paste a JSON backup from another browser session or load a `.json` file.
- Use **Export board** to download a JSON backup of the current board.
- Use **Undo** and **Redo** to move through recent board changes in the current session.
- Press `Ctrl+Z` or `Cmd+Z` to undo, and `Ctrl+Y` or `Cmd+Shift+Z` to redo.
- Type in the search field to filter cards, and clear it to bring the full board back.
- Select **Edit** on a card to update its content, column, or delete it.
- Reload the page to confirm card positions persist.
- Select **Reset board** to restore the sample cards.

## Notes

- Board data stays in the current browser and is not synchronized between devices.
- Touch and pen dragging starts only from the card handle so normal board scrolling remains available.
- If browser storage is blocked or full, moves continue for the current session and the status message explains that they were not saved.
- Resetting clears the saved state for this board.
- Titles are limited to 80 characters and descriptions to 240 characters.
- Imported backups must match the board schema and column IDs before they replace the current state.
- Undo and redo history is session-only and clears on reload.
- Keyboard shortcuts follow the same session-only undo and redo history.
- Search is live and session-only; it never changes the saved board data.
- Vercel responses apply CSP, referrer, permissions, and MIME-sniffing security headers.

## License

Licensed under the [MIT License](LICENSE).
