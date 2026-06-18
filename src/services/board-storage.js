// src/services/board-storage.js
// Loads and saves validated board state through the browser storage API.
// Connects to: config/board-config.js, models/board-state.js, and board-controller.js.
// Created: 2026-06-18

import { STORAGE_KEY } from "../config/board-config.js";
import { createInitialState, isValidState } from "../models/board-state.js";

/**
 * Loads valid saved state or returns a fresh state when none is available.
 * @param {Storage} storage Storage-compatible browser dependency.
 * @returns {{state: {cards: Array<object>}, recovered: boolean}} Load result.
 */
export function loadBoard(storage) {
  const serializedState = storage.getItem(STORAGE_KEY);

  if (serializedState === null) {
    return { state: createInitialState(), recovered: false };
  }

  try {
    const parsedState = JSON.parse(serializedState);
    if (isValidState(parsedState)) {
      return { state: parsedState, recovered: false };
    }
  } catch (error) {
    console.warn("Unable to parse saved board state.", { error: error.message });
  }

  storage.removeItem(STORAGE_KEY);
  return { state: createInitialState(), recovered: true };
}

/**
 * Serializes a validated board state into browser storage.
 * @param {Storage} storage Storage-compatible browser dependency.
 * @param {{cards: Array<object>}} state Board state to save.
 * @returns {void}
 * @throws {Error} When state is invalid or storage rejects the write.
 */
export function saveBoard(storage, state) {
  if (!isValidState(state)) {
    throw new Error("Cannot save an invalid board state.");
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Removes persisted board state so configured defaults can be restored.
 * @param {Storage} storage Storage-compatible browser dependency.
 * @returns {void}
 */
export function clearBoard(storage) {
  storage.removeItem(STORAGE_KEY);
}
