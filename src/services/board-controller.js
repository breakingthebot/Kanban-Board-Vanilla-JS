// src/services/board-controller.js
// Coordinates state, persistence, rendering, drag-and-drop, and user feedback.
// Connects to: board state, storage service, column component, and src/main.js.
// Created: 2026-06-18

import { createColumnElement } from "../components/column.js";
import { createCardDialog } from "../components/card-dialog.js";
import { COLUMNS } from "../config/board-config.js";
import {
  addCard,
  createInitialState,
  deleteCard,
  placeCard,
  updateCard,
} from "../models/board-state.js";
import { clearBoard, loadBoard, saveBoard } from "./board-storage.js";
import { createCardDragManager } from "./card-drag.js";

/**
 * Creates the board controller around explicit DOM and storage dependencies.
 * @param {object} dependencies Controller dependencies.
 * @param {HTMLElement} dependencies.boardElement Board container.
 * @param {HTMLElement} dependencies.statusElement Live status region.
 * @param {HTMLButtonElement} dependencies.resetButton Reset control.
 * @param {HTMLButtonElement} dependencies.createButton Create-card control.
 * @param {HTMLDialogElement} dependencies.dialogElement Card editor dialog.
 * @param {Storage} dependencies.storage Browser storage implementation.
 * @returns {{initialize: () => void}} Public controller API.
 */
export function createBoardController({
  boardElement,
  statusElement,
  resetButton,
  createButton,
  dialogElement,
  storage,
}) {
  let state = createInitialState();
  const cardDialog = createCardDialog({
    dialogElement,
    onSave: saveCard,
    onDelete: removeCard,
    confirmDelete: window.confirm.bind(window),
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
    dragManager.initialize();
  }

  /** Rebuilds board columns from the current state. */
  function render() {
    boardElement.replaceChildren();
    COLUMNS.forEach((column, index) => {
      const cards = state.cards.filter((card) => card.columnId === column.id);
      boardElement.append(
        createColumnElement(
          column,
          cards,
          index,
          COLUMNS.length,
          moveByDirection,
          reorderByDirection,
          openCardEditor,
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
    state = cardId
      ? updateCard(state, cardId, input)
      : addCard(state, crypto.randomUUID(), input);
    render();
    persistState(cardId ? "Card updated." : "Card created.");
  }

  /**
   * Deletes one card and persists the new state.
   * @param {string} cardId Card identifier to delete.
   * @returns {void}
   */
  function removeCard(cardId) {
    state = deleteCard(state, cardId);
    render();
    persistState("Card deleted.");
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
      state = placeCard(state, cardId, destinationColumnId, beforeCardId);
      render();
    } catch (error) {
      console.error("Unable to move card.", {
        cardId,
        destinationColumnId,
        error: error.message,
      });
      setStatus("The card could not be moved. Please try again.", true);
      return;
    }

    const destination = COLUMNS.find((column) => column.id === destinationColumnId);
    try {
      saveBoard(storage, state);
      setStatus(`Card moved to ${destination.title}.`);
    } catch (error) {
      console.error("Unable to persist moved card.", {
        cardId,
        destinationColumnId,
        error: error.message,
      });
      setStatus(
        `Card moved to ${destination.title}, but storage is unavailable.`,
        true,
      );
    }
  }

  /** Restores configured sample cards and removes persisted changes. */
  function reset() {
    state = createInitialState();
    render();

    try {
      clearBoard(storage);
      setStatus("Board reset to its starting cards.");
    } catch (error) {
      console.error("Unable to reset board.", { error: error.message });
      setStatus("Board reset for this session, but storage is unavailable.", true);
    }
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
   * Updates the live status region with normal or error feedback.
   * @param {string} message User-facing status message.
   * @param {boolean} [isError=false] Whether the message represents an error.
   */
  function setStatus(message, isError = false) {
    statusElement.textContent = message;
    statusElement.classList.toggle("status--error", isError);
  }

  return { initialize };
}
