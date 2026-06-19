// tests/services/card-due-date.test.js
// Verifies due date parsing, display formatting, and overdue detection.
// Connects to: src/services/card-due-date.js.
// Created: 2026-06-18

import assert from "node:assert/strict";
import test from "node:test";

import { formatDueDate, isOverdue, normalizeDueDate } from "../../src/services/card-due-date.js";

test("normalizeDueDate accepts valid dates and trims empty input", () => {
  assert.equal(normalizeDueDate(" 2026-06-30 "), "2026-06-30");
  assert.equal(normalizeDueDate(""), undefined);
  assert.equal(normalizeDueDate(null), undefined);
});

test("normalizeDueDate rejects malformed or impossible dates", () => {
  assert.throws(() => normalizeDueDate("2026/06/30"), /YYYY-MM-DD/);
  assert.throws(() => normalizeDueDate("2026-13-01"), /valid calendar dates/);
});

test("formatDueDate and isOverdue provide readable status", () => {
  assert.equal(formatDueDate("2026-06-30"), "Due Jun 30, 2026");
  assert.equal(isOverdue("2000-01-01", new Date("2026-06-18T12:00:00")), true);
  assert.equal(isOverdue("2099-01-01", new Date("2026-06-18T12:00:00")), false);
});
