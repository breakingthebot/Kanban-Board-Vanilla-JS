// src/components/card.js
// Builds one draggable card with pointer, editing, and accessible movement controls.
// Connects to: components/column.js and services/card-drag.js.
// Created: 2026-06-18

import { formatDueDate, isOverdue } from "../services/card-due-date.js";

/**
 * Creates a card element without injecting untrusted content as HTML.
 * @param {object} card Serializable card data.
 * @param {number} columnIndex Current column position.
 * @param {number} columnCount Total column count.
 * @param {number} cardIndex Current position within the column.
 * @param {number} cardCount Number of cards in the column.
 * @param {(cardId: string, direction: number) => void} onMoveColumn Column move callback.
 * @param {(cardId: string, direction: number) => void} onReorder Reorder callback.
 * @param {(cardId: string) => void} onEdit Edit callback.
 * @param {(cardId: string) => void} onDuplicate Duplicate callback.
 * @returns {HTMLElement} Fully configured card article.
 */
export function createCardElement(
  card,
  columnIndex,
  columnCount,
  cardIndex,
  cardCount,
  onMoveColumn,
  onReorder,
  onEdit,
  onDuplicate,
) {
  const article = document.createElement("article");
  article.className = "card";
  article.draggable = true;
  article.dataset.cardId = card.id;
  article.dataset.columnId = card.columnId;
  article.dataset.overdue = String(isOverdue(card.dueDate));
  article.tabIndex = 0;
  article.setAttribute("aria-label", `${card.title}. Draggable task card.`);

  const title = document.createElement("h3");
  title.textContent = card.title;

  const cardHeader = document.createElement("div");
  cardHeader.className = "card__header";
  cardHeader.append(title, createDragHandle(card.title));

  const description = document.createElement("p");
  description.textContent = card.description;
  description.className = "card__description";

  const dueDate = createDueDateBadge(card.dueDate);
  const labels = createLabels(card.labels);

  const controls = document.createElement("div");
  controls.className = "card__controls";
  controls.setAttribute("aria-label", `Move ${card.title}`);

  controls.append(
    createEditButton(card.id, onEdit),
    createDuplicateButton(card.id, onDuplicate),
    createMoveButton("Move up", "\u2191", -1, cardIndex === 0, card.id, onReorder),
    createMoveButton(
      "Move down",
      "\u2193",
      1,
      cardIndex === cardCount - 1,
      card.id,
      onReorder,
    ),
    createMoveButton(
      "Move left",
      "\u2190",
      -1,
      columnIndex === 0,
      card.id,
      onMoveColumn,
    ),
    createMoveButton(
      "Move right",
      "\u2192",
      1,
      columnIndex === columnCount - 1,
      card.id,
      onMoveColumn,
    ),
  );

  const content = [cardHeader, description];
  if (dueDate) {
    content.push(dueDate);
  }
  if (labels) {
    content.push(labels);
  }
  content.push(controls);
  article.append(...content);
  return article;
}

/**
 * Creates a due-date badge when a card has a deadline.
 * @param {string|undefined} dueDate Due date string.
 * @returns {HTMLElement|null} Due date badge or null when empty.
 */
function createDueDateBadge(dueDate) {
  if (!dueDate) {
    return null;
  }

  const badge = document.createElement("p");
  badge.className = "card__due-date";
  badge.textContent = formatDueDate(dueDate);
  badge.dataset.overdue = String(isOverdue(dueDate));
  if (badge.dataset.overdue === "true") {
    badge.textContent = `${badge.textContent} • Overdue`;
  }

  return badge;
}

/**
 * Creates a label list for the card when labels are present.
 * @param {Array<string>|undefined} cardLabels Stored labels.
 * @returns {HTMLElement|null} Label container or null when empty.
 */
function createLabels(cardLabels) {
  if (!Array.isArray(cardLabels) || cardLabels.length === 0) {
    return null;
  }

  const labels = document.createElement("div");
  labels.className = "card__labels";
  labels.setAttribute("aria-label", "Card labels");

  cardLabels.forEach((label) => {
    const chip = document.createElement("span");
    chip.className = "card__label";
    chip.textContent = label;
    labels.append(chip);
  });

  return labels;
}

/**
 * Creates a dedicated touch/pen drag handle without hijacking page scrolling.
 * @param {string} cardTitle Card title for the accessible label.
 * @returns {HTMLSpanElement} Pointer-only drag handle.
 */
function createDragHandle(cardTitle) {
  const handle = document.createElement("span");
  handle.className = "drag-handle";
  handle.dataset.dragLabel = cardTitle;
  handle.setAttribute("aria-hidden", "true");
  handle.textContent = "\u283F";
  return handle;
}

/**
 * Creates the card edit button.
 * @param {string} cardId Card identifier.
 * @param {(cardId: string) => void} onEdit Edit callback.
 * @returns {HTMLButtonElement} Configured edit button.
 */
function createEditButton(cardId, onEdit) {
  const button = document.createElement("button");
  button.className = "text-button";
  button.type = "button";
  button.append(createButtonIcon("✎"), createButtonLabel("Edit"));
  button.addEventListener("click", () => onEdit(cardId));
  return button;
}

/**
 * Creates the card duplicate button.
 * @param {string} cardId Card identifier.
 * @param {(cardId: string) => void} onDuplicate Duplicate callback.
 * @returns {HTMLButtonElement} Configured duplicate button.
 */
function createDuplicateButton(cardId, onDuplicate) {
  const button = document.createElement("button");
  button.className = "text-button";
  button.type = "button";
  button.append(createButtonIcon("⧉"), createButtonLabel("Duplicate"));
  button.addEventListener("click", () => onDuplicate(cardId));
  return button;
}

/**
 * Creates the decorative icon used inside a text button.
 * @param {string} icon Visual icon character.
 * @returns {HTMLSpanElement} Icon span.
 */
function createButtonIcon(icon) {
  const span = document.createElement("span");
  span.className = "button__icon";
  span.setAttribute("aria-hidden", "true");
  span.textContent = icon;
  return span;
}

/**
 * Creates the visible text used inside a text button.
 * @param {string} label Button label.
 * @returns {HTMLSpanElement} Text span.
 */
function createButtonLabel(label) {
  const span = document.createElement("span");
  span.className = "button__label";
  span.textContent = label;
  return span;
}

/**
 * Creates one directional card movement button.
 * @param {string} label Accessible button label.
 * @param {string} symbol Visible directional symbol.
 * @param {number} direction Negative for up/left, positive for down/right.
 * @param {boolean} disabled Whether movement is unavailable.
 * @param {string} cardId Card identifier.
 * @param {(cardId: string, direction: number) => void} onMove Move callback.
 * @returns {HTMLButtonElement} Configured movement button.
 */
function createMoveButton(label, symbol, direction, disabled, cardId, onMove) {
  const button = document.createElement("button");
  button.className = "icon-button";
  button.type = "button";
  button.disabled = disabled;
  button.setAttribute("aria-label", label);
  button.textContent = symbol;
  button.addEventListener("click", () => onMove(cardId, direction));
  return button;
}
