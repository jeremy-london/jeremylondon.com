#!/usr/bin/env node

console.error(`scripts/humanize-blog-posts.mjs has been retired.

It performed broad archive-wide text transformations after generated writing
passes. The recovery workflow requires article-specific editing against git
history and topic-specific information maps.

Use manual editorial batches and pnpm blog:audit instead.`)

process.exit(1)
