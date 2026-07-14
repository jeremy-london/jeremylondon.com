import { getCollection } from 'astro:content'
import { cleanMDXContent, sortLatestPosts } from './content-core.js'

export { cleanMDXContent, sortLatestPosts }

// Only return posts without `draft: true` in the frontmatter.
export const latestPosts = sortLatestPosts(
  await getCollection('blog', ({ data }) => {
    return data.draft !== true
  }),
)
