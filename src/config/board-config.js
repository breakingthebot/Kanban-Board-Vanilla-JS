// src/config/board-config.js
// Defines immutable board columns, sample cards, and persistence settings.
// Connects to: models/board-state.js, services/board-storage.js, and components.
// Created: 2026-06-18

export const STORAGE_KEY = "kanban-board-state-v1";
export const CARD_TITLE_MAX_LENGTH = 80;
export const CARD_DESCRIPTION_MAX_LENGTH = 240;
export const CARD_LABEL_MAX_LENGTH = 24;
export const CARD_LABEL_MAX_COUNT = 4;
export const CARD_DUE_DATE_MAX_LENGTH = 10;

export const COLUMNS = Object.freeze([
  Object.freeze({
    id: "todo",
    title: "To do",
    accent: "#3157d5",
    accentSoft: "#e9eeff",
  }),
  Object.freeze({
    id: "doing",
    title: "In progress",
    accent: "#b54708",
    accentSoft: "#fff4e5",
  }),
  Object.freeze({
    id: "done",
    title: "Done",
    accent: "#027a48",
    accentSoft: "#e8f9f0",
  }),
]);

export const INITIAL_CARDS = Object.freeze([
  Object.freeze({
    id: "card-research",
    title: "Review project requirements",
    description: "Confirm the scope and identify the first deliverable.",
    labels: Object.freeze(["planning", "scope"]),
    dueDate: "2026-06-30",
    columnId: "todo",
  }),
  Object.freeze({
    id: "card-layout",
    title: "Build the board layout",
    description: "Create responsive columns and accessible card controls.",
    labels: Object.freeze(["ui", "responsive"]),
    dueDate: "2026-07-03",
    columnId: "doing",
  }),
  Object.freeze({
    id: "card-repository",
    title: "Create the repository",
    description: "Set up source control and project documentation.",
    labels: Object.freeze(["setup", "documentation"]),
    dueDate: "2026-06-20",
    columnId: "done",
  }),
]);
