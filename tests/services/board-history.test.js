// tests/services/board-history.test.js
// Verifies undo and redo snapshot behavior for the board history service.
// Connects to: src/services/board-history.js and src/models/board-state.js.
// Created: 2026-06-18

import assert from "node:assert/strict";
import test from "node:test";

import { createInitialState } from "../../src/models/board-state.js";
import { createBoardHistory } from "../../src/services/board-history.js";

test("record, undo, and redo move between snapshots", () => {
  const history = createBoardHistory();
  const initialState = createInitialState();
  const nextState = {
    cards: initialState.cards.map((card) => ({ ...card })),
  };
  nextState.cards[0].title = "Changed";

  history.record(initialState);
  assert.equal(history.canUndo(), true);
  assert.equal(history.canRedo(), false);

  const undoResult = history.undo(nextState);
  assert.equal(undoResult.changed, true);
  assert.deepEqual(undoResult.state, initialState);
  assert.equal(history.canRedo(), true);

  const redoResult = history.redo(undoResult.state);
  assert.equal(redoResult.changed, true);
  assert.deepEqual(redoResult.state, nextState);
  assert.equal(history.canRedo(), false);
});

test("record clears redo history and respects the snapshot limit", () => {
  const history = createBoardHistory(2);
  const firstState = createInitialState();
  const secondState = {
    cards: firstState.cards.map((card) => ({ ...card })),
  };
  secondState.cards[0].title = "First change";
  const thirdState = {
    cards: secondState.cards.map((card) => ({ ...card })),
  };
  thirdState.cards[0].title = "Second change";
  const fourthState = {
    cards: thirdState.cards.map((card) => ({ ...card })),
  };
  fourthState.cards[0].title = "Third change";

  history.record(firstState);
  history.record(secondState);
  history.record(thirdState);

  const firstUndo = history.undo(fourthState);
  const secondUndo = history.undo(firstUndo.state);
  const thirdUndo = history.undo(secondUndo.state);

  assert.equal(firstUndo.changed, true);
  assert.equal(secondUndo.changed, true);
  assert.equal(thirdUndo.changed, false);

  history.record(fourthState);
  assert.equal(history.canRedo(), false);
});

test("clear removes all stored history", () => {
  const history = createBoardHistory();
  history.record(createInitialState());
  history.clear();

  assert.equal(history.canUndo(), false);
  assert.equal(history.canRedo(), false);
});
