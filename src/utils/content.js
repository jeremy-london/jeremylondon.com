import { getCollection } from 'astro:content'

// Only return posts without `draft: true` in the frontmatter

export const latestPosts = (
  await getCollection('blog', ({ data }) => {
    return data.draft !== true
  })
).sort(
  (a, b) =>
    new Date(b.data.publishDate).valueOf() -
    new Date(a.data.publishDate).valueOf(),
)

export const cleanMDXContent = (content) => {
  // Remove import statements and capture component names
  const componentNames = []
  let cleanedContent = content.replace(
    /^import\s+(\w+)\s+from\s+["'][^"']+["'];$/gm,
    (_match, componentName) => {
      componentNames.push(componentName)
      return ''
    },
  )

  // Remove JSX components based on captured names
  componentNames.forEach((name) => {
    const regex = new RegExp(
      `<${name}(\\s+[^>]*)?\\/>|<${name}(\\s+[^>]*)?>.*?</${name}>`,
      'gs',
    )
    cleanedContent = cleanedContent.replace(regex, '')
  })

  // Remove specific <h2> block
  const h2Regex =
    /<h2>\s*<a href="#interactive-code-environment"[^>]*>.*?<\/a>\s*<\/h2>/gs
  cleanedContent = cleanedContent.replace(h2Regex, '')

  return cleanedContent
}
