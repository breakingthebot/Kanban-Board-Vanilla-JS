// tests/models/board-state.test.js
// Verifies board-state creation, validation, and immutable card movement.
// Connects to: src/models/board-state.js.
// Created: 2026-06-18

import assert from "node:assert/strict";
import test from "node:test";

import {
  createInitialState,
  isValidState,
  moveCard,
} from "../../src/models/board-state.js";

test("createInitialState returns independent card copies", () => {
  const firstState = createInitialState();
  const secondState = createInitialState();

  firstState.cards[0].title = "Changed";

  assert.notEqual(secondState.cards[0].title, "Changed");
});

test("isValidState accepts configured initial state", () => {
  assert.equal(isValidState(createInitialState()), true);
});

test("isValidState rejects unknown columns and duplicate card IDs", () => {
  const invalidColumn = createInitialState();
  invalidColumn.cards[0].columnId = "unknown";

  const duplicateId = createInitialState();
  duplicateId.cards[1].id = duplicateId.cards[0].id;

  assert.equal(isValidState(invalidColumn), false);
  assert.equal(isValidState(duplicateId), false);
});

test("moveCard moves a card without mutating the original state", () => {
  const originalState = createInitialState();
  const cardId = originalState.cards[0].id;
  const movedState = moveCard(originalState, cardId, "done");

  assert.equal(originalState.cards[0].columnId, "todo");
  assert.equal(movedState.cards[0].columnId, "done");
  assert.notStrictEqual(movedState, originalState);
});

test("moveCard rejects missing cards and columns", () => {
  const state = createInitialState();

  assert.throws(() => moveCard(state, "missing", "done"), /unknown card/);
  assert.throws(() => moveCard(state, state.cards[0].id, "missing"), /unknown column/);
});
