// src/main.js
// Validates the application shell and starts the Kanban board controller.
// Connects to: index.html and services/board-controller.js.
// Created: 2026-06-18

import { createBoardController } from "./services/board-controller.js";

const boardElement = document.querySelector("#board");
const statusElement = document.querySelector("#board-status");
const resetButton = document.querySelector("#reset-board");

if (!boardElement || !statusElement || !resetButton) {
  throw new Error("Cannot start Kanban board: required page elements are missing.");
}

const controller = createBoardController({
  boardElement,
  statusElement,
  resetButton,
  storage: window.localStorage,
});

controller.initialize();
