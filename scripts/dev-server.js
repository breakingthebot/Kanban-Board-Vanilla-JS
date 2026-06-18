// scripts/dev-server.js
// Serves project files locally without third-party runtime dependencies.
// Connects to: package.json start script and browser-based manual testing.
// Created: 2026-06-18

import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const HOST = "127.0.0.1";
const DEFAULT_PORT = 4173;
const PORT = Number.parseInt(process.env.PORT ?? String(DEFAULT_PORT), 10);
const PROJECT_ROOT = process.cwd();
const CONTENT_TYPES = Object.freeze({
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
});

/**
 * Resolves a URL pathname to a project file while blocking path traversal.
 * @param {string} pathname Request URL pathname.
 * @returns {string|null} Safe absolute path or null when outside the project.
 */
function resolveFilePath(pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const relativePath = normalize(decodeURIComponent(requestedPath)).replace(
    /^(\.\.(\/|\\|$))+/, "",
  );
  const filePath = join(PROJECT_ROOT, relativePath);
  return filePath.startsWith(PROJECT_ROOT) ? filePath : null;
}

/**
 * Handles one static-file request with explicit error responses.
 * @param {import("node:http").IncomingMessage} request Incoming request.
 * @param {import("node:http").ServerResponse} response Outgoing response.
 * @returns {void}
 */
function handleRequest(request, response) {
  try {
    const url = new URL(request.url, `http://${HOST}:${PORT}`);
    const filePath = resolveFilePath(url.pathname);

    if (!filePath || !statSync(filePath).isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const contentType = CONTENT_TYPES[extname(filePath)] ?? "application/octet-stream";
    response.writeHead(200, {
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
    });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    console.error("Unable to serve request.", {
      url: request.url,
      error: error.message,
    });
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Internal server error");
  }
}

const server = createServer(handleRequest);

server.on("error", (error) => {
  console.error("Development server failed.", {
    host: HOST,
    port: PORT,
    error: error.message,
  });
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  console.info("Development server ready.", {
    url: `http://${HOST}:${PORT}`,
  });
});
