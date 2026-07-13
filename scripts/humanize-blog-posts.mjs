import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

async function collectBlogFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectBlogFiles(path)))
    } else if (path.endsWith('.mdx') || path.endsWith('template.md')) {
      files.push(path)
    }
  }

  return files
}

const files = await collectBlogFiles('src/content/blog')

const bodyReplacements = [
  [
    /That was the short version in ([^.]+)\. The real version was messier: the change moved the work around, and the tradeoffs still showed up in the open\./g,
    'That was the short version in $1. The part that mattered in practice was messier, because the change moved the work around and forced the same tradeoffs to show up in daylight.',
  ],
  [
    /That was the short version in ([^.]+)\. The release changed the shape of the work, but it did not remove the need to make choices in the open\./g,
    'That was the short version in $1. The part that mattered in practice was messier, because the change moved the work around and forced the same tradeoffs to show up in daylight.',
  ],
  [
    /For this topic, I would keep the claim narrow: (.+?) because it changed a decision a builder had to make, not because it won a week of attention\./g,
    'I would keep the point tight. The useful part is the decision it changes, because that is what readers can test, question, and use in the next project.',
  ],
  [
    /I would write about it from the seat of someone who has to maintain the (.+?) path after the launch week has passed\./g,
    'I would write about it from the point of view of the person who has to keep the $1 path working after launch, when the launch-week glow is gone and the bugs are still there.',
  ],
  [
    /The release changed the shape of the work, but it did not remove the need to make choices in the open\./g,
    'The work changed, but the tradeoffs stayed visible.',
  ],
  [
    /I would keep the point tight\. The useful part is the decision it changes, because that is where the work actually moves\./g,
    'I would keep the point tight. The useful part is the decision it changes, because that is what people have to carry into the next round of work.',
  ],
]

const titleTransforms = [
  [/^(.*) made (.*) feel like an (.*)$/i, (_m, a, b, c) => `${a} turned ${b} into an ${c}`],
  [/^(.*) made (.*) feel like a (.*)$/i, (_m, a, b, c) => `${a} turned ${b} into a ${c}`],
  [/^(.*) made (.*) feel less (.*)$/i, (_m, a, b, c) => `${a} brought ${b} closer to ${c === 'small' ? 'something bigger' : 'practice'}`],
  [/^(.*) made (.*) feel more (.*)$/i, (_m, a, b, c) => `${a} gave ${b} more ${c}`],
  [/^(.*) made (.*) feel real$/i, (_m, a, b) => `${a} gave ${b} real tradeoffs`],
  [/^(.*) made (.*) more important$/i, (_m, a, b) => `${a} raised the stakes for ${b}`],
  [/^(.*) made (.*) more honest$/i, (_m, a, b) => `${a} made ${b} harder to dodge`],
  [/^(.*) made (.*) more visible$/i, (_m, a, b) => `${a} put ${b} in plain view`],
  [/^(.*) made (.*) more accountable$/i, (_m, a, b) => `${a} made ${b} easier to inspect`],
  [/^(.*) made (.*) more operational$/i, (_m, a, b) => `${a} brought ${b} into everyday use`],
  [/^(.*) made (.*) less hypothetical$/i, (_m, a, b) => `${a} turned ${b} into something teams had to plan for`],
  [/^(.*) made (.*) less separate$/i, (_m, a, b) => `${a} brought ${b} closer to the main stack`],
  [/^(.*) made (.*) less annoying$/i, (_m, a, b) => `${a} cut some friction from ${b}`],
  [/^(.*) made (.*) less small$/i, (_m, a, b) => `${a} made ${b} feel bigger than a side note`],
  [/^(.*) made (.*) feel inevitable$/i, (_m, a, b) => `${a} pushed ${b} toward the default`],
  [/^(.*) made (.*) feel normal$/i, (_m, a, b) => `${a} made ${b} feel normal`],
]

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return null
  return { frontmatter: match[1], body: match[2] }
}

function updateLine(frontmatter, key, value) {
  const pattern = new RegExp(`^${key}:\\s*"([^"]*)"$`, 'm')
  return frontmatter.replace(pattern, `${key}: "${value}"`)
}

function humanizeTitle(title) {
  for (const [pattern, replacer] of titleTransforms) {
    if (pattern.test(title)) return title.replace(pattern, replacer)
  }
  return title
}

function humanizeBody(body) {
  let next = body
  for (const [pattern, replacement] of bodyReplacements) {
    next = next.replace(pattern, replacement)
  }
  return next
}

let changed = 0

for (const file of files) {
  const source = await readFile(file, 'utf8')
  const parsed = parseFrontmatter(source)
  if (!parsed) continue

  let { frontmatter, body } = parsed
  let nextFrontmatter = frontmatter

  const titleMatch = frontmatter.match(/^title:\s*"([^"]+)"$/m)
  if (titleMatch) {
    const humanizedTitle = humanizeTitle(titleMatch[1])
    if (humanizedTitle !== titleMatch[1]) {
      nextFrontmatter = updateLine(nextFrontmatter, 'title', humanizedTitle)
    }
  }

  const excerptMatch = frontmatter.match(/^excerpt:\s*"([^"]+)"$/m)
  if (excerptMatch) {
    const humanizedExcerpt = humanizeBody(excerptMatch[1])
    if (humanizedExcerpt !== excerptMatch[1]) {
      nextFrontmatter = updateLine(nextFrontmatter, 'excerpt', humanizedExcerpt)
    }
  }

  const nextBody = humanizeBody(body)
  const nextSource = `---\n${nextFrontmatter}\n---\n${nextBody}`

  if (nextSource !== source) {
    await writeFile(file, nextSource)
    changed += 1
  }
}

console.log(`Humanized ${changed} blog files`)
