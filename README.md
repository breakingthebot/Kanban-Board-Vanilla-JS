<!--
README.md
Documents setup, operation, testing, and architecture for the Kanban board.
Connects to: the complete project and its development workflow.
Created: 2026-06-18
-->

# Kanban Board

A responsive, dependency-free Kanban board that moves cards between columns and saves the board in the browser.

## Stack

- HTML5
- CSS3
- Vanilla JavaScript with ES modules
- Node.js built-in test runner
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

## Deployed

No production deployment is configured yet.

## Architecture Notes

The app is a small browser board with three clear layers. Configuration defines the columns and starter cards. Pure model functions validate and move cards without touching the page, while the storage service owns serialization to one versioned `localStorage` key. UI components create DOM elements with `textContent`, and a controller coordinates rendering, persistence, drag events, keyboard-accessible move buttons, reset behavior, and user-facing status messages. This separation keeps the state rules testable without a browser or third-party packages.

## Usage

- Drag a card onto another column on desktop.
- Use the arrow buttons on a card to move it with a mouse, touch input, or keyboard.
- Reload the page to confirm card positions persist.
- Select **Reset board** to restore the sample cards.

## Notes

- Board data stays in the current browser and is not synchronized between devices.
- Native HTML drag-and-drop has limited touch support, so mobile movement uses the accessible arrow controls.
- Resetting clears the saved state for this board.

## License

Licensed under the [MIT License](LICENSE).
