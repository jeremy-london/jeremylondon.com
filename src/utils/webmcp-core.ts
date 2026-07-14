import type { Category } from '@data/category'
import { cleanMDXContent } from './content-core.js'
import { getReadingTimeDetails } from './reading-time.js'
import { slugifyTag } from './tags'

type BlogPost = {
  id: string
  data: {
    title: string
    excerpt: string
    category: string
    tags?: string[]
    publishDate: Date
  }
  body: string
}

export const buildWebmcpBlogIndex = (
  posts: BlogPost[] = [],
  categories: Category[] = [],
) =>
  posts.map((post) => ({
    id: post.id,
    title: post.data.title,
    excerpt: post.data.excerpt,
    category: post.data.category,
    categoryLabel:
      categories.find((category) => category.slug === post.data.category)
        ?.title ?? post.data.category,
    tags: (post.data.tags ?? []).map((tag: string) => ({
      label: tag,
      slug: slugifyTag(tag),
    })),
    date: post.data.publishDate.toISOString(),
    year: String(post.data.publishDate.getFullYear()),
    month: post.data.publishDate.toISOString().slice(0, 7),
    readingTimeMinutes: getReadingTimeDetails(cleanMDXContent(post.body))
      .readingTimeMinutes,
  }))
