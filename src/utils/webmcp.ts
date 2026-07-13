import { categories } from '@data/category'
import { cleanMDXContent, latestPosts } from '@utils/content'
import { getReadingTimeDetails } from '@utils/reading-time'
import { slugifyTag } from '@utils/tags'

export const webmcpBlogIndex = latestPosts.map((post) => ({
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

export const webmcpPageTargets = {
  home: '/',
  blog: '/blog',
  about: '/about',
  contact: '/contact',
  rss: '/rss/',
}
