// scripts/check-syntax.js
// Discovers project JavaScript files and validates each with the Node.js parser.
// Connects to: package.json check script, src, scripts, tests, and GitHub Actions.
// Created: 2026-06-18

import { readdirSync } from "node:fs";
import { extname, join } from "node:path";
import { spawnSync } from "node:child_process";

const SOURCE_DIRECTORIES = Object.freeze(["src", "scripts", "tests"]);
const JAVASCRIPT_EXTENSION = ".js";

/**
 * Recursively finds JavaScript files under one directory.
 * @param {string} directory Directory to inspect.
 * @returns {Array<string>} Sorted JavaScript file paths.
 */
function findJavaScriptFiles(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? findJavaScriptFiles(path)
        : extname(entry.name) === JAVASCRIPT_EXTENSION
          ? [path]
          : [];
    })
    .sort();
}

/**
 * Parses one JavaScript file and throws when Node reports invalid syntax.
 * @param {string} filePath File to validate.
 * @returns {void}
 */
function checkSyntax(filePath) {
  const result = spawnSync(process.execPath, ["--check", filePath], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(`Syntax check failed for ${filePath}.\n${result.stderr}`);
  }
}

const files = SOURCE_DIRECTORIES.flatMap(findJavaScriptFiles);
files.forEach(checkSyntax);

console.info("JavaScript syntax check passed.", { filesChecked: files.length });
