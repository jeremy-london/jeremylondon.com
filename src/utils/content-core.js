export const sortLatestPosts = (posts = []) =>
  [...posts]
    .filter((post) => post?.data?.draft !== true)
    .sort(
      (a, b) =>
        new Date(b.data.publishDate).valueOf() -
        new Date(a.data.publishDate).valueOf(),
    )

export const cleanMDXContent = (content = '') => {
  const componentNames = []
  let cleanedContent = content.replace(
    /^import\s+(\w+)\s+from\s+["'][^"']+["'];$/gm,
    (_match, componentName) => {
      componentNames.push(componentName)
      return ''
    },
  )

  componentNames.forEach((name) => {
    const regex = new RegExp(
      `<${name}(\\s+[^>]*)?\\/>|<${name}(\\s+[^>]*)?>.*?</${name}>`,
      'gs',
    )
    cleanedContent = cleanedContent.replace(regex, '')
  })

  const h2Regex =
    /<h2>\s*<a href="#interactive-code-environment"[^>]*>.*?<\/a>\s*<\/h2>/gs
  cleanedContent = cleanedContent.replace(h2Regex, '')

  return cleanedContent
}
