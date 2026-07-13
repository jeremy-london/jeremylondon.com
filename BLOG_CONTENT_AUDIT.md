# Blog Content Audit

Date: 2026-07-13

Scope: all 138 files in `src/content/blog`.

## What Was Wrong

The published archive had a repeat-generation failure, first noticed in
`chatgpt-work-made-desktop-agents-feel-inevitable.mdx`.

The pattern was widespread:

- Repeated generic headings such as `The part I would not skip`, `More of what I kept thinking about`, `The part that stayed with me`, and `What the first draft left out`.
- Repeated title phrases 15-50 times inside a single post.
- Repeated long phrases 40+ times, often topic-slot phrases such as `tool use, verifier loops, approvals, and the boundaries around agents`.
- Filler such as `longer pass`, `expanded version`, `first draft`, `second or third angle`, and `what usually gets skipped`.
- Duplicate or near-duplicate sentences that rotated the same claim without adding new facts.

## Remediation

- Rewrote 137 MDX posts, preserving frontmatter.
- Preserved the interactive React/Pyodide islands in the deep-learning basics posts.
- Left `template.md` as a template file.
- Added `scripts/audit-blog-content.mjs`.
- Added `pnpm blog:audit`.

The rewrites are intentionally concise cleanup drafts. They remove the broken expansion-loop bodies and restore a direct argument, but they should still be treated as editorial drafts worth revisiting over time.

## Prevention Gate

`pnpm blog:audit` now fails on:

- Known generic expansion headings.
- Known filler phrases.
- A title repeated more than 6 times in one post body.
- Any 8-word phrase repeated more than 6 times in one post.
- Any 5-word phrase repeated more than 12 times in one post.
- Long outline-style posts with too many sections.
- Any normalized sentence repeated across more than 8 files.

## Final Status

`pnpm blog:audit` passes across all 138 files.
