// src/services/card-drag.js
// Translates desktop drag and touch/pen pointer gestures into ordered card placements.
// Connects to: rendered card/column DOM and services/board-controller.js.
// Created: 2026-06-18

/**
 * Creates delegated drag behavior that survives controller re-renders.
 * @param {object} dependencies Drag dependencies.
 * @param {HTMLElement} dependencies.boardElement Board event root.
 * @param {(cardId: string, columnId: string, beforeCardId: string|null) => void} dependencies.onDrop Placement callback.
 * @returns {{initialize: () => void}} Drag manager API.
 */
export function createCardDragManager({ boardElement, onDrop }) {
  let pointerDrag = null;

  /** Binds native drag and pointer events once to the board root. */
  function initialize() {
    boardElement.addEventListener("dragstart", handleDragStart);
    boardElement.addEventListener("dragend", clearIndicators);
    boardElement.addEventListener("dragover", handleDragOver);
    boardElement.addEventListener("dragleave", handleDragLeave);
    boardElement.addEventListener("drop", handleDrop);
    boardElement.addEventListener("pointerdown", handlePointerDown);
    boardElement.addEventListener("pointermove", handlePointerMove);
    boardElement.addEventListener("pointerup", handlePointerUp);
    boardElement.addEventListener("pointercancel", cancelPointerDrag);
  }

  /** @param {DragEvent} event Native desktop drag-start event. */
  function handleDragStart(event) {
    const card = event.target.closest(".card");
    if (!card || !event.dataTransfer) return;

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", card.dataset.cardId);
    card.classList.add("card--dragging");
  }

  /** @param {DragEvent} event Native desktop drag-over event. */
  function handleDragOver(event) {
    const column = event.target.closest(".column");
    if (!column) return;

    event.preventDefault();
    showDropPosition(column, event.clientY);
  }

  /** @param {DragEvent} event Native desktop drag-leave event. */
  function handleDragLeave(event) {
    const column = event.target.closest(".column");
    if (column && !column.contains(event.relatedTarget)) clearIndicators();
  }

  /** @param {DragEvent} event Native desktop drop event. */
  function handleDrop(event) {
    const column = event.target.closest(".column");
    if (!column || !event.dataTransfer) return;

    event.preventDefault();
    completeDrop(
      event.dataTransfer.getData("text/plain"),
      column,
      event.clientY,
    );
  }

  /** @param {PointerEvent} event Touch or pen pointer-down event. */
  function handlePointerDown(event) {
    const handle = event.target.closest(".drag-handle");
    if (!handle || event.pointerType === "mouse") return;

    const card = handle.closest(".card");
    pointerDrag = { cardId: card.dataset.cardId, handle, pointerId: event.pointerId };
    handle.setPointerCapture(event.pointerId);
    card.classList.add("card--dragging");
    event.preventDefault();
  }

  /** @param {PointerEvent} event Active touch or pen pointer-move event. */
  function handlePointerMove(event) {
    if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) return;

    const column = getColumnAtPoint(event.clientX, event.clientY);
    if (column) showDropPosition(column, event.clientY);
    event.preventDefault();
  }

  /** @param {PointerEvent} event Active touch or pen pointer-up event. */
  function handlePointerUp(event) {
    if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) return;

    const { cardId, handle } = pointerDrag;
    const column = getColumnAtPoint(event.clientX, event.clientY);
    if (handle.hasPointerCapture(event.pointerId)) {
      handle.releasePointerCapture(event.pointerId);
    }
    pointerDrag = null;

    if (column) completeDrop(cardId, column, event.clientY);
    else clearIndicators();
  }

  /** Cancels an interrupted touch or pen gesture without changing state. */
  function cancelPointerDrag() {
    pointerDrag = null;
    clearIndicators();
  }

  /**
   * Resolves the column currently under a viewport coordinate.
   * @param {number} x Horizontal viewport coordinate.
   * @param {number} y Vertical viewport coordinate.
   * @returns {HTMLElement|null} Column under the pointer.
   */
  function getColumnAtPoint(x, y) {
    return document.elementFromPoint(x, y)?.closest(".column") ?? null;
  }

  /**
   * Completes a placement and clears all transient drag styling.
   * @param {string} cardId Moving card identifier.
   * @param {HTMLElement} column Destination column.
   * @param {number} pointerY Vertical pointer coordinate.
   */
  function completeDrop(cardId, column, pointerY) {
    const beforeCardId = findBeforeCardId(column, pointerY, cardId);
    clearIndicators();
    onDrop(cardId, column.dataset.columnId, beforeCardId);
  }

  /**
   * Shows the destination column and exact insertion line.
   * @param {HTMLElement} column Destination column.
   * @param {number} pointerY Vertical pointer coordinate.
   */
  function showDropPosition(column, pointerY) {
    const draggingCardId =
      pointerDrag?.cardId ??
      boardElement.querySelector(".card--dragging")?.dataset.cardId;
    const beforeCardId = findBeforeCardId(column, pointerY, draggingCardId);
    clearDropTargets();
    column.classList.add("column--drop-target");

    if (beforeCardId) {
      [...column.querySelectorAll(".card")]
        .find((card) => card.dataset.cardId === beforeCardId)
        ?.classList.add("card--drop-before");
    }
  }

  /**
   * Finds the first destination card whose midpoint is below the pointer.
   * @param {HTMLElement} column Destination column.
   * @param {number} pointerY Vertical pointer coordinate.
   * @param {string} draggingCardId Moving card identifier.
   * @returns {string|null} Card to insert before, or null for column end.
   */
  function findBeforeCardId(column, pointerY, draggingCardId) {
    const destinationCards = [...column.querySelectorAll(".card")].filter(
      (card) => card.dataset.cardId !== draggingCardId,
    );
    const beforeCard = destinationCards.find((card) => {
      const bounds = card.getBoundingClientRect();
      return pointerY < bounds.top + bounds.height / 2;
    });
    return beforeCard?.dataset.cardId ?? null;
  }

  /** Removes all transient drag and destination styling. */
  function clearIndicators() {
    boardElement.querySelectorAll(".card--dragging").forEach((card) => {
      card.classList.remove("card--dragging");
    });
    clearDropTargets();
  }

  /** Removes destination-only styling while preserving the dragged card. */
  function clearDropTargets() {
    boardElement.querySelectorAll(".column--drop-target").forEach((column) => {
      column.classList.remove("column--drop-target");
    });
    boardElement.querySelectorAll(".card--drop-before").forEach((card) => {
      card.classList.remove("card--drop-before");
    });
  }

  return { initialize };
}
