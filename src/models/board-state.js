// src/models/board-state.js
// Creates, validates, and updates the serializable board state.
// Connects to: config/board-config.js and services/board-controller.js.
// Created: 2026-06-18

import { COLUMNS, INITIAL_CARDS } from "../config/board-config.js";

/**
 * Creates a fresh board state from the configured sample cards.
 * @returns {{cards: Array<object>}} A mutable board state copy.
 */
export function createInitialState() {
  return { cards: INITIAL_CARDS.map((card) => ({ ...card })) };
}

/**
 * Checks whether unknown data has the expected board-state shape.
 * @param {unknown} state Candidate state loaded from persistence.
 * @returns {boolean} Whether the candidate is safe to render.
 */
export function isValidState(state) {
  if (!state || typeof state !== "object" || !Array.isArray(state.cards)) {
    return false;
  }

  const columnIds = new Set(COLUMNS.map((column) => column.id));
  const cardIds = new Set();

  return state.cards.every((card) => {
    const isValidCard =
      card &&
      typeof card === "object" &&
      typeof card.id === "string" &&
      card.id.length > 0 &&
      typeof card.title === "string" &&
      card.title.length > 0 &&
      typeof card.description === "string" &&
      columnIds.has(card.columnId) &&
      !cardIds.has(card.id);

    cardIds.add(card?.id);
    return isValidCard;
  });
}

/**
 * Returns a new state with one card moved to a valid destination column.
 * @param {{cards: Array<object>}} state Current board state.
 * @param {string} cardId Card identifier to move.
 * @param {string} destinationColumnId Destination column identifier.
 * @returns {{cards: Array<object>}} Updated immutable state.
 * @throws {Error} When the card or destination does not exist.
 */
export function moveCard(state, cardId, destinationColumnId) {
  const destinationExists = COLUMNS.some(
    (column) => column.id === destinationColumnId,
  );
  const cardExists = state.cards.some((card) => card.id === cardId);

  if (!destinationExists) {
    throw new Error(`Cannot move card: unknown column "${destinationColumnId}".`);
  }

  if (!cardExists) {
    throw new Error(`Cannot move card: unknown card "${cardId}".`);
  }

  return {
    cards: state.cards.map((card) =>
      card.id === cardId ? { ...card, columnId: destinationColumnId } : { ...card },
    ),
  };
}
