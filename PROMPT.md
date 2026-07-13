# Full blog editorial rewrite goal

Re-audit and rewrite the blog archive so each post has the depth its topic deserves, without semantic loops, generic AI filler, or uniformly short cleanup drafts.

## Done when

* Every non-template post in `src/content/blog` has an editorial depth recorded in a machine-readable manifest:
  * `quick-note`
  * `engineering-note`
  * `technical-deep-dive`
  * `systems-essay`
* Every manifest entry includes an information map of distinct concepts the post should teach.
* The archive has a natural depth distribution, roughly:
  * 20-30% quick notes
  * 30-40% engineering notes
  * 25-35% technical deep dives
  * 5-15% systems essays
* Quick notes remain concise and useful.
* Engineering notes explain problem, reasoning, implementation implications, and tradeoffs.
* Technical deep dives include concrete technical substance such as architecture, data flow, failure modes, implementation details, metrics, latency, cost, security, scaling, or examples.
* Systems essays build a progressive mental model of the problem, constraints, architecture, flow, failure modes, measurement, scale behavior, tradeoffs, and unresolved questions.
* Rewrites preserve frontmatter and existing interactive MDX islands.
* `pnpm blog:audit` fails on both repetition and under-depth.
* `pnpm blog:audit` exits 0.
* `pnpm markdown:check` exits 0.
* `pnpm check` exits 0.
* `pnpm astro check` exits 0 or any warnings/hints are unrelated and explicitly reported.
* `pnpm build` exits 0.

## Voice

Write like Jeremy London: direct, technical, curious, practical, skeptical of ceremony, comfortable going into implementation details, and focused on systems that actually ship.

Avoid corporate AI phrasing, generic industry introductions, fake excitement, repeated conclusions, and prose that hides behind abstractions.

Do not fabricate projects, employers, incidents, customers, personal metrics, or private production experience. If a specific experience is not documented in the repo, frame the section as technical reasoning.

## Never touch

* Do not rewrite generated agent folders such as `.agents`, `.claude`, `.codex`, or `.github`.
* Do not revert unrelated working-tree changes.
* Do not alter post frontmatter except when required by validation.
* Do not remove interactive MDX components from tutorial posts.

## Stop if

* The rewrite touches files outside `src/content/blog`, `scripts`, `package.json`, or audit documentation without a clear reason.
* Astro content validation starts failing because the rewrite changed frontmatter shape.
* The audit starts rewarding uniform post length instead of depth-appropriate information.

## Rewrite method

Work from topic complexity, not current word count or reading time.

For each post:

1. Read the full original and identify its central technical claim.
2. Assign an editorial depth based on the complexity of the subject.
3. Build the information map before rewriting.
4. Identify missing concepts, weak abstractions, semantic repetition, and unsupported claims.
5. Rewrite from the information map while preserving the original intellectual intent.
6. Run a critic pass against the rewritten post.
7. Revise the post if the critic finds repetition, shallow treatment, generic prose, or artificial expansion.
8. Run repository validation only after the editorial pass is complete.

Do not use word count as the primary signal for depth.

A long post can still be under-depth.

A short post can be complete.

## Information map standard

Information-map entries must represent distinct ideas the reader should understand after reading the post.

Bad information map:

* agent security
* secure agents
* agent boundaries
* safe tool use

Good information map:

* capability-scoped tool grants
* filesystem and network isolation
* credential delegation
* temporal permission boundaries
* confused deputy risks
* cross-agent delegation
* approval state transitions
* revocation behavior
* audit receipts

The post must substantively teach its mapped concepts. Mentioning a concept or adding a heading is not sufficient.

## Critic pass

For `technical-deep-dive` and `systems-essay` posts, perform a separate critic pass.

The critic should ask:

* What would a senior engineer still ask "how?" about?
* Which sections describe rather than explain?
* Which claims are repeated with different wording?
* Which sections exist only to increase length?
* Are implementation details concrete enough to reason about?
* Are failure modes materially different from one another?
* Are tradeoffs explained or merely listed?
* Does code, pseudocode, or architecture content actually clarify the system?
* Does the conclusion add information, or repeat the introduction?

Rewrite again when the critic identifies material problems.

## Audit anti-gaming rules

`pnpm blog:audit` must not reward:

* raw word count
* number of headings
* number of code fences
* keyword density
* repeated technical terminology
* artificially fragmented sections
* duplicated concepts phrased differently

Under-depth checks should compare the post against its declared editorial depth and information map.

For deep posts, validate that mapped concepts receive substantive treatment across the article.

Repetition checks should detect both exact duplication and likely semantic loops.

The audit is a guardrail, not the author.

Do not rewrite prose solely to satisfy a numeric score when doing so makes the article worse.

## Archive-level review

After individual rewrites are complete, review the archive as a body of work.

Check for:

* repeated arguments across multiple posts
* multiple posts teaching effectively the same concept
* identical opening patterns
* repeated metaphors
* repeated conclusions
* overuse of the same sentence rhythm
* excessive use of "the hard part is"
* excessive use of "the interesting part is"
* excessive use of rhetorical contrast such as "X is not Y. It is Z."
* technical deep dives that should reference related posts rather than re-explain them
* important technical themes that are consistently treated too shallowly

Do not force every post to sound structurally identical.

The archive should feel like one engineer's evolving technical notebook, not 137 outputs from one prompt template.
