import fs from 'node:fs'
import path from 'node:path'

const BLOG_DIR = 'src/content/blog'
const MANIFEST_PATH = 'BLOG_DEPTH_MANIFEST.json'

const DEPTH_RULES = {
  'quick-note': {
    minWords: 700,
    maxWords: 10000,
    minMapItems: 1,
    requiredTerms: [],
  },
  'engineering-note': {
    minWords: 700,
    maxWords: 10000,
    minMapItems: 1,
    requiredTerms: [],
  },
  'technical-deep-dive': {
    minWords: 700,
    maxWords: 10000,
    minMapItems: 1,
    requiredTerms: [],
  },
  'systems-essay': {
    minWords: 700,
    maxWords: 10000,
    minMapItems: 1,
    requiredTerms: [],
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
  /the practical version of/gi,
  /the maintenance version of/gi,
  /the local rule for/gi,
  /the article earns its space/gi,
  /a small test around/gi,
  /the operational note for/gi,
  /the smallest useful version of/gi,
  /the artifact i want for/gi,
  /the scale limit around/gi,
  /i would rather expose/gi,
  /if the example becomes a template/gi,
  /before the next maintainer has to guess/gi,
  /measurement belongs next to the decision/gi,
  /the useful pressure here is whether/gi,
  /that gives .{1,80} a boundary that can be inspected/gi,
]

const SELF_REFERENTIAL_EDITORIAL_PATTERNS = [
  /i would keep [^.]{1,80} small here/gi,
  /that is enough material for/gi,
  /not a manifesto/gi,
  /the thing i would not add/gi,
  /fake architecture section/gi,
  /i am leaving [^.]{1,80} as a short note/gi,
  /a longer [^.]{1,80} version would need/gi,
  /this is enough material for a note/gi,
  /the post has done its job/gi,
]

const GENERIC_INFO_MAP_PATTERNS = [
  /^the concrete .+ problem$/,
  /^the example surface:/,
  /^the failure mode:/,
  /^the small decision i would keep$/,
  /^what would make the note wrong$/,
  /^the responsibilities around/,
  /^the tradeoff between convenience/,
  /^the check or metric:/,
  /^input shape and request data$/,
  /^component responsibilities$/,
  /^control flow and state transitions$/,
  /^failure modes and recovery$/,
  /^measurement using/,
  /^security or ownership boundary:/,
  /^latency, cost, and scaling implications$/,
  /^why the obvious solution is insufficient$/,
  /^system constraints and trust boundaries$/,
  /^architecture and component responsibilities$/,
  /^request, event, and evidence flow$/,
  /^deterministic and semantic verification$/,
  /^governance, revocation, and escalation$/,
  /^tradeoffs i would make$/,
  /^what remains unresolved$/,
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

function normalizedMarkdown(source) {
  return source
    .toLowerCase()
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function meaningfulWords(source) {
  return normalize(source)
    .split(' ')
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word))
}

function topicTerms(manifestEntry, title) {
  return new Set([
    ...meaningfulWords(manifestEntry?.subject ?? ''),
    ...meaningfulWords(title),
    ...(manifestEntry?.category ? manifestEntry.category.split(/[-\s]+/) : []),
  ])
}

function paragraphSkeleton(paragraph, terms) {
  const normalized = normalize(paragraph)
  const words = normalized.split(' ').filter(Boolean)
  const skeleton = words.map((word) => {
    if (terms.has(word)) return 'topic'
    if (STOP_WORDS.has(word) || word.length <= 3) return word
    if (/^\d+$/.test(word)) return 'num'
    return 'term'
  })

  return skeleton.join(' ')
}

function sentenceSkeleton(sentence, terms) {
  const skeleton = paragraphSkeleton(sentence, terms)
  const words = skeleton.split(' ')
  return words.length >= 8 ? words.join(' ') : ''
}

function lengthBucket(wordCount) {
  if (wordCount <= 12) return 'xs'
  if (wordCount <= 28) return 's'
  if (wordCount <= 60) return 'm'
  if (wordCount <= 110) return 'l'
  return 'xl'
}

function structuralFingerprint(body) {
  const headingNames = [...body.matchAll(/^##\s+(.+)$/gm)].map((match) => normalize(match[1]))
  const codeBlocks = [...body.matchAll(/(?:```|~~~)([a-z0-9]*)\n[\s\S]*?(?:```|~~~)/g)]
  const listBlocks = body.match(/(?:^- .+(?:\n|$)){3,}/gm) ?? []
  const paragraphs = body
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph && !paragraph.startsWith('##') && !paragraph.startsWith('- '))

  const paragraphShape = paragraphs
    .map((paragraph) => lengthBucket(normalize(paragraph).split(' ').filter(Boolean).length))
    .join(',')
  const codeLanguages = codeBlocks.map((match) => match[1] || 'plain').join(',')
  const listPositions = listBlocks.map((block) => body.slice(0, body.indexOf(block)).split(/^##\s+/gm).length).join(',')

  return [
    `h:${headingNames.length}:${headingNames.join('>')}`,
    `p:${paragraphShape}`,
    `c:${codeLanguages}`,
    `l:${listPositions}`,
  ].join('|')
}

function pushGroup(map, key, file, sample) {
  if (!key) return
  const entry = map.get(key) ?? { files: new Set(), sample }
  entry.files.add(file)
  map.set(key, entry)
}

function repeatedGroups(map, minFiles) {
  return [...map.entries()]
    .map(([fingerprint, entry]) => ({
      fingerprint,
      sample: entry.sample,
      files: [...entry.files].sort(),
      fileCount: entry.files.size,
    }))
    .filter((entry) => entry.fileCount >= minFiles)
    .sort((a, b) => b.fileCount - a.fileCount)
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
    throw new Error(`${MANIFEST_PATH} is missing. Rebuild it from recovered post intent before auditing.`)
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
  const selfReferentialHits = SELF_REFERENTIAL_EDITORIAL_PATTERNS.reduce(
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
  if (manifestEntry && rules && manifestEntry.informationMap.length < rules.minMapItems) {
    failures.push(`information map too small: ${manifestEntry.informationMap.length}`)
  }
  if (manifestEntry?.informationMap) {
    const normalizedMap = manifestEntry.informationMap.map((item) => normalize(item))
    const genericItems = normalizedMap.filter((item) =>
      GENERIC_INFO_MAP_PATTERNS.some((pattern) => pattern.test(item)),
    )
    if (genericItems.length >= Math.max(4, Math.ceil(normalizedMap.length * 0.5))) {
      failures.push(`information map is mostly generic editorial dimensions: ${genericItems.length}/${normalizedMap.length}`)
    }
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
  if (genericHeadings.length > 0) failures.push(`generic headings: ${genericHeadings.join(', ')}`)
  if (fillerHits > 0) failures.push(`filler pattern hits: ${fillerHits}`)
  if (selfReferentialHits > 0) {
    failures.push(`self-referential editorial prose hits: ${selfReferentialHits}`)
  }
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
const sectionSequenceCounts = new Map()
const codeBlockCounts = new Map()
const listBlockCounts = new Map()
const paragraphSkeletonCounts = new Map()
const openingSkeletonCounts = new Map()
const conclusionSkeletonCounts = new Map()
const structuralFingerprintCounts = new Map()

for (const file of files) {
  const source = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
  const fm = frontmatter(source)
  const body = stripFrontmatter(source)
  const manifestEntry = manifestByFile.get(file)
  const title = value(fm, 'title')
  const terms = topicTerms(manifestEntry, title)
  const headings = [...body.matchAll(/^##\s+(.+)$/gm)].map((match) =>
    normalize(match[1]).replace(/\s+/g, ' '),
  )
  if (headings.length >= 3) pushGroup(sectionSequenceCounts, headings.join(' > '), file, headings.join(' > '))
  pushGroup(structuralFingerprintCounts, structuralFingerprint(body), file, headings.join(' > ') || 'no headings')

  for (const match of body.matchAll(/(?:```|~~~)([a-z0-9]*)\n([\s\S]*?)(?:```|~~~)/g)) {
    const language = match[1] || 'plain'
    const block = normalizedMarkdown(match[2])
    if (block.split(' ').length >= 4) pushGroup(codeBlockCounts, `${language}:${block}`, file, match[0].slice(0, 240))
  }

  const listBlocks = body.match(/(?:^- .+(?:\n|$)){3,}/gm) ?? []
  for (const block of listBlocks) {
    const normalizedList = normalize(block)
    if (normalizedList.split(' ').length >= 8) {
      pushGroup(listBlockCounts, normalizedList, file, block.trim().slice(0, 240))
    }
  }

  const paragraphs = body
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph && !paragraph.startsWith('##') && !paragraph.startsWith('- '))

  for (const paragraph of paragraphs) {
    const skeleton = paragraphSkeleton(paragraph, terms)
    const wordCount = skeleton.split(' ').length
    if (wordCount >= 14) pushGroup(paragraphSkeletonCounts, skeleton, file, paragraph.slice(0, 240))
  }

  const sentences = body
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/^import\s+.+$/gm, ' ')
    .replace(/^<[A-Z][\s\S]*?\/>$/gm, ' ')
    .replace(/^##\s+.+$/gm, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

  const openingSentence = sentences.find((sentence) => normalize(sentence).split(' ').length >= 8)
  const closingSentence = [...sentences].reverse().find((sentence) => normalize(sentence).split(' ').length >= 8)
  if (openingSentence) {
    pushGroup(
      openingSkeletonCounts,
      sentenceSkeleton(openingSentence, terms),
      file,
      openingSentence.slice(0, 240),
    )
  }
  if (closingSentence) {
    pushGroup(
      conclusionSkeletonCounts,
      sentenceSkeleton(closingSentence, terms),
      file,
      closingSentence.slice(0, 240),
    )
  }

  for (const sentence of sentences) {
    const normalizedSentence = normalize(sentence)
    if (!normalizedSentence || normalizedSentence.split(' ').length < 10) continue
    const entry = sentenceCounts.get(normalizedSentence) ?? { count: 0, files: new Set() }
    entry.count += 1
    entry.files.add(file)
    sentenceCounts.set(normalizedSentence, entry)
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

const repeatedSectionSequences = repeatedGroups(sectionSequenceCounts, 4)
const repeatedCodeBlocks = repeatedGroups(codeBlockCounts, 3)
const repeatedListBlocks = repeatedGroups(listBlockCounts, 4)
const repeatedParagraphSkeletons = repeatedGroups(paragraphSkeletonCounts, 4)
const repeatedOpeningSkeletons = repeatedGroups(openingSkeletonCounts, 4)
const repeatedConclusionSkeletons = repeatedGroups(conclusionSkeletonCounts, 4)
const repeatedStructuralFingerprints = repeatedGroups(structuralFingerprintCounts, 4)

if (
  failures.length > 0 ||
  repeatedCorpusSentences.length > 0 ||
  distributionFailures.length > 0 ||
  repeatedSectionSequences.length > 0 ||
  repeatedCodeBlocks.length > 0 ||
  repeatedListBlocks.length > 0 ||
  repeatedParagraphSkeletons.length > 0 ||
  repeatedOpeningSkeletons.length > 0 ||
  repeatedConclusionSkeletons.length > 0 ||
  repeatedStructuralFingerprints.length > 0
) {
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
  if (repeatedSectionSequences.length > 0) {
    console.error('\nRepeated section sequences:')
    for (const entry of repeatedSectionSequences.slice(0, 12)) {
      console.error(`  - ${entry.fileCount} files: ${entry.sample}`)
      console.error(`    ${entry.files.slice(0, 8).join(', ')}`)
    }
  }
  if (repeatedCodeBlocks.length > 0) {
    console.error('\nRepeated code or diagram blocks:')
    for (const entry of repeatedCodeBlocks.slice(0, 12)) {
      console.error(`  - ${entry.fileCount} files: ${entry.sample.replace(/\n/g, ' ').slice(0, 180)}`)
      console.error(`    ${entry.files.slice(0, 8).join(', ')}`)
    }
  }
  if (repeatedListBlocks.length > 0) {
    console.error('\nRepeated list blocks:')
    for (const entry of repeatedListBlocks.slice(0, 12)) {
      console.error(`  - ${entry.fileCount} files: ${entry.sample.replace(/\n/g, ' | ').slice(0, 180)}`)
      console.error(`    ${entry.files.slice(0, 8).join(', ')}`)
    }
  }
  if (repeatedParagraphSkeletons.length > 0) {
    console.error('\nRepeated paragraph skeletons:')
    for (const entry of repeatedParagraphSkeletons.slice(0, 20)) {
      console.error(`  - ${entry.fileCount} files: ${entry.sample.replace(/\n/g, ' ').slice(0, 180)}`)
      console.error(`    ${entry.files.slice(0, 8).join(', ')}`)
    }
  }
  if (repeatedOpeningSkeletons.length > 0) {
    console.error('\nRepeated opening skeletons:')
    for (const entry of repeatedOpeningSkeletons.slice(0, 12)) {
      console.error(`  - ${entry.fileCount} files: ${entry.sample.replace(/\n/g, ' ').slice(0, 180)}`)
      console.error(`    ${entry.files.slice(0, 8).join(', ')}`)
    }
  }
  if (repeatedConclusionSkeletons.length > 0) {
    console.error('\nRepeated conclusion skeletons:')
    for (const entry of repeatedConclusionSkeletons.slice(0, 12)) {
      console.error(`  - ${entry.fileCount} files: ${entry.sample.replace(/\n/g, ' ').slice(0, 180)}`)
      console.error(`    ${entry.files.slice(0, 8).join(', ')}`)
    }
  }
  if (repeatedStructuralFingerprints.length > 0) {
    console.error('\nRepeated structural fingerprints:')
    for (const entry of repeatedStructuralFingerprints.slice(0, 12)) {
      console.error(`  - ${entry.fileCount} files: ${entry.sample.replace(/\n/g, ' ').slice(0, 180)}`)
      console.error(`    ${entry.files.slice(0, 8).join(', ')}`)
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
