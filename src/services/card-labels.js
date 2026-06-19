// src/services/card-labels.js
// Parses, normalizes, and formats card labels shared by forms, models, and rendering.
// Connects to: config/board-config.js, components/card-dialog.js, services/board-state.js, and services/board-search.js.
// Created: 2026-06-18

import { CARD_LABEL_MAX_COUNT, CARD_LABEL_MAX_LENGTH } from "../config/board-config.js";

/**
 * Splits a comma-separated label field into trimmed entries.
 * @param {string} rawLabels Raw input from the card editor.
 * @returns {Array<string>} Candidate label strings.
 */
export function parseLabelInput(rawLabels) {
  if (typeof rawLabels !== "string") {
    return [];
  }

  return rawLabels
    .split(",")
    .map((label) => label.trim())
    .filter((label) => label.length > 0);
}

/**
 * Normalizes card labels for storage and validation.
 * @param {unknown} rawLabels Candidate label input.
 * @returns {Array<string>} Safe, deduplicated label strings.
 * @throws {Error} When label count or length constraints are violated.
 */
export function normalizeLabels(rawLabels) {
  const labels = Array.isArray(rawLabels)
    ? rawLabels
    : typeof rawLabels === "string"
      ? parseLabelInput(rawLabels)
      : [];

  const normalizedLabels = [];
  const seenLabels = new Set();

  for (const label of labels) {
    if (typeof label !== "string") {
      throw new Error("Card labels must be text values.");
    }

    const normalizedLabel = label.trim().replace(/\s+/g, " ");
    if (normalizedLabel.length === 0) {
      continue;
    }

    if (normalizedLabel.length > CARD_LABEL_MAX_LENGTH) {
      throw new Error(
        `Card labels must be ${CARD_LABEL_MAX_LENGTH} characters or fewer.`,
      );
    }

    const dedupeKey = normalizedLabel.toLowerCase();
    if (seenLabels.has(dedupeKey)) {
      continue;
    }

    seenLabels.add(dedupeKey);
    normalizedLabels.push(normalizedLabel);
  }

  if (normalizedLabels.length > CARD_LABEL_MAX_COUNT) {
    throw new Error(`Cards can include at most ${CARD_LABEL_MAX_COUNT} labels.`);
  }

  return normalizedLabels;
}

/**
 * Formats stored labels back into a comma-separated input value.
 * @param {Array<string>} labels Stored label strings.
 * @returns {string} Readable label text for forms.
 */
export function formatLabelInput(labels) {
  return Array.isArray(labels) ? labels.join(", ") : "";
}
