// tests/services/board-storage.test.js
// Verifies persistence, reset behavior, and recovery from corrupt saved data.
// Connects to: src/services/board-storage.js and src/config/board-config.js.
// Created: 2026-06-18

import assert from "node:assert/strict";
import test from "node:test";

import { STORAGE_KEY } from "../../src/config/board-config.js";
import { createInitialState } from "../../src/models/board-state.js";
import {
  clearBoard,
  loadBoard,
  saveBoard,
} from "../../src/services/board-storage.js";

/**
 * Creates an in-memory implementation of the Storage methods used by the app.
 * @returns {Storage} Storage-compatible test double.
 */
function createMemoryStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

test("loadBoard returns initial state when storage is empty", () => {
  const result = loadBoard(createMemoryStorage());

  assert.deepEqual(result.state, createInitialState());
  assert.equal(result.recovered, false);
});

test("saveBoard and loadBoard round-trip valid state", () => {
  const storage = createMemoryStorage();
  const state = createInitialState();

  saveBoard(storage, state);

  assert.deepEqual(loadBoard(storage).state, state);
});

test("loadBoard removes corrupt data and reports recovery", () => {
  const storage = createMemoryStorage();
  storage.setItem(STORAGE_KEY, "not-json");

  const result = loadBoard(storage);

  assert.deepEqual(result.state, createInitialState());
  assert.equal(result.recovered, true);
  assert.equal(storage.getItem(STORAGE_KEY), null);
});

test("saveBoard rejects invalid state", () => {
  assert.throws(
    () => saveBoard(createMemoryStorage(), { cards: [{ id: "unsafe" }] }),
    /invalid board state/,
  );
});

test("clearBoard removes saved state", () => {
  const storage = createMemoryStorage();
  saveBoard(storage, createInitialState());

  clearBoard(storage);

  assert.equal(storage.getItem(STORAGE_KEY), null);
});
