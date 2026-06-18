// src/services/board-controller.js
// Coordinates state, persistence, rendering, drag-and-drop, and user feedback.
// Connects to: board state, storage service, column component, and src/main.js.
// Created: 2026-06-18

import { createColumnElement } from "../components/column.js";
import { COLUMNS } from "../config/board-config.js";
import { createInitialState, moveCard } from "../models/board-state.js";
import { clearBoard, loadBoard, saveBoard } from "./board-storage.js";

/**
 * Creates the board controller around explicit DOM and storage dependencies.
 * @param {object} dependencies Controller dependencies.
 * @param {HTMLElement} dependencies.boardElement Board container.
 * @param {HTMLElement} dependencies.statusElement Live status region.
 * @param {HTMLButtonElement} dependencies.resetButton Reset control.
 * @param {Storage} dependencies.storage Browser storage implementation.
 * @returns {{initialize: () => void}} Public controller API.
 */
export function createBoardController({
  boardElement,
  statusElement,
  resetButton,
  storage,
}) {
  let state = createInitialState();

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
    boardElement.addEventListener("dragstart", handleDragStart);
    boardElement.addEventListener("dragend", clearDropIndicators);
    boardElement.addEventListener("dragover", handleDragOver);
    boardElement.addEventListener("dragleave", handleDragLeave);
    boardElement.addEventListener("drop", handleDrop);
  }

  /** Rebuilds board columns from the current state. */
  function render() {
    boardElement.replaceChildren();
    COLUMNS.forEach((column, index) => {
      const cards = state.cards.filter((card) => card.columnId === column.id);
      boardElement.append(
        createColumnElement(column, cards, index, COLUMNS.length, moveByDirection),
      );
    });
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
      updateCardPosition(cardId, destination.id);
    }
  }

  /**
   * Updates state, saves it, and reports the completed card movement.
   * @param {string} cardId Card identifier.
   * @param {string} destinationColumnId Destination column identifier.
   */
  function updateCardPosition(cardId, destinationColumnId) {
    try {
      state = moveCard(state, cardId, destinationColumnId);
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

  /** @param {DragEvent} event Native drag-start event. */
  function handleDragStart(event) {
    const card = event.target.closest(".card");
    if (!card || !event.dataTransfer) return;

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", card.dataset.cardId);
    card.classList.add("card--dragging");
  }

  /** @param {DragEvent} event Native drag-over event. */
  function handleDragOver(event) {
    const column = event.target.closest(".column");
    if (!column) return;

    event.preventDefault();
    clearDropIndicators();
    column.classList.add("column--drop-target");
  }

  /** @param {DragEvent} event Native drag-leave event. */
  function handleDragLeave(event) {
    const column = event.target.closest(".column");
    if (column && !column.contains(event.relatedTarget)) {
      column.classList.remove("column--drop-target");
    }
  }

  /** @param {DragEvent} event Native drop event. */
  function handleDrop(event) {
    const column = event.target.closest(".column");
    if (!column || !event.dataTransfer) return;

    event.preventDefault();
    const cardId = event.dataTransfer.getData("text/plain");
    clearDropIndicators();
    updateCardPosition(cardId, column.dataset.columnId);
  }

  /** Removes visual drag state from every card and column. */
  function clearDropIndicators() {
    boardElement.querySelectorAll(".card--dragging").forEach((card) => {
      card.classList.remove("card--dragging");
    });
    boardElement.querySelectorAll(".column--drop-target").forEach((column) => {
      column.classList.remove("column--drop-target");
    });
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
