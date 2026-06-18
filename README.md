<!--
README.md
Documents setup, operation, testing, and architecture for the Kanban board.
Connects to: the complete project and its development workflow.
Created: 2026-06-18
-->

# Kanban Board

A responsive, dependency-free Kanban board for creating, editing, deleting, and moving cards with browser persistence.

## Stack

- HTML5
- CSS3
- Vanilla JavaScript with ES modules
- Node.js built-in test runner
- GitHub Actions continuous integration
- Browser `localStorage`

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

GitHub Actions runs the same command on every push and pull request using Node.js 22.

## Deployed

No production deployment is configured yet.

## Architecture Notes

The app is a small browser board with three clear layers. Configuration defines the columns and starter cards. Pure model functions validate, order, and move cards without touching the page, while storage owns serialization to one versioned `localStorage` key. UI components create DOM elements with `textContent`; a dedicated drag service translates mouse, touch, and pen gestures into placements; and the controller coordinates state, rendering, persistence, and feedback. This separation keeps ordering rules testable without a browser or third-party packages.

## Usage

- Drag a card to an exact position with a mouse on desktop.
- Drag from the card handle with touch or pen input.
- Use the up, down, left, and right buttons for keyboard-accessible ordering.
- Select **Create card** to add validated work to any column.
- Select **Edit** on a card to update its content, column, or delete it.
- Reload the page to confirm card positions persist.
- Select **Reset board** to restore the sample cards.

## Notes

- Board data stays in the current browser and is not synchronized between devices.
- Touch and pen dragging starts only from the card handle so normal board scrolling remains available.
- If browser storage is blocked or full, moves continue for the current session and the status message explains that they were not saved.
- Resetting clears the saved state for this board.
- Titles are limited to 80 characters and descriptions to 240 characters.

## License

Licensed under the [MIT License](LICENSE).
