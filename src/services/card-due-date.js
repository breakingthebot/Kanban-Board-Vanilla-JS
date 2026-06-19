// src/services/card-due-date.js
// Normalizes, validates, formats, and compares board card due dates.
// Connects to: config/board-config.js, models/board-state.js, components/card-dialog.js, components/card.js, and board filtering.
// Created: 2026-06-18

import { CARD_DUE_DATE_MAX_LENGTH, CARD_DUE_SOON_DAYS } from "../config/board-config.js";

/**
 * Normalizes a due date input to a YYYY-MM-DD string.
 * @param {unknown} rawDueDate Raw due date input.
 * @returns {string|undefined} Normalized due date or undefined when empty.
 * @throws {Error} When the value is not a valid calendar date.
 */
export function normalizeDueDate(rawDueDate) {
  if (rawDueDate === undefined || rawDueDate === null) {
    return undefined;
  }

  const dueDate = String(rawDueDate).trim();
  if (dueDate.length === 0) {
    return undefined;
  }

  if (dueDate.length !== CARD_DUE_DATE_MAX_LENGTH || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    throw new Error("Card due dates must use YYYY-MM-DD format.");
  }

  const [year, month, day] = dueDate.split("-").map((part) => Number.parseInt(part, 10));
  const parsedDate = new Date(year, month - 1, day);
  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    throw new Error("Card due dates must be valid calendar dates.");
  }

  return dueDate;
}

/**
 * Formats a due date for display in the card footer.
 * @param {string|undefined} dueDate Due date string.
 * @returns {string} Human-readable label.
 */
export function formatDueDate(dueDate) {
  if (!dueDate) {
    return "";
  }

  const [year, month, day] = dueDate.split("-").map((part) => Number.parseInt(part, 10));
  const date = new Date(year, month - 1, day);
  return `Due ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

/**
 * Checks whether a due date is overdue relative to today.
 * @param {string|undefined} dueDate Due date string.
 * @param {Date} [referenceDate=new Date()] Reference date for comparison.
 * @returns {boolean} Whether the date is overdue.
 */
export function isOverdue(dueDate, referenceDate = new Date()) {
  if (!dueDate) {
    return false;
  }

  const [year, month, day] = dueDate.split("-").map((part) => Number.parseInt(part, 10));
  const due = new Date(year, month - 1, day, 23, 59, 59, 999);
  const today = new Date(referenceDate);
  today.setHours(23, 59, 59, 999);
  return due.getTime() < today.getTime();
}

/**
 * Checks whether a due date falls within the upcoming window.
 * @param {string|undefined} dueDate Due date string.
 * @param {Date} [referenceDate=new Date()] Reference date for comparison.
 * @returns {boolean} Whether the due date is due soon.
 */
export function isDueSoon(dueDate, referenceDate = new Date()) {
  if (!dueDate || isOverdue(dueDate, referenceDate)) {
    return false;
  }

  const [year, month, day] = dueDate.split("-").map((part) => Number.parseInt(part, 10));
  const due = new Date(year, month - 1, day, 23, 59, 59, 999);
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  const soonLimit = new Date(today);
  soonLimit.setDate(soonLimit.getDate() + CARD_DUE_SOON_DAYS);
  soonLimit.setHours(23, 59, 59, 999);

  return due.getTime() <= soonLimit.getTime();
}
