// tests/services/card-labels.test.js
// Verifies label parsing and normalization for card input and storage.
// Connects to: src/services/card-labels.js.
// Created: 2026-06-18

import assert from "node:assert/strict";
import test from "node:test";

import { formatLabelInput, normalizeLabels, parseLabelInput } from "../../src/services/card-labels.js";

test("parseLabelInput trims comma-separated labels", () => {
  assert.deepEqual(parseLabelInput(" planning, scope , ui "), ["planning", "scope", "ui"]);
  assert.deepEqual(parseLabelInput(null), []);
});

test("normalizeLabels deduplicates and enforces limits", () => {
  assert.deepEqual(normalizeLabels(["Launch", " launch ", "Release"]), [
    "Launch",
    "Release",
  ]);
  assert.deepEqual(formatLabelInput(["planning", "scope"]), "planning, scope");
  assert.throws(
    () => normalizeLabels(["x".repeat(25)]),
    /24 characters or fewer/,
  );
  assert.throws(
    () => normalizeLabels(["a", "b", "c", "d", "e"]),
    /at most 4 labels/,
  );
});
