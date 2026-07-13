import rss from '@astrojs/rss'
import { authors } from '@data/authors'
import { getFormattedDate } from '@utils/all'
import { cleanMDXContent, latestPosts } from '@utils/content'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import sanitizeHtml from 'sanitize-html'
import { Streamdown } from 'streamdown'

export async function GET(context) {
  const blog = latestPosts
  const site =
    import.meta.env.DEV || !context.site
      ? new URL('/', context.url)
      : context.site
  const absoluteUrl = (path) => new URL(path, site).toString()

  const items = blog.map((post) => ({
    title: post.data.title,
    pubDate: getFormattedDate(post.data.publishDate),
    description: post.data.excerpt,
    author: authors.filter((author) => author.slug === post.data.author)[0]
      .name,
    categories: [post.data.category],
    link: absoluteUrl(`/blog/${post.id}/`),
    customData: `<language>en-us</language>`,
    content: sanitizeHtml(
      renderToStaticMarkup(
        React.createElement(
          Streamdown,
          { controls: false, mode: 'static' },
          cleanMDXContent(post.body),
        ),
      ),
      {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      },
    ),
  }))

  return rss({
    stylesheet: 'rss/style.xsl',
    title: `jeremylondon.com`,
    description: `Engineering leader and builder working across AI platforms, distributed systems, security, and reliability.`,
    site,
    items: items,
  })
}
