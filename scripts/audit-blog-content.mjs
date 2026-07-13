import fs from 'node:fs'
import path from 'node:path'

const BLOG_DIR = 'src/content/blog'

const GENERIC_HEADINGS = new Set([
  'the part i would not skip',
  'more of what i kept thinking about',
  'the part that stayed with me',
  'what the first draft left out',
  'the small version',
  'what would change my mind',
  'after the cleanup',
  'the teardown',
  'what broke first',
])

const FILLER_PATTERNS = [
  /longer pass/gi,
  /expanded version/gi,
  /first draft/gi,
  /short note/gi,
  /second or third angle/gi,
  /what usually gets skipped/gi,
  /the useful part lives/gi,
  /where the real judgment shows up/gi,
  /the boring version of the work/gi,
  /when the team is tired/gi,
  /the simplest path is also the one/gi,
  /if a paragraph could appear in ten other posts/gi,
  /decoration with syntax highlighting/gi,
  /stops being a tidy phrase/gi,
  /naming the topic is cheap/gi,
  /smaller than the original draft tried to make it/gi,
  /without reconstructing the whole argument from memory/gi,
  /anything beyond that should earn its place/gi,
  /the useful question for/gi,
]

const STOP_WORDS = new Set(
  'the a an and or but if then because that this those these with without into from about around through under over after before while when where what how why it is are was were be being been has have had do does did can could should would will just not only also as of to in on for by at i you we they he she them his her my our their'.split(
    ' ',
  ),
)

function frontmatter(source) {
  return source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
}

function stripFrontmatter(source) {
  return source.replace(/^---\n[\s\S]*?\n---\n?/, '')
}

function value(fm, key) {
  const line = fm.split('\n').find((item) => item.startsWith(`${key}:`))
  return line ? line.slice(key.length + 1).trim().replace(/^['"]|['"]$/g, '') : ''
}

function clean(source) {
  return source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[[^\]]+\]\([^)]+\)/g, ' ')
    .replace(/[#*_`>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalize(source) {
  return clean(source)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function repeatedNgrams(words, size) {
  const counts = new Map()

  for (let index = 0; index <= words.length - size; index += 1) {
    const slice = words.slice(index, index + size)
    if (!slice.some((word) => !STOP_WORDS.has(word) && word.length > 3)) continue
    const gram = slice.join(' ')
    counts.set(gram, (counts.get(gram) ?? 0) + 1)
  }

  return [...counts.entries()]
    .filter(([, count]) => count >= 5)
    .sort((a, b) => b[1] - a[1])
}

function auditFile(file) {
  const source = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
  const fm = frontmatter(source)
  const body = stripFrontmatter(source)
  const title = value(fm, 'title')
  const bodyNorm = normalize(body)
  const words = bodyNorm.split(' ').filter(Boolean)
  const titleNorm = normalize(title)
  const titleRepeat = titleNorm
    ? bodyNorm.match(new RegExp(titleNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))?.length ?? 0
    : 0
  const titleWords = titleNorm
    .split(' ')
    .filter((word) => word.length > 4 && !STOP_WORDS.has(word))
  const repeatedTitleWords = titleWords
    .map((word) => ({
      word,
      count: bodyNorm.match(new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'))
        ?.length ?? 0,
    }))
    .filter((entry) => entry.count > 12)

  const headings = [...body.matchAll(/^##\s+(.+)$/gm)].map((match) =>
    match[1].trim().toLowerCase(),
  )
  const genericHeadings = headings.filter((heading) => GENERIC_HEADINGS.has(heading))
  const fillerHits = FILLER_PATTERNS.reduce(
    (count, pattern) => count + (body.match(pattern)?.length ?? 0),
    0,
  )
  const repeatedLongPhrase = repeatedNgrams(words, 8)[0] ?? ['', 0]
  const repeatedMidPhrase = repeatedNgrams(words, 5)[0] ?? ['', 0]
  const bodyWordCount = words.length

  const failures = []
  if (genericHeadings.length > 0) failures.push(`generic headings: ${genericHeadings.join(', ')}`)
  if (fillerHits > 0) failures.push(`filler pattern hits: ${fillerHits}`)
  if (titleRepeat > 6) failures.push(`title repeated ${titleRepeat} times`)
  if (repeatedTitleWords.length > 0) {
    failures.push(
      `title terms overused: ${repeatedTitleWords
        .map((entry) => `${entry.word}=${entry.count}`)
        .join(', ')}`,
    )
  }
  if (repeatedLongPhrase[1] > 6) {
    failures.push(`8-word phrase repeated ${repeatedLongPhrase[1]} times: "${repeatedLongPhrase[0]}"`)
  }
  if (repeatedMidPhrase[1] > 12) {
    failures.push(`5-word phrase repeated ${repeatedMidPhrase[1]} times: "${repeatedMidPhrase[0]}"`)
  }
  if (bodyWordCount > 1800 && headings.length > 8) {
    failures.push(`long outline-style post: ${bodyWordCount} words and ${headings.length} sections`)
  }

  return {
    file,
    title,
    failures,
  }
}

const files = fs
  .readdirSync(BLOG_DIR)
  .filter((file) => /\.mdx?$/.test(file))
  .sort()

const failures = files.map(auditFile).filter((result) => result.failures.length > 0)
const sentenceCounts = new Map()

for (const file of files) {
  const source = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
  const body = stripFrontmatter(source)
  const sentences = body
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(normalize)
    .filter((sentence) => sentence.split(' ').length >= 9)

  for (const sentence of sentences) {
    if (!sentence) continue
    const entry = sentenceCounts.get(sentence) ?? { count: 0, files: new Set() }
    entry.count += 1
    entry.files.add(file)
    sentenceCounts.set(sentence, entry)
  }
}

const repeatedCorpusSentences = [...sentenceCounts.entries()]
  .map(([sentence, entry]) => ({
    sentence,
    count: entry.count,
    fileCount: entry.files.size,
  }))
  .filter((entry) => entry.fileCount > 8)
  .sort((a, b) => b.fileCount - a.fileCount)

if (failures.length > 0 || repeatedCorpusSentences.length > 0) {
  console.error(`Blog content audit failed: ${failures.length}/${files.length} files`)
  for (const result of failures) {
    console.error(`\n${result.file}`)
    for (const failure of result.failures) console.error(`  - ${failure}`)
  }
  if (repeatedCorpusSentences.length > 0) {
    console.error('\nRepeated sentences across the archive:')
    for (const entry of repeatedCorpusSentences.slice(0, 20)) {
      console.error(`  - ${entry.fileCount} files: "${entry.sentence}"`)
    }
  }
  process.exit(1)
}

console.log(`Blog content audit passed: ${files.length} files`)
