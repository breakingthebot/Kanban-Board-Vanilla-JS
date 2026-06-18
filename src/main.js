// src/main.js
// Validates the application shell and starts the Kanban board controller.
// Connects to: index.html and services/board-controller.js.
// Created: 2026-06-18

import { createBoardController } from "./services/board-controller.js";

const boardElement = document.querySelector("#board");
const statusElement = document.querySelector("#board-status");
const resetButton = document.querySelector("#reset-board");
const createButton = document.querySelector("#create-card");
const dialogElement = document.querySelector("#card-dialog");

if (!boardElement || !statusElement || !resetButton || !createButton || !dialogElement) {
  throw new Error("Cannot start Kanban board: required page elements are missing.");
}

const controller = createBoardController({
  boardElement,
  statusElement,
  resetButton,
  createButton,
  dialogElement,
  storage: window.localStorage,
});

controller.initialize();
