import { categories } from '@data/category'
import { latestPosts } from '@utils/content'
import { buildWebmcpBlogIndex } from './webmcp-core'

export { buildWebmcpBlogIndex }

export const webmcpBlogIndex = buildWebmcpBlogIndex(latestPosts, categories)

export const webmcpPageTargets = {
  home: '/',
  blog: '/blog',
  about: '/about',
  contact: '/contact',
  rss: '/rss/',
}
