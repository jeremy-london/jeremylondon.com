# Blog archive recovery goal

Recover the blog from generated cross-post prose templates by first removing unsafe automated authoring paths, then rewriting posts independently from historical source material in small batches.

## Done when

* The old depth-based prose generators cannot be run accidentally.
* `scripts/rewrite-blog-posts.mjs`, `scripts/expand-blog-posts.mjs`, `scripts/expand-short-blog-posts.mjs`, and `scripts/humanize-blog-posts.mjs` no longer generate article bodies from shared sentence banks, category profiles, or depth templates.
* `pnpm blog:audit` fails on the current archive before rewrites begin and reports cross-post template problems.
* The audit detects repeated section sequences, code blocks, paragraph skeletons, list blocks, opening skeletons, conclusion skeletons, and structural fingerprints.
* The audit detects information maps that are primarily generic editorial dimensions instead of topic-specific concepts.
* The audit detects repeated self-referential editorial prose such as explaining why a post is short.
* The recovery workflow uses git history to recover each post's pre-mass-rewrite intellectual intent before new prose is written.
* Rewritten posts preserve frontmatter and interactive MDX islands unless validation requires a narrow fix.
* Final validation after rewriting: `pnpm blog:audit`, `pnpm markdown:check`, `pnpm check`, `pnpm astro check`, and `pnpm build`.

## Never touch

* Do not use depth classification as an article outline.
* Do not mass-generate article bodies from JavaScript string templates.
* Do not preserve the current generated body as the source of truth.
* Do not edit `.agents`, `.claude`, `.codex`, or `.github`.
* Do not revert unrelated working-tree changes.

## Stop if

* The audit passes against the current known-bad archive.
* A rewrite cannot recover the original idea from git history, frontmatter, MDX islands, or surrounding repository context.
* A batch starts producing recognizable repeated openings, headings, examples, or conclusions.
