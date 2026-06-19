<!--
CONTRIBUTING.md
Documents the branch, validation, review, and release workflow for contributors.
Connects to: README.md, GitHub Actions, pull requests, and CHANGELOG.md.
Created: 2026-06-18
-->

# Contributing

## Development Setup

1. Install Node.js 20 or newer.
2. Fork or clone the repository.
3. Run `npm install` from the repository root.
4. Run `npm run test:e2e:install` once to install Chromium.
5. Create a focused branch from `main`.

Use descriptive branch names such as `feature/card-labels` or `fix/storage-recovery`.

## Development Checks

Before committing, run:

```powershell
npm run check
npm run test:e2e
```

The first command validates every JavaScript file and runs unit tests. The second runs desktop and mobile browser workflows plus automated accessibility checks.

## Commit Standards

- Keep commits focused and leave the application working.
- Use present-tense messages such as `Add card label filtering`.
- Do not commit `.env`, generated reports, browser artifacts, or `AGENTS.md`.
- Update tests, `README.md`, and `CHANGELOG.md` with behavior changes.

## Pull Requests

1. Push the branch to GitHub.
2. Open a draft pull request into `main`.
3. Complete the pull request template.
4. Resolve test, accessibility, and review failures before marking it ready.
5. Use squash merge unless preserving separate commits is materially useful.

## Release Process

1. Confirm the `main` workflow passes.
2. Confirm `CHANGELOG.md` and the package version agree.
3. Run `npm ci`, `npm run check`, and `npm run test:e2e` from a clean clone.
4. Deploy a Vercel preview and manually verify the documented workflows.
5. Deploy production with `vercel.cmd --prod` on Windows or `vercel --prod` elsewhere.
6. Add the production URL to `README.md` when it changes.
7. Create an annotated Git tag matching the package version, such as `v1.11.0`.
8. Push the tag and create GitHub release notes from the matching changelog entry.

Never tag a release while required checks are pending or failing.
