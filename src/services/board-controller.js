// src/services/board-controller.js
// Coordinates state, persistence, rendering, drag-and-drop, and user feedback.
// Connects to: board state, storage service, column component, and src/main.js.
// Created: 2026-06-18

import { createColumnElement } from "../components/column.js";
import { createCardDialog } from "../components/card-dialog.js";
import { createBoardBackupDialog } from "../components/board-backup-dialog.js";
import { COLUMNS } from "../config/board-config.js";
import {
  addCard,
  createInitialState,
  deleteCard,
  placeCard,
  updateCard,
} from "../models/board-state.js";
import { createBoardHistory } from "./board-history.js";
import { deserializeBoardState, serializeBoardState } from "./board-backup.js";
import { filterCardsByQuery } from "./board-search.js";
import { summarizeBoardSearch } from "./board-search-summary.js";
import { clearBoard, loadBoard, saveBoard } from "./board-storage.js";
import { createCardDragManager } from "./card-drag.js";

/**
 * Creates the board controller around explicit DOM and storage dependencies.
 * @param {object} dependencies Controller dependencies.
 * @param {HTMLElement} dependencies.boardElement Board container.
 * @param {HTMLElement} dependencies.statusElement Live status region.
 * @param {HTMLInputElement} dependencies.searchInput Search field.
 * @param {HTMLButtonElement} dependencies.clearSearchButton Search reset control.
 * @param {HTMLElement} dependencies.searchSummaryElement Search summary region.
 * @param {HTMLButtonElement} dependencies.importButton Import control.
 * @param {HTMLButtonElement} dependencies.exportButton Export control.
 * @param {HTMLButtonElement} dependencies.undoButton Undo control.
 * @param {HTMLButtonElement} dependencies.redoButton Redo control.
 * @param {HTMLButtonElement} dependencies.resetButton Reset control.
 * @param {HTMLButtonElement} dependencies.createButton Create-card control.
 * @param {HTMLDialogElement} dependencies.dialogElement Card editor dialog.
 * @param {HTMLDialogElement} dependencies.backupDialogElement Board backup dialog.
 * @param {Storage} dependencies.storage Browser storage implementation.
 * @returns {{initialize: () => void}} Public controller API.
 */
export function createBoardController({
  boardElement,
  statusElement,
  searchInput,
  clearSearchButton,
  searchSummaryElement,
  importButton,
  exportButton,
  undoButton,
  redoButton,
  resetButton,
  createButton,
  dialogElement,
  backupDialogElement,
  storage,
}) {
  let state = createInitialState();
  let searchQuery = "";
  const history = createBoardHistory();
  const cardDialog = createCardDialog({
    dialogElement,
    onSave: saveCard,
    onDelete: removeCard,
    confirmDelete: window.confirm.bind(window),
  });
  const backupDialog = createBoardBackupDialog({
    dialogElement: backupDialogElement,
    onImport: importBackup,
  });
  const dragManager = createCardDragManager({
    boardElement,
    onDrop: updateCardPosition,
  });

  /** Loads persisted data, binds static controls, and renders the board. */
  function initialize() {
    try {
      const loadResult = loadBoard(storage);
      state = loadResult.state;
      render();
      setStatus(
        loadResult.recovered
          ? "Saved data was invalid, so the board was restored."
          : "Board ready.",
      );
    } catch (error) {
      console.error("Unable to load board state.", { error: error.message });
      render();
      setStatus("Storage is unavailable. Changes will last only for this session.", true);
    }

    resetButton.addEventListener("click", reset);
    createButton.addEventListener("click", cardDialog.openCreate);
    importButton.addEventListener("click", openImportDialog);
    exportButton.addEventListener("click", exportBackup);
    undoButton.addEventListener("click", undoLastChange);
    redoButton.addEventListener("click", redoLastChange);
    searchInput.addEventListener("input", handleSearchInput);
    clearSearchButton.addEventListener("click", clearSearch);
    document.addEventListener("keydown", handleKeyboardShortcut);
    dragManager.initialize();
    updateHistoryControls();
  }

  /** Rebuilds board columns from the current state. */
  function render() {
    boardElement.replaceChildren();
    const matchingCards = filterCardsByQuery(state.cards, searchQuery);
    const searchSummary = summarizeBoardSearch(state.cards, searchQuery);
    renderSearchSummary(searchSummary);
    COLUMNS.forEach((column, index) => {
      const cards = matchingCards.filter((card) => card.columnId === column.id);
      boardElement.append(
        createColumnElement(
          column,
          cards,
          index,
          COLUMNS.length,
          moveByDirection,
          reorderByDirection,
          openCardEditor,
          searchSummary.isFiltering ? "No matching cards" : undefined,
        ),
      );
    });
  }

  /** @param {string} cardId Card identifier to edit. */
  function openCardEditor(cardId) {
    const card = state.cards.find((candidate) => candidate.id === cardId);
    if (card) cardDialog.openEdit(card);
  }

  /**
   * Creates or updates a card and persists the new state.
   * @param {string|null} cardId Existing card ID or null for creation.
   * @param {object} input Untrusted form input.
   * @returns {void}
   */
  function saveCard(cardId, input) {
    const nextState = cardId
      ? updateCard(state, cardId, input)
      : addCard(state, crypto.randomUUID(), input);
    commitState(nextState, cardId ? "Card updated." : "Card created.");
  }

  /**
   * Deletes one card and persists the new state.
   * @param {string} cardId Card identifier to delete.
   * @returns {void}
   */
  function removeCard(cardId) {
    commitState(deleteCard(state, cardId), "Card deleted.");
  }

  /** Opens the backup import dialog with the current state prefilled. */
  function openImportDialog() {
    backupDialog.open(serializeBoardState(state));
  }

  /**
   * Replaces the current state with a validated imported backup.
   * @param {string} serializedState Raw JSON backup text.
   * @returns {void}
   */
  function importBackup(serializedState) {
    commitState(deserializeBoardState(serializedState), "Board imported.");
  }

  /** Downloads the current board state as a JSON backup file. */
  function exportBackup() {
    try {
      const backup = serializeBoardState(state);
      const blob = new Blob([backup], { type: "application/json" });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "kanban-board-backup.json";
      link.click();
      URL.revokeObjectURL(downloadUrl);
      setStatus("Board backup downloaded.");
    } catch (error) {
      console.error("Unable to export board backup.", { error: error.message });
      setStatus("The board backup could not be exported.", true);
    }
  }

  /**
   * Moves a card by one column from its current location.
   * @param {string} cardId Card identifier.
   * @param {number} direction Negative for left, positive for right.
   */
  function moveByDirection(cardId, direction) {
    const card = state.cards.find((candidate) => candidate.id === cardId);
    const currentIndex = COLUMNS.findIndex((column) => column.id === card?.columnId);
    const destination = COLUMNS[currentIndex + direction];

    if (destination) {
      updateCardPosition(cardId, destination.id, null);
    }
  }

  /**
   * Moves a card one position within its current column.
   * @param {string} cardId Card identifier.
   * @param {number} direction Negative for up, positive for down.
   */
  function reorderByDirection(cardId, direction) {
    const card = state.cards.find((candidate) => candidate.id === cardId);
    if (!card) return;

    const columnCards = state.cards.filter(
      (candidate) => candidate.columnId === card.columnId,
    );
    const currentIndex = columnCards.findIndex((candidate) => candidate.id === cardId);

    if (direction < 0 && currentIndex === 0) return;
    if (direction > 0 && currentIndex === columnCards.length - 1) return;

    const beforeCardId =
      direction < 0
        ? columnCards[currentIndex - 1].id
        : columnCards[currentIndex + 2]?.id ?? null;
    updateCardPosition(cardId, card.columnId, beforeCardId);
  }

  /**
   * Updates state, saves it, and reports the completed card movement.
   * @param {string} cardId Card identifier.
   * @param {string} destinationColumnId Destination column identifier.
   * @param {string|null} beforeCardId Card to insert before, or null for last.
   */
  function updateCardPosition(cardId, destinationColumnId, beforeCardId) {
    try {
      commitState(
        placeCard(state, cardId, destinationColumnId, beforeCardId),
        `Card moved to ${getColumnTitle(destinationColumnId)}.`,
      );
    } catch (error) {
      console.error("Unable to move card.", {
        cardId,
        destinationColumnId,
        error: error.message,
      });
      setStatus("The card could not be moved. Please try again.", true);
    }
  }

  /** Restores configured sample cards and removes persisted changes. */
  function reset() {
    history.record(state);
    state = createInitialState();
    render();

    try {
      clearBoard(storage);
      setStatus("Board reset to its starting cards.");
    } catch (error) {
      console.error("Unable to reset board.", { error: error.message });
      setStatus("Board reset for this session, but storage is unavailable.", true);
    }

    updateHistoryControls();
  }

  /** Restores the most recent board state change. */
  function undoLastChange() {
    const result = history.undo(state);
    if (!result.changed) {
      setStatus("Nothing to undo.");
      return;
    }

    state = result.state;
    render();
    persistState("Board change undone.");
    updateHistoryControls();
  }

  /** Reapplies the most recently undone board state change. */
  function redoLastChange() {
    const result = history.redo(state);
    if (!result.changed) {
      setStatus("Nothing to redo.");
      return;
    }

    state = result.state;
    render();
    persistState("Board change redone.");
    updateHistoryControls();
  }

  /** Updates the board view to match the active search text. */
  function handleSearchInput() {
    searchQuery = searchInput.value;
    render();
  }

  /** Clears the search input and restores the full board. */
  function clearSearch() {
    searchQuery = "";
    searchInput.value = "";
    render();
    searchInput.focus();
  }

  /**
   * Updates the live search summary text to reflect the current filter state.
   * @param {{
   *   isFiltering: boolean,
   *   normalizedQuery: string,
   *   totalMatches: number,
   *   totalCards: number,
   *   columnMatches: Array<{id: string, title: string, count: number}>
   * }} summary Search summary payload.
   * @returns {void}
   */
  function renderSearchSummary(summary) {
    searchSummaryElement.replaceChildren();
    searchSummaryElement.classList.toggle("search-summary--empty", summary.isFiltering && summary.totalMatches === 0);

    const text = summary.isFiltering
      ? summary.totalMatches === 0
        ? `No cards match "${summary.normalizedQuery}".`
        : `${summary.totalMatches} of ${summary.totalCards} cards match "${summary.normalizedQuery}".`
      : `${summary.totalCards} cards on the board.`;

    searchSummaryElement.append(document.createTextNode(text));

    if (!summary.isFiltering) {
      return;
    }

    const countsText = summary.columnMatches
      .map((column) => `${column.title}: ${column.count}`)
      .join(" | ");
    searchSummaryElement.append(document.createTextNode(` ${countsText}`));
  }

  /**
   * Handles keyboard shortcuts for undo and redo without interfering with forms.
   * @param {KeyboardEvent} event Native keydown event.
   * @returns {void}
   */
  function handleKeyboardShortcut(event) {
    if (!isHistoryShortcut(event) || isEditableTarget(event.target)) {
      return;
    }

    event.preventDefault();

    if (event.key.toLowerCase() === "z" && !event.shiftKey) {
      undoLastChange();
      return;
    }

    redoLastChange();
  }

  /**
   * Persists current state and reports whether the change is durable.
   * @param {string} successMessage Message shown after successful persistence.
   * @returns {void}
   */
  function persistState(successMessage) {
    try {
      saveBoard(storage, state);
      setStatus(successMessage);
    } catch (error) {
      console.error("Unable to persist board state.", { error: error.message });
      setStatus(`${successMessage} Storage is unavailable.`, true);
    }
  }

  /**
   * Applies a state transition, stores the previous snapshot, and refreshes the UI.
   * @param {{cards: Array<object>}} nextState Next board state.
   * @param {string} successMessage Message shown after successful persistence.
   * @returns {void}
   */
  function commitState(nextState, successMessage) {
    history.record(state);
    state = nextState;
    render();
    persistState(successMessage);
    updateHistoryControls();
  }

  /** Updates undo and redo controls to match the current history stack. */
  function updateHistoryControls() {
    undoButton.disabled = !history.canUndo();
    redoButton.disabled = !history.canRedo();
  }

  /**
   * Updates the live status region with normal or error feedback.
   * @param {string} message User-facing status message.
   * @param {boolean} [isError=false] Whether the message represents an error.
   */
  function setStatus(message, isError = false) {
    statusElement.textContent = message;
    statusElement.classList.toggle("status--error", isError);
  }

  /**
   * Returns a readable column title for status messages.
   * @param {string} columnId Target column identifier.
   * @returns {string} Column title or identifier fallback.
   */
  function getColumnTitle(columnId) {
    return COLUMNS.find((column) => column.id === columnId)?.title ?? columnId;
  }

  /**
   * Determines whether a key combination maps to undo or redo.
   * @param {KeyboardEvent} event Native keydown event.
   * @returns {boolean} Whether the event is a supported history shortcut.
   */
  function isHistoryShortcut(event) {
    const key = event.key.toLowerCase();
    return (event.ctrlKey || event.metaKey) && (key === "z" || key === "y");
  }

  /**
   * Detects whether focus is inside an editable element where shortcuts should be ignored.
   * @param {EventTarget|null} target Event target to inspect.
   * @returns {boolean} Whether the target is a text-entry control.
   */
  function isEditableTarget(target) {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return Boolean(
      target.closest("input, textarea, select, [contenteditable='true']"),
    );
  }

  return { initialize };
}
