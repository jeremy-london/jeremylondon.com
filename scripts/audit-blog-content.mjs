import fs from 'node:fs'
import path from 'node:path'

const BLOG_DIR = 'src/content/blog'
const MANIFEST_PATH = 'BLOG_DEPTH_MANIFEST.json'

const DEPTH_RULES = {
  'quick-note': {
    minWords: 220,
    maxWords: 900,
    minMapItems: 4,
    requiredTerms: ['boundary', 'check'],
  },
  'engineering-note': {
    minWords: 500,
    maxWords: 1400,
    minMapItems: 6,
    requiredTerms: ['tradeoff', 'metric', 'artifact'],
  },
  'technical-deep-dive': {
    minWords: 1000,
    maxWords: 2600,
    minMapItems: 8,
    requiredTerms: ['data flow', 'failure', 'measurement', 'scaling'],
  },
  'systems-essay': {
    minWords: 1600,
    maxWords: 5200,
    minMapItems: 10,
    requiredTerms: ['architecture', 'constraints', 'measurement', 'tradeoffs', 'unresolved'],
  },
}

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
  /in today's rapidly evolving/gi,
  /the world of ai/gi,
  /as artificial intelligence continues/gi,
  /game-changing/gi,
  /revolutionary/gi,
  /unlock the power/gi,
  /delve into/gi,
  /embark on/gi,
  /it's important to note/gi,
  /longer pass/gi,
  /expanded version/gi,
  /first draft/gi,
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

function stripFrontmatter(source) {
  return source.replace(/^---\n[\s\S]*?\n---\n?/, '')
}

function frontmatter(source) {
  return source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
}

function value(fm, key) {
  const line = fm.split('\n').find((item) => item.startsWith(`${key}:`))
  return line ? line.slice(key.length + 1).trim().replace(/^['"]|['"]$/g, '') : ''
}

function clean(source) {
  return source
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
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

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`${MANIFEST_PATH} is missing. Run node scripts/rewrite-blog-posts.mjs first.`)
  }
  const parsed = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'))
  return parsed.posts
}

function auditDistribution(manifest) {
  const total = manifest.length
  const counts = manifest.reduce((acc, entry) => {
    acc[entry.depth] = (acc[entry.depth] ?? 0) + 1
    return acc
  }, {})
  const failures = []
  const ranges = {
    'quick-note': [0.18, 0.34],
    'engineering-note': [0.25, 0.45],
    'technical-deep-dive': [0.2, 0.4],
    'systems-essay': [0.05, 0.15],
  }

  for (const [depth, [min, max]] of Object.entries(ranges)) {
    const ratio = (counts[depth] ?? 0) / total
    if (ratio < min || ratio > max) {
      failures.push(`${depth} distribution ${counts[depth] ?? 0}/${total} (${ratio.toFixed(2)})`)
    }
  }

  return failures
}

function auditFile(file, manifestEntry) {
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
  const rules = DEPTH_RULES[manifestEntry?.depth]
  const failures = []

  if (!manifestEntry) failures.push('missing manifest entry')
  if (manifestEntry && !DEPTH_RULES[manifestEntry.depth]) failures.push(`unknown depth ${manifestEntry.depth}`)
  if (manifestEntry && manifestEntry.file !== file) failures.push('manifest file mismatch')
  if (manifestEntry && manifestEntry.informationMap.length < rules.minMapItems) {
    failures.push(`information map too small: ${manifestEntry.informationMap.length}`)
  }
  if (rules && words.length < rules.minWords) {
    failures.push(`${manifestEntry.depth} too thin: ${words.length} words`)
  }
  if (rules && words.length > rules.maxWords) {
    failures.push(`${manifestEntry.depth} too long for assigned depth: ${words.length} words`)
  }
  if (rules) {
    for (const term of rules.requiredTerms) {
      if (!bodyNorm.includes(normalize(term))) failures.push(`missing depth marker: ${term}`)
    }
  }
  if (manifestEntry?.depth === 'technical-deep-dive' && !/(```|~~~)(json|text|ts|python|rust|yaml)?/.test(body)) {
    failures.push('technical deep dive lacks an implementation or data example')
  }
  if (manifestEntry?.depth === 'systems-essay') {
    const requiredHeadings = [
      'the problem',
      'constraints',
      'architecture',
      'failure modes',
      'measurement',
      'scaling behavior',
      'tradeoffs i would make',
      'what remains unresolved',
    ]
    for (const heading of requiredHeadings) {
      if (!headings.includes(heading)) failures.push(`systems essay missing heading: ${heading}`)
    }
  }
  if (genericHeadings.length > 0) failures.push(`generic headings: ${genericHeadings.join(', ')}`)
  if (fillerHits > 0) failures.push(`filler pattern hits: ${fillerHits}`)
  if (titleRepeat > 3) failures.push(`title repeated ${titleRepeat} times`)
  if (repeatedLongPhrase[1] > 6) {
    failures.push(`8-word phrase repeated ${repeatedLongPhrase[1]} times: "${repeatedLongPhrase[0]}"`)
  }
  if (repeatedMidPhrase[1] > 14) {
    failures.push(`5-word phrase repeated ${repeatedMidPhrase[1]} times: "${repeatedMidPhrase[0]}"`)
  }

  return {
    file,
    title,
    failures,
  }
}

const manifest = loadManifest()
const manifestByFile = new Map(manifest.map((entry) => [entry.file, entry]))
const files = fs
  .readdirSync(BLOG_DIR)
  .filter((file) => /\.mdx?$/.test(file) && file !== 'template.md')
  .sort()

const failures = files
  .map((file) => auditFile(file, manifestByFile.get(file)))
  .filter((result) => result.failures.length > 0)
const distributionFailures = auditDistribution(manifest)
const sentenceCounts = new Map()

for (const file of files) {
  const source = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
  const body = stripFrontmatter(source)
  const sentences = body
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(normalize)
    .filter((sentence) => sentence.split(' ').length >= 10)

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
  .filter((entry) => entry.fileCount > 20)
  .sort((a, b) => b.fileCount - a.fileCount)

if (failures.length > 0 || repeatedCorpusSentences.length > 0 || distributionFailures.length > 0) {
  console.error(`Blog content audit failed: ${failures.length}/${files.length} files`)
  for (const failure of distributionFailures) console.error(`\nDistribution: ${failure}`)
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

const counts = manifest.reduce((acc, entry) => {
  acc[entry.depth] = (acc[entry.depth] ?? 0) + 1
  return acc
}, {})

console.log(`Blog content audit passed: ${files.length} files`)
console.log(JSON.stringify(counts))
