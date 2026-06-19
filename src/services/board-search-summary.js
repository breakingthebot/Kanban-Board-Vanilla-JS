// src/services/board-search-summary.js
// Summarizes filtered board results for the live search UI.
// Connects to: services/board-controller.js and tests/services/board-search-summary.test.js.
// Created: 2026-06-18

import { COLUMNS } from "../config/board-config.js";
import { filterCardsByQuery, normalizeSearchQuery } from "./board-search.js";

/**
 * Builds a search summary with per-column counts and overall match totals.
 * @param {Array<{columnId: string}>} cards Board cards to summarize.
 * @param {string} query Raw search input.
 * @returns {{
 *   isFiltering: boolean,
 *   normalizedQuery: string,
 *   totalMatches: number,
 *   totalCards: number,
 *   columnMatches: Array<{id: string, title: string, count: number}>
 * }} Search summary.
 */
export function summarizeBoardSearch(cards, query) {
  const normalizedQuery = normalizeSearchQuery(query);
  const matchingCards = filterCardsByQuery(cards, normalizedQuery);
  const columnMatches = COLUMNS.map((column) => ({
    id: column.id,
    title: column.title,
    count: matchingCards.filter((card) => card.columnId === column.id).length,
  }));

  return {
    isFiltering: normalizedQuery.length > 0,
    normalizedQuery,
    totalMatches: matchingCards.length,
    totalCards: cards.length,
    columnMatches,
  };
}
