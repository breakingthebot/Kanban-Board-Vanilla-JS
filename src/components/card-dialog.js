// src/components/card-dialog.js
// Manages the accessible create/edit dialog and converts validated form fields to card input.
// Connects to: index.html, config/board-config.js, and services/board-controller.js.
// Created: 2026-06-18

import {
  CARD_DESCRIPTION_MAX_LENGTH,
  CARD_TITLE_MAX_LENGTH,
  COLUMNS,
} from "../config/board-config.js";

/**
 * Creates a reusable card editor around the dialog markup.
 * @param {object} dependencies Editor dependencies.
 * @param {HTMLDialogElement} dependencies.dialogElement Dialog element.
 * @param {(cardId: string|null, input: object) => void} dependencies.onSave Save callback.
 * @param {(cardId: string) => void} dependencies.onDelete Delete callback.
 * @param {(message: string) => boolean} dependencies.confirmDelete Confirmation callback.
 * @returns {{openCreate: Function, openEdit: Function, close: Function}} Editor API.
 */
export function createCardDialog({
  dialogElement,
  onSave,
  onDelete,
  confirmDelete,
}) {
  const form = dialogElement.querySelector("form");
  const heading = dialogElement.querySelector("#card-dialog-title");
  const titleInput = dialogElement.querySelector("#card-title");
  const descriptionInput = dialogElement.querySelector("#card-description");
  const columnSelect = dialogElement.querySelector("#card-column");
  const errorElement = dialogElement.querySelector("#card-form-error");
  const deleteButton = dialogElement.querySelector("#delete-card");
  const cancelButton = dialogElement.querySelector("#cancel-card");
  let editingCardId = null;

  populateColumns(columnSelect);
  titleInput.maxLength = CARD_TITLE_MAX_LENGTH;
  descriptionInput.maxLength = CARD_DESCRIPTION_MAX_LENGTH;

  form.addEventListener("submit", handleSubmit);
  cancelButton.addEventListener("click", close);
  deleteButton.addEventListener("click", handleDelete);
  dialogElement.addEventListener("close", reset);

  /** Opens an empty editor for a new card. */
  function openCreate() {
    reset();
    heading.textContent = "Create card";
    deleteButton.hidden = true;
    dialogElement.showModal();
    titleInput.focus();
  }

  /**
   * Opens the editor populated with an existing card.
   * @param {object} card Card record to edit.
   */
  function openEdit(card) {
    reset();
    editingCardId = card.id;
    heading.textContent = "Edit card";
    titleInput.value = card.title;
    descriptionInput.value = card.description;
    columnSelect.value = card.columnId;
    deleteButton.hidden = false;
    dialogElement.showModal();
    titleInput.focus();
  }

  /** Closes the editor without saving. */
  function close() {
    dialogElement.close();
  }

  /** @param {SubmitEvent} event Native form submission event. */
  function handleSubmit(event) {
    event.preventDefault();
    errorElement.textContent = "";

    try {
      onSave(editingCardId, {
        title: titleInput.value,
        description: descriptionInput.value,
        columnId: columnSelect.value,
      });
      close();
    } catch (error) {
      errorElement.textContent = error.message;
      titleInput.focus();
    }
  }

  /** Deletes the active card after explicit user confirmation. */
  function handleDelete() {
    if (
      editingCardId &&
      confirmDelete("Delete this card? This action cannot be undone.")
    ) {
      onDelete(editingCardId);
      close();
    }
  }

  /** Clears mode and form data between dialog uses. */
  function reset() {
    editingCardId = null;
    form.reset();
    errorElement.textContent = "";
    deleteButton.hidden = true;
  }

  return { openCreate, openEdit, close };
}

/**
 * Adds configured board columns to the dialog select.
 * @param {HTMLSelectElement} selectElement Destination select element.
 * @returns {void}
 */
function populateColumns(selectElement) {
  selectElement.replaceChildren();
  COLUMNS.forEach((column) => {
    const option = document.createElement("option");
    option.value = column.id;
    option.textContent = column.title;
    selectElement.append(option);
  });
}
