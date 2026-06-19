// src/services/board-backup.js
// Serializes and restores board state backups from JSON strings.
// Connects to: models/board-state.js, services/board-controller.js, and components/board-backup-dialog.js.
// Created: 2026-06-18

import { isValidState } from "../models/board-state.js";

/**
 * Serializes a validated board state into formatted JSON.
 * @param {{cards: Array<object>}} state Board state to encode.
 * @returns {string} Pretty-printed JSON backup.
 * @throws {Error} When the state is invalid.
 */
export function serializeBoardState(state) {
  if (!isValidState(state)) {
    throw new Error("Cannot export an invalid board state.");
  }

  return JSON.stringify(state, null, 2);
}

/**
 * Parses a board backup from JSON and validates its structure.
 * @param {string} serializedState Candidate JSON backup.
 * @returns {{cards: Array<object>}} Restored board state.
 * @throws {Error} When the backup cannot be parsed or is invalid.
 */
export function deserializeBoardState(serializedState) {
  if (typeof serializedState !== "string" || serializedState.trim().length === 0) {
    throw new Error("Board backup JSON is required.");
  }

  let parsedState;

  try {
    parsedState = JSON.parse(serializedState);
  } catch {
    throw new Error("Board backup JSON could not be parsed.");
  }

  if (!isValidState(parsedState)) {
    throw new Error("Board backup data is not a valid board state.");
  }

  return parsedState;
}
