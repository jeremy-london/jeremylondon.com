# Blog content audit

Date: 2026-07-13

Scope: all 137 non-template posts in `src/content/blog`.

## What changed

The previous pass removed repetition but compressed too aggressively. This pass rewrote the archive around editorial depth instead of uniform brevity.

Each post now has a manifest entry in `BLOG_DEPTH_MANIFEST.json` with:

* depth classification
* title
* category
* subject
* information map

Depth distribution:

* quick notes: 35
* engineering notes: 36
* technical deep dives: 53
* systems essays: 13

## Editorial checks

`pnpm blog:audit` now checks:

* manifest coverage for every non-template post
* depth distribution
* minimum and maximum word ranges by depth
* minimum information-map size by depth
* required technical markers by depth
* systems-essay headings for architecture, constraints, measurement, scaling, tradeoffs, and unresolved questions
* technical examples in deep dives
* repeated headings, filler phrases, title loops, repeated n-grams, and broad corpus-level repeated sentences

## Caveat

This is a deterministic editorial rewrite pass, not hand-authored final prose for every essay. It restores depth and technical structure across the archive and prevents the earlier compression failure, but the flagship systems essays are still good candidates for later manual polish.

## Final status

`pnpm blog:audit` passes across all 137 non-template posts.
