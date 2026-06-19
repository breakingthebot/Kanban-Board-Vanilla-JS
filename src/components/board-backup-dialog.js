// src/components/board-backup-dialog.js
// Manages the import backup dialog and validation feedback.
// Connects to: index.html, services/board-backup.js, and services/board-controller.js.
// Created: 2026-06-18

/**
 * Creates a reusable dialog for importing board backups.
 * @param {object} dependencies Dialog dependencies.
 * @param {HTMLDialogElement} dependencies.dialogElement Dialog element.
 * @param {(serializedState: string) => void} dependencies.onImport Import callback.
 * @returns {{open: (serializedState: string) => void, close: () => void}} Dialog API.
 */
export function createBoardBackupDialog({ dialogElement, onImport }) {
  const form = dialogElement.querySelector("form");
  const heading = dialogElement.querySelector("#board-backup-title");
  const textarea = dialogElement.querySelector("#board-backup-data");
  const errorElement = dialogElement.querySelector("#board-backup-error");
  const cancelButton = dialogElement.querySelector("#cancel-board-backup");

  form.addEventListener("submit", handleSubmit);
  cancelButton.addEventListener("click", close);
  dialogElement.addEventListener("close", reset);

  /**
   * Opens the dialog with serialized board data prefilled for editing.
   * @param {string} serializedState Current board state JSON.
   */
  function open(serializedState) {
    reset();
    heading.textContent = "Import board backup";
    textarea.value = serializedState;
    dialogElement.showModal();
    textarea.focus();
    textarea.select();
  }

  /** Closes the dialog without importing a backup. */
  function close() {
    dialogElement.close();
  }

  /** @param {SubmitEvent} event Native form submission event. */
  function handleSubmit(event) {
    event.preventDefault();
    errorElement.textContent = "";

    try {
      onImport(textarea.value);
      close();
    } catch (error) {
      errorElement.textContent = error.message;
      textarea.focus();
    }
  }

  /** Clears dialog state between uses. */
  function reset() {
    form.reset();
    errorElement.textContent = "";
  }

  return { open, close };
}
