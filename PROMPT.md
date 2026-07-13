# Blog Rewrite Goal

Rewrite the blog posts that show generated repetition or templated filler so the published archive no longer reads like expanded AI draft output.

## Done When

- Essay-style posts with repeated expansion-loop bodies are rewritten into concise, direct posts that preserve frontmatter and the core claim from each title/excerpt.
- Deep tutorial/demo posts that already contain substantive educational content are not rewritten unnecessarily.
- A repeat-pattern audit script exists and fails on the old failure mode: repeated generic headings, excessive title repetition, repeated long phrases, and filler phrases such as `longer pass`, `expanded version`, and `first draft`.
- `pnpm blog:audit` exits 0.
- `pnpm markdown:check` exits 0.
- `pnpm astro check` exits 0 or any failure is unrelated and explicitly reported.

## Never Touch

- Do not rewrite generated agent folders such as `.agents`, `.claude`, `.codex`, or `.github`.
- Do not revert unrelated working-tree changes.
- Do not alter post frontmatter except when required by validation.

## Stop If

- The rewrite touches files outside `src/content/blog`, `scripts`, `package.json`, or audit documentation without a clear reason.
- Astro content validation starts failing because the rewrite changed frontmatter shape.
