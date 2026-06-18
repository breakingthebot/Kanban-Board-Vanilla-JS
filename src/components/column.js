// src/components/column.js
// Builds a board column, card count, empty state, and drop target.
// Connects to: config/board-config.js, components/card.js, and board-controller.js.
// Created: 2026-06-18

import { createCardElement } from "./card.js";

/**
 * Creates one board column and renders its assigned cards.
 * @param {object} column Column configuration.
 * @param {Array<object>} cards Cards assigned to the column.
 * @param {number} columnIndex Current column position.
 * @param {number} columnCount Total number of columns.
 * @param {(cardId: string, direction: number) => void} onMove Move callback.
 * @param {(cardId: string) => void} onEdit Edit callback.
 * @returns {HTMLElement} Configured column section.
 */
export function createColumnElement(
  column,
  cards,
  columnIndex,
  columnCount,
  onMove,
  onEdit,
) {
  const section = document.createElement("section");
  section.className = "column";
  section.dataset.columnId = column.id;
  section.setAttribute("aria-labelledby", `${column.id}-title`);

  const header = document.createElement("header");
  header.className = "column__header";

  const title = document.createElement("h2");
  title.id = `${column.id}-title`;
  title.textContent = column.title;

  const count = document.createElement("span");
  count.className = "column__count";
  count.textContent = String(cards.length);
  count.setAttribute("aria-label", `${cards.length} cards`);

  const cardList = document.createElement("div");
  cardList.className = "column__cards";

  if (cards.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "Drop a card here";
    cardList.append(emptyState);
  } else {
    cards.forEach((card) => {
      cardList.append(
        createCardElement(card, columnIndex, columnCount, onMove, onEdit),
      );
    });
  }

  header.append(title, count);
  section.append(header, cardList);
  return section;
}
