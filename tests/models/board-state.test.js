// tests/models/board-state.test.js
// Verifies board-state creation, validation, and immutable card movement.
// Connects to: src/models/board-state.js.
// Created: 2026-06-18

import assert from "node:assert/strict";
import test from "node:test";

import {
  addCard,
  createInitialState,
  deleteCard,
  isValidState,
  moveCard,
  updateCard,
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

test("isValidState rejects missing fields and non-object input", () => {
  const missingDescription = createInitialState();
  delete missingDescription.cards[0].description;

  assert.equal(isValidState(missingDescription), false);
  assert.equal(isValidState(null), false);
  assert.equal(isValidState([]), false);
});

test("isValidState rejects persisted fields beyond configured limits", () => {
  const oversizedTitle = createInitialState();
  oversizedTitle.cards[0].title = "x".repeat(81);
  const oversizedDescription = createInitialState();
  oversizedDescription.cards[0].description = "x".repeat(241);

  assert.equal(isValidState(oversizedTitle), false);
  assert.equal(isValidState(oversizedDescription), false);
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

test("addCard trims valid input without mutating existing state", () => {
  const state = createInitialState();
  const result = addCard(state, "card-new", {
    title: "  New task  ",
    description: "  Details  ",
    columnId: "todo",
  });

  assert.equal(state.cards.length + 1, result.cards.length);
  assert.deepEqual(result.cards.at(-1), {
    id: "card-new",
    title: "New task",
    description: "Details",
    columnId: "todo",
  });
});

test("addCard rejects invalid fields and duplicate IDs", () => {
  const state = createInitialState();

  assert.throws(
    () => addCard(state, "card-new", { title: " ", description: "", columnId: "todo" }),
    /title must be between/,
  );
  assert.throws(
    () => addCard(state, state.cards[0].id, state.cards[0]),
    /already exists/,
  );
  assert.throws(
    () => addCard(state, "card-new", { ...state.cards[0], columnId: "unknown" }),
    /unknown column/,
  );
  assert.throws(
    () =>
      addCard(state, "card-new", {
        ...state.cards[0],
        description: "x".repeat(241),
      }),
    /description must be 240 characters or fewer/,
  );
});

test("updateCard changes editable fields and preserves the card ID", () => {
  const state = createInitialState();
  const cardId = state.cards[0].id;
  const result = updateCard(state, cardId, {
    title: "Updated task",
    description: "Updated details",
    columnId: "done",
  });

  assert.deepEqual(result.cards[0], {
    id: cardId,
    title: "Updated task",
    description: "Updated details",
    columnId: "done",
  });
  assert.notDeepEqual(state.cards[0], result.cards[0]);
});

test("deleteCard removes an existing card and rejects unknown IDs", () => {
  const state = createInitialState();
  const cardId = state.cards[0].id;
  const result = deleteCard(state, cardId);

  assert.equal(result.cards.some((card) => card.id === cardId), false);
  assert.equal(state.cards.some((card) => card.id === cardId), true);
  assert.throws(() => deleteCard(state, "missing"), /unknown card/);
});
