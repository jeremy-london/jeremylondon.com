import sanitizeHtml from 'sanitize-html'

export const resolveSite = (context, isDev = import.meta.env.DEV) =>
  isDev || !context.site ? new URL('/', context.url) : context.site

export const resolveAuthorName = (authorSlug, authors = []) => {
  const author = authors.find((item) => item.slug === authorSlug)

  if (!author) {
    throw new Error(`Missing author for slug: ${authorSlug}`)
  }

  return author.name
}

export const sanitizeRssContent = (content) =>
  sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  })

export const buildRssItems = ({
  blog = [],
  authors = [],
  site,
  formatDate,
  renderContent,
}) =>
  blog.map((post) => ({
    title: post.data.title,
    pubDate: formatDate(post.data.publishDate),
    description: post.data.excerpt,
    author: resolveAuthorName(post.data.author, authors),
    categories: [post.data.category],
    link: new URL(`/blog/${post.id}/`, site).toString(),
    customData: `<language>en-us</language>`,
    content: sanitizeRssContent(renderContent(post.body)),
  }))
