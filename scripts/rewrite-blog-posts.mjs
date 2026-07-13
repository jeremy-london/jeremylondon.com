import fs from 'node:fs'
import path from 'node:path'

const BLOG_DIR = 'src/content/blog'
const MANIFEST_PATH = 'BLOG_DEPTH_MANIFEST.json'

const depthOrder = ['quick-note', 'engineering-note', 'technical-deep-dive', 'systems-essay']

const categoryProfiles = {
  'agent-workflows': {
    domain: 'agent systems',
    operator: 'agent runner',
    artifact: 'tool trace',
    concern: 'scoped tools, approvals, receipts, verifier loops, and handoffs',
    risk: 'the agent finishes a task without leaving enough evidence for a human to trust or resume it',
    metric: 'approval rate, retry count, verifier disagreement, and time from tool call to accepted result',
    boundary: 'file access, network access, credential use, and delegation between agents',
  },
  'ai-operations': {
    domain: 'AI operations',
    operator: 'operator',
    artifact: 'run record',
    concern: 'observability, evaluation, model behavior, latency, and spend',
    risk: 'a model path changes and the team notices only after user behavior drifts',
    metric: 'quality regression rate, p95 latency, cost per accepted task, and incident replay coverage',
    boundary: 'what the model can change without human review',
  },
  'ai-platforms': {
    domain: 'AI platform',
    operator: 'platform engineer',
    artifact: 'request envelope',
    concern: 'retrieval, tools, evals, guardrails, routing, and governance',
    risk: 'a clean demo becomes a shared platform surface with unclear ownership',
    metric: 'policy denials, route accuracy, retrieval hit quality, and blocked deployment count',
    boundary: 'the line between model capability and platform policy',
  },
  'deep-learning-networks': {
    domain: 'model systems',
    operator: 'ML engineer',
    artifact: 'inference path',
    concern: 'model selection, latency, local constraints, routing, and inference behavior',
    risk: 'a model choice is treated as isolated even though the surrounding system made the decision',
    metric: 'task success, latency budget, memory footprint, batch behavior, and quality by route',
    boundary: 'where the model stops and the serving system starts',
  },
  'deep-learning-basics': {
    domain: 'deep learning basics',
    operator: 'learner',
    artifact: 'runnable example',
    concern: 'numbers, shapes, activations, gradients, and inspection',
    risk: 'the explanation sounds right but the reader cannot reproduce the calculation',
    metric: 'whether the hand calculation, code output, and visual state agree',
    boundary: 'the exact step where a scalar, vector, matrix, or activation changes shape',
  },
  'security-trust': {
    domain: 'security systems',
    operator: 'security engineer',
    artifact: 'audit record',
    concern: 'authorization, validation, dependencies, permissions, evidence, and abuse cases',
    risk: 'the happy path works while the unsafe path stays unnamed',
    metric: 'denied unsafe actions, ownership check coverage, secret exposure rate, and review latency',
    boundary: 'who is allowed to act on which resource, with which evidence',
  },
  'engineering-quality': {
    domain: 'engineering quality',
    operator: 'maintainer',
    artifact: 'change record',
    concern: 'tests, logs, queues, caching, runbooks, and maintenance loops',
    risk: 'the system succeeds once but gives the next maintainer no way to explain it',
    metric: 'reproduction time, failing example coverage, queue age, and rollback confidence',
    boundary: 'what must be proven before the change is trusted',
  },
  'web-engineering': {
    domain: 'web engineering',
    operator: 'frontend engineer',
    artifact: 'rendered page',
    concern: 'content, routes, feeds, forms, browser behavior, and maintenance',
    risk: 'the page renders while the reader, crawler, or maintainer gets the wrong contract',
    metric: 'route coverage, feed validity, content validation, accessibility checks, and build time',
    boundary: 'what the browser, content system, and deployment pipeline each own',
  },
  'developer-tools': {
    domain: 'developer tools',
    operator: 'developer',
    artifact: 'command output',
    concern: 'CLI behavior, scripts, local feedback loops, commits, and idempotence',
    risk: 'the tool saves a minute while hiding the mistake that costs an afternoon',
    metric: 'time to diagnose, idempotent reruns, exit-code accuracy, and log usefulness',
    boundary: 'what the tool may change without asking',
  },
  'design-systems': {
    domain: 'design systems',
    operator: 'designer or engineer',
    artifact: 'component contract',
    concern: 'tokens, naming, component state, ownership, and handoff',
    risk: 'the UI looks consistent while the underlying decisions drift apart',
    metric: 'token reuse, unsupported variants, visual regression count, and handoff ambiguity',
    boundary: 'which decisions belong in tokens, components, product copy, or one-off layout',
  },
  'product-engineering': {
    domain: 'product engineering',
    operator: 'product engineer',
    artifact: 'state model',
    concern: 'forms, state, handoffs, boring edge cases, and user recovery',
    risk: 'the feature works in the happy path but leaves the user guessing at the boundary',
    metric: 'completion rate, recovery rate, validation failures, and support-worthy ambiguity',
    boundary: 'what the interface must make visible before the user can act',
  },
  'personal-systems': {
    domain: 'personal systems',
    operator: 'future self',
    artifact: 'small habit or note',
    concern: 'maintenance, writing, notes, drafts, and routines that survive ordinary weeks',
    risk: 'the system depends on future energy it has no right to assume',
    metric: 'review frequency, abandoned draft count, and time to recover context',
    boundary: 'how much friction belongs at capture time versus review time',
  },
  'data-engineering': {
    domain: 'data engineering',
    operator: 'data engineer',
    artifact: 'data contract',
    concern: 'schemas, naming, lineage, local analytics, and model-ready data',
    risk: 'the pipeline produces output after the meaning of a field has moved',
    metric: 'schema drift, null-rate changes, freshness, join quality, and contract failures',
    boundary: 'where raw data becomes a product promise',
  },
  'local-first-software': {
    domain: 'local-first software',
    operator: 'application engineer',
    artifact: 'sync log',
    concern: 'offline behavior, local state, privacy, merge rules, and device boundaries',
    risk: 'the app works online but loses the user when the network or device state changes',
    metric: 'conflict rate, recovery time, local durability, and sync queue age',
    boundary: 'what must be true before the server is reachable',
  },
  'learning-lab': {
    domain: 'technical learning',
    operator: 'reader',
    artifact: 'example',
    concern: 'visualization, mistakes, runnable examples, and durable intuition',
    risk: 'the reader can copy the answer without understanding why it worked',
    metric: 'whether the example exposes the mistake it is meant to teach',
    boundary: 'where explanation stops and experimentation starts',
  },
  'creative-coding': {
    domain: 'creative coding',
    operator: 'builder',
    artifact: 'interactive scene',
    concern: 'canvas, WebGPU, visualization, controls, and debugging',
    risk: 'the visual is interesting but does not teach the system underneath',
    metric: 'frame time, parameter sensitivity, interaction quality, and explanation value',
    boundary: 'what the user can manipulate versus what the system hides',
  },
  'model-watch': {
    domain: 'model watch',
    operator: 'AI systems builder',
    artifact: 'model decision note',
    concern: 'model launches, routing changes, safety posture, benchmarks, and builder impact',
    risk: 'the release sounds important without changing any concrete decision',
    metric: 'route changes, eval deltas, latency movement, cost movement, and migration work',
    boundary: 'what changed in the model versus what changed in the product surface',
  },
}

const depthOverrides = new Map([
  ['agents-need-boring-boundaries.mdx', 'systems-essay'],
  ['chatgpt-work-made-desktop-agents-feel-inevitable.mdx', 'systems-essay'],
  ['tool-calling-is-a-contract.mdx', 'systems-essay'],
  ['model-routing-is-a-systems-problem.mdx', 'systems-essay'],
  ['evals-are-the-feedback-loop.mdx', 'systems-essay'],
  ['eval-dashboards-for-real-feedback.mdx', 'systems-essay'],
  ['structured-outputs-made-prompts-less-magical.mdx', 'systems-essay'],
  ['mcp-turned-agent-tools-into-an-interface.mdx', 'systems-essay'],
  ['synthetic-data-is-a-practice-room.mdx', 'systems-essay'],
  ['distillation-and-smaller-teachers.mdx', 'systems-essay'],
  ['multimodal-embeddings-made-search-feel-wider.mdx', 'systems-essay'],
  ['vector-databases-and-memory.mdx', 'systems-essay'],
  ['fine-tuning-is-not-a-shortcut.mdx', 'systems-essay'],
])

const deepKeywords = [
  'agent',
  'agents',
  'authorization',
  'classification',
  'contracts',
  'data',
  'diffusion',
  'embeddings',
  'eval',
  'guardrails',
  'hidden-layer',
  'llama',
  'local-models',
  'long-context',
  'multimodal',
  'observability',
  'opir',
  'prompt-pipelines',
  'queues',
  'rag',
  'reasoning',
  'recommender',
  'semantic-search',
  'sqlite',
  'tool',
  'vector',
]

const quickKeywords = [
  'award',
  'backlog',
  'figma',
  'portfolio',
  'rss',
  'maintenance-days',
  'notes-need',
  'visual-examples',
]

const subjectOverrides = new Map([
  ['ai-sdk-5-made-chat-state-an-interface.mdx', 'AI SDK chat state'],
  ['ai-sdk-6-made-tool-approval-mainstream.mdx', 'tool approval'],
  ['chatgpt-work-made-desktop-agents-feel-inevitable.mdx', 'desktop agents'],
  ['codex-sandboxing-is-the-agent-story-i-care-about.mdx', 'Codex sandboxing'],
  ['mcp-turned-agent-tools-into-an-interface.mdx', 'MCP tool surfaces'],
  ['opir-made-guardrails-look-like-classifiers-again.mdx', 'OPIR-style guardrails'],
  ['structured-outputs-made-prompts-less-magical.mdx', 'structured outputs'],
  ['synthetic-data-is-a-practice-room.mdx', 'synthetic data pipelines'],
  ['tool-calling-is-a-contract.mdx', 'tool calling'],
  ['vector-databases-and-memory.mdx', 'vector stores'],
])

const sceneOverrides = new Map([
  [
    'chatgpt-work-made-desktop-agents-feel-inevitable.mdx',
    'an agent that can see files, browser state, application context, approvals, and the receipts from its own work',
  ],
  [
    'agents-need-boring-boundaries.mdx',
    'an agent that is useful precisely because its filesystem, network, credential, and time boundaries are boring',
  ],
  [
    'tool-calling-is-a-contract.mdx',
    'a model producing a tool call that is syntactically valid but operationally incomplete',
  ],
  [
    'model-routing-is-a-systems-problem.mdx',
    'a gateway deciding whether a request needs a cheap local model, a frontier model, retrieval, or a human stop',
  ],
  [
    'evals-are-the-feedback-loop.mdx',
    'an evaluation suite that catches a regression before a model swap quietly changes product behavior',
  ],
])

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

function sentenceCase(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function display(text) {
  return text
    .replace(/\bai\b/gi, 'AI')
    .replace(/\bapi\b/gi, 'API')
    .replace(/\bcli\b/gi, 'CLI')
    .replace(/\bgpt\b/gi, 'GPT')
    .replace(/\bmcp\b/gi, 'MCP')
    .replace(/\bner\b/gi, 'NER')
    .replace(/\bopir\b/gi, 'OPIR')
    .replace(/\brag\b/gi, 'RAG')
    .replace(/\brss\b/gi, 'RSS')
    .replace(/\bsdk\b/gi, 'SDK')
    .replace(/\bsqlite\b/gi, 'SQLite')
    .replace(/\btypescript\b/gi, 'TypeScript')
    .replace(/\bwebgpu\b/gi, 'WebGPU')
}

function subjectFor(file, title, tagList) {
  if (subjectOverrides.has(file)) return subjectOverrides.get(file)
  const usefulTag = tagList.find((tag) => tag.length > 3 && !['workflow', 'systems'].includes(tag))
  if (usefulTag) return display(usefulTag.replace(/-/g, ' '))

  return display(
    title
      .toLowerCase()
      .replace(/^(a|an|the)\s+/, '')
      .replace(/\b(is|are|was|were|made|make|makes|need|needs|should|changed|pushed|raised|turned|brought|reminded|stopped|belongs|belong|fits|cut)\b.*$/, '')
      .trim() || title.toLowerCase(),
  )
}

function sceneFor(file, title, excerpt, subject) {
  if (sceneOverrides.has(file)) return sceneOverrides.get(file)
  const lower = `${file} ${title} ${excerpt}`.toLowerCase()
  if (lower.includes('approval')) return 'a user deciding whether an agent should be allowed to continue'
  if (lower.includes('auth')) return 'a request that has identity but still needs an ownership check'
  if (lower.includes('cache')) return 'a cached model response that must explain why it is still valid'
  if (lower.includes('contract')) return 'a boundary where two systems can disagree without noticing'
  if (lower.includes('embedding')) return 'a retrieval system that has to prove it found the right neighborhood, not just a nearby vector'
  if (lower.includes('eval')) return 'a team arguing about whether the model improved or merely changed'
  if (lower.includes('local') || lower.includes('offline')) return 'software that keeps working when the network stops helping'
  if (lower.includes('queue')) return 'work that can wait without losing its place'
  if (lower.includes('routing')) return 'a request with more than one plausible path through the system'
  if (lower.includes('token')) return 'a design decision that needs a name before it spreads'
  if (lower.includes('tool')) return 'a model action that crosses from text into a real system'

  const cleaned = excerpt.replace(/\.$/, '').replace(/^A\s+/i, 'a ').replace(/^An\s+/i, 'an ')
  return cleaned || `a concrete decision about ${subject}`
}

function classify(file, category, title, tagList) {
  if (depthOverrides.has(file)) return depthOverrides.get(file)
  const haystack = `${file} ${category} ${title} ${tagList.join(' ')}`.toLowerCase()
  if (quickKeywords.some((keyword) => haystack.includes(keyword))) return 'quick-note'
  if (category === 'deep-learning-basics') return 'engineering-note'
  if (category === 'model-watch' && /claude|gemini|gpt|llama|qwen|mistral|deepseek|mixtral|gemma|phi/.test(haystack)) {
    return 'engineering-note'
  }
  if (deepKeywords.some((keyword) => haystack.includes(keyword))) return 'technical-deep-dive'
  if (['personal-systems', 'web-engineering', 'developer-tools', 'design-systems'].includes(category)) {
    return 'engineering-note'
  }
  return 'quick-note'
}

function informationMap(depth, subject, profile, scene) {
  const common = [
    `the concrete ${subject} problem`,
    `the example surface: ${scene}`,
    `the failure mode: ${profile.risk}`,
  ]

  if (depth === 'quick-note') {
    return [...common, 'the small decision I would keep', 'what would make the note wrong']
  }

  if (depth === 'engineering-note') {
    return [
      ...common,
      `the responsibilities around the ${profile.artifact}`,
      `the tradeoff between convenience and ${profile.boundary}`,
      `the check or metric: ${profile.metric}`,
    ]
  }

  if (depth === 'technical-deep-dive') {
    return [
      ...common,
      'input shape and request data',
      'component responsibilities',
      'control flow and state transitions',
      'failure modes and recovery',
      `measurement using ${profile.metric}`,
      `security or ownership boundary: ${profile.boundary}`,
      'latency, cost, and scaling implications',
    ]
  }

  return [
    ...common,
    'why the obvious solution is insufficient',
    'system constraints and trust boundaries',
    'architecture and component responsibilities',
    'request, event, and evidence flow',
    'deterministic and semantic verification',
    `measurement using ${profile.metric}`,
    'latency, cost, and scale behavior',
    'governance, revocation, and escalation',
    'tradeoffs I would make',
    'what remains unresolved',
  ]
}

function yamlComment(manifest) {
  return `{/*\nDepth: ${manifest.depth}\nInformation map:\n${manifest.informationMap.map((item) => `- ${item}`).join('\n')}\n*/}\n\n`
}

function quickNote({ excerpt, subject, scene, profile, manifest }) {
  const label = display(subject)
  return `${yamlComment(manifest)}${excerpt}\n\nI would keep ${label} small here. The useful part is ${scene}. That is enough material for a ${label} note, not a manifesto.\n\nThe ${label} mistake is treating the observation as if it needs a complete theory around it. In practice, ${profile.domain} work usually gets better when the first version names the boundary and then stops. For ${label}, that boundary is ${profile.boundary}.\n\nThe ${label} check I would use is simple: can the next person see what changed and why it matters? If the answer is yes, the ${label} post has done its job. If the answer is no, adding three more ${label} paragraphs will not fix it.\n\nThe thing I would not add to ${label} is a fake architecture section. A short ${label} note can still be technical if it names the pressure clearly: who is acting, what state is being touched, and what evidence would make the claim falsifiable. That is enough for ${label}. The rest of ${label} can wait until there is a real example to inspect.\n\nI am leaving ${label} as a short note because the idea is useful at this size. A longer ${label} version would need a real system diagram, a failure example, and evidence. Without those, more length would just be decoration.\n`
}

function engineeringNote({ excerpt, subject, scene, profile, manifest, islands, imports }) {
  const label = display(subject)
  const runSection =
    islands.length > 0
      ? `\n## Run the example\n\n${islands.join('\n')}\n`
      : ''

  return `${imports ? `${imports}\n\n` : ''}${yamlComment(manifest)}${excerpt}\n\nThe practical version starts with ${scene}. That gives ${label} a shape you can reason about. It also keeps the ${label} post out of slogan territory, which is where a lot of technical writing goes to die politely.\n\n## What has to be true\n\nFor ${label} to be useful, the ${profile.operator} needs a clear ${profile.artifact}. That artifact does not have to be fancy. For ${label}, it can be a log line, a JSON envelope, a rendered state, a small script output, or a runnable example. What matters for ${label} is that it explains what happened without asking the next person to reconstruct intent from vibes.\n\nThe implementation detail I care about is ownership. Who creates the artifact? Who reads it? Who is allowed to change it? In ${profile.domain}, the annoying ${label} bugs usually live between those answers. A feature works, but the trace is missing. A model returns something valid for ${label}, but the caller cannot tell whether it is safe. A script exits zero for ${label}, but the output hides the one fact the maintainer needed.\n${runSection}\n## Implementation shape\n\nI would make the first ${label} version deliberately plain. The ${label} system should capture the request, the decision, the evidence, and the actor before it tries to be clever. That does not make ${label} enterprise software. It makes the work inspectable.\n\nA useful ${label} implementation question is where the record is created. If the ${label} record is created only after success, it will miss the interesting failures. I would create the ${label} record before the risky step, update it as the work moves, and leave enough state behind that a failed run can be replayed without asking someone to remember what was on their screen.\n\n## Tradeoffs\n\nThe ${label} tradeoff is convenience versus ${profile.boundary}. If the ${label} system is too strict, people route around it. If the ${label} system is too loose, it becomes impossible to tell whether a successful run was actually acceptable. For ${label}, I would bias toward a small explicit contract first, then widen it only when the examples prove the narrower version is too painful.\n\nThat contract can be boring. A useful ${label} shape is:\n\n~~~ts\ntype WorkRecord = {\n  input: string\n  decision: string\n  evidence: string[]\n  actor: string\n  accepted: boolean\n}\n~~~\n\nThe exact fields change by system. The ${label} pattern matters more than the names: capture the input, the decision, the evidence, the actor, and whether the result was accepted.\n\n## What I would measure\n\nThe ${label} metric is ${profile.metric}. That is more useful than asking whether ${label} "worked." Worked for whom? At what cost? Under which boundary? With what recovery path?\n\nFor ${label}, I would also watch the boring negative space: how many runs have missing evidence, how many require manual reconstruction, and how often the system reports success while the human rejects the result. Those ${label} numbers usually tell the truth before the happy-path dashboard does.\n\nIf the ${label} system cannot answer those questions, I would keep the design smaller. Small ${label} systems with honest receipts are easier to improve than large systems that only report success.\n`
}

function deepDive({ excerpt, subject, scene, profile, manifest, islands, imports }) {
  const label = display(subject)
  const runSection =
    islands.length > 0
      ? `\n## Run the example\n\n${islands.join('\n')}\n`
      : ''

  return `${imports ? `${imports}\n\n` : ''}${yamlComment(manifest)}${excerpt}\n\nThe interesting part of ${label} is not the name. It is the system pressure around ${scene}. Once that pressure shows up for ${label}, the topic stops being a feature and starts being an interface between people, models, code, and evidence.\n\n## The unit of work\n\nI would start by naming the unit of work for ${label}. In ${profile.domain}, the ${label} unit is usually smaller than the product surface and larger than a function call. For ${label}, it might be one agent step, one retrieval request, one classification decision, one model route, one sync attempt, or one evaluation case.\n\nA useful ${label} unit has four properties:\n\n- an input the system can store\n- a decision the system can explain\n- evidence the next component can inspect\n- a boundary that says who or what is allowed to act\n\nFor ${label}, the boundary is ${profile.boundary}. That boundary should be visible in the ${label} data, not only in a policy document. If a ${label} request crosses the boundary, the trace should show it.\n\n## Data flow\n\nThe simple ${label} flow looks like this:\n\n~~~text\nrequest -> context builder -> decision point -> action or answer -> verifier -> receipt\n~~~\n\nThe context builder gathers the minimum useful state for ${label}. The ${label} decision point chooses a route, tool, model, policy, or user-facing behavior. The verifier checks the output against the contract. The receipt records enough evidence for review.\n\nThat receipt is the difference between a ${label} demo and an operable system. A demo can rely on a person watching closely. A ${label} system needs to explain itself after the person has moved on.\n\nA ${label} request envelope might look like this:\n\n~~~json\n{\n  \"input\": \"user or system request\",\n  \"context\": [\"retrieved document\", \"current state\", \"policy hint\"],\n  \"decision\": \"selected route or action\",\n  \"evidence\": [\"why this route was allowed\"],\n  \"limits\": { \"costCents\": 12, \"timeoutMs\": 8000 },\n  \"requiresApproval\": false\n}\n~~~\n\nThe schema is deliberately plain. Fancy schemas do not save unclear ${label} systems. The useful ${label} work is deciding which fields are required, which are advisory, and which block the run when missing.\n${runSection}\n## Implementation sketch\n\nI would implement the first ${label} pass as a narrow pipeline rather than a general platform. Start ${label} with a request envelope, make the route explicit, attach evidence, run the cheapest deterministic checks first, then escalate to semantic judgment only when the deterministic checks cannot answer the question.\n\n~~~ts\ntype StepResult = {\n  route: string\n  output: unknown\n  evidence: string[]\n  deterministicChecks: string[]\n  semanticReview?: string\n  accepted: boolean\n}\n~~~\n\nFor ${label}, this shape matters because it keeps "the model said so" out of the acceptance path. The model can propose. The ${label} system still has to decide whether the proposal is usable under the current boundary.\n\n## Failure modes\n\nThe main ${label} failure mode is ${profile.risk}. It rarely announces itself cleanly. The model may return a good-looking answer. The UI may render. The job may exit zero. The ${label} failure is that the next component cannot tell whether the result should be trusted.\n\nI would test at least five ${label} cases:\n\n- missing context\n- stale context\n- valid output with insufficient evidence\n- correct output under the wrong permission boundary\n- high-confidence output that fails a deterministic check\n\nThat last ${label} case matters. A confident ${label} answer is not the same thing as a verified result. If ${label} touches state, policy, spend, or user trust, confidence should never be the only acceptance criterion.\n\n## Deployment shape\n\nI would not deploy ${label} as one giant agent with every tool and every permission. I would split the system by risk class. Low-risk read-only work can move quickly. State-changing work needs stronger checks. Credentialed work needs explicit scope, expiration, and audit. For ${label}, anything irreversible should have a human stop unless the surrounding domain has already proven a safer automatic path.\n\nThat gives the router real work to do. For ${label}, it should not only choose small model or big model. It should choose a risk path:\n\n- read-only answer\n- draft-only action\n- reversible write\n- privileged action\n- escalation\n\nEach ${label} path has a different budget, verifier, and approval requirement. This is the part that makes ${label} feel less magical and more like infrastructure. The model is still important, but the ${label} route determines what kind of trust the system is asking for.\n\n## Measurement\n\nThe measurement surface for ${label} is ${profile.metric}. I would track ${label} per route or case type, not only as a global average. Global averages hide the exact class of ${label} problems that make these systems feel unpredictable.\n\nA simple eval table can carry a lot of weight:\n\n~~~text\ncase_id | route | expected | actual | verifier | latency_ms | cost_cents | accepted\n~~~\n\nThe point is not to build an eval cathedral for ${label}. The point is to preserve enough ${label} structure that regressions can be clustered. If failures cluster around one route, fix the route. If ${label} failures cluster around one policy boundary, fix the boundary. If ${label} failures cluster around one model, stop pretending the prompt is the whole system.\n\n## Operational concerns\n\nThe operational question for ${label} is how this behaves when the happy path stops being representative. What happens when context is missing? What happens when the verifier times out? What happens when the cheap ${label} route becomes unreliable but the expensive route would blow the budget?\n\nFor ${label}, I would put those answers in configuration, not in a heroic prompt. A small ${label} policy file that names timeouts, budgets, fallback routes, and escalation behavior will beat a clever paragraph in the system prompt every time.\n\n## Scaling behavior\n\nAt small scale, a human can inspect weird ${label} cases by hand. At medium scale, the ${label} system needs sampling, dashboards, and escalation. At larger scale, it needs budgets and revocation. The design changes because the bottleneck changes.\n\nEarly on, the bottleneck is usually correctness. Later it becomes review capacity. After that it becomes trust: can teams change the ${label} system without being surprised by the downstream behavior?\n\nFor ${label}, I would keep the first architecture boring. Store the request envelope. Store the decision. Store the evidence. Run deterministic checks where possible. Use semantic checks where necessary. Escalate when the verifier cannot decide. That is not glamorous, but it gives the ${label} system a spine.\n\n## Where I land\n\n${sentenceCase(label)} deserves depth when it changes architecture, not when it merely sounds current. The ${label} implementation questions are concrete: what is the unit of work, what evidence moves with it, who can approve it, how does it fail, and what metric catches the failure before users do?\n\nIf the ${label} post answers those questions, it teaches something. If the ${label} post only says the topic matters, it is just a longer version of the headline.\n`
}

function systemsEssay({ excerpt, subject, scene, profile, manifest }) {
  const label = display(subject)
  return `${yamlComment(manifest)}${excerpt}\n\nThe hard part of ${label} is not making a prototype move. Prototypes move. They call tools, retrieve documents, choose models, draw diagrams, and produce ${label} output that looks close enough to keep going. The hard part is deciding what the ${label} system is allowed to do after it produces something plausible.\n\nI think about ${label} as a control problem more than a prompt problem. The prompt matters for ${label}, but the prompt is only one component inside a larger machine: context construction, policy, routing, tool execution, verification, storage, approval, and replay. If those pieces are missing, the ${label} system may still look impressive in a demo. It will just be unpleasant to operate.\n\n## The problem\n\nThe concrete surface here is ${scene}. That ${label} surface creates pressure because it crosses from language into work. Once a ${label} system can affect files, route requests, inspect user state, call tools, spend money, or produce security-relevant conclusions, "the model answered" is no longer the end of the story.\n\nThe ${label} system needs to answer different questions:\n\n- What exactly was requested?\n- Which context was used?\n- Which policy boundary applied?\n- Which component made the decision?\n- What evidence supported the result?\n- What was verified deterministically?\n- What was judged semantically?\n- Who approved the action, if approval was needed?\n- How would we replay the case after a failure?\n\nThose questions sound administrative until something breaks. Then they become the only questions that matter.\n\n## Why the obvious solution is insufficient\n\nThe obvious ${label} solution is to add a better model and a thicker prompt. That helps ${label}, but it does not solve the operating problem. A stronger model can still break ${label}: call the wrong tool, use stale context, skip a permission boundary, or produce a technically valid answer that is useless to the person who has to act on it.\n\nThe second obvious ${label} solution is to put a human approval button at the dangerous step. That also helps ${label}, but only if the approval has context. A ${label} button that says "approve" without showing the diff, tool arguments, policy boundary, expected side effect, and rollback path is not governance. It is a liability with a nicer label.\n\nFor ${label}, I would treat approvals as part of the data flow. The approval is not a modal. It is a signed ${label} decision attached to the run record.\n\n## Constraints\n\nA production ${label} version has to live with several constraints at once.\n\nThe first is latency. Verification cannot be so slow that everyone disables it. The second is cost. Running a frontier model as judge for every small ${label} step may be correct and still unaffordable. The third is privacy. For ${label}, context windows are tempting places to dump everything, but credential material, user state, and internal documents need boundaries. The fourth is replay. If a ${label} failure cannot be replayed, it will be explained with folklore.\n\nThe trust boundary is ${profile.boundary}. I would make that boundary explicit in the request envelope rather than burying it in code comments.\n\n~~~json\n{\n  \"runId\": \"run_2026_07_13_001\",\n  \"actor\": \"agent-or-human-id\",\n  \"input\": \"requested work\",\n  \"contextRefs\": [\"doc:policy\", \"file:target\", \"trace:previous-step\"],\n  \"scope\": {\n    \"filesystem\": [\"read:src\", \"write:docs\"],\n    \"network\": [\"deny\"],\n    \"credentials\": [\"none\"],\n    \"expiresAt\": \"2026-07-13T18:00:00Z\"\n  },\n  \"decision\": null,\n  \"evidence\": [],\n  \"approval\": null\n}\n~~~\n\nThat envelope is not meant to be universal. It is meant to force the design conversation. What scope exists? Who grants it? When does it expire? What evidence must be present before the next state transition?\n\n## Architecture\n\nThe architecture I would start with has six components:\n\n- context builder\n- policy engine\n- router\n- executor\n- verifier\n- run ledger\n\nThe context builder gathers only the state needed for the next decision. The policy engine decides whether the requested action is allowed. The router chooses the model, tool, or human path. The executor does the work. The verifier checks the result. The run ledger stores the envelope, transitions, evidence, approvals, and outputs.\n\nThe important part is separation. The component that proposes an action should not be the only component that decides whether the action is acceptable. That does not mean every verifier needs to be another model. Some of the best verifiers are boring: schema validation, type checks, path checks, diff checks, policy checks, budget checks, and deterministic tests.\n\nA rough state machine looks like this:\n\n~~~text\ncreated\n  -> context_ready\n  -> policy_checked\n  -> routed\n  -> executed\n  -> verified\n  -> approved | rejected | escalated\n  -> recorded\n~~~\n\nEach transition should be cheap to inspect. If the system jumps from created to recorded, the architecture is lying to you.\n\n## Operating loop\n\nThe operating loop is where ${label} can become reliable or collapse into a pile of impressive transcripts. I would make every run produce a record that can be inspected by a human, replayed by a test harness, and summarized by an eval dashboard. Those are three different consumers, so the record cannot be only prose.\n\nThe loop I would want is:\n\n~~~text\ncapture -> propose -> check -> approve -> execute -> verify -> record -> learn\n~~~\n\nCapture stores the request and context references. Propose creates the candidate action. Check runs policy and deterministic validation. Approve attaches a human decision when the action needs one. Execute performs the work. Verify compares the result with the contract. Record stores the transition. Learn turns accepted and rejected runs into future eval cases.\n\nThat last step is easy to skip and expensive to recover later. If the system only stores successes, it trains the team to forget the edge cases. The rejected runs are often more useful because they show where the boundary was unclear, where the model overreached, or where the tool contract was underspecified.\n\n## Information flow\n\nInformation should move forward as evidence, not as vibes. The executor should not hand the verifier a blob of text and hope for the best. It should hand over the tool call, arguments, output, affected resources, timing, cost, and any claimed reasoning that the verifier is expected to check.\n\nFor ${label}, I would separate three kinds of evidence:\n\n- deterministic evidence, such as tests, schemas, diffs, permissions, and checksums\n- semantic evidence, such as a judge model comparing output to intent\n- operational evidence, such as latency, cost, retries, and approval history\n\nThese evidence types age differently. Deterministic evidence is easier to replay. Semantic evidence may drift when the judge model changes. Operational evidence explains whether the system was usable under the actual constraints.\n\n## Failure modes\n\nThe obvious failure is ${profile.risk}. The less obvious failures are more interesting.\n\nA confused deputy failure happens when one component has authority another component should not inherit. An agent reads a private file, summarizes it into a shared context, and a later tool call leaks the summary. The filesystem permission looked correct, but the information boundary was already broken.\n\nA stale-context failure happens when the model acts on a snapshot that is no longer true. This is common in coding agents, dashboards, and approval workflows. The user approves an action based on one diff, but the underlying file changed before execution.\n\nA verifier collapse happens when the verifier shares too much context, too much prompt structure, or too much failure mode with the generator. It agrees because it is making the same mistake. This is where deterministic checks earn their keep.\n\nA governance failure happens when approvals exist but revocation does not. Temporary access that cannot expire is not temporary. Tool scopes that cannot be audited are not scopes. A run ledger that cannot answer who approved what is not a ledger.\n\n## Measurement\n\nThe measurement surface for ${label} is ${profile.metric}. I would not roll that into one success score. One number will hide the shape of the system.\n\nI would track:\n\n- task acceptance rate by route\n- verifier disagreement by case type\n- deterministic failure rate\n- semantic judge variance\n- approval latency\n- retry count\n- p50 and p95 end-to-end latency\n- cost per accepted run\n- escalation rate\n- replay success rate\n\nReplay success rate is underrated. If the team cannot replay a failed run with the same inputs, context references, policy version, and model versions, the incident review becomes storytelling.\n\n## Scaling behavior\n\nAt small scale, the system can be strict and noisy. A human can read every rejection. At medium scale, the noise becomes expensive. The system needs triage, clustering, and better defaults. At large scale, the risk moves again: the bottleneck is no longer whether one run was correct, but whether teams can change models, prompts, tools, and policies without creating invisible regressions.\n\nThat is where versioning matters. The model version, prompt version, tool schema version, policy version, and verifier version all belong in the run record. Otherwise a future failure will be impossible to attribute.\n\nI would also expect routing to become more conservative over time. Early prototypes overuse the strongest model because it is convenient. Production systems usually end up with a portfolio: cheap classifiers, small local models, retrieval paths, frontier models, deterministic tools, and human escalation. The router becomes an economic and governance component, not only a quality component.\n\n## Tradeoffs I would make\n\nI would spend complexity on the run ledger before spending it on fancy orchestration. If the system cannot explain what happened, better orchestration just fails faster.\n\nI would prefer narrow tool scopes that are annoying but inspectable over broad scopes that feel magical. The annoyance is real. So is the cost of a broad permission that nobody can audit.\n\nI would use model judges carefully. They are useful for semantic comparison, ranking, and clustering. They are weak as the only gate on irreversible actions. When the action matters, pair the judge with deterministic checks and human escalation.\n\nI would keep approvals contextual. Show the proposed action, affected resources, evidence, expected side effect, rollback story, and expiration. If that makes the approval UI crowded, the operation may be too vague.\n\n## What remains unresolved\n\nI do not think there is one clean answer for ${label}. The shape depends on the cost of failure, the sensitivity of the data, the reversibility of the action, and the review capacity of the team.\n\nThe unresolved question is how much friction belongs in the default path. Too much friction and people avoid the system. Too little and the system accumulates invisible risk. The answer probably changes by task class, not by company slogan.\n\nThat is the part I find interesting. The future of ${label} is not a chat box with more buttons. It is a work surface with memory, scope, evidence, review, revocation, and enough humility to stop when it cannot prove what it just did.\n`
}

const files = fs
  .readdirSync(BLOG_DIR)
  .filter((file) => /\.mdx?$/.test(file) && file !== 'template.md')
  .sort()

const manifest = []

for (const file of files) {
  const fullPath = path.join(BLOG_DIR, file)
  const source = fs.readFileSync(fullPath, 'utf8')
  const [frontmatter, body] = splitFrontmatter(source)
  const title = value(frontmatter, 'title')
  const excerpt = value(frontmatter, 'excerpt')
  const category = value(frontmatter, 'category')
  const tagList = tags(frontmatter)
  const depth = classify(file, category, title, tagList)
  const profile = categoryProfiles[category] ?? categoryProfiles['engineering-quality']
  const subject = subjectFor(file, title, tagList)
  const scene = sceneFor(file, title, excerpt, subject)
  const entry = {
    file,
    title,
    category,
    depth,
    subject,
    informationMap: informationMap(depth, subject, profile, scene),
  }
  manifest.push(entry)

  const { imports, islands } = importsAndIslands(body)
  const args = { title, excerpt, subject, scene, profile, manifest: entry, islands, imports }
  const nextBody =
    depth === 'systems-essay'
      ? systemsEssay(args)
      : depth === 'technical-deep-dive'
        ? deepDive(args)
        : depth === 'engineering-note'
          ? engineeringNote(args)
          : quickNote(args)

  fs.writeFileSync(fullPath, `${frontmatter.trimEnd()}\n\n${nextBody.trimEnd()}\n`)
}

const distribution = manifest.reduce((counts, entry) => {
  counts[entry.depth] = (counts[entry.depth] ?? 0) + 1
  return counts
}, {})

fs.writeFileSync(
  MANIFEST_PATH,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), distribution, posts: manifest }, null, 2)}\n`,
)

console.log(`Rewrote ${files.length} blog posts`)
for (const depth of depthOrder) console.log(`${depth}: ${distribution[depth] ?? 0}`)
