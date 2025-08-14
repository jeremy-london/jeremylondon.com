import rss from '@astrojs/rss'
import { getFormattedDate } from '@utils/all'
import { cleanMDXContent, latestPosts } from '@utils/content'
import MarkdownIt from 'markdown-it'
import sanitizeHtml from 'sanitize-html'

const parser = new MarkdownIt()

import { authors } from '@data/authors'

export async function GET(context) {
  const blog = await latestPosts

  const items = blog.map((post) => ({
    title: post.data.title,
    pubDate: getFormattedDate(post.data.publishDate),
    description: post.data.excerpt,
    author: authors.filter((author) => author.slug === post.data.author)[0]
      .name,
    categories: [post.data.category],
    link: `/blog/${post.slug}/`,
    customData: `<language>en-us</language>`,
    content: sanitizeHtml(parser.render(cleanMDXContent(post.body)), {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    }),
  }))

  return rss({
    stylesheet: 'rss/style.xsl',
    title: `jeremylondon.com`,
    description: `Exploring AI, tech trends, and engineering in a uniquely engaging blog for the curious mind.`,
    site: context.site,
    items: items,
  })
}
