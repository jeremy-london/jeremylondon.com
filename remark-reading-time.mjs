import { toString } from 'mdast-util-to-string'

import { getReadingTimeDetails } from './src/utils/reading-time.js'

export function remarkReadingTime() {
  return function (tree, { data }) {
    const readingTime = getReadingTimeDetails(toString(tree))

    data.astro.frontmatter.minutesRead = readingTime.minutesRead
    data.astro.frontmatter.readingTimeMinutes = readingTime.readingTimeMinutes
  }
}
