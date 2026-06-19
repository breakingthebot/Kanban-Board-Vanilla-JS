// src/main.js
// Validates the application shell and starts the Kanban board controller.
// Connects to: index.html and services/board-controller.js.
// Created: 2026-06-18

import { createBoardController } from "./services/board-controller.js";

const boardElement = document.querySelector("#board");
const statusElement = document.querySelector("#board-status");
const importButton = document.querySelector("#import-board");
const exportButton = document.querySelector("#export-board");
const resetButton = document.querySelector("#reset-board");
const createButton = document.querySelector("#create-card");
const dialogElement = document.querySelector("#card-dialog");
const backupDialogElement = document.querySelector("#board-backup-dialog");

if (
  !boardElement ||
  !statusElement ||
  !importButton ||
  !exportButton ||
  !resetButton ||
  !createButton ||
  !dialogElement ||
  !backupDialogElement
) {
  throw new Error("Cannot start Kanban board: required page elements are missing.");
}

const controller = createBoardController({
  boardElement,
  statusElement,
  importButton,
  exportButton,
  resetButton,
  createButton,
  dialogElement,
  backupDialogElement,
  storage: window.localStorage,
});

controller.initialize();
