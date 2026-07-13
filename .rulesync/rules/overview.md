---
root: true
targets: ["*"]
description: "Project overview, workflow, and rulesync source-of-truth guidance"
globs: ["**/*"]
---

# Project Overview

This repo is Jeremy London's personal website, blog, and agent-workflow sandbox. The site is an Astro static app with MDX posts and a small number of React islands for interactive writing and demos.

## Product Shape

- `src/pages/` contains Astro routes.
- `src/components/` contains reusable Astro and React components.
- `src/content/` contains blog content collections.
- `src/styles/` contains global styling.
- `public/` contains static assets.

Keep site changes focused and editorially quiet. Copy should sound like Jeremy in a technical conversation: direct, specific, and not promotional.

## Agent System

`.rulesync/` is the source of truth for every agent-facing artifact. Generated folders such as `.claude/`, `.codex/`, `.agents/`, and `.github/` are outputs, not long-term editing surfaces.

- Rules live in `.rulesync/rules/`.
- Commands live in `.rulesync/commands/`.
- Subagents live in `.rulesync/subagents/`.
- Skills live in `.rulesync/skills/` and should target all supported coding agents unless there is a concrete tool-specific reason not to.
- Hooks live in `.rulesync/hooks.json` and `.rulesync/hooks/`.
- Permissions live in `.rulesync/permissions.json`.
- MCP servers live in `.rulesync/mcp.json`.

When changing generated behavior, edit `.rulesync` first and run `pnpm rulesync`. Do not patch `.claude`, `.codex`, `.agents`, or `.github` as the durable fix.

## Loopkit

Loopkit is the repo's cross-agent workflow layer. `/spec` writes the goal contract before implementation, `/verify` runs adversarial verification before completion claims, and the `verifier` subagent reviews diffs against the goal. The session-start hook loads `using-loopkit` where the host supports it and stays Codex-safe where it does not.

## Commands

- `pnpm dev` starts the local dev server.
- `pnpm build` builds the production site.
- `pnpm check` runs the configured project checks.
- `pnpm astro check` runs Astro type/content checks.
- `pnpm markdown:check` runs rumdl against Markdown and MDX, including `.rulesync`.
- `pnpm rulesync` regenerates tool-specific agent files from `.rulesync`.

## Conventions

- Read files before editing them.
- Match the existing style in the area being changed.
- Keep each change focused on one purpose.
- Do not rewrite unrelated content while fixing a local issue.
- Treat generated tool outputs as disposable. Source changes belong in `.rulesync`.

Keep this overview short. It is loaded into agent context, so stale or generic guidance is expensive.
