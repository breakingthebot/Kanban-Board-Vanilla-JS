// src/services/board-history.js
// Tracks session-only undo and redo snapshots for the board controller.
// Connects to: services/board-controller.js and tests/services/board-history.test.js.
// Created: 2026-06-18

/**
 * Creates a bounded, session-only history buffer for board snapshots.
 * @param {number} [limit=25] Maximum number of undo snapshots to retain.
 * @returns {{
 *   record: (state: {cards: Array<object>}) => void,
 *   undo: (state: {cards: Array<object>}) => {state: {cards: Array<object>}, changed: boolean},
 *   redo: (state: {cards: Array<object>}) => {state: {cards: Array<object>}, changed: boolean},
 *   canUndo: () => boolean,
 *   canRedo: () => boolean,
 *   clear: () => void
 * }} History API.
 */
export function createBoardHistory(limit = 25) {
  const undoStack = [];
  const redoStack = [];

  /**
   * Stores a snapshot of the current board before a mutating action.
   * @param {{cards: Array<object>}} state Current board state.
   * @returns {void}
   */
  function record(state) {
    undoStack.push(cloneState(state));
    if (undoStack.length > limit) {
      undoStack.shift();
    }
    redoStack.length = 0;
  }

  /**
   * Restores the most recent undo snapshot.
   * @param {{cards: Array<object>}} state Current board state.
   * @returns {{state: {cards: Array<object>}, changed: boolean}} Undo result.
   */
  function undo(state) {
    const previousState = undoStack.pop();
    if (!previousState) {
      return { state, changed: false };
    }

    redoStack.push(cloneState(state));
    return { state: previousState, changed: true };
  }

  /**
   * Restores the most recent redo snapshot.
   * @param {{cards: Array<object>}} state Current board state.
   * @returns {{state: {cards: Array<object>}, changed: boolean}} Redo result.
   */
  function redo(state) {
    const nextState = redoStack.pop();
    if (!nextState) {
      return { state, changed: false };
    }

    undoStack.push(cloneState(state));
    if (undoStack.length > limit) {
      undoStack.shift();
    }
    return { state: nextState, changed: true };
  }

  /** @returns {boolean} Whether an undo snapshot exists. */
  function canUndo() {
    return undoStack.length > 0;
  }

  /** @returns {boolean} Whether a redo snapshot exists. */
  function canRedo() {
    return redoStack.length > 0;
  }

  /** Clears both history stacks. */
  function clear() {
    undoStack.length = 0;
    redoStack.length = 0;
  }

  return { record, undo, redo, canUndo, canRedo, clear };
}

/**
 * Clones a board state into a fresh serializable snapshot.
 * @param {{cards: Array<object>}} state Board state to clone.
 * @returns {{cards: Array<object>}} Independent snapshot copy.
 */
function cloneState(state) {
  return { cards: state.cards.map((card) => ({ ...card })) };
}
