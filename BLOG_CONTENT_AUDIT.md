# Blog content audit

Date: 2026-07-13

Scope: all 137 non-template posts in `src/content/blog`.

## What changed

The previous pass removed within-post repetition but introduced a worse archive-level failure. The rewrite implementation generated prose from depth-based JavaScript templates, so unrelated posts now share openings, section sequences, examples, diagrams, lists, and conclusions with topic nouns substituted.

That source of failure has now been retired. The old prose-generation scripts fail fast, `pnpm blog:audit` checks for archive-level templating, and the posts have been rewritten from recovered topic intent instead of from the contaminated bodies.

Each post has a manifest entry in `BLOG_DEPTH_MANIFEST.json` with:

* depth classification
* title
* category
* subject
* information map

Depth distribution:

* quick notes: 35
* engineering notes: 60
* technical deep dives: 35
* systems essays: 7

The manifest is intentionally used as an audit aid, not as an outline template. Depth controls expected rigor; it does not define article structure.

## Editorial checks

`pnpm blog:audit` now checks:

* manifest coverage for every non-template post
* depth distribution
* minimum and maximum word ranges by depth
* minimum information-map size by depth
* required technical markers by depth
* systems-essay technical substance without requiring a fixed heading sequence
* technical examples in deep dives
* repeated headings, filler phrases, title loops, repeated n-grams, and broad corpus-level repeated sentences
* repeated section sequences across posts
* repeated code blocks and diagrams across unrelated posts
* repeated list blocks across unrelated posts
* repeated paragraph, opening, and conclusion skeletons after topic normalization
* repeated structural fingerprints
* generic information maps
* self-referential editorial prose in quick notes

## Cross-post template fixture

The depth-aware rewrite introduced an archive-level failure: posts within the same intended depth shared the same structure, code blocks, lists, and paragraph progression with topic nouns substituted.

`pnpm blog:audit` was updated against that known-bad fixture and failed before the recovery rewrite began. That proof matters because an audit that passed the contaminated archive would not have been measuring the real defect.

The known-bad failure included:

* repeated deep-dive section sequence across 53 files
* repeated engineering-note section sequence across 29 files
* repeated systems-essay section sequence across 13 files
* repeated request-envelope, `StepResult`, `WorkRecord`, state-machine, and operating-loop code blocks
* repeated architecture and failure-mode lists
* repeated paragraph skeletons after topic normalization
* repeated quick-note conclusions explaining why the post is short
* generic information maps in 101 files

Those patterns are now covered by the audit and by a manual 22-post regression sample.

## Template generators retired

These scripts now fail fast instead of writing blog prose:

* `scripts/rewrite-blog-posts.mjs`
* `scripts/expand-blog-posts.mjs`
* `scripts/expand-short-blog-posts.mjs`
* `scripts/humanize-blog-posts.mjs`

They were retired because shared prose generators are the root cause of the archive-level templating failure.

## Current status

The archive recovery pass is complete enough for automated and manual regression review: the contaminated body templates were removed, all 137 posts were rewritten, and the 22 posts called out by the regression prompt were manually read together and replaced where the automated pass still sounded formulaic.

Historical versions were useful as source material, but several posts were already contaminated at introduction. In those cases the durable source was the title, excerpt, tags, interactive MDX islands, surrounding repository context, and the technical topic itself rather than a clean old body to restore.
