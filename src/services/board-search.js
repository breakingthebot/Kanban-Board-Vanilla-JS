// src/services/board-search.js
// Filters board cards by a normalized search query without mutating state.
// Connects to: services/board-controller.js and tests/services/board-search.test.js.
// Created: 2026-06-18

/**
 * Normalizes a search query for consistent filtering.
 * @param {string} query Raw search input.
 * @returns {string} Lowercased, trimmed query.
 */
export function normalizeSearchQuery(query) {
  return typeof query === "string" ? query.trim().toLowerCase() : "";
}

/**
 * Returns the cards that match a search query in the title or description.
 * @param {Array<{title: string, description: string}>} cards Cards to filter.
 * @param {string} query Raw search input.
 * @returns {Array<object>} Cards matching the search query.
 */
export function filterCardsByQuery(cards, query) {
  const normalizedQuery = normalizeSearchQuery(query);
  if (normalizedQuery.length === 0) {
    return cards;
  }

  return cards.filter((card) => {
    const title = card.title.toLowerCase();
    const description = card.description.toLowerCase();
    const labels = Array.isArray(card.labels) ? card.labels.join(" ").toLowerCase() : "";
    return (
      title.includes(normalizedQuery) ||
      description.includes(normalizedQuery) ||
      labels.includes(normalizedQuery)
    );
  });
}
