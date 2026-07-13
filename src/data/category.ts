export interface Props {
  title: string
  slug: string
  color: 'green' | 'blue' | 'orange' | 'purple' | 'pink' | 'yellow'
  description: string
}
export type Category = Props

export const categories: Props[] = [
  {
    title: 'Deep Learning Basics',
    slug: 'deep-learning-basics',
    color: 'green',
    description:
      'Foundational notes on neural networks, model behavior, and the building blocks behind modern AI systems.',
  },
  {
    title: 'AI Systems',
    slug: 'deep-learning-networks',
    color: 'blue',
    description:
      'Practical notes on model serving, routing, local inference, recommendations, and systems that run under real constraints.',
  },
  {
    title: 'AI Platforms',
    slug: 'advance-deep-learning',
    color: 'purple',
    description:
      'Production AI patterns across RAG, agents, MCP, evaluation, multimodal systems, guardrails, and governance.',
  },
  {
    title: 'Engineering Quality',
    slug: 'deep-learning-principals',
    color: 'pink',
    description:
      'Testing, observability, queues, caching, data quality, and the habits that keep engineering teams honest.',
  },
  {
    title: 'Agent Workflows',
    slug: 'agent-workflows',
    color: 'orange',
    description:
      'Notes on agents, verifier loops, tool boundaries, approvals, handoffs, and workflow design.',
  },
  {
    title: 'Web Engineering',
    slug: 'web-engineering',
    color: 'yellow',
    description:
      'Practical work on Astro, content systems, frontend quality, feeds, forms, and small-site maintenance.',
  },
  {
    title: 'Security Trust',
    slug: 'security-trust',
    color: 'purple',
    description:
      'Authorization, validation, secret scanning, dependencies, audit trails, and the controls that make software safer to operate.',
  },
  {
    title: 'Developer Tools',
    slug: 'developer-tools',
    color: 'blue',
    description:
      'CLI ergonomics, scripts, local development loops, commits, and tooling that makes the safer path shorter.',
  },
  {
    title: 'Learning Lab',
    slug: 'learning-lab',
    color: 'green',
    description:
      'Teaching notes on examples, visualization, Pyodide, math intuition, and writing technical material that people can use.',
  },
  {
    title: 'Personal Systems',
    slug: 'personal-systems',
    color: 'pink',
    description:
      'Writing backlogs, notes, portfolio upkeep, personal automation, and maintenance habits that survive ordinary weeks.',
  },
  {
    title: 'Data Engineering',
    slug: 'data-engineering',
    color: 'orange',
    description:
      'Practical notes on databases, analytical workflows, data contracts, migrations, and the systems around model-ready data.',
  },
  {
    title: 'AI Operations',
    slug: 'ai-operations',
    color: 'purple',
    description:
      'Operational notes on observability, runtime safety, evaluation, Kubernetes, cost controls, and keeping AI systems understandable.',
  },
  {
    title: 'Product Engineering',
    slug: 'product-engineering',
    color: 'blue',
    description:
      'Product-minded engineering notes on handoff, state, forms, feature quality, and building software people can actually operate.',
  },
  {
    title: 'Local First Software',
    slug: 'local-first-software',
    color: 'green',
    description:
      'Notes on offline-capable tools, sync, local databases, private workflows, and software that keeps working close to the user.',
  },
  {
    title: 'Design Systems',
    slug: 'design-systems',
    color: 'yellow',
    description:
      'Design system notes on tokens, component contracts, Figma handoff, frontend polish, and UI decisions that age well.',
  },
  {
    title: 'Creative Coding',
    slug: 'creative-coding',
    color: 'pink',
    description:
      'Experiments with WebGPU, canvas, visualization, interactive essays, and technical visuals that teach instead of decorate.',
  },
  {
    title: 'Model Watch',
    slug: 'model-watch',
    color: 'orange',
    description:
      'Dated notes on frontier model launches, what changed against the previous generation, and what the release means for builders.',
  },
]
