// src/components/card.js
// Builds one draggable card and its accessible movement controls.
// Connects to: components/column.js and services/board-controller.js.
// Created: 2026-06-18

/**
 * Creates a card element without injecting untrusted content as HTML.
 * @param {object} card Serializable card data.
 * @param {number} columnIndex Current column position.
 * @param {number} columnCount Total column count.
 * @param {(cardId: string, direction: number) => void} onMove Move callback.
 * @param {(cardId: string) => void} onEdit Edit callback.
 * @returns {HTMLElement} Fully configured card article.
 */
export function createCardElement(card, columnIndex, columnCount, onMove, onEdit) {
  const article = document.createElement("article");
  article.className = "card";
  article.draggable = true;
  article.dataset.cardId = card.id;
  article.tabIndex = 0;
  article.setAttribute("aria-label", `${card.title}. Draggable task card.`);

  const title = document.createElement("h3");
  title.textContent = card.title;

  const description = document.createElement("p");
  description.textContent = card.description;

  const controls = document.createElement("div");
  controls.className = "card__controls";
  controls.setAttribute("aria-label", `Move ${card.title}`);

  controls.append(
    createEditButton(card.id, onEdit),
    createMoveButton("Move left", -1, columnIndex === 0, card.id, onMove),
    createMoveButton(
      "Move right",
      1,
      columnIndex === columnCount - 1,
      card.id,
      onMove,
    ),
  );

  article.append(title, description, controls);
  return article;
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
 * @param {number} direction Negative for left, positive for right.
 * @param {boolean} disabled Whether movement is unavailable.
 * @param {string} cardId Card identifier.
 * @param {(cardId: string, direction: number) => void} onMove Move callback.
 * @returns {HTMLButtonElement} Configured movement button.
 */
function createMoveButton(label, direction, disabled, cardId, onMove) {
  const button = document.createElement("button");
  button.className = "icon-button";
  button.type = "button";
  button.disabled = disabled;
  button.setAttribute("aria-label", label);
  button.textContent = direction < 0 ? "←" : "→";
  button.addEventListener("click", () => onMove(cardId, direction));
  return button;
}
