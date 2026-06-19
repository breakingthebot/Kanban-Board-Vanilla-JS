// tests/e2e/board.spec.js
// Verifies complete browser workflows, persistence, ordering, responsive behavior, and accessibility.
// Connects to: index.html, src application modules, Playwright, and Axe.
// Created: 2026-06-18

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("renders a usable board without serious accessibility violations", async ({
  page,
}) => {
  await expect(page.getByRole("heading", { name: "Kanban Board" })).toBeVisible();
  await expect(page.locator(".column")).toHaveCount(3);
  await expect(page.locator(".card")).toHaveCount(3);

  const accessibilityScan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const blockingViolations = accessibilityScan.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );

  expect(blockingViolations).toEqual([]);
});

test("creates, edits, moves, persists, and deletes a card", async ({ page }) => {
  await createCard(page, "Release checklist", "Confirm launch tasks", "todo");
  await page.reload();

  const createdCard = page.locator(".card", { hasText: "Release checklist" });
  await expect(createdCard).toBeVisible();
  await createdCard.getByRole("button", { name: "Edit" }).click();

  const editor = page.getByRole("dialog", { name: "Edit card" });
  await editor.getByLabel("Title").fill("Production checklist");
  await editor.getByLabel("Description").fill("Confirm the production launch tasks");
  await editor.getByLabel("Column").selectOption("done");
  await editor.getByRole("button", { name: "Save card" }).click({ force: true });
  await page.reload();

  const updatedCard = page.locator(".card", { hasText: "Production checklist" });
  await expect(updatedCard).toBeVisible();
  await expect(
    page.locator('[data-column-id="done"] .card', {
      hasText: "Production checklist",
    }),
  ).toBeVisible();

  await updatedCard.scrollIntoViewIfNeeded();
  await updatedCard.getByRole("button", { name: "Edit" }).click({ force: true });
  page.once("dialog", (confirmation) => confirmation.accept());
  await page.getByRole("dialog", { name: "Edit card" })
    .getByRole("button", { name: "Delete" })
    .click({ force: true });
  await page.reload();

  await expect(page.locator(".card", { hasText: "Production checklist" })).toHaveCount(0);
});

test("imports a JSON backup through the public dialog workflow", async ({ page }) => {
  const backup = {
    cards: [
      {
        id: "imported-card",
        title: "Imported task",
        description: "Restored from backup",
        columnId: "done",
      },
    ],
  };

  await page.getByRole("button", { name: "Import board" }).click();
  const dialog = page.getByRole("dialog", { name: "Import board backup" });
  await dialog.getByLabel("Backup JSON").fill(JSON.stringify(backup, null, 2));
  await dialog.getByRole("button", { name: "Import board" }).click({ force: true });
  await page.reload();

  await expect(page.locator(".card", { hasText: "Imported task" })).toBeVisible();
  await expect(page.locator('[data-column-id="done"] .card', { hasText: "Imported task" })).toBeVisible();
});

test("loads a JSON backup file into the import dialog", async ({ page }) => {
  const backup = {
    cards: [
      {
        id: "file-imported-card",
        title: "File imported task",
        description: "Restored from a JSON file",
        columnId: "todo",
      },
    ],
  };

  await page.getByRole("button", { name: "Import board" }).click();
  const dialog = page.getByRole("dialog", { name: "Import board backup" });
  await dialog.getByRole("button", { name: "Load file" }).click({ force: true });
  await dialog.locator("#board-backup-file").setInputFiles({
    name: "board-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup, null, 2)),
  });
  await dialog.getByRole("button", { name: "Import board" }).click({ force: true });
  await page.reload();

  await expect(page.locator(".card", { hasText: "File imported task" })).toBeVisible();
  await expect(page.locator('[data-column-id="todo"] .card', { hasText: "File imported task" })).toBeVisible();
});

test("undoes and redoes a card creation in the current session", async ({ page }) => {
  await createCard(page, "Temporary task", "", "todo");

  await expect(page.locator(".card", { hasText: "Temporary task" })).toBeVisible();
  await page.keyboard.press("Control+z");
  await expect(page.locator(".card", { hasText: "Temporary task" })).toHaveCount(0);

  await page.keyboard.press("Control+Shift+z");
  await expect(page.locator(".card", { hasText: "Temporary task" })).toBeVisible();
});

test("uses keyboard shortcuts to undo and redo without affecting text inputs", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Create card" }).click();
  const editor = page.getByRole("dialog", { name: "Create card" });
  await editor.getByLabel("Title").fill("Shortcut task");
  await editor.getByLabel("Description").fill("Undo should not fire here");
  await editor.getByLabel("Title").press("Control+z");
  await expect(editor.getByLabel("Title")).toHaveValue("Shortcut task");
  await editor.getByLabel("Column").selectOption("todo");
  await editor.getByRole("button", { name: "Save card" }).click({ force: true });

  await expect(page.locator(".card", { hasText: "Shortcut task" })).toBeVisible();
  await page.keyboard.press("Control+z");
  await expect(page.locator(".card", { hasText: "Shortcut task" })).toHaveCount(0);
  await page.keyboard.press("Control+y");
  await expect(page.locator(".card", { hasText: "Shortcut task" })).toBeVisible();
});

test("filters cards with the search field and clears the filter", async ({ page }) => {
  const search = page.getByLabel("Search cards");

  await search.fill("responsive");
  await expect(page.locator(".card")).toHaveCount(1);
  await expect(page.locator(".card", { hasText: "Build the board layout" })).toBeVisible();

  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(search).toHaveValue("");
  await expect(page.locator(".card")).toHaveCount(3);
});

test("preserves keyboard and mouse ordering after reload", async ({ page }) => {
  await createCard(page, "Second task", "", "todo");
  await createCard(page, "Third task", "", "todo");

  const thirdCard = page.locator(".card", { hasText: "Third task" });
  await thirdCard.getByRole("button", { name: "Move up" }).click();
  await expect(todoTitles(page)).toHaveText([
    "Review project requirements",
    "Third task",
    "Second task",
  ]);

  const firstCard = page.locator(".card", { hasText: "Review project requirements" });
  await page.locator(".card", { hasText: "Second task" }).dragTo(firstCard, {
    targetPosition: { x: 20, y: 2 },
  });
  await page.reload();

  await expect(todoTitles(page)).toHaveText([
    "Second task",
    "Review project requirements",
    "Third task",
  ]);
});

/**
 * Creates one card through the public dialog workflow.
 * @param {import("@playwright/test").Page} page Active browser page.
 * @param {string} title Card title.
 * @param {string} description Card description.
 * @param {string} columnId Destination column identifier.
 * @returns {Promise<void>}
 */
async function createCard(page, title, description, columnId) {
  await page.getByRole("button", { name: "Create card" }).click();
  const editor = page.getByRole("dialog", { name: "Create card" });
  await editor.getByLabel("Title").fill(title);
  await editor.getByLabel("Description").fill(description);
  await editor.getByLabel("Column").selectOption(columnId);
  await editor.getByRole("button", { name: "Save card" }).click({ force: true });
}

/**
 * Selects task titles in visual order from the To do column.
 * @param {import("@playwright/test").Page} page Active browser page.
 * @returns {import("@playwright/test").Locator} Ordered title locator.
 */
function todoTitles(page) {
  return page.locator('[data-column-id="todo"] .card h3');
}
