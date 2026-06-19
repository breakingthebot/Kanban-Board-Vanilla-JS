// tests/services/board-backup.test.js
// Verifies JSON serialization and restoration for board backup imports and exports.
// Connects to: src/services/board-backup.js and src/models/board-state.js.
// Created: 2026-06-18

import assert from "node:assert/strict";
import test from "node:test";

import { createInitialState } from "../../src/models/board-state.js";
import {
  deserializeBoardState,
  serializeBoardState,
} from "../../src/services/board-backup.js";

test("serializeBoardState returns formatted JSON for a valid board", () => {
  const backup = serializeBoardState(createInitialState());

  assert.match(backup, /^\{\n  "cards": \[/);
  assert.deepEqual(JSON.parse(backup), createInitialState());
});

test("deserializeBoardState restores a valid board backup", () => {
  const state = createInitialState();
  const restoredState = deserializeBoardState(JSON.stringify(state));

  assert.deepEqual(restoredState, state);
});

test("deserializeBoardState rejects invalid, empty, and malformed backups", () => {
  assert.throws(() => deserializeBoardState(""), /required/);
  assert.throws(() => deserializeBoardState("not-json"), /could not be parsed/);
  assert.throws(
    () => deserializeBoardState(JSON.stringify({ cards: [{ id: "unsafe" }] })),
    /not a valid board state/,
  );
});
