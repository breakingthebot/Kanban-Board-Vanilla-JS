// tests/services/board-search.test.js
// Verifies query normalization and card filtering for the board search service.
// Connects to: src/services/board-search.js and src/models/board-state.js.
// Created: 2026-06-18

import assert from "node:assert/strict";
import test from "node:test";

import { createInitialState } from "../../src/models/board-state.js";
import { filterCardsByQuery, normalizeSearchQuery } from "../../src/services/board-search.js";

test("normalizeSearchQuery trims and lowercases user input", () => {
  assert.equal(normalizeSearchQuery("  Board Search  "), "board search");
  assert.equal(normalizeSearchQuery(null), "");
});

test("filterCardsByQuery returns all cards for an empty query", () => {
  const cards = createInitialState().cards;

  assert.deepEqual(filterCardsByQuery(cards, "  "), cards);
});

test("filterCardsByQuery matches titles and descriptions case-insensitively", () => {
  const cards = createInitialState().cards;
  const titleMatches = filterCardsByQuery(cards, "repository");
  const descriptionMatches = filterCardsByQuery(cards, "responsive");

  assert.equal(titleMatches.length, 1);
  assert.equal(titleMatches[0].title, "Create the repository");
  assert.equal(descriptionMatches.length, 1);
  assert.equal(descriptionMatches[0].title, "Build the board layout");
});
