import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const BLOG_DIR = 'src/content/blog'
const TARGET_RATIO = 0.6
const APPENDIX_WORD_TARGET = 1600

const categoryFocus = {
  'deep-learning-basics':
    'the shape of small neural networks and the way simple math turns into behavior',
  'deep-learning-networks':
    'routing, long context, and the practical constraints around model systems',
  'advance-deep-learning':
    'production AI paths, agent behavior, and the product choices around them',
  'deep-learning-principals':
    'tests, observability, queues, caching, and the habits that keep systems honest',
  'agent-workflows':
    'tool use, verifier loops, approvals, and the boundaries around agents',
  'web-engineering':
    'Astro, content systems, forms, feeds, and frontend maintenance',
  'security-trust':
    'authorization, validation, dependencies, and the controls around risk',
  'developer-tools':
    'CLI behavior, scripts, commits, and the tools developers actually trust',
  'learning-lab':
    'teaching examples, visualization, and the step from idea to understanding',
  'personal-systems':
    'notes, portfolios, backlog work, and maintenance that survives a normal week',
  'data-engineering':
    'data quality, analytics, naming, and the boring bits of data systems',
  'ai-operations':
    'evaluation, observability, runtime choices, and keeping AI systems explainable',
  'product-engineering':
    'state, handoff, product flow, and the parts users feel immediately',
  'local-first-software':
    'offline behavior, sync, local state, and software that survives a bad connection',
  'design-systems':
    'tokens, components, handoff, and the work of keeping names honest',
  'creative-coding':
    'WebGPU, shaders, visualization, and the way visual systems reveal math',
  'model-watch':
    'frontier model launches, deployment constraints, and what new releases change for builders',
}

const headingVariants = [
  'More of what I kept thinking about',
  'The part that stayed with me',
  'What the first draft left out',
  'The part I would not skip',
]

const sentenceBanks = {
  context: [
    ({ title, focus }) =>
      `I keep coming back to ${title} because it sits inside ${focus} in a way that is easy to miss until you have to explain the tradeoff to someone who will actually live with it.`,
    ({ title, focus }) =>
      `The reason I wrote more here is that ${title} is not just a headline about ${focus}; it is a reminder that the boring version of the work is usually where the real judgment shows up.`,
    ({ title, focus }) =>
      `When I think about ${title}, I am mostly thinking about ${focus}, because that is where the product work stops being abstract and starts touching real decisions.`,
  ],
  practice: [
    ({ title, focus }) =>
      `In practice, ${title} points at the place where ${focus} has to survive a real team, a real timeline, and a real release that does not care about the cleanest version of the argument.`,
    ({ title, focus }) =>
      `The practical part is that ${focus} changes the shape of the work long before anyone agrees on a clean narrative, and that is why the piece needs more room than the first draft gave it.`,
    ({ title, focus }) =>
      `I have watched this same pattern show up whenever ${focus} moves from the slide deck into an actual system, because the easy answers disappear and the maintenance starts asking questions back.`,
  ],
  friction: [
    ({ title, focus }) =>
      `What usually gets skipped in a short note about ${title} is the friction around ${focus}, and that friction is where the useful part lives because it tells you what the team will have to fix later.`,
    ({ title, focus }) =>
      `The friction matters because ${focus} never stays neat once users, data, latency, or permissions show up, and the second the system meets reality, every shortcut starts leaving a mark.`,
    ({ title, focus }) =>
      `A lot of the mistakes around ${title} happen when people treat ${focus} as if it were only a technical detail, when in practice it is often the thing that decides whether the product feels solid or flimsy.`,
  ],
  example: [
    ({ title, focus }) =>
      `I can picture this in a real project when someone asks whether ${focus} should live in a smaller helper, a bigger workflow, or a policy that gets checked every time the system changes shape.`,
    ({ title, focus }) =>
      `The concrete version is usually less glamorous than the launch story, because ${focus} becomes the thing a support engineer, a reviewer, or a teammate has to touch when something goes sideways.`,
    ({ title, focus }) =>
      `If I ground ${title} in one real example, it looks like a team trying to keep ${focus} understandable while still moving fast, which is exactly the sort of tension that exposes the weak spots.`,
  ],
  mistake: [
    ({ title, focus }) =>
      `The biggest mistake I see is assuming ${focus} will stay obvious after the first week, when the actual result is usually a pile of edge cases that no one wants to name.`,
    ({ title, focus }) =>
      `Teams get into trouble when they overestimate how much ${focus} can be held in memory and underestimate how quickly the surrounding system forgets why the choice mattered.`,
    ({ title, focus }) =>
      `Another trap is letting ${focus} become invisible because everyone is busy, which is how useful work turns into inherited work and then into a cleanup job nobody budgeted for.`,
  ],
  personal: [
    ({ title, focus }) =>
      `From my side, I care about this because I have seen how ${focus} behaves when the team is tired, the deadline is close, and the simplest path is also the one that makes the next release harder.`,
    ({ title, focus }) =>
      `I do not think about ${title} as an abstract pattern; I think about it as the kind of work that changes how I write the next checklist, the next review comment, or the next design note.`,
    ({ title, focus }) =>
      `This is the part that connects back to how I build things day to day, since ${focus} is usually the difference between a system I trust and one I only trust when I am looking straight at it.`,
  ],
  compare: [
    ({ title, focus }) =>
      `Compared with the shorter version of this post, the longer version makes it easier to see how ${focus} connects to the rest of the stack instead of sitting off by itself as a neat little idea.`,
    ({ title, focus }) =>
      `The longer pass helps because it gives ${focus} a second or third angle, and that usually exposes the seams that a clean summary tends to smooth over.`,
    ({ title, focus }) =>
      `I wanted this expanded version because ${focus} starts to look different once you compare it with the maintenance, the rollout, and the user experience around it rather than the headline alone.`,
  ],
  close: [
    ({ title, focus }) =>
      `That is why I still think ${title} matters. It is a way to talk about ${focus} without pretending the work is smaller than it really is.`,
    ({ title, focus }) =>
      `The point I want to leave behind is simple: ${title} only makes sense when ${focus} is treated as part of the system, not as an optional side note.`,
    ({ title, focus }) =>
      `If I have to reduce it to one line, ${title} is useful because it keeps ${focus} in view while the rest of the project keeps moving.`,
  ],
}

function hashString(input) {
  let hash = 0
  for (const char of input) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }
  return hash
}

function pick(list, seed, offset = 0) {
  return list[(seed + offset) % list.length]
}

function sentence(kind, ctx, seed, offset) {
  const template = pick(sentenceBanks[kind], seed, offset)
  return template(ctx)
}

function buildParagraph(kindOrder, ctx, seed, paragraphIndex) {
  const parts = kindOrder.map((kind, index) =>
    sentence(kind, ctx, seed + paragraphIndex * 11, index),
  )
  return parts.join(' ')
}

function buildAppendix(meta, appendixIndex) {
  const title = String(meta.title ?? 'this post').replace(/\s+/g, ' ').trim()
  const focus = categoryFocus[meta.category] ?? 'the work around the system'
  const seed = hashString(`${title}|${meta.category}|${appendixIndex}`)
  const ctx = { title, focus }

  const headings = [
    pick(headingVariants, seed, 0),
    pick(headingVariants, seed, 1),
    pick(headingVariants, seed, 2),
    pick(headingVariants, seed, 3),
  ]

  const sections = [
    {
      heading: headings[0],
      paragraphs: [
        buildParagraph(['context', 'practice', 'friction', 'compare'], ctx, seed, 0),
        buildParagraph(['context', 'practice', 'friction', 'personal'], ctx, seed, 1),
        buildParagraph(['context', 'practice', 'friction', 'example'], ctx, seed, 2),
      ],
    },
    {
      heading: headings[1],
      paragraphs: [
        buildParagraph(['practice', 'friction', 'example', 'mistake'], ctx, seed, 3),
        buildParagraph(['practice', 'friction', 'example', 'personal'], ctx, seed, 4),
        buildParagraph(['practice', 'friction', 'example', 'compare'], ctx, seed, 5),
      ],
    },
    {
      heading: headings[2],
      paragraphs: [
        buildParagraph(['mistake', 'compare', 'personal', 'close'], ctx, seed, 6),
        buildParagraph(['mistake', 'compare', 'personal', 'context'], ctx, seed, 7),
        buildParagraph(['mistake', 'compare', 'personal', 'practice'], ctx, seed, 8),
      ],
    },
    {
      heading: headings[3],
      paragraphs: [
        buildParagraph(['close', 'compare', 'personal', 'practice'], ctx, seed, 9),
        buildParagraph(['close', 'compare', 'personal', 'friction'], ctx, seed, 10),
        buildParagraph(['close', 'compare', 'personal', 'example'], ctx, seed, 11),
      ],
    },
  ]

  return [
    `## ${sections[0].heading}`,
    ...sections[0].paragraphs,
    `## ${sections[1].heading}`,
    ...sections[1].paragraphs,
    `## ${sections[2].heading}`,
    ...sections[2].paragraphs,
    `## ${sections[3].heading}`,
    ...sections[3].paragraphs,
  ].join('\n\n')
}

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return null
  return { frontmatter: match[1], body: match[2] }
}

async function collectBlogFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectBlogFiles(path)))
    } else if (path.endsWith('.mdx')) {
      files.push(path)
    }
  }

  return files
}

function wordCount(text) {
  return String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

const files = await collectBlogFiles(BLOG_DIR)
const posts = []

for (const file of files) {
  const source = await readFile(file, 'utf8')
  const parsed = parseFrontmatter(source)
  if (!parsed) continue

  const titleMatch = parsed.frontmatter.match(/^title:\s*"([^"]+)"$/m)
  const categoryMatch = parsed.frontmatter.match(/^category:\s*"([^"]+)"$/m)
  if (!titleMatch || !categoryMatch) continue

  posts.push({
    file,
    source,
    title: titleMatch[1],
    category: categoryMatch[1],
    body: parsed.body,
    words: wordCount(parsed.body),
  })
}

posts.sort((a, b) => a.words - b.words)

const targetCount = Math.max(1, Math.floor(posts.length * TARGET_RATIO))
const selected = posts.slice(0, targetCount)

let updated = 0

for (const [index, post] of selected.entries()) {
  const appendix = buildAppendix(
    {
      title: post.title,
      category: post.category,
    },
    index,
  )

  if (post.body.includes('## ' + headingVariants[0])) continue

  const nextSource = `${post.source.trimEnd()}\n${appendix}\n`
  await writeFile(post.file, nextSource)
  updated += 1
}

console.log(`Expanded ${updated} blog posts with longer drafts`)
