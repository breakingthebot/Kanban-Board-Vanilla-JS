// tests/services/board-search-summary.test.js
// Verifies search summaries for total and per-column match counts.
// Connects to: src/services/board-search-summary.js and src/models/board-state.js.
// Created: 2026-06-18

import assert from "node:assert/strict";
import test from "node:test";

import { createInitialState } from "../../src/models/board-state.js";
import { summarizeBoardSearch } from "../../src/services/board-search-summary.js";

test("summarizeBoardSearch returns counts for all columns", () => {
  const summary = summarizeBoardSearch(createInitialState().cards, "board");

  assert.equal(summary.isFiltering, true);
  assert.equal(summary.totalMatches, 1);
  assert.deepEqual(
    summary.columnMatches.map((column) => [column.id, column.count]),
    [
      ["todo", 0],
      ["doing", 1],
      ["done", 0],
    ],
  );
});

test("summarizeBoardSearch reports all cards when search is empty", () => {
  const summary = summarizeBoardSearch(createInitialState().cards, " ");

  assert.equal(summary.isFiltering, false);
  assert.equal(summary.totalMatches, summary.totalCards);
  assert.deepEqual(
    summary.columnMatches.map((column) => column.count),
    [1, 1, 1],
  );
});
