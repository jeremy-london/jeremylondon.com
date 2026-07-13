import fs from 'node:fs'
import path from 'node:path'

const BLOG_DIR = 'src/content/blog'

const categoryNotes = {
  'agent-workflows': {
    frame: 'agent workflow',
    concern: 'tool access, review loops, approvals, and handoffs',
    failure: 'the agent appears helpful while the surrounding process loses track of what changed',
    check: 'the receipt an operator can inspect after the run',
  },
  'ai-operations': {
    frame: 'AI operations',
    concern: 'observability, runtime behavior, evaluation, and cost',
    failure: 'the system returns an answer but no one can explain the path it took',
    check: 'the signal that tells a tired operator what happened',
  },
  'ai-platforms': {
    frame: 'AI platform',
    concern: 'retrieval, tools, evals, guardrails, and governance',
    failure: 'a clean demo turns into a messy product surface once users and permissions arrive',
    check: 'the boundary between model behavior and product responsibility',
  },
  'deep-learning-networks': {
    frame: 'model system',
    concern: 'routing, inference, latency, and local constraints',
    failure: 'the model choice looks isolated even though the surrounding system made the decision',
    check: 'the operational reason for choosing one path over another',
  },
  'deep-learning-basics': {
    frame: 'learning note',
    concern: 'numbers, shapes, and the small example a reader can run',
    failure: 'the explanation sounds correct but the reader cannot test the step that matters',
    check: 'the smallest calculation that can be inspected directly',
  },
  'security-trust': {
    frame: 'trust boundary',
    concern: 'authorization, validation, dependencies, audit trails, and risk',
    failure: 'the happy path works while the unsafe path stays unnamed',
    check: 'the place where permission, evidence, or ownership is checked',
  },
  'engineering-quality': {
    frame: 'engineering quality',
    concern: 'tests, observability, queues, caching, and data quality',
    failure: 'the workflow succeeds once but gives the next maintainer no evidence',
    check: 'the test or log that keeps the claim honest',
  },
  'web-engineering': {
    frame: 'web engineering',
    concern: 'content, forms, feeds, frontend behavior, and small-site maintenance',
    failure: 'the page renders but the reader, crawler, or maintainer gets the wrong contract',
    check: 'the browser-visible behavior that proves the page still works',
  },
  'developer-tools': {
    frame: 'developer tool',
    concern: 'CLI behavior, scripts, commits, and local feedback loops',
    failure: 'the tool saves a minute while hiding the mistake that costs an afternoon',
    check: 'the command output that tells the user what happened',
  },
  'design-systems': {
    frame: 'design system',
    concern: 'tokens, component contracts, naming, and handoff',
    failure: 'the UI looks consistent while the underlying decisions drift apart',
    check: 'the named decision a designer and engineer can both point to',
  },
  'product-engineering': {
    frame: 'product engineering',
    concern: 'state, handoff, forms, product quality, and boring edge cases',
    failure: 'the feature works in the happy path but leaves the user guessing at the boundary',
    check: 'the state the interface needs to make visible',
  },
  'personal-systems': {
    frame: 'personal system',
    concern: 'notes, maintenance, drafts, and habits that survive ordinary weeks',
    failure: 'the system depends on future energy it has no right to assume',
    check: 'the small habit that still works when the week is crowded',
  },
  'data-engineering': {
    frame: 'data workflow',
    concern: 'schemas, contracts, naming, local analytics, and model-ready data',
    failure: 'the pipeline produces output after the meaning of a field has moved',
    check: 'the contract that explains what changed',
  },
  'local-first-software': {
    frame: 'local-first workflow',
    concern: 'offline behavior, sync, local state, and private work',
    failure: 'the app works online but loses the user once the network or device state changes',
    check: 'the rule for what happens before the server is reachable',
  },
  'learning-lab': {
    frame: 'teaching note',
    concern: 'examples, visualization, debugging, and reader mistakes',
    failure: 'the reader can copy the answer without understanding why it worked',
    check: 'the mistake the tutorial helps them recover from',
  },
  'creative-coding': {
    frame: 'creative coding',
    concern: 'canvas, WebGPU, visualization, and interactive explanation',
    failure: 'the visual is interesting but does not teach the system underneath',
    check: 'the control that lets the reader change the result',
  },
  'model-watch': {
    frame: 'model-watch note',
    concern: 'model launches, routing changes, safety posture, and builder impact',
    failure: 'the release sounds important without changing any concrete decision',
    check: 'the new constraint a builder has to account for',
  },
}

const titleOverrides = {
  'activation-functions-are-decision-shapes.mdx': {
    subject: 'activation functions',
    scene: 'choosing ReLU, sigmoid, or tanh for a small model',
  },
  'chatgpt-work-made-desktop-agents-feel-inevitable.mdx': {
    subject: 'ChatGPT work',
    scene: 'an agent working across files, browser state, approvals, and visible receipts',
  },
  'time-series-models-and-rhythm.mdx': {
    subject: 'time-series threat analytics',
    scene: 'a signal that only makes sense when the order of events is preserved',
  },
}

function splitFrontmatter(source) {
  const match = source.match(/^(---\n[\s\S]*?\n---\n?)([\s\S]*)$/)
  if (!match) throw new Error('Missing frontmatter')
  return [match[1], match[2]]
}

function value(frontmatter, key) {
  const line = frontmatter.split('\n').find((item) => item.startsWith(`${key}:`))
  return line ? line.slice(key.length + 1).trim().replace(/^['"]|['"]$/g, '') : ''
}

function tags(frontmatter) {
  const raw = value(frontmatter, 'tags')
  return raw
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .split(',')
    .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean)
}

function importsAndIslands(body) {
  const imports = body
    .split('\n')
    .filter((line) => line.startsWith('import '))
    .join('\n')

  const islands = [...body.matchAll(/^<[A-Z][\s\S]*?^\/>$/gm)]
    .map((match) => match[0])
    .filter((block) => block.includes('client:only') || block.includes('filePath='))

  return { imports, islands }
}

function sentenceCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function displaySubject(value) {
  return value
    .replace(/\bchatgpt\b/gi, 'ChatGPT')
    .replace(/\bgpt\b/gi, 'GPT')
    .replace(/\bai\b/gi, 'AI')
    .replace(/\bsdk\b/gi, 'SDK')
    .replace(/\bapi\b/gi, 'API')
    .replace(/\brss\b/gi, 'RSS')
    .replace(/\bmcp\b/gi, 'MCP')
    .replace(/\bopir\b/gi, 'OPIR')
    .replace(/\bpyodide\b/gi, 'Pyodide')
    .replace(/\bwebgpu\b/gi, 'WebGPU')
    .replace(/\btypescript\b/gi, 'TypeScript')
    .replace(/\bsqlite\b/gi, 'SQLite')
    .replace(/\bopentelemetry\b/gi, 'OpenTelemetry')
}

function hashValue(value) {
  let hash = 0
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return hash
}

function choose(options, seed) {
  return options[seed % options.length]
}

function subjectFor(file, title, tagList) {
  if (titleOverrides[file]?.subject) return titleOverrides[file].subject

  const tag = tagList.find((item) => item.length > 3)
  if (tag) return tag

  return title
    .toLowerCase()
    .replace(/^(a|an|the)\s+/, '')
    .replace(/\b(is|are|was|were|made|make|makes|need|needs|should|changed|pushed|raised|turned|brought|reminded|stopped|belongs|belong)\b.*$/, '')
    .trim() || title.toLowerCase()
}

function sceneFor(file, title, excerpt, subject) {
  if (titleOverrides[file]?.scene) return titleOverrides[file].scene

  const lowered = title.toLowerCase()
  if (lowered.includes('approval')) return 'a user deciding whether an agent should be allowed to continue'
  if (lowered.includes('sandbox')) return 'an agent that can help only inside the boundary it was given'
  if (lowered.includes('rss')) return 'a reader following updates without depending on another timeline'
  if (/\bform\b|\bforms\b/.test(lowered)) return 'a user trying to recover from a mistake in a form'
  if (/\brouting\b|\broute\b/.test(lowered)) return 'a request that has more than one plausible path through the system'
  if (lowered.includes('eval')) return 'a team arguing about whether the model improved or merely changed'
  if (lowered.includes('queue')) return 'work that can wait without losing its place'
  if (lowered.includes('cache')) return 'a cached answer that has to explain why it is still valid'
  if (lowered.includes('local') || lowered.includes('offline')) return 'software that keeps working when the network stops helping'
  if (lowered.includes('token')) return 'a design decision that needs a name before it spreads'
  if (lowered.includes('model') || lowered.includes('gpt') || lowered.includes('claude') || lowered.includes('gemini')) {
    return 'a model choice that changes the surrounding workflow'
  }

  return excerpt
    .replace(/\.$/, '')
    .replace(/^A\s+/i, 'a ')
    .replace(/^An\s+/i, 'an ')
    .replace(/^The\s+/i, 'the ')
    .slice(0, 180) || `a concrete decision about ${subject}`
}

function deepLearningBody({ excerpt, subject, scene, imports, islands }) {
  const intro = excerpt.replace(/^A short note on\s+/i, 'This post is about ')
  const verb = subject.endsWith('s') ? 'work' : 'works'
  const pronoun = subject.endsWith('s') ? 'them' : 'it'
  const label = displaySubject(subject)
  const componentSection =
    islands.length > 0
      ? `\n## Run the example\n\n${islands.join('\n')}\n`
      : ''

  return `${imports ? `${imports}\n\n` : ''}${intro} For ${label}, the useful move is to slow down and keep the numbers visible. A neural network becomes less mysterious when each multiplication, bias, and activation has somewhere to live on the page.\n\n## Start with the shape\n\nI would start with ${scene}. Name the inputs. Name the weights. Write the bias down instead of waving at it. The point is not to make the math look impressive; it is to make the next step hard to hide.\n\n${sentenceCase(label)} ${verb} better as a learning object when the reader can change one value and see what moves. If every value changes at once, the lesson turns into fog. If one value changes and the output follows, the model starts to feel inspectable.\n${componentSection}\n## What to watch\n\nThe mistake to watch for in ${label} is treating the output as magic because the notation got dense. For these small examples, the check is plain: compute the dot product, add the bias, apply the activation, and compare the result with the rendered demo.\n\nThat is also why the runnable version matters here. A static explanation can be correct and still leave the reader with no grip. A small interactive example gives them a place to poke the system and find the edge.\n\n## Where I land\n\nI do not need ${label} to feel profound. I need ${pronoun} to be traceable. If the reader can explain which input mattered, which weight amplified it, and where the activation changed the result, the post has done its job.\n`
}

function essayBody({ file, excerpt, subject, scene, note }) {
  const intro = excerpt.replace(/^A short note on\s+/i, 'This post is about ')
  const label = displaySubject(subject)
  const seed = hashValue(file)
  const headings = choose(
    [
      ['What Changes', 'Where It Fails', 'The Check'],
      ['The Practical Part', 'The Edge Case', 'What I Want To See'],
      ['Why It Matters', 'The Risk', 'My Bar'],
      ['The Useful Version', 'The Failure Mode', 'The Test'],
    ],
    seed,
  )
  const opener = choose(
    [
      `${intro} I care about ${label} only when it changes the work someone has to do.`,
      `${intro} The useful version is practical: ${scene}.`,
      `${intro} The point is not to make ${label} sound bigger than it is. It is to name the decision it changes.`,
      `${intro} I would keep the argument close to the workflow instead of treating ${label} like a slogan.`,
    ],
    seed + 1,
  )
  const first = choose(
    [
      `For ${label}, the important part is ${scene}. That gives the idea a place to stand. Without that concrete surface, the post turns into category talk: ${note.concern}.`,
      `The move that matters for ${label} is small: connect the idea to ${scene}. Once ${label} is visible, the reader can tell whether this claim is operational or just commentary.`,
      `For ${label}, I would start from the constraint, not the announcement. The constraint is ${scene}, and the surrounding question is how ${note.concern} changes in practice.`,
      `${sentenceCase(label)} gets interesting when it changes a real workflow. The example I would use is ${scene}, because it gives the reader something to inspect instead of a broad claim to accept.`,
    ],
    seed + 2,
  )
  const second = choose(
    [
      `The failure mode for ${label} is ${note.failure}. For ${label}, that can look fine from a distance, so the page ships, the demo runs, or the team agrees with itself while the next person still cannot tell what actually happened.`,
      `The bad version of ${label} is familiar: ${note.failure}. For ${label}, sometimes that means a decision with no trail, a boundary with no owner, or an example that does not prove the point.`,
      `${sentenceCase(label)} breaks when ${note.failure}. Once ${label} reaches that point, the language may still sound confident, but the system has stopped giving the reader evidence.`,
      `The thing I would watch for with ${label} is quieter than a crash: ${note.failure}. That is the kind of break that makes a ${label} post feel padded even when the topic is legitimate.`,
    ],
    seed + 3,
  )
  const third = choose(
    [
      `My bar for ${label} is ${note.check}. If the ${label} post cannot show that, it should stay short and honest.`,
      `The check for ${label} is ${note.check}. For ${label}, that is enough to separate a useful note from a long one.`,
      `For ${label}, I would ask for ${note.check}. The ${label} post can be brief and still be useful if that evidence is present.`,
      `The version I would publish needs ${note.check}. Without that evidence for ${label}, I would rather cut the paragraph than decorate the uncertainty.`,
    ],
    seed + 4,
  )
  const closer = choose(
    [
      `This works best as a concise note. The ${label} claim does not need more volume; it needs one clear boundary and one concrete reason to care.`,
      `That is where I would leave it. Keep the ${label} claim narrow, make the tradeoff visible, and let the example do the work.`,
      `I do not want ${label} to sound more certain than the evidence allows. Make the decision visible, then stop.`,
      `The smaller version is stronger. It gives the reader the ${label} claim, the failure mode, and the check without pretending there is a larger theory hiding underneath.`,
    ],
    seed + 5,
  )

  return `${opener}\n\n## ${headings[0]}\n\n${first}\n\n## ${headings[1]}\n\n${second}\n\n## ${headings[2]}\n\n${third}\n\n${closer}\n`
}

const files = fs
  .readdirSync(BLOG_DIR)
  .filter((file) => /\.mdx?$/.test(file) && file !== 'template.md')
  .sort()

for (const file of files) {
  const fullPath = path.join(BLOG_DIR, file)
  const source = fs.readFileSync(fullPath, 'utf8')
  const [fm, body] = splitFrontmatter(source)
  const title = value(fm, 'title')
  const excerpt = value(fm, 'excerpt')
  const category = value(fm, 'category')
  const tagList = tags(fm)
  const note = categoryNotes[category] ?? {
    frame: 'technical note',
    concern: 'constraints, examples, and maintenance',
    failure: 'the explanation sounds plausible while the actual decision stays vague',
    check: 'the example or constraint that makes the point inspectable',
  }
  const subject = subjectFor(file, title, tagList)
  const scene = sceneFor(file, title, excerpt, subject)
  const { imports, islands } = importsAndIslands(body)

  const nextBody =
    category === 'deep-learning-basics'
      ? deepLearningBody({ excerpt, subject, scene, imports, islands })
      : essayBody({ file, excerpt, subject, scene, note })

  fs.writeFileSync(fullPath, `${fm.trimEnd()}\n\n${nextBody.trimEnd()}\n`)
}

console.log(`Rewrote ${files.length} blog posts`)
