// src/config/board-config.js
// Defines immutable board columns, sample cards, and persistence settings.
// Connects to: models/board-state.js, services/board-storage.js, and components.
// Created: 2026-06-18

export const STORAGE_KEY = "kanban-board-state-v1";

export const COLUMNS = Object.freeze([
  Object.freeze({ id: "todo", title: "To do" }),
  Object.freeze({ id: "doing", title: "In progress" }),
  Object.freeze({ id: "done", title: "Done" }),
]);

export const INITIAL_CARDS = Object.freeze([
  Object.freeze({
    id: "card-research",
    title: "Review project requirements",
    description: "Confirm the scope and identify the first deliverable.",
    columnId: "todo",
  }),
  Object.freeze({
    id: "card-layout",
    title: "Build the board layout",
    description: "Create responsive columns and accessible card controls.",
    columnId: "doing",
  }),
  Object.freeze({
    id: "card-repository",
    title: "Create the repository",
    description: "Set up source control and project documentation.",
    columnId: "done",
  }),
]);
