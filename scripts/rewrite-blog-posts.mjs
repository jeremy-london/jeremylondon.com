#!/usr/bin/env node

console.error(`scripts/rewrite-blog-posts.mjs has been retired.

It generated article prose from shared depth templates, which created cross-post
topic substitution across the blog archive.

Recovery rule:
- recover each post's intent from git history, frontmatter, and MDX islands
- build a topic-specific information map
- write the article independently
- run pnpm blog:audit after each batch

Do not replace this guard with another prose generator.`)

process.exit(1)
