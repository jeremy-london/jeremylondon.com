import rss from '@astrojs/rss'
import { authors } from '@data/authors'
import { getFormattedDate } from '@utils/all'
import { cleanMDXContent, latestPosts } from '@utils/content'
import { buildRssItems, resolveSite, sanitizeRssContent } from '@utils/rss-core'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Streamdown } from 'streamdown'

export { buildRssItems, resolveSite, sanitizeRssContent }

export async function GET(context) {
  const blog = latestPosts
  const site = resolveSite(context)
  const items = buildRssItems({
    blog,
    authors,
    site,
    formatDate: getFormattedDate,
    renderContent: (body) =>
      renderToStaticMarkup(
        React.createElement(
          Streamdown,
          { controls: false, mode: 'static' },
          cleanMDXContent(body),
        ),
      ),
  })

  return rss({
    title: `jeremylondon.com`,
    description: `Engineering leader and builder working across AI platforms, distributed systems, security, and reliability.`,
    site,
    items,
  })
}
