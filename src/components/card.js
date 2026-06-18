// src/components/card.js
// Builds one draggable card with pointer, editing, and accessible movement controls.
// Connects to: components/column.js and services/card-drag.js.
// Created: 2026-06-18

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
) {
  const article = document.createElement("article");
  article.className = "card";
  article.draggable = true;
  article.dataset.cardId = card.id;
  article.tabIndex = 0;
  article.setAttribute("aria-label", `${card.title}. Draggable task card.`);

  const title = document.createElement("h3");
  title.textContent = card.title;

  const cardHeader = document.createElement("div");
  cardHeader.className = "card__header";
  cardHeader.append(title, createDragHandle(card.title));

  const description = document.createElement("p");
  description.textContent = card.description;

  const controls = document.createElement("div");
  controls.className = "card__controls";
  controls.setAttribute("aria-label", `Move ${card.title}`);

  controls.append(
    createEditButton(card.id, onEdit),
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

  article.append(cardHeader, description, controls);
  return article;
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
  button.textContent = "Edit";
  button.addEventListener("click", () => onEdit(cardId));
  return button;
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
